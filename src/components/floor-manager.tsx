"use client";

import { useEffect } from "react";
import { useFloorStore } from "../store/floor-store";
import { FurnitureCategory, ShapeType } from "../types/floor-types";
import FloorCanvas from "./floor-canvas";
import FloorTabs from "./floor-tabs";
import LeftSidebar from "./left-sidebar";

export default function FloorManager() {
  const { floors, setFloors, setActiveShape } = useFloorStore();

  useEffect(() => {
    if (floors[0].shapes.length === 0) {
      const initialTables = Array.from({ length: 9 }, (_, i) => ({
        id: `T0${i + 1}`,
        type: "circle" as ShapeType,
        x: (i % 3) * 220 + 130,
        y: Math.floor(i / 3) * 220 + 130,
        width: 100,
        height: 100,
        category: "table" as FurnitureCategory,
        label: `T0${i + 1}`,
        color: i === 7 ? "#2c5282" : "#d1d5db",
        selected: i === 0,
        chairs: [
          { angle: 0, distance: 60 },
          { angle: 90, distance: 60 },
          { angle: 180, distance: 60 },
          { angle: 270, distance: 60 },
        ],
      }));

      setFloors(
        floors.map((floor, index) =>
          index === 0 ? { ...floor, shapes: initialTables } : floor
        )
      );
      setActiveShape("T01");
    }
  }, [floors, setFloors, setActiveShape]);

  const currentFloor =
    floors.find((f) => f.id === useFloorStore.getState().activeFloor) ||
    floors[0];

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white border-b p-4">
        <h1 className="text-2xl font-bold">Restaurant Floor Manager</h1>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />
        <div className="flex-1 flex flex-col">
          <FloorTabs />
          <div className="flex-1 overflow-auto p-4 bg-gray-50">
            <FloorCanvas floor={currentFloor} />
          </div>
        </div>
      </div>
    </div>
  );
}
