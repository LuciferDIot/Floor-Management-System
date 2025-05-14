"use client";

import type React from "react";

import { useCallback, useRef } from "react";
import { useFloorPlanStore } from "../store/floor-plan-store";
import { ShapeCategory } from "../types";

export function useCanvasInteractions(
  canvasRef: React.RefObject<HTMLDivElement>
) {
  const {
    zoom,
    setZoom,
    panOffset,
    setPanOffset,
    setSelectedElements,
    currentTool,
    addShape,
  } = useFloorPlanStore();

  const isDraggingCanvas = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Middle mouse button for panning
      if (e.button === 1) {
        e.preventDefault();
        isDraggingCanvas.current = true;
        lastMousePos.current = { x: e.clientX, y: e.clientY };
        return;
      }

      // Left mouse button
      if (e.button === 0) {
        // Deselect when clicking on empty canvas, but only if Ctrl is not pressed
        if (e.target === canvasRef.current && !e.ctrlKey) {
          setSelectedElements([]);
        }

        // Add shape if a tool is selected
        if (currentTool !== "select" && e.target === canvasRef.current) {
          const rect = canvasRef.current?.getBoundingClientRect();
          if (!rect) return;

          const x = (e.clientX - rect.left) / zoom - panOffset.x;
          const y = (e.clientY - rect.top) / zoom - panOffset.y;

          // Add shape based on current tool
          if (currentTool === ShapeCategory.TABLE) {
            addShape({
              id: `table-${Date.now()}`,
              label: "New Table",
              category: ShapeCategory.TABLE,
              x,
              y,
              width: 80,
              height: 80,
              rotation: 0,
            });
          } else if (currentTool === ShapeCategory.CHAIR) {
            addShape({
              id: `chair-${Date.now()}`,
              label: "New Chair",
              category: ShapeCategory.CHAIR,
              x,
              y,
              width: 40,
              height: 40,
              rotation: 0,
            });
          }
        }
      }
    },
    [zoom, panOffset, setSelectedElements, currentTool, addShape]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDraggingCanvas.current) {
        const dx = e.clientX - lastMousePos.current.x;
        const dy = e.clientY - lastMousePos.current.y;

        setPanOffset({
          x: panOffset.x + dx / zoom,
          y: panOffset.y + dy / zoom,
        });

        lastMousePos.current = { x: e.clientX, y: e.clientY };
      }
    },
    [panOffset, setPanOffset, zoom]
  );

  const handleMouseUp = useCallback(() => {
    isDraggingCanvas.current = false;
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Calculate mouse position relative to canvas
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Calculate mouse position in world space
      const worldX = mouseX / zoom + panOffset.x;
      const worldY = mouseY / zoom + panOffset.y;

      // Calculate new zoom level
      const zoomDelta = -e.deltaY * 0.001;
      const newZoom = Math.max(0.1, Math.min(2, zoom + zoomDelta));

      // Calculate new pan offset to zoom toward mouse position
      const newPanOffset = {
        x: worldX - mouseX / newZoom,
        y: worldY - mouseY / newZoom,
      };

      setZoom(newZoom);
      setPanOffset(newPanOffset);
    },
    [zoom, panOffset, setZoom, setPanOffset]
  );

  const handleMiddleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1) {
      e.preventDefault();
      isDraggingCanvas.current = true;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  }, []);

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    handleMiddleMouseDown,
  };
}
