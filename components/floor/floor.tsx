"use client";

import type React from "react";

import { useFloorPlanStore } from "@/lib/store/floor-plan-store";
import { ElementType, type FloorType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";
import { ContextMenu } from "../context-menu/context-menu";
import { ShapeFactory } from "../shapes/shape-factory";
import { ResizeHandle } from "./resize-handle";

interface FloorProps {
  floor: FloorType;
}

export function Floor({ floor }: FloorProps) {
  const floorRef = useRef<HTMLDivElement>(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);

  const {
    selectedElements,
    setSelectedElements,
    updateFloor,
    deleteFloor,
    duplicateFloor,
    bringFloorToFront,
    sendFloorToBack,
    addToHistory,
  } = useFloorPlanStore();

  const isSelected = selectedElements.some(
    (el) => el.id === floor.id && el.type === ElementType.FLOOR
  );

  const handleFloorClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Double click to edit floor
    if (e.detail === 2) {
      // Open floor edit modal
      return;
    }

    // Select floor
    if (!e.ctrlKey) {
      setSelectedElements([{ id: floor.id, type: ElementType.FLOOR }]);
    } else {
      // Add to multi-selection with Ctrl key
      setSelectedElements([
        ...selectedElements,
        { id: floor.id, type: ElementType.FLOOR },
      ]);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (floorRef.current) {
      const rect = floorRef.current.getBoundingClientRect();
      setContextMenuPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setShowContextMenu(true);

      // Select the floor when right-clicking
      if (
        !selectedElements.some(
          (el) => el.id === floor.id && el.type === ElementType.FLOOR
        )
      ) {
        setSelectedElements([{ id: floor.id, type: ElementType.FLOOR }]);
      }
    }
  };

  const handleResizeStart = (direction: string) => {
    setIsResizing(true);
    setResizeDirection(direction);
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
    setResizeDirection(null);
    addToHistory();
  };

  const handleResize = (newWidth: number, newHeight: number) => {
    updateFloor(floor.id, {
      ...floor,
      width: newWidth,
      height: newHeight,
    });
  };

  return (
    <div
      ref={floorRef}
      className={cn(
        "absolute border-2 border-dashed bg-white",
        isSelected ? "border-blue-500" : "border-gray-300"
      )}
      style={{
        left: floor.x,
        top: floor.y,
        width: floor.width,
        height: floor.height,
        zIndex: floor.zIndex,
      }}
      onClick={handleFloorClick}
      onContextMenu={handleContextMenu}
    >
      {/* Floor label */}
      <div className="absolute top-2 left-2 bg-white px-2 py-1 text-sm font-medium rounded">
        {floor.name}
      </div>

      {/* Floor shapes */}
      {floor.shapes.map((shape) => (
        <ShapeFactory key={shape.id} shape={shape} floorId={floor.id} />
      ))}

      {/* Resize handles (only show when selected) */}
      {isSelected && (
        <>
          <ResizeHandle
            position="top-left"
            onResizeStart={() => handleResizeStart("top-left")}
            onResize={(dx, dy) =>
              handleResize(floor.width - dx, floor.height - dy)
            }
            onResizeEnd={handleResizeEnd}
          />
          <ResizeHandle
            position="top-right"
            onResizeStart={() => handleResizeStart("top-right")}
            onResize={(dx, dy) =>
              handleResize(floor.width + dx, floor.height - dy)
            }
            onResizeEnd={handleResizeEnd}
          />
          <ResizeHandle
            position="bottom-left"
            onResizeStart={() => handleResizeStart("bottom-left")}
            onResize={(dx, dy) =>
              handleResize(floor.width - dx, floor.height + dy)
            }
            onResizeEnd={handleResizeEnd}
          />
          <ResizeHandle
            position="bottom-right"
            onResizeStart={() => handleResizeStart("bottom-right")}
            onResize={(dx, dy) =>
              handleResize(floor.width + dx, floor.height + dy)
            }
            onResizeEnd={handleResizeEnd}
          />
        </>
      )}

      {/* Floor Context Menu */}
      {showContextMenu && (
        <ContextMenu
          position={contextMenuPosition}
          items={[
            {
              label: "Bring to Front",
              onClick: () => bringFloorToFront(floor.id),
            },
            { label: "Send to Back", onClick: () => sendFloorToBack(floor.id) },
            { label: "Duplicate", onClick: () => duplicateFloor(floor.id) },
            { label: "Delete", onClick: () => deleteFloor(floor.id) },
            { label: "Edit Shape", onClick: () => {} },
          ]}
          onClose={() => setShowContextMenu(false)}
        />
      )}
    </div>
  );
}
