"use client";

import Konva from "konva";
import { Circle, Group, Rect, Text } from "react-konva";
import { useFloorContext } from "../context/floor-context";
import type { Shape } from "../types";

interface TableShapeProps {
  shape: Shape;
}

export default function TableShape({ shape }: TableShapeProps) {
  const { selectedShapes, selectShape, updateShape, activeFloor } =
    useFloorContext();
  const isSelected = selectedShapes.includes(shape.id);

  const handleSelect = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const isShift = e.evt.shiftKey;

    if (isShift) {
      // Multi-select with shift
      if (selectedShapes.includes(shape.id)) {
        selectShape(selectedShapes.filter((id) => id !== shape.id));
      } else {
        selectShape([...selectedShapes, shape.id]);
      }
    } else {
      // Single select
      selectShape([shape.id]);
    }
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (!activeFloor) return;

    updateShape(activeFloor, shape.id, {
      ...shape,
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  if (shape.tableType === "round") {
    return (
      <Group
        x={shape.x}
        y={shape.y}
        draggable
        onClick={handleSelect}
        onTap={handleSelect}
        onDragEnd={handleDragEnd}
      >
        <Circle
          radius={shape.width / 2}
          fill={isSelected ? "#b3d1ff" : "#ccc"}
          stroke="#666"
          strokeWidth={1}
        />
        <Text
          text={shape.label || ""}
          fontSize={14}
          fill="white"
          align="center"
          verticalAlign="middle"
          width={shape.width}
          height={shape.height}
          offsetX={shape.width / 2}
          offsetY={shape.height / 2}
        />
      </Group>
    );
  }

  // Rectangle or square table
  return (
    <Group
      x={shape.x}
      y={shape.y}
      draggable
      onClick={handleSelect}
      onTap={handleSelect}
      onDragEnd={handleDragEnd}
    >
      <Rect
        width={shape.width}
        height={shape.height}
        fill={isSelected ? "#b3d1ff" : "#ccc"}
        stroke="#666"
        strokeWidth={1}
      />
      <Text
        text={shape.label || ""}
        fontSize={14}
        fill="white"
        align="center"
        verticalAlign="middle"
        width={shape.width}
        height={shape.height}
      />
    </Group>
  );
}
