import "./App.css";
import FloorManager from "./components/floor-manager";

function App() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">Restaurant Floor Manager</h1>
      <FloorManager />
    </main>
  );
}

export default App;
