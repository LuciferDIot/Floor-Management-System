"use client";

import type React from "react";

import { useFloorActions } from "@/hooks/useFloorActions";
import { useCanvasInteractions } from "@/lib/hooks/use-canvas-interactions";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { ContextMenu } from "../context-menu/context-menu";
import { Floor } from "../floor/floor";

export function Canvas() {
  const canvasRef = useRef<HTMLDivElement>(null);

  const {
    floors,
    zoom,
    panOffset,
    snapToGrid,
    gridSize,
    isDrawingCustomShape,
    addFloor,
    setSelectedElements,
  } = useFloorActions();

  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });

  const { handleMouseDown, handleMouseMove, handleMouseUp, handleWheel } =
    useCanvasInteractions(canvasRef);

  // Handle right-click on canvas
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setContextMenuPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setShowContextMenu(true);
    }
  }, []);

  // Close context menu when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = () => {
      setShowContextMenu(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Handle keyboard shortcuts for canvas
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key to deselect
      if (e.key === "Escape") {
        setSelectedElements([]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setSelectedElements]);

  return (
    <div className="relative flex-1 overflow-hidden bg-gray-100">
      <div
        ref={canvasRef}
        className={cn(
          "absolute w-full h-full",
          isDrawingCustomShape && "cursor-crosshair"
        )}
        style={{
          transform: `scale(${zoom}) translate(${panOffset.x}px, ${panOffset.y}px)`,
          transformOrigin: "0 0",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={handleContextMenu}
      >
        {/* Grid */}
        {snapToGrid && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundSize: `${gridSize * zoom}px ${gridSize * zoom}px`,
              backgroundImage:
                "radial-gradient(circle, #9ca3af 1px, transparent 1px)",
              backgroundPosition: `${panOffset.x % gridSize}px ${
                panOffset.y % gridSize
              }px`,
            }}
          />
        )}

        {/* Floors */}
        {floors.map((floor) => (
          <Floor key={floor.id} floor={floor} />
        ))}
      </div>

      {/* Canvas Context Menu */}
      {showContextMenu && (
        <ContextMenu
          position={contextMenuPosition}
          items={[
            { label: "Add Floor", onClick: () => addFloor() },
            { label: "Paste", onClick: () => {}, disabled: true },
            { label: "Toggle Grid", onClick: () => {} },
            { label: "Zoom to Fit", onClick: () => {} },
            { label: "Clear All", onClick: () => {} },
          ]}
          onClose={() => setShowContextMenu(false)}
        />
      )}
    </div>
  );
}
