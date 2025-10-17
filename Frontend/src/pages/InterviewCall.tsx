import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FeedbackView } from "@/components/FeedbackView";
import { api } from "@/lib/api";
import { getCurrentUser } from "@/lib/actions/auth.action";
import Vapi from "@vapi-ai/web";
import { interviewer } from "@/constants";

type CallState = "waiting" | "connecting" | "active" | "ended";

interface SavedMessage {
  role: "user" | "assistant";
  content: string;
}

const InterviewCall = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [callState, setCallState] = useState<CallState>("waiting");
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [messages, setMessages] = useState<SavedMessage[]>([]); // 🔥 Store messages like Next.js

  const videoRef = useRef<HTMLVideoElement>(null);
  const vapiRef = useRef<Vapi | null>(null);

  // Setup camera
  useEffect(() => {
    if (callState === "active" && !localStream) {
      const startCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          setLocalStream(stream);
          if (videoRef.current) videoRef.current.srcObject = stream;
          setCameraOn(true);
        } catch (err) {
          console.error("❌ Camera access denied", err);
        }
      };
      startCamera();
    }

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [callState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
    };
  }, []);

  // 🔥 Generate feedback when call ends (like Next.js)
  useEffect(() => {
    const handleGenerateFeedback = async () => {
      if (callState === "ended" && messages.length > 0) {
        try {
          const user = await getCurrentUser();
          const userId = user?.id || "user123";

          console.log("📝 Generating feedback with", messages.length, "messages");

          // Call backend to create feedback
          const response = await api.createFeedback(id!, userId, messages);

          if (response.success) {
            console.log("✅ Feedback generated:", response.feedbackId);
          } else {
            console.error("❌ Failed to generate feedback");
          }
        } catch (error) {
          console.error("❌ Error generating feedback:", error);
        }
      }
    };

    handleGenerateFeedback();
  }, [callState, messages, id]);

  // Handle start call
  const handleStartCall = async () => {
    setCallState("connecting");

    try {
      // Fetch interview to get questions
      const { success, interview } = await api.getInterview(id!);
      if (!success) throw new Error("Failed to fetch interview");

      // Initialize VAPI
      const publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY;
      vapiRef.current = new Vapi(publicKey);

      // 🔥 Setup event listeners (like Next.js Agent component)
      vapiRef.current.on("call-start", () => {
        console.log("📞 Call started");
        setCallState("active");
      });

      vapiRef.current.on("call-end", () => {
        console.log("☎️  Call ended");
        setCallState("ended");
      });

      // 🔥 Collect transcript messages (like Next.js)
      vapiRef.current.on("message", (message: any) => {
        if (message.type === "transcript" && message.transcriptType === "final") {
          console.log(`💬 ${message.role}: ${message.transcript}`);
          setMessages((prev) => [
            ...prev,
            { role: message.role, content: message.transcript },
          ]);
        }
      });

      vapiRef.current.on("speech-start", () => {
        setIsSpeaking(true);
      });

      vapiRef.current.on("speech-end", () => {
        setIsSpeaking(false);
      });

      vapiRef.current.on("error", (error) => {
        console.error("❌ VAPI error:", error);
        setCallState("waiting");
        alert("Call error. Please try again.");
      });

      // 🔥 Format questions and start call (like Next.js)
      const formattedQuestions = interview.questions.map((q: string) => `- ${q}`).join("\n");
      
      const assistantConfig = {
        ...interviewer,
        model: {
          ...interviewer.model,
          messages: [
            {
              ...interviewer.model.messages[0],
              content: interviewer.model.messages[0].content.replace(
                "{{questions}}",
                formattedQuestions
              ),
            },
          ],
        },
      };

      // Start the call with assistant config
      await vapiRef.current.start(assistantConfig);
    } catch (error) {
      console.error("❌ Error starting call:", error);
      setCallState("waiting");
      alert("Failed to start call. Please try again.");
    }
  };

  // Handle end call button
  const handleEndCall = async () => {
    if (vapiRef.current) {
      vapiRef.current.stop();
    }
    
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
  };

  // Toggle camera
  const toggleCamera = () => {
    if (!localStream) return;

    const videoTracks = localStream.getVideoTracks();
    videoTracks.forEach((track) => {
      track.enabled = !track.enabled;
    });
    setCameraOn(!cameraOn);
  };

  // Toggle microphone
  const toggleMic = () => {
    if (vapiRef.current) {
      vapiRef.current.setMuted(!micOn);
      setMicOn(!micOn);
    }
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  if (callState === "ended") {
    return <FeedbackView interviewId={id!} onBackToHome={handleBackToHome} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">Interview Session</h1>
          {callState === "connecting" && (
            <p className="text-sm text-muted-foreground">Connecting...</p>
          )}
          {messages.length > 0 && (
            <p className="text-xs text-muted-foreground">Messages: {messages.length}</p>
          )}
        </div>
      </header>

      {/* Video Grid */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* Candidate Video */}
          <Card className="aspect-video bg-muted/50 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              {callState === "active" && cameraOn ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-16 h-16 text-primary" />
                </div>
              )}
            </div>
            <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-2">
              <span className="text-sm font-medium">You</span>
              {callState === "active" && !micOn && (
                <MicOff className="w-3 h-3 text-destructive" />
              )}
            </div>
          </Card>

          {/* HR Video */}
          <Card className="aspect-video bg-muted/50 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-16 h-16 text-primary" />
              </div>
            </div>
            <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-2">
              <span className="text-sm font-medium">HR Interviewer</span>
              {isSpeaking && (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              )}
            </div>
          </Card>
        </div>

        {/* Controls */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
          {callState === "waiting" ? (
            <Button
              size="lg"
              onClick={handleStartCall}
              className="rounded-full h-14 px-8"
            >
              <Phone className="mr-2 h-5 w-5" />
              Start Interview
            </Button>
          ) : callState === "connecting" ? (
            <Button size="lg" disabled className="rounded-full h-14 px-8">
              Connecting...
            </Button>
          ) : (
            <>
              <Button
                size="lg"
                variant={cameraOn ? "default" : "secondary"}
                onClick={toggleCamera}
                className="rounded-full h-14 w-14"
              >
                {cameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </Button>

              <Button
                size="lg"
                variant={micOn ? "default" : "secondary"}
                onClick={toggleMic}
                className="rounded-full h-14 w-14"
              >
                {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </Button>

              <Button
                size="lg"
                variant="destructive"
                onClick={handleEndCall}
                className="rounded-full h-14 w-14"
              >
                <PhoneOff className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default InterviewCall;