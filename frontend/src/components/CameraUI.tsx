import TitleUI from "./TitleUI";

function CameraUI() {
  return (
    <div className="flex flex-col h-screen bg-[#f8fafc]">
      <TitleUI />
      <div className="flex-grow flex items-center justify-center">
        <h1 className="text-5xl font-bold text-[#0f172a]">Camera UI</h1>
      </div>
    </div>
  );
}   

export default CameraUI;