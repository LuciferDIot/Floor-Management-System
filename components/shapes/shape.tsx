"use client";

import { useFloorActions } from "@/hooks/useFloorActions";
import { useMode } from "@/hooks/useMode";
import { useReservationActions } from "@/hooks/useReservationActions";
import { useSelectionActions } from "@/hooks/useSelectionActions";
import { useShapeActions } from "@/hooks/useShapeActions";
import {
  ElementType,
  ReservationStatus,
  ShapeCategory,
  ShapeType,
  UseType,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ContextMenu } from "../context-menu/context-menu";
import { ReservationBadge } from "../reservation/reservation-badge";
import { RotateHandle } from "./rotate-handle";

interface ShapeProps {
  shape: ShapeType;
  floorId: string;
  isInGroup?: boolean;
  style?: React.CSSProperties;
}

export function Shape({
  shape,
  floorId,
  isInGroup = false,
  style,
}: ShapeProps) {
  const shapeRef = useRef<HTMLDivElement>(null);
  const { mode } = useMode();

  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });

  const { selectedElements, updateShape, deleteShape } = useShapeActions();
  const { reserveTable, unreserveTable, getChairsForTable } =
    useReservationActions();
  const { snapToGrid, gridSize, addToHistory } = useFloorActions();
  const { selectShape } = useSelectionActions();

  const isSelected = selectedElements.some(
    (el) => el.id === shape.id && el.type === ElementType.SHAPE
  );
  const isTable = shape.category === ShapeCategory.TABLE;
  const chairCount = isTable ? getChairsForTable(floorId, shape.id).length : 0;

  const handleShapeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectShape(shape.id);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Get the position relative to the viewport instead of the shape
    setContextMenuPosition({
      x: e.clientX,
      y: e.clientY,
    });
    setShowContextMenu(true);
    selectShape(shape.id);
  };

  const handleDragStart = (e: React.DragEvent) => {
    // Set drag image to empty image for smoother dragging
    const img = new Image();
    img.src =
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    e.dataTransfer.setDragImage(img, 0, 0);

    // Select the shape if not already selected
    if (!isSelected) {
      selectShape(shape.id);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    if (e.clientX === 0 && e.clientY === 0) return; // Ignore invalid events

    const container = shapeRef.current?.parentElement?.getBoundingClientRect();
    if (!container) return;

    // Calculate new position relative to container
    let newX = e.clientX - container.left - shape.width / 2;
    let newY = e.clientY - container.top - shape.height / 2;

    // Apply snap to grid if enabled
    if (snapToGrid) {
      newX = Math.round(newX / gridSize) * gridSize;
      newY = Math.round(newY / gridSize) * gridSize;
    }

    // Update position visually (but don't save to state yet)
    if (shapeRef.current) {
      shapeRef.current.style.left = `${newX}px`;
      shapeRef.current.style.top = `${newY}px`;
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const container = shapeRef.current?.parentElement?.getBoundingClientRect();
    if (!container) return;

    // Calculate final position
    let newX = e.clientX - container.left - shape.width / 2;
    let newY = e.clientY - container.top - shape.height / 2;

    // Apply snap to grid if enabled
    if (snapToGrid) {
      newX = Math.round(newX / gridSize) * gridSize;
      newY = Math.round(newY / gridSize) * gridSize;
    }

    // Save final position to state
    updateShape(floorId, shape.id, {
      ...shape,
      x: newX,
      y: newY,
    });

    addToHistory();
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

  const handleRotate = (angle: number) => {
    updateShape(floorId, shape.id, {
      ...shape,
      rotation: angle,
    });
  };

  const ContextMenuItems = [
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
    ...(mode === UseType.ADVANCED
      ? [{ label: "Add to Group", onClick: () => {} }]
      : []),
    {
      label: "Delete",
      onClick: () => deleteShape(floorId, shape.id),
    },
  ];

  return (
    <>
      <div
        ref={shapeRef}
        draggable={!isInGroup}
        className={cn(
          "absolute",
          isSelected && "outline outline-2 outline-blue-500"
        )}
        style={{
          ...style,
          left: !isInGroup ? shape.x : style?.left,
          top: !isInGroup ? shape.y : style?.top,
          width: shape.width,
          height: shape.height,
          transform: `rotate(${shape.rotation}deg)`,
          cursor: !isInGroup ? "grab" : "default",
          zIndex: isSelected ? 10 : 1,
          position: "absolute",
        }}
        onClick={handleShapeClick}
        onContextMenu={handleContextMenu}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
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
      </div>

      {/* Shape Context Menu - rendered as a portal to body */}
      {showContextMenu &&
        createPortal(
          <ContextMenu
            position={contextMenuPosition}
            items={ContextMenuItems}
            onClose={() => setShowContextMenu(false)}
          />,
          document.body
        )}
    </>
  );
}
