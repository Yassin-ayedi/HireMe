"use client";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import {
  InterviewSetupDialog,
  InterviewSetupData,
} from "@/components/InterviewSetupDialog";
import { InterviewList, Interview } from "@/components/InterviewList";
import { PremiumTriesCounter } from "@/components/PremiumTriesCounter";
import { UpgradeDialog } from "@/components/UpgradeDialog";
import { toast } from "sonner";

import { getCurrentUser } from "@/lib/actions/auth.action";
import { getInterviewsByUserId } from "@/lib/actions/general.action";

const Index = () => {
  const navigate = useNavigate();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [remainingTries, setRemainingTries] = useState(3);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true); // 🔥 ADD THIS

  useEffect(() => {
    async function fetchData() {
      setLoading(true); // 🔥 ADD THIS
      const user = await getCurrentUser();
      console.log("Current User:", user); 
      
      if (!user) {
        setLoading(false); // 🔥 ADD THIS
        return;
      }
      setUser(user);

      const pastInterviews = await getInterviewsByUserId(user.id);
      console.log("Past Interviews:", pastInterviews);
      
      const formatted = pastInterviews.map((i: any) => ({
        id: i.id,
        role: i.role,
        numberOfQuestions: i.numberOfQuestions ?? 8,
        questionTypes: i.questionTypes ?? ["general"],
        date: new Date(i.createdAt),
        status: "completed" as "completed", 
      }));

      setInterviews(formatted);
      setLoading(false); // 🔥 ADD THIS
    }
    fetchData();
  }, []);

  const handleStartInterview = () => {
    if (remainingTries <= 0) {
      setUpgradeDialogOpen(true);
      return;
    }
    setDialogOpen(true);
  };

  const handleSubmitInterview = (data: InterviewSetupData) => {
    const newInterview: Interview = {
      id: data.interviewId,
      role: data.role,
      numberOfQuestions: data.numberOfQuestions,
      questionTypes: data.questionTypes,
      date: new Date(),
      status: "pending",
    };

    setInterviews((prev) => [newInterview, ...prev]);
    setRemainingTries((prev) => prev - 1);
    setDialogOpen(false);

    // Navigate to interview call (not feedback, since it's new)
    navigate(`/interview/${newInterview.id}`);
  };

  // 🔥 CHANGED: Navigate to feedback for completed interviews
  const handleInterviewClick = (interview: Interview) => {
    // If interview is completed, go to feedback
    if (interview.status === "completed") {
      navigate(`/interview/${interview.id}/feedback`);
    } else {
      // If pending/new, go to interview call
      navigate(`/interview/${interview.id}`);
    }
  };

  const handleUpgrade = () => {
    toast.success("Redirecting to payment...", {
      description: "You'll be redirected to complete your upgrade",
    });
    setUpgradeDialogOpen(false);
    // TODO: Integrate with payment system
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">AI Interviewer</h1>
                <p className="text-xs text-muted-foreground">
                  Practice with confidence
                </p>
              </div>
            </div>

            {interviews.length > 0 && (
              <div className="flex items-center gap-4">
                <PremiumTriesCounter remainingTries={remainingTries} />
                <Button variant="gradient" onClick={handleStartInterview}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Interview
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          // 🔥 SHOW LOADING STATE
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your interviews...</p>
            </div>
          </div>
        ) : interviews.length === 0 ? (
          <EmptyState onStartInterview={handleStartInterview} />
        ) : (
          <InterviewList
            interviews={interviews}
            onInterviewClick={handleInterviewClick}
          />
        )}
      </main>

      {/* Interview Setup Dialog */}
      <InterviewSetupDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmitInterview}
        remainingTries={remainingTries}
      />

      {/* Upgrade Dialog */}
      <UpgradeDialog
        open={upgradeDialogOpen}
        onOpenChange={setUpgradeDialogOpen}
        onUpgrade={handleUpgrade}
      />
    </div>
  );
};

export default Index;