import express from "express";
import cors from "cors";
import { generateText, generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { db } from "./firebaseConfig.js";
import { feedbackSchema } from "./constants.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// --- Generate Interview Questions ---
app.post("/api/vapi/generate", async (req, res) => {
  const { type, role, level, techstack, amount, userid } = req.body;

  try {
    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]
        
        Thank you! <3
    `,
    });

    console.log("✅ Generated questions:", questions);
    
    const interview = {
      role,
      type,
      level,
      techstack: techstack.split(",").map(t => t.trim()),
      questions: JSON.parse(questions),
      userId: userid,
      finalized: true,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("interviews").add(interview);

    res.status(200).json({ success: true, interviewId: docRef.id });
  } catch (error) {
    console.error("❌ Error generating interview:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- Create Feedback (called from frontend after call ends) ---
app.post("/api/feedback/create", async (req, res) => {
  const { interviewId, userId, messages } = req.body;

  if (!interviewId || !userId || !messages) {
    return res.status(400).json({ 
      success: false, 
      error: "Missing required fields" 
    });
  }

  console.log(`📝 Creating feedback for interview: ${interviewId}`);
  console.log(`💬 Messages received: ${messages.length}`);

  try {
    if (messages.length === 0) {
      console.log("⚠️  No messages to generate feedback from");
      return res.status(400).json({
        success: false,
        error: "No messages provided"
      });
    }

    const formattedTranscript = messages
      .map((sentence) => `- ${sentence.role}: ${sentence.content}\n`)
      .join("");

    console.log("🤖 Calling Gemini AI for feedback generation...");

    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: false,
      }),
      schema: feedbackSchema,
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem-Solving**: Ability to analyze problems and propose solutions.
        - **Cultural & Role Fit**: Alignment with company values and job role.
        - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
        `,
      system:
        "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
    });

    const feedback = {
      interviewId: interviewId,
      userId: userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    const feedbackRef = db.collection("feedback").doc();
    await feedbackRef.set(feedback);

    console.log("✅ Feedback generated successfully:", feedbackRef.id);
    
    res.status(200).json({ 
      success: true, 
      feedbackId: feedbackRef.id 
    });
  } catch (error) {
    console.error("❌ Error generating feedback:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- Get Feedback by Interview ID ---
app.get("/api/feedback/:interviewId", async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { userId } = req.query;

    console.log(`🔍 Fetching feedback for interview: ${interviewId}, user: ${userId}`);

    const querySnapshot = await db
      .collection("feedback")
      .where("interviewId", "==", interviewId)
      .where("userId", "==", userId)
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      console.log("❌ Feedback not found");
      return res.status(404).json({ 
        success: false, 
        error: "Feedback not found" 
      });
    }

    const feedbackDoc = querySnapshot.docs[0];
    console.log("✅ Feedback found:", feedbackDoc.id);
    
    res.status(200).json({
      success: true,
      feedback: { id: feedbackDoc.id, ...feedbackDoc.data() },
    });
  } catch (error) {
    console.error("❌ Error fetching feedback:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- Get Interview Details ---
app.get("/api/interviews/:id", async (req, res) => {
  try {
    const doc = await db.collection("interviews").doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ 
        success: false, 
        error: "Interview not found" 
      });
    }

    res.status(200).json({
      success: true,
      interview: { id: doc.id, ...doc.data() },
    });
  } catch (error) {
    console.error("❌ Error fetching interview:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok",
    timestamp: new Date().toISOString() 
  });
});

const PORT = process.env.PORT || 8085;

app.listen(PORT, () => {
  console.log(`\n✅ Server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health\n`);
});