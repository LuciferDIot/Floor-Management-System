"use client";
import { useGroupActions } from "@/hooks/useGroupActions";
import type { ShapeType } from "@/lib/types";
import { GroupWrapper } from "./group-wrapper";
import { Shape } from "./shape";

interface ShapeFactoryProps {
  shape: ShapeType;
  floorId: string;
}

export function ShapeFactory({ shape, floorId }: ShapeFactoryProps) {
  const { floors, groups } = useGroupActions();

  // If shape is part of a group and it's the first shape of the group we encounter,
  // render the entire group
  if (shape.groupId) {
    const group = groups[shape.groupId];
    if (!group) return <Shape shape={shape} floorId={floorId} />;

    // Check if this is the first shape of the group we're rendering
    const firstShapeId = group.shapeIds[0];
    if (shape.id !== firstShapeId) {
      // Not the first shape, will be rendered as part of the group
      return null;
    }

    // This is the first shape, render the entire group
    return (
      <GroupWrapper groupId={shape.groupId}>
        {group.shapeIds.map((shapeId) => {
          // Find the shape in the floor
          const groupShape = floors
            .find((f) => f.id === floorId)
            ?.shapes.find((s) => s.id === shapeId);

          if (!groupShape) return null;

          return (
            <Shape
              key={shapeId}
              shape={groupShape}
              floorId={floorId}
              isInGroup
            />
          );
        })}
      </GroupWrapper>
    );
  }

  // Regular shape, not in a group
  return <Shape shape={shape} floorId={floorId} />;
}
