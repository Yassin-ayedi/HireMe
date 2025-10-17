const API_URL = "http://localhost:8085/api";

export const api = {
  // Get interview details
  getInterview: async (interviewId: string) => {
    const response = await fetch(`${API_URL}/interviews/${interviewId}`);
    return response.json();
  },

  // 🔥 Create feedback (called from frontend after call ends)
  createFeedback: async (
    interviewId: string,
    userId: string,
    messages: Array<{ role: string; content: string }>
  ) => {
    const response = await fetch(`${API_URL}/feedback/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interviewId, userId, messages }),
    });
    return response.json();
  },

  // Get feedback
  getFeedback: async (interviewId: string, userId: string) => {
    const response = await fetch(`${API_URL}/feedback/${interviewId}?userId=${userId}`);
    return response.json();
  },

  // Generate interview
  generateInterview: async (data: {
    type: string;
    role: string;
    level: string;
    techstack: string;
    amount: number;
    userid: string;
  }) => {
    const response = await fetch(`${API_URL}/vapi/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};