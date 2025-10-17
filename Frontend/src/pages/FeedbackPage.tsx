import { useNavigate, useParams } from "react-router-dom";
import { FeedbackView } from "@/components/FeedbackView";

const FeedbackPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate("/");
  };

  if (!id) {
    navigate("/");
    return null;
  }

  return <FeedbackView interviewId={id} onBackToHome={handleBackToHome} />;
};

export default FeedbackPage;