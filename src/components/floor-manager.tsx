"use client";
import { FloorProvider } from "../context/floor-context";
import CanvasArea from "./canvas-area";
import FloorTabs from "./floor-tabs";
import ShapePicker from "./shape-picker";
import ToolBar from "./tool-bar";

export default function FloorManager() {
  return (
    <FloorProvider>
      <div className="flex w-full h-[calc(100vh-100px)] border rounded-lg overflow-hidden">
        <div className="w-64 border-r bg-gray-50">
          <ShapePicker />
        </div>
        <div className="flex-1 flex flex-col">
          <FloorTabs />
          <CanvasArea />
          <ToolBar />
        </div>
      </div>
    </FloorProvider>
  );
}
