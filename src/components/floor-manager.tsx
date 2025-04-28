"use client";

import { Tabs, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { Plus } from "lucide-react";
import { useEffect } from "react";
import { useFloorStore } from "../store/floor-store";
import { FurnitureCategory, ShapeType } from "../types/floor-types";
import FloorCanvas from "./floor-canvas";
import LeftSidebar from "./left-sidebar";
import { Button } from "./ui/button";

export default function FloorManager() {
  const {
    floors,
    activeFloor,
    setActiveFloor,
    setFloors,
    setActiveShape,
    handleAddFloor,
  } = useFloorStore();

  // Initialize floor 1 with some tables
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

  const currentFloor = floors.find((f) => f.id === activeFloor) || floors[0];

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white border-b p-4">
        <h1 className="text-2xl font-bold">Restaurant Floor Manager</h1>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          <div className="border-b">
            <Tabs value={activeFloor} onValueChange={setActiveFloor}>
              <TabsList className="h-12 w-full justify-start rounded-none border-b bg-white px-4">
                {floors.map((floor) => (
                  <TabsTrigger
                    key={floor.id}
                    value={floor.id}
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6"
                  >
                    {floor.name}
                  </TabsTrigger>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAddFloor}
                  className="ml-2"
                >
                  <Plus size={16} className="mr-1" />
                  Add Floor
                </Button>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex-1 overflow-auto p-4 bg-gray-50">
            <FloorCanvas floor={currentFloor} />
          </div>
        </div>
      </div>
    </div>
  );
}
