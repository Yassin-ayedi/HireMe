export interface Interview {
  id: string;
  role: string;
  numberOfQuestions: number;
  questionTypes: string[];
  date: Date;
  status: "completed" | "in-progress" | "pending";
}
