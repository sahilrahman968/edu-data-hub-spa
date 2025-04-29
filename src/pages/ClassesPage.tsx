
import ClassForm from "@/components/forms/ClassForm";

const ClassesPage = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Classes Management</h1>
        <p className="text-gray-500">Create and manage educational classes</p>
      </div>
      <div className="max-w-md">
        <ClassForm />
      </div>
    </div>
  );
};

export default ClassesPage;
