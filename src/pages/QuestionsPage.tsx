
import QuestionForm from "@/components/forms/QuestionForm";

const QuestionsPage = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Questions Management</h1>
        <p className="text-gray-500">Create and manage educational questions</p>
      </div>
      <div className="w-full">
        <QuestionForm />
      </div>
    </div>
  );
};

export default QuestionsPage;
