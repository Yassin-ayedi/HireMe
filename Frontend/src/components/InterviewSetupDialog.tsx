"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { PremiumTriesCounter } from "./PremiumTriesCounter";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { api } from "@/lib/api";

interface InterviewSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: InterviewSetupData) => void;
  remainingTries: number;
}

export interface InterviewSetupData {
  role: string;
  numberOfQuestions: number;
  questionTypes: string[];
  interviewId: string;
}

const QUESTION_COUNTS = [
  { value: 1, label: "Quick", position: 0 },
  { value: 8, label: "Balanced", position: 50 },
  { value: 15, label: "Comprehensive", position: 100 },
];

const QUESTION_TYPES = [
  {
    id: "general",
    label: "General Interview Questions",
    description: "Mix of behavioral and role-specific questions",
  },
  {
    id: "behavioral",
    label: "Behavioral Focus",
    description: "STAR method, soft skills, and experiences",
  },
  {
    id: "technical",
    label: "Technical Focus",
    description: "Role-specific technical skills and knowledge",
  },
  {
    id: "leadership",
    label: "Leadership Focus",
    description: "Management and leadership scenarios",
  },
];

export function InterviewSetupDialog({
  open,
  onOpenChange,
  onSubmit,
  remainingTries,
}: InterviewSetupDialogProps) {
  const [role, setRole] = useState("");
  const [questionCount, setQuestionCount] = useState([50]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const getQuestionNumber = (sliderValue: number) => {
    if (sliderValue <= 25) return 1;
    if (sliderValue <= 75) return 8;
    return 15;
  };

  const getQuestionLabel = (sliderValue: number) => {
    if (sliderValue <= 25) return "Quick";
    if (sliderValue <= 75) return "Balanced";
    return "Comprehensive";
  };

  const toggleType = (typeId: string) => {
    setSelectedTypes((prev) =>
      prev.includes(typeId) ? prev.filter((id) => id !== typeId) : [...prev, typeId]
    );
  };

  const handleSubmit = async () => {
      if (!role.trim() || selectedTypes.length === 0) return;

  const user = await getCurrentUser();
  const userId = user?.id || "unknown";

  const payload = {
    type: selectedTypes[0],
    role: role.trim(),
    level: "junior",
    techstack: "",
    amount: getQuestionNumber(questionCount[0]),
    userid: userId,
  };

  console.log("Generated payload:", payload);

  try {
    // ✅ Use centralized API helper
    const data = await api.generateInterview(payload);
    console.log("API response:", data);

    onSubmit({
      role: payload.role,
      numberOfQuestions: payload.amount,
      questionTypes: selectedTypes,
      interviewId: data.interviewId,
    });

    // Reset
    setRole("");
    setQuestionCount([50]);
    setSelectedTypes([]);
    onOpenChange(false);
    console.log("Interview id:", data.interviewId);
  } catch (err) {
    console.error("Error posting interview:", err);
  }

  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Setup Your Interview</DialogTitle>
          <DialogDescription>Configure your AI interview practice session</DialogDescription>
        </DialogHeader>

        <div className="flex justify-end mb-4">
          <PremiumTriesCounter remainingTries={remainingTries} />
        </div>

        <div className="space-y-6 py-4">
          {/* Role Input */}
          <div className="space-y-2">
            <Label htmlFor="role" className="text-base font-semibold">
              What role are you interviewing for?
            </Label>
            <Input
              id="role"
              placeholder="e.g., Senior Software Engineer, Product Manager..."
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="h-11"
            />
          </div>

          {/* Number of Questions */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Number of Questions</Label>
            <div className="px-2">
              <Slider
                value={questionCount}
                onValueChange={setQuestionCount}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className={questionCount[0] <= 25 ? "text-primary font-medium" : "text-muted-foreground"}>
                1 question (Quick)
              </span>
              <span className={questionCount[0] > 25 && questionCount[0] <= 75 ? "text-primary font-medium" : "text-muted-foreground"}>
                8 questions (Balanced)
              </span>
              <span className={questionCount[0] > 75 ? "text-primary font-medium" : "text-muted-foreground"}>
                15 questions (Comprehensive)
              </span>
            </div>
            <div className="text-center py-2 bg-gradient-hero rounded-lg">
              <span className="text-lg font-bold text-primary">
                {getQuestionNumber(questionCount[0])} questions
              </span>
              <span className="text-sm text-muted-foreground ml-2">
                ({getQuestionLabel(questionCount[0])})
              </span>
            </div>
          </div>

          {/* Question Types */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Type of Questions</Label>
            <div className="space-y-3">
              {QUESTION_TYPES.map((type) => (
                <div
                  key={type.id}
                  className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedTypes.includes(type.id)
                      ? "border-primary bg-gradient-hero"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => toggleType(type.id)}
                >
                  <Checkbox
                    id={type.id}
                    checked={selectedTypes.includes(type.id)}
                    onCheckedChange={() => toggleType(type.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-1">
                    <label
                      htmlFor={type.id}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {type.label}
                    </label>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="gradient"
            onClick={handleSubmit}
            disabled={!role.trim() || selectedTypes.length === 0}
          >
            Start Interview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
