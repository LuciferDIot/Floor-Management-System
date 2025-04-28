"use client";

import { cn } from "../lib/utils";
import { useFloorStore } from "../store/floor-store";
import { Shape } from "../types/floor-types";

interface ShapeRendererProps {
  shape: Shape;
}

export default function ShapeRenderer({ shape }: ShapeRendererProps) {
  const { drawMode, onShapeSelect, onUpdateShape } = useFloorStore();

  const handleDragStart = (e: React.MouseEvent) => {
    if (drawMode !== "select") return;
    e.stopPropagation();
    const rect = (
      e.currentTarget.parentElement as HTMLElement
    ).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    onShapeSelect(shape.id);

    const dragOffset = { x: x - shape.x, y: y - shape.y };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newX = moveEvent.clientX - rect.left - dragOffset.x;
      const newY = moveEvent.clientY - rect.top - dragOffset.y;
      onUpdateShape({ ...shape, x: newX, y: newY });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  if (shape.type === "circle") {
    return (
      <div
        className={cn(
          "absolute rounded-full flex items-center justify-center transition-colors",
          shape.selected && "ring-2 ring-blue-500"
        )}
        style={{
          left: shape.x - shape.width / 2,
          top: shape.y - shape.height / 2,
          width: shape.width,
          height: shape.height,
          backgroundColor: shape.color,
          cursor: drawMode === "select" ? "move" : "default",
        }}
        onMouseDown={handleDragStart}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-white font-bold">{shape.label}</span>
        {shape.chairs &&
          shape.chairs.map((chair, i) => {
            const chairX =
              Math.cos((chair.angle * Math.PI) / 180) * chair.distance;
            const chairY =
              Math.sin((chair.angle * Math.PI) / 180) * chair.distance;
            return (
              <div
                key={`${shape.id}-chair-${i}`}
                className="absolute rounded-full bg-gray-400"
                style={{
                  width: 30,
                  height: 30,
                  left: shape.width / 2 + chairX - 15,
                  top: shape.height / 2 + chairY - 15,
                }}
              />
            );
          })}
      </div>
    );
  } else if (shape.type === "square" || shape.type === "rectangle") {
    return (
      <div
        className={cn(
          "absolute flex items-center justify-center transition-colors",
          shape.selected && "ring-2 ring-blue-500"
        )}
        style={{
          left: shape.x - shape.width / 2,
          top: shape.y - shape.height / 2,
          width: shape.width,
          height: shape.height,
          backgroundColor: shape.color,
          cursor: drawMode === "select" ? "move" : "default",
        }}
        onMouseDown={handleDragStart}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-white font-bold">{shape.label}</span>
      </div>
    );
  } else if (shape.type === "custom" && shape.customPath) {
    const pathData =
      shape.customPath
        .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
        .join(" ") + " Z";
    return (
      <div
        className={cn("absolute", shape.selected && "ring-2 ring-blue-500")}
        style={{
          left: shape.x,
          top: shape.y,
          width: shape.width,
          height: shape.height,
          cursor: drawMode === "select" ? "move" : "default",
        }}
        onMouseDown={handleDragStart}
        onClick={(e) => e.stopPropagation()}
      >
        <svg width={shape.width} height={shape.height}>
          <path
            d={pathData}
            fill={shape.color}
            stroke={shape.selected ? "#3b82f6" : "transparent"}
            strokeWidth={2}
          />
          <text
            x={shape.width / 2}
            y={shape.height / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontWeight="bold"
          >
            {shape.label}
          </text>
        </svg>
      </div>
    );
  }

  return null;
}
