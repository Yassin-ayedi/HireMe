import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onStartInterview: () => void;
}

export function EmptyState({ onStartInterview }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-in">
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-gradient-hero rounded-2xl flex items-center justify-center animate-glow">
          <Sparkles className="w-12 h-12 text-primary" />
        </div>
      </div>
      
      <h2 className="text-3xl font-bold mb-3 bg-gradient-primary bg-clip-text text-transparent">
        You didn't do interviews yet
      </h2>
      
      <p className="text-muted-foreground mb-8 max-w-md">
        Get started with your first AI-powered interview practice session and level up your interview skills
      </p>
      
      <Button 
        variant="gradient" 
        size="lg" 
        onClick={onStartInterview}
        className="font-semibold"
      >
        <Sparkles className="mr-2 h-5 w-5" />
        Start Interview
      </Button>
    </div>
  );
}
