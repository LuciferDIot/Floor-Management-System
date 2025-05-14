"use client";

import type React from "react";

import { useFloorPlanStore } from "@/lib/store/floor-plan-store";
import {
  type ShapeType,
  ElementType,
  ReservationStatus,
  ShapeCategory,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { ContextMenu } from "../context-menu/context-menu";
import { ReservationBadge } from "../reservation/reservation-badge";
import { RotateHandle } from "./rotate-handle";

interface ShapeProps {
  shape: ShapeType;
  floorId: string;
  isInGroup?: boolean;
}

export function Shape({ shape, floorId, isInGroup = false }: ShapeProps) {
  const shapeRef = useRef<HTMLDivElement>(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const {
    selectedElements,
    selectShape,
    updateShape,
    deleteShape,
    moveShape,
    reserveTable,
    unreserveTable,
    snapToGrid,
    gridSize,
    addToHistory,
    getChairsForTable,
  } = useFloorPlanStore();

  const isSelected = selectedElements.some(
    (el) => el.id === shape.id && el.type === ElementType.SHAPE
  );
  const isTable = shape.category === ShapeCategory.TABLE;
  const chairCount = isTable ? getChairsForTable(floorId, shape.id).length : 0;

  const handleShapeClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Only handle click if not dragging
    if (!isDragging) {
      const isCtrlPressed = e.ctrlKey;
      selectShape(shape.id);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (shapeRef.current) {
      const rect = shapeRef.current.getBoundingClientRect();
      setContextMenuPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setShowContextMenu(true);

      // Select the shape when right-clicking
      selectShape(shape.id);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left mouse button
    e.stopPropagation();

    // Alt + Drag to duplicate
    if (e.altKey) {
      // Duplicate shape logic
      return;
    }

    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });

    // Select the shape if not already selected
    if (!isSelected) {
      selectShape(shape.id);
    }
  };

  // Fix the event listener setup - replace useState with useEffect
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const dx = e.clientX - startPos.x;
      const dy = e.clientY - startPos.y;

      let newX = shape.x + dx;
      let newY = shape.y + dy;

      // Snap to grid if enabled
      if (snapToGrid) {
        newX = Math.round(newX / gridSize) * gridSize;
        newY = Math.round(newY / gridSize) * gridSize;
      }

      // Use moveShape which handles group membership
      moveShape(floorId, shape.id, newX, newY);

      setStartPos({ x: e.clientX, y: e.clientY });
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        addToHistory();
      }
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [
    isDragging,
    startPos,
    shape.x,
    shape.y,
    snapToGrid,
    gridSize,
    moveShape,
    floorId,
    shape.id,
    addToHistory,
  ]);

  const handleRotate = (angle: number) => {
    updateShape(floorId, shape.id, {
      ...shape,
      rotation: angle,
    });
  };

  // Render different shapes based on category and type
  const renderShape = () => {
    switch (shape.category) {
      case ShapeCategory.TABLE:
        return (
          <div
            className={cn(
              "w-full h-full rounded-full bg-amber-100 border-2",
              shape.reservation?.status === ReservationStatus.RESERVED
                ? "border-red-500"
                : shape.reservation?.status === ReservationStatus.PENDING
                ? "border-yellow-500"
                : "border-green-500"
            )}
          >
            <div className="flex items-center justify-center h-full text-sm font-medium">
              {shape.label}
            </div>
          </div>
        );
      case ShapeCategory.CHAIR:
        return (
          <div className="w-full h-full rounded-md bg-gray-200 border-2 border-gray-400">
            <div className="flex items-center justify-center h-full text-xs">
              {shape.label}
            </div>
          </div>
        );
      case ShapeCategory.CUSTOM:
        // Render custom shape using SVG
        return (
          <div className="w-full h-full">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <path
                d={shape.customPath || "M0,0 L100,0 L100,100 L0,100 Z"}
                fill={shape.fill || "#e5e7eb"}
                stroke={shape.stroke || "#9ca3af"}
                strokeWidth="2"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-sm">
              {shape.label}
            </div>
          </div>
        );
      default:
        return (
          <div className="w-full h-full bg-gray-200 border-2 border-gray-400">
            <div className="flex items-center justify-center h-full text-sm">
              {shape.label}
            </div>
          </div>
        );
    }
  };

  // Don't add event handlers if shape is in a group
  const eventHandlers = isInGroup
    ? {}
    : {
        onClick: handleShapeClick,
        onMouseDown: handleMouseDown,
        onContextMenu: handleContextMenu,
      };

  return (
    <div
      ref={shapeRef}
      className={cn(
        "absolute",
        isSelected && "outline outline-2 outline-blue-500"
      )}
      style={{
        left: shape.x,
        top: shape.y,
        width: shape.width,
        height: shape.height,
        transform: `rotate(${shape.rotation}deg)`,
        cursor: isDragging ? "grabbing" : "grab",
        zIndex: isSelected ? 10 : 1,
      }}
      {...eventHandlers}
    >
      {renderShape()}

      {/* Reservation badge for tables */}
      {isTable && shape.reservation && (
        <ReservationBadge
          reservation={shape.reservation}
          chairCount={chairCount}
        />
      )}

      {/* Rotation handle (only show when selected and not in a group) */}
      {isSelected && !isInGroup && (
        <RotateHandle
          onRotate={handleRotate}
          initialRotation={shape.rotation}
        />
      )}

      {/* Shape Context Menu */}
      {showContextMenu && (
        <ContextMenu
          position={contextMenuPosition}
          items={[
            ...(isTable
              ? [
                  {
                    label:
                      shape.reservation?.status === ReservationStatus.RESERVED
                        ? "Unreserve"
                        : "Reserve",
                    onClick: () =>
                      shape.reservation?.status === ReservationStatus.RESERVED
                        ? unreserveTable(floorId, shape.id)
                        : reserveTable(floorId, shape.id, chairCount),
                  },
                ]
              : []),
            { label: "Rename", onClick: () => {} },
            { label: "Copy", onClick: () => {} },
            { label: "Rotate", onClick: () => {} },
            { label: "Add to Group", onClick: () => {} },
            { label: "Delete", onClick: () => deleteShape(floorId, shape.id) },
          ]}
          onClose={() => setShowContextMenu(false)}
        />
      )}
    </div>
  );
}
