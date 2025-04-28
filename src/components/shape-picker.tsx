"use client";

import { useState } from "react";
import { useFloorContext } from "../context/floor-context";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export default function ShapePicker() {
  const { activeFloor, addShape } = useFloorContext();
  const [category, setCategory] = useState("tables");
  const [customLabel, setCustomLabel] = useState("");

  const handleAddTable = (tableType: "round" | "rectangular" | "square") => {
    if (!activeFloor) return;

    let width = 80;
    let height = 80;

    if (tableType === "rectangular") {
      width = 120;
      height = 80;
    } else if (tableType === "square") {
      width = 80;
      height = 80;
    }

    addShape(activeFloor, {
      id: `table-${Date.now()}`,
      type: "table",
      tableType,
      x: 100,
      y: 100,
      width,
      height,
      label: customLabel || `T${Math.floor(Math.random() * 100)}`,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    });
  };

  const handleAddChair = () => {
    if (!activeFloor) return;

    addShape(activeFloor, {
      id: `chair-${Date.now()}`,
      type: "chair",
      x: 100,
      y: 100,
      width: 40,
      height: 40,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    });
  };

  const handleAddDecoration = (
    decorationType: "plant" | "divider" | "lamp"
  ) => {
    if (!activeFloor) return;

    let width = 40;
    let height = 40;

    if (decorationType === "divider") {
      width = 100;
      height = 10;
    } else if (decorationType === "lamp") {
      width = 30;
      height = 30;
    }

    addShape(activeFloor, {
      id: `decoration-${Date.now()}`,
      type: "decoration",
      decorationType,
      x: 100,
      y: 100,
      width,
      height,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Shape Picker</h2>

      <div className="mb-4">
        <Label htmlFor="custom-label">Custom Label (Optional)</Label>
        <Input
          id="custom-label"
          value={customLabel}
          onChange={(e) => setCustomLabel(e.target.value)}
          placeholder="e.g. T01"
          className="mt-1"
        />
      </div>

      <Tabs value={category} onValueChange={setCategory}>
        <TabsList className="w-full">
          <TabsTrigger value="tables" className="flex-1">
            Tables
          </TabsTrigger>
          <TabsTrigger value="chairs" className="flex-1">
            Chairs
          </TabsTrigger>
          <TabsTrigger value="decorations" className="flex-1">
            Decor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tables" className="mt-4 space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleAddTable("round")}
          >
            <div className="w-6 h-6 rounded-full bg-gray-300 mr-2"></div>
            Round Table
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleAddTable("rectangular")}
          >
            <div className="w-8 h-5 bg-gray-300 mr-2"></div>
            Rectangular Table
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleAddTable("square")}
          >
            <div className="w-6 h-6 bg-gray-300 mr-2"></div>
            Square Table
          </Button>
        </TabsContent>

        <TabsContent value="chairs" className="mt-4 space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleAddChair}
          >
            <div className="w-5 h-5 rounded-full bg-gray-300 mr-2"></div>
            Chair
          </Button>
        </TabsContent>

        <TabsContent value="decorations" className="mt-4 space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleAddDecoration("plant")}
          >
            <div className="w-6 h-6 bg-green-200 mr-2"></div>
            Plant
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleAddDecoration("divider")}
          >
            <div className="w-8 h-3 bg-gray-300 mr-2"></div>
            Divider
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleAddDecoration("lamp")}
          >
            <div className="w-5 h-5 rounded-full bg-yellow-200 mr-2"></div>
            Lamp
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
