"use client";

import { Rect, Circle, Line } from "react-konva";
import type { Floor } from "../types";

interface FloorShapeProps {
  floor: Floor;
}

export default function FloorShape({ floor }: FloorShapeProps) {
  const { shape } = floor;

  if (shape.type === "rectangle") {
    const [x, y, width, height] = shape.points;
    return (
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="#f5f5f5"
        stroke="#ddd"
        strokeWidth={2}
      />
    );
  }

  if (shape.type === "circle") {
    const [x, y, radius] = shape.points;
    return (
      <Circle
        x={x}
        y={y}
        radius={radius}
        fill="#f5f5f5"
        stroke="#ddd"
        strokeWidth={2}
      />
    );
  }

  // Custom shape
  return (
    <Line
      points={shape.points}
      fill="#f5f5f5"
      stroke="#ddd"
      strokeWidth={2}
      closed={true}
    />
  );
}
