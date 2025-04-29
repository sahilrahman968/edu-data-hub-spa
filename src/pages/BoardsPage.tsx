
import BoardForm from "@/components/forms/BoardForm";

const BoardsPage = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Boards Management</h1>
        <p className="text-gray-500">Create and manage educational boards</p>
      </div>
      <div className="max-w-md">
        <BoardForm />
      </div>
    </div>
  );
};

export default BoardsPage;
