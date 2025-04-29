
import SubjectForm from "@/components/forms/SubjectForm";

const SubjectsPage = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Subjects Management</h1>
        <p className="text-gray-500">Create and manage educational subjects</p>
      </div>
      <div className="max-w-md">
        <SubjectForm />
      </div>
    </div>
  );
};

export default SubjectsPage;
