"use client";

import Konva from "konva";
import { Circle, Group } from "react-konva";
import { useFloorContext } from "../context/floor-context";
import type { Shape } from "../types";

interface ChairShapeProps {
  shape: Shape;
}

export default function ChairShape({ shape }: ChairShapeProps) {
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
        fill={isSelected ? "#b3d1ff" : "#ddd"}
        stroke="#999"
        strokeWidth={1}
      />
    </Group>
  );
}
