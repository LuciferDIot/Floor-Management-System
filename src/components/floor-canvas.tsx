"use client";

import { useRef } from "react";
import { useCanvasInteractions } from "../hooks/use-canvas-interactions";
import { useFloorStore } from "../store/floor-store";
import { Floor } from "../types/floor-types";
import ShapeRenderer from "./shape-renderer";

interface FloorCanvasProps {
  floor: Floor;
}

export default function FloorCanvas({ floor }: FloorCanvasProps) {
  const { drawMode } = useFloorStore();
  const canvasRef = useRef<HTMLDivElement>(null);
  const {
    handleCanvasClick,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    customPathPoints,
    isDrawing,
  } = useCanvasInteractions(canvasRef, floor);

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full border bg-white"
      onClick={handleCanvasClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        cursor:
          drawMode === "draw"
            ? "crosshair"
            : drawMode === "place"
            ? "cell"
            : "default",
      }}
    >
      {floor.shapes.map((shape) => (
        <ShapeRenderer key={shape.id} shape={shape} />
      ))}

      {isDrawing && customPathPoints.length > 1 && (
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <path
            d={customPathPoints
              .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
              .join(" ")}
            fill="rgba(59, 130, 246, 0.2)"
            stroke="#3b82f6"
            strokeWidth={2}
          />
        </svg>
      )}
    </div>
  );
}
