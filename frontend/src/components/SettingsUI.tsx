import TitleUI from "./TitleUI";

function SettingsUI() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <TitleUI />
      <div className="flex flex-col items-center justify-center mt-4">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-2 text-gray-600">User Settings Information</p>
      </div>
    </div>
  );
}

export default SettingsUI;