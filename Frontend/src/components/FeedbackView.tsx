import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { getCurrentUser } from "@/lib/actions/auth.action";

interface FeedbackViewProps {
  interviewId: string;
  onBackToHome: () => void;
}

interface Feedback {
  totalScore: number;
  categoryScores: Array<{
    name: string;
    score: number;
    comment: string;
  }>;
  strengths: string[];
  areasForImprovement: string[];
  finalAssessment: string;
}

export function FeedbackView({ interviewId, onBackToHome }: FeedbackViewProps) {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 10;

    // 🔥 Poll for feedback (it takes time to generate)
    const fetchFeedback = async () => {
      try {
        const user = await getCurrentUser();
        const userId = user?.id || "unknown";

        const response = await api.getFeedback(interviewId, userId);

        if (response.success && response.feedback) {
          setFeedback(response.feedback);
          setLoading(false);
        } else if (attempts < maxAttempts) {
          attempts++;
          // Wait 2 seconds and try again
          setTimeout(fetchFeedback, 2000);
        } else {
          setError("Feedback generation timed out. Please try again later.");
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching feedback:", err);
        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(fetchFeedback, 2000);
        } else {
          setError("Failed to load feedback");
          setLoading(false);
        }
      }
    };

    fetchFeedback();
  }, [interviewId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-semibold mb-2">Generating Your Feedback</h2>
          <p className="text-muted-foreground">
            Our AI is analyzing your interview performance...
          </p>
        </Card>
      </div>
    );
  }

  if (error || !feedback) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2 text-destructive">Error</h2>
          <p className="text-muted-foreground mb-4">
            {error || "Failed to load feedback"}
          </p>
          <Button onClick={onBackToHome}>Back to Home</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Interview Feedback</h1>
          <p className="text-muted-foreground">Here's how you performed</p>
        </div>

        {/* Total Score */}
        <Card className="p-6 mb-6 bg-gradient-hero">
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-2">Overall Score</h2>
            <div className="text-5xl font-bold text-primary">
              {feedback.totalScore}/100
            </div>
          </div>
        </Card>

        {/* Category Scores */}
        <Card className="p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Category Breakdown</h3>
          <div className="space-y-4">
            {feedback.categoryScores.map((category, index) => (
              <div key={index} className="border-b pb-4 last:border-0">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{category.name}</span>
                  <span className="text-lg font-bold text-primary">
                    {category.score}/100
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{category.comment}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Strengths */}
        <Card className="p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 text-green-600">Strengths</h3>
          <ul className="space-y-2">
            {feedback.strengths.map((strength, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Areas for Improvement */}
        <Card className="p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 text-orange-600">
            Areas for Improvement
          </h3>
          <ul className="space-y-2">
            {feedback.areasForImprovement.map((area, index) => (
              <li key={index} className="flex items-start">
                <span className="text-orange-600 mr-2">!</span>
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Final Assessment */}
        <Card className="p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Final Assessment</h3>
          <p className="text-muted-foreground leading-relaxed">
            {feedback.finalAssessment}
          </p>
        </Card>

        <div className="flex justify-center">
          <Button onClick={onBackToHome} size="lg">
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}