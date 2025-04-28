import "./App.css";
import FloorManager from "./components/floor-manager";

function App() {
  return (
    <main className="flex items-center justify-center h-screen w-screen bg-gray-200">
      <div className="w-[80vw] h-[80vh] ">
        <FloorManager />
      </div>
    </main>
  );
}

export default App;
