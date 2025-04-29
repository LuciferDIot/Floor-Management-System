"use client";

import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { useFloorContext } from "../context/floor-context";
import { Floor, FloorShapeType } from "../types";

interface FloorCreatorProps {
  onFloorCreated?: () => void;
  initialFloor?: Floor;
}

export default function FloorCreator({
  onFloorCreated,
  initialFloor,
}: FloorCreatorProps) {
  const { addFloor, updateFloor } = useFloorContext();
  const [floorName, setFloorName] = useState(initialFloor?.name || "");
  const [shapeType, setShapeType] = useState<FloorShapeType>(
    initialFloor?.shape?.type || FloorShapeType.Rectangle
  );
  const [size, setSize] = useState({
    width:
      initialFloor?.shape?.type === "rectangle"
        ? initialFloor.shape.points[2]
        : 300,
    height:
      initialFloor?.shape?.type === "rectangle"
        ? initialFloor.shape.points[3]
        : 200,
  });
  const [radius, setRadius] = useState(
    initialFloor?.shape?.type === "circle" ? initialFloor.shape.points[2] : 150
  );

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
      floorData.type = FloorShapeType.Rectangle;
    }

    if (initialFloor) {
      updateFloor(initialFloor.id, {
        name: floorName,
        shape: floorData,
      });
    } else {
      addFloor({
        id: `floor-${Date.now()}`,
        name: floorName,
        shape: floorData,
        items: [],
      });
    }

    if (onFloorCreated) {
      onFloorCreated();
    }
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
          onValueChange={(value) => setShapeType(value as FloorShapeType)}
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
          {initialFloor ? "Update Floor" : "Create Floor"}
        </Button>
      </div>
    </div>
  );
}
