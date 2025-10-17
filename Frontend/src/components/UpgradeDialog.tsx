import { Crown, Check, Sparkles, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpgrade: () => void;
}

const PREMIUM_FEATURES = [
  "Unlimited interview practices",
  "Advanced AI feedback and scoring",
  "Custom question difficulty levels",
  "Detailed performance analytics",
  "Interview history export",
  "Priority support",
];

export function UpgradeDialog({ open, onOpenChange, onUpgrade }: UpgradeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Crown className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-2xl text-center">Upgrade to Premium</DialogTitle>
          <DialogDescription className="text-center">
            You've used all your free tries. Upgrade to continue practicing!
          </DialogDescription>
        </DialogHeader>

        <Card className="p-6 border-2 border-primary/20 bg-gradient-hero">
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">$9.99</div>
              <div className="text-sm text-muted-foreground">per month</div>
            </div>

            <div className="space-y-2">
              {PREMIUM_FEATURES.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="mt-0.5 p-1 bg-primary/10 rounded-full">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div className="space-y-3 pt-2">
          <Button
            variant="gradient"
            size="lg"
            className="w-full"
            onClick={onUpgrade}
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Upgrade to Premium
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Maybe Later
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Cancel anytime. No questions asked.
        </p>
      </DialogContent>
    </Dialog>
  );
}
