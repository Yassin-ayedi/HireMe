import { useState } from "react";
import { Search, Calendar, FileText, Clock, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface Interview {
  id: string;
  role: string;
  numberOfQuestions: number;
  questionTypes: string[];
  date: Date;
  status: "completed" | "in-progress" | "pending";
}

interface InterviewListProps {
  interviews: Interview[];
  onInterviewClick: (interview: Interview) => void;
}

export function InterviewList({ interviews, onInterviewClick }: InterviewListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredInterviews = interviews.filter((interview) => {
    const matchesSearch = interview.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || interview.status === statusFilter;
    const matchesType = typeFilter === "all" || interview.questionTypes.includes(typeFilter);
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: Interview["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "in-progress":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="behavioral">Behavioral</SelectItem>
            <SelectItem value="technical">Technical</SelectItem>
            <SelectItem value="leadership">Leadership</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Interview Cards */}
      <div className="grid gap-4">
        {filteredInterviews.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No interviews found matching your filters</p>
          </Card>
        ) : (
          filteredInterviews.map((interview) => (
            <Card
              key={interview.id}
              className="p-6 hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-primary/50"
              onClick={() => onInterviewClick(interview)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                      {interview.role}
                    </h3>
                    <Badge className={getStatusColor(interview.status)}>
                      {interview.status.replace("-", " ")}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      {interview.date.toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FileText className="h-4 w-4" />
                      {interview.numberOfQuestions} questions
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      {interview.numberOfQuestions === 1
                        ? "~5 min"
                        : interview.numberOfQuestions === 8
                        ? "~20 min"
                        : "~40 min"}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {interview.questionTypes.map((type) => (
                      <Badge key={type} variant="outline" className="capitalize">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>

                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
