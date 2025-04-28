"use client";

import { useState } from "react";
import { useFloorContext } from "../context/floor-context";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";

type ShapeType = "rectangle" | "circle" | "custom";

export default function FloorCreator() {
  const { addFloor } = useFloorContext();
  const [floorName, setFloorName] = useState("");
  const [shapeType, setShapeType] = useState<ShapeType>("rectangle");
  const [size, setSize] = useState({ width: 300, height: 200 });
  const [radius, setRadius] = useState(150);

  const createFloor = () => {
    if (!floorName) return;

    const floorData = {
      points: [] as number[],
      type: shapeType,
    };

    if (shapeType === "rectangle") {
      // Center the rectangle
      const x = 50;
      const y = 50;
      floorData.points = [x, y, size.width, size.height];
    } else if (shapeType === "circle") {
      // Center the circle
      floorData.points = [200, 200, radius];
    } else {
      // Custom shape not supported in this simplified version
      floorData.points = [50, 50, 300, 200];
      floorData.type = "rectangle";
    }

    addFloor({
      id: `floor-${Date.now()}`,
      name: floorName,
      shape: floorData,
      items: [],
    });
  };

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="floor-name">Floor Name</Label>
        <Input
          id="floor-name"
          value={floorName}
          onChange={(e) => setFloorName(e.target.value)}
          placeholder="e.g. Floor 01"
        />
      </div>

      <div className="grid gap-2">
        <Label>Floor Shape</Label>
        <RadioGroup
          value={shapeType}
          onValueChange={(value: string) => setShapeType(value as ShapeType)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="rectangle" id="rectangle" />
            <Label htmlFor="rectangle">Rectangle</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="circle" id="circle" />
            <Label htmlFor="circle">Circle</Label>
          </div>
        </RadioGroup>
      </div>

      {shapeType === "rectangle" && (
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="width">Width</Label>
            <Input
              id="width"
              type="number"
              value={size.width}
              onChange={(e) =>
                setSize({ ...size, width: Number(e.target.value) })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="height">Height</Label>
            <Input
              id="height"
              type="number"
              value={size.height}
              onChange={(e) =>
                setSize({ ...size, height: Number(e.target.value) })
              }
            />
          </div>
        </div>
      )}

      {shapeType === "circle" && (
        <div className="grid gap-2">
          <Label htmlFor="radius">Radius</Label>
          <Input
            id="radius"
            type="number"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
          />
        </div>
      )}

      <div className="border rounded-md overflow-hidden p-4 bg-gray-100">
        {shapeType === "rectangle" && (
          <div
            className="bg-white border border-gray-300"
            style={{
              width: `${Math.min(size.width, 350)}px`,
              height: `${Math.min(size.height, 250)}px`,
            }}
          ></div>
        )}
        {shapeType === "circle" && (
          <div
            className="bg-white border border-gray-300 rounded-full"
            style={{
              width: `${Math.min(radius * 2, 350)}px`,
              height: `${Math.min(radius * 2, 250)}px`,
            }}
          ></div>
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={createFloor} disabled={!floorName}>
          Create Floor
        </Button>
      </div>
    </div>
  );
}
