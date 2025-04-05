import TitleUI from "./TitleUI";

function MessagingUI() {
  return (
    <div className="flex flex-col h-screen bg-[#f8fafc]">
      <TitleUI />
      <div className="flex-grow flex items-center justify-center">
        <h1 className="text-3xl font-bold text-[#0f172a]">Messaging UI</h1>
      </div>
    </div>
  );
}   

export default MessagingUI;