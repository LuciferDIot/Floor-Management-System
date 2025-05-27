"use client";

import type React from "react";

import { useFloorActions } from "@/hooks/useFloorActions";
import { useGroupActions } from "@/hooks/useGroupActions";
import { ElementType } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
} from "react";
import { RotateHandle } from "./rotate-handle";

interface GroupWrapperProps {
  groupId: string;
  children: React.ReactNode;
}

export function GroupWrapper({ groupId, children }: GroupWrapperProps) {
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
        "absolute",
        isSelected && "border-dotted border-2 border-blue-500",
        "transform" // Add transform class for proper rotation
      )}
      style={{
        left: group.center.x - (group.width || 0) / 2,
        top: group.center.y - (group.height || 0) / 2,
        width: `${group.width}px`,
        height: `${group.height}px`,
        transform: `rotate(${group.rotation}deg)`,
        transformOrigin: "center center",
        cursor: isDragging ? "grabbing" : "grab",
        zIndex: isSelected ? 10 : 1,
      }}
      onClick={handleGroupClick}
      onMouseDown={handleMouseDown}
    >
      <div
        className="relative w-full h-full"
        style={{
          // This container will hold all shapes at their relative positions
          transform: `rotate(${-group.rotation}deg)`, // Counter-rotate to maintain shape orientation
          transformOrigin: "center center",
        }}
      >
        {Children.map(children, (child) => {
          if (isValidElement(child)) {
            const typedChild = child as React.ReactElement<{
              shape: { x: number; y: number; rotation: number };
              style?: React.CSSProperties;
            }>;
            const shape = typedChild.props.shape;
            // Calculate shape's position relative to group center
            const groupWidth = group.width ?? 0;
            const groupHeight = group.height ?? 0;
            const relativeX = shape.x - group.center.x + groupWidth / 2;
            const relativeY = shape.y - group.center.y + groupHeight / 2;

            return cloneElement(typedChild, {
              style: {
                ...typedChild.props.style,
                position: "absolute",
                left: `${relativeX}px`,
                top: `${relativeY}px`,
                transform: `rotate(${shape.rotation}deg)`, // Individual shape rotation
              },
            });
          }
          return child;
        })}
      </div>

      {/* Rotation handle */}
      {isSelected && (
        <RotateHandle
          onRotate={handleRotate}
          initialRotation={group.rotation}
        />
      )}
    </div>
  );
}
