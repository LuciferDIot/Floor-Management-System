"use client";

import type React from "react";

import { useFloorActions } from "@/hooks/useFloorActions";
import { useGroupActions } from "@/hooks/useGroupActions";
import { ElementType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { RotateHandle } from "./rotate-handle";

interface GroupWrapperProps {
  groupId: string;
  floorId: string;
  children: React.ReactNode;
}

export function GroupWrapper({
  groupId,
  floorId,
  children,
}: GroupWrapperProps) {
  const groupRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const { groups, selectedElements, selectGroup, rotateGroup, moveGroup } =
    useGroupActions();

  const { addToHistory } = useFloorActions();

  const group = groups[groupId];
  if (!group) return null;

  const isSelected = selectedElements.some(
    (el) => el.id === groupId && el.type === ElementType.GROUP
  );

  const handleGroupClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectGroup(groupId);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left mouse button
    e.stopPropagation();

    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });

    // Select the group if not already selected
    if (!isSelected) {
      selectGroup(groupId);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const dx = e.clientX - startPos.x;
    const dy = e.clientY - startPos.y;

    moveGroup(groupId, dx, dy);

    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      addToHistory();
    }
  };

  // Add event listeners for drag
  useEffect(() => {
    let handleGlobalMouseMove: (e: MouseEvent) => void;
    let handleGlobalMouseUp: () => void;

    if (isDragging) {
      handleGlobalMouseMove = (e: MouseEvent) => {
        const dx = e.clientX - startPos.x;
        const dy = e.clientY - startPos.y;

        moveGroup(groupId, dx, dy);

        setStartPos({ x: e.clientX, y: e.clientY });
      };

      handleGlobalMouseUp = () => {
        setIsDragging(false);
        addToHistory();
      };

      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleGlobalMouseMove);
        document.removeEventListener("mouseup", handleGlobalMouseUp);
      };
    } else {
      // Return a cleanup function that does nothing if not dragging
      return () => {};
    }
  }, [isDragging, startPos, moveGroup, groupId, addToHistory]);

  const handleRotate = (angle: number) => {
    rotateGroup(groupId, angle);
  };

  return (
    <div
      ref={groupRef}
      className={cn(
        "absolute border-2 border-dashed border-transparent",
        isSelected && "border-blue-500"
      )}
      style={{
        left: group.center.x - 10, // Offset for border
        top: group.center.y - 10,
        width: 20, // Placeholder size, actual size determined by children
        height: 20,
        cursor: isDragging ? "grabbing" : "grab",
        zIndex: isSelected ? 10 : 1,
      }}
      onClick={handleGroupClick}
      onMouseDown={handleMouseDown}
    >
      {children}

      {/* Rotation handle (only show when selected) */}
      {isSelected && (
        <RotateHandle
          onRotate={handleRotate}
          initialRotation={group.rotation}
        />
      )}
    </div>
  );
}
