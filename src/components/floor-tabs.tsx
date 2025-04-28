"use client";

import { Tabs, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { Plus } from "lucide-react";
import { useFloorStore } from "../store/floor-store";
import { Button } from "./ui/button";

export default function FloorTabs() {
  const { floors, activeFloor, setActiveFloor, handleAddFloor } =
    useFloorStore();

  return (
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
  );
}
