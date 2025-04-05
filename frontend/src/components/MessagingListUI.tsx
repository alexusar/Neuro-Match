import TitleUI from "./TitleUI";

function MessagingListUI() {
  return (
    <div className="flex flex-col h-screen">
      <TitleUI />
      <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
        {/* Messaging List Content */}
        <h2 className="text-2xl font-bold text-gray-800">Messaging List</h2>
        {/* Add your messaging list items here */}
      </div>
    </div>
  );
}

export default MessagingListUI;