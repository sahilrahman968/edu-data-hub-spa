
import ChapterForm from "@/components/forms/ChapterForm";

const ChaptersPage = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Chapters Management</h1>
        <p className="text-gray-500">Create and manage educational chapters</p>
      </div>
      <div className="max-w-md">
        <ChapterForm />
      </div>
    </div>
  );
};

export default ChaptersPage;
