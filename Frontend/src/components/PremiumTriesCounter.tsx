import { Crown } from "lucide-react";

interface PremiumTriesCounterProps {
  remainingTries: number;
  maxTries?: number;
}

export function PremiumTriesCounter({ remainingTries, maxTries = 3 }: PremiumTriesCounterProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-hero border border-primary/20 rounded-lg shadow-premium">
      <Crown className="w-5 h-5 text-primary" />
      <span className="text-sm font-medium">
        <span className="text-primary font-bold">{remainingTries}</span>
        <span className="text-muted-foreground"> / {maxTries} tries remaining</span>
      </span>
    </div>
  );
}
