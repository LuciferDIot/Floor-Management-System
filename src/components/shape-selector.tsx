"use client";

import {
  Circle,
  Pencil,
  RectangleVerticalIcon as Rectangle,
  Square,
} from "lucide-react";
import { cn } from "../lib/utils";
import { FurnitureCategory, ShapeType } from "../types/floor-types";
import { Button } from "./ui/button";

interface ShapeSelectorProps {
  onSelectShape: (shape: ShapeType) => void;
  category: FurnitureCategory;
  selectedShape: ShapeType | null;
}

export default function ShapeSelector({
  onSelectShape,
  category,
  selectedShape,
}: ShapeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Button
        variant="outline"
        className={cn(
          "flex flex-col items-center justify-center h-20 p-2",
          selectedShape === "circle" && "border-primary bg-primary/10"
        )}
        onClick={() => onSelectShape("circle")}
      >
        <Circle
          className={cn(
            "h-8 w-8 mb-1",
            selectedShape === "circle" && "text-primary"
          )}
        />
        <span className="text-xs">
          {category === "table"
            ? "Round Table"
            : category === "chair"
            ? "Chair"
            : "Circle"}
        </span>
      </Button>

      <Button
        variant="outline"
        className={cn(
          "flex flex-col items-center justify-center h-20 p-2",
          selectedShape === "square" && "border-primary bg-primary/10"
        )}
        onClick={() => onSelectShape("square")}
      >
        <Square
          className={cn(
            "h-8 w-8 mb-1",
            selectedShape === "square" && "text-primary"
          )}
        />
        <span className="text-xs">
          {category === "table"
            ? "Square Table"
            : category === "chair"
            ? "Stool"
            : "Square"}
        </span>
      </Button>

      <Button
        variant="outline"
        className={cn(
          "flex flex-col items-center justify-center h-20 p-2",
          selectedShape === "rectangle" && "border-primary bg-primary/10"
        )}
        onClick={() => onSelectShape("rectangle")}
      >
        <Rectangle
          className={cn(
            "h-8 w-8 mb-1",
            selectedShape === "rectangle" && "text-primary"
          )}
        />
        <span className="text-xs">
          {category === "table"
            ? "Rect Table"
            : category === "chair"
            ? "Bench"
            : "Rectangle"}
        </span>
      </Button>

      <Button
        variant="outline"
        className={cn(
          "flex flex-col items-center justify-center h-20 p-2",
          selectedShape === "custom" && "border-primary bg-primary/10"
        )}
        onClick={() => onSelectShape("custom")}
      >
        <Pencil
          className={cn(
            "h-8 w-8 mb-1",
            selectedShape === "custom" && "text-primary"
          )}
        />
        <span className="text-xs">Custom</span>
      </Button>
    </div>
  );
}
