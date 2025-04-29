
import TopicForm from "@/components/forms/TopicForm";

const TopicsPage = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Topics Management</h1>
        <p className="text-gray-500">Create and manage educational topics</p>
      </div>
      <div className="max-w-md">
        <TopicForm />
      </div>
    </div>
  );
};

export default TopicsPage;
