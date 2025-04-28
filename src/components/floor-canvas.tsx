"use client";

import type React from "react";

import { useRef, useState } from "react";
import { cn } from "../lib/utils";
import { useFloorStore } from "../store/floor-store";
import { Floor, Shape } from "../types/floor-types";

interface FloorCanvasProps {
  floor: Floor;
}

export default function FloorCanvas({ floor }: FloorCanvasProps) {
  const {
    activeShape,
    drawMode,
    selectedShapeType,
    selectedCategory,
    onAddShape,
    onShapeSelect,
    onUpdateShape,
  } = useFloorStore();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [customPathPoints, setCustomPathPoints] = useState<
    { x: number; y: number }[]
  >([]);
  const [isDrawing, setIsDrawing] = useState(false);

  // Handle canvas click for placing shapes or selecting
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (drawMode === "place" && selectedShapeType) {
      // Add new shape
      const newShapeId = `${selectedCategory.charAt(0).toUpperCase()}${
        floor.shapes.length + 1
      }`;

      const newShape: Shape = {
        id: newShapeId,
        type: selectedShapeType,
        x,
        y,
        width: selectedShapeType === "circle" ? 100 : 120,
        height:
          selectedShapeType === "circle"
            ? 100
            : selectedShapeType === "square"
            ? 120
            : 80,
        category: selectedCategory,
        label: newShapeId,
        color: "#d1d5db",
        selected: true,
        chairs:
          selectedCategory === "table"
            ? [
                { angle: 0, distance: 60 },
                { angle: 90, distance: 60 },
                { angle: 180, distance: 60 },
                { angle: 270, distance: 60 },
              ]
            : [],
      };

      // Check for overlaps
      const hasOverlap = checkForOverlap(newShape);

      if (!hasOverlap) {
        onAddShape(newShape);
      }
    } else if (drawMode === "select") {
      // Check if clicked on a shape
      let clickedShape = null;

      for (const shape of floor.shapes) {
        if (isPointInShape(x, y, shape)) {
          clickedShape = shape.id;
          break;
        }
      }

      onShapeSelect(clickedShape);
    }
  };

  // Start drawing custom shape
  const handleDrawStart = (e: React.MouseEvent) => {
    if (drawMode !== "draw") return;

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCustomPathPoints([{ x, y }]);
    setIsDrawing(true);
  };

  // Continue drawing custom shape
  const handleDrawMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Only add points if they're significantly different from the last point
    const lastPoint = customPathPoints[customPathPoints.length - 1];
    const dx = x - lastPoint.x;
    const dy = y - lastPoint.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 5) {
      // Only add points that are at least 5px away from the last point
      setCustomPathPoints((prev) => [...prev, { x, y }]);
    }
  };

  // Finish drawing custom shape
  const handleDrawEnd = () => {
    if (!isDrawing || customPathPoints.length < 3) {
      setIsDrawing(false);
      setCustomPathPoints([]);
      return;
    }

    // Create a custom shape from the path
    const minX = Math.min(...customPathPoints.map((p) => p.x));
    const minY = Math.min(...customPathPoints.map((p) => p.y));
    const maxX = Math.max(...customPathPoints.map((p) => p.x));
    const maxY = Math.max(...customPathPoints.map((p) => p.y));

    const newShapeId = `${selectedCategory.charAt(0).toUpperCase()}${
      floor.shapes.length + 1
    }`;

    const newShape: Shape = {
      id: newShapeId,
      type: "custom",
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      category: selectedCategory,
      label: newShapeId,
      color: "#d1d5db",
      selected: true,
      customPath: customPathPoints.map((p) => ({
        x: p.x - minX,
        y: p.y - minY,
      })),
      chairs: [],
    };

    // Check for overlaps
    const hasOverlap = checkForOverlap(newShape);

    if (!hasOverlap && newShape.width > 20 && newShape.height > 20) {
      onAddShape(newShape);
    }

    setIsDrawing(false);
    setCustomPathPoints([]);
  };

  // Start dragging a shape
  const handleShapeDragStart = (e: React.MouseEvent, shape: Shape) => {
    if (drawMode !== "select") return;

    e.stopPropagation();

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setDragOffset({
      x: x - shape.x,
      y: y - shape.y,
    });

    setIsDragging(true);
    onShapeSelect(shape.id);
  };

  // Continue dragging a shape
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDrawing) {
      handleDrawMove(e);
      return;
    }

    if (!isDragging || !activeShape) return;

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const shape = floor.shapes.find((s) => s.id === activeShape);
    if (!shape) return;

    const newX = x - dragOffset.x;
    const newY = y - dragOffset.y;

    // Create a temporary shape to check for overlaps
    const tempShape = { ...shape, x: newX, y: newY };

    // Check for overlaps with other shapes
    const hasOverlap = checkForOverlap(tempShape);

    if (!hasOverlap) {
      onUpdateShape({ ...shape, x: newX, y: newY });
    }
  };

  // End dragging a shape
  const handleMouseUp = () => {
    setIsDragging(false);

    if (isDrawing) {
      handleDrawEnd();
    }
  };

  // Check if a point is inside a shape
  const isPointInShape = (x: number, y: number, shape: Shape) => {
    if (shape.type === "circle") {
      const dx = x - shape.x;
      const dy = y - shape.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance <= shape.width / 2;
    } else if (shape.type === "square" || shape.type === "rectangle") {
      return (
        x >= shape.x - shape.width / 2 &&
        x <= shape.x + shape.width / 2 &&
        y >= shape.y - shape.height / 2 &&
        y <= shape.y + shape.height / 2
      );
    } else if (shape.type === "custom" && shape.customPath) {
      // For custom shapes, use point-in-polygon algorithm
      // This is a simplified version and might need improvement
      let inside = false;
      const points = shape.customPath.map((p) => ({
        x: p.x + shape.x,
        y: p.y + shape.y,
      }));

      for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const xi = points[i].x,
          yi = points[i].y;
        const xj = points[j].x,
          yj = points[j].y;

        const intersect =
          yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
        if (intersect) inside = !inside;
      }

      return inside;
    }

    return false;
  };

  // Check if a shape overlaps with any other shape
  const checkForOverlap = (shape: Shape) => {
    for (const otherShape of floor.shapes) {
      if (otherShape.id === shape.id) continue;

      // Simple bounding box check for now
      // This could be improved with more precise collision detection
      const dx = Math.abs(shape.x - otherShape.x);
      const dy = Math.abs(shape.y - otherShape.y);

      const minDistance = (shape.width + otherShape.width) / 2;

      if (dx < minDistance && dy < minDistance) {
        return true;
      }
    }

    return false;
  };

  // Render a shape based on its type
  const renderShape = (shape: Shape) => {
    const isSelected = shape.selected;

    if (shape.type === "circle") {
      return (
        <div
          key={shape.id}
          className={cn(
            "absolute rounded-full flex items-center justify-center transition-colors",
            isSelected && "ring-2 ring-blue-500"
          )}
          style={{
            left: shape.x - shape.width / 2,
            top: shape.y - shape.height / 2,
            width: shape.width,
            height: shape.height,
            backgroundColor: shape.color,
            cursor: drawMode === "select" ? "move" : "default",
          }}
          onMouseDown={(e) => handleShapeDragStart(e, shape)}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-white font-bold">{shape.label}</span>

          {/* Render chairs if this is a table */}
          {shape.chairs &&
            shape.chairs.map((chair, i) => {
              const chairX =
                Math.cos((chair.angle * Math.PI) / 180) * chair.distance;
              const chairY =
                Math.sin((chair.angle * Math.PI) / 180) * chair.distance;

              return (
                <div
                  key={`${shape.id}-chair-${i}`}
                  className="absolute rounded-full bg-gray-400"
                  style={{
                    width: 30,
                    height: 30,
                    left: shape.width / 2 + chairX - 15,
                    top: shape.height / 2 + chairY - 15,
                  }}
                />
              );
            })}
        </div>
      );
    } else if (shape.type === "square") {
      return (
        <div
          key={shape.id}
          className={cn(
            "absolute flex items-center justify-center transition-colors",
            isSelected && "ring-2 ring-blue-500"
          )}
          style={{
            left: shape.x - shape.width / 2,
            top: shape.y - shape.height / 2,
            width: shape.width,
            height: shape.height,
            backgroundColor: shape.color,
            cursor: drawMode === "select" ? "move" : "default",
          }}
          onMouseDown={(e) => handleShapeDragStart(e, shape)}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-white font-bold">{shape.label}</span>
        </div>
      );
    } else if (shape.type === "rectangle") {
      return (
        <div
          key={shape.id}
          className={cn(
            "absolute flex items-center justify-center transition-colors",
            isSelected && "ring-2 ring-blue-500"
          )}
          style={{
            left: shape.x - shape.width / 2,
            top: shape.y - shape.height / 2,
            width: shape.width,
            height: shape.height,
            backgroundColor: shape.color,
            cursor: drawMode === "select" ? "move" : "default",
          }}
          onMouseDown={(e) => handleShapeDragStart(e, shape)}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-white font-bold">{shape.label}</span>
        </div>
      );
    } else if (shape.type === "custom" && shape.customPath) {
      // For custom shapes, create an SVG path
      const pathData =
        shape.customPath
          .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
          .join(" ") + " Z";

      return (
        <div
          key={shape.id}
          className={cn("absolute", isSelected && "ring-2 ring-blue-500")}
          style={{
            left: shape.x,
            top: shape.y,
            width: shape.width,
            height: shape.height,
            cursor: drawMode === "select" ? "move" : "default",
          }}
          onMouseDown={(e) => handleShapeDragStart(e, shape)}
          onClick={(e) => e.stopPropagation()}
        >
          <svg width={shape.width} height={shape.height}>
            <path
              d={pathData}
              fill={shape.color}
              stroke={isSelected ? "#3b82f6" : "transparent"}
              strokeWidth={2}
            />
            <text
              x={shape.width / 2}
              y={shape.height / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontWeight="bold"
            >
              {shape.label}
            </text>
          </svg>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full border bg-white"
      onClick={handleCanvasClick}
      onMouseDown={handleDrawStart}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        cursor:
          drawMode === "draw"
            ? "crosshair"
            : drawMode === "place"
            ? "cell"
            : "default",
      }}
    >
      {floor.shapes.map(renderShape)}

      {/* Draw the custom path while drawing */}
      {isDrawing && customPathPoints.length > 1 && (
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <path
            d={customPathPoints
              .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
              .join(" ")}
            fill="rgba(59, 130, 246, 0.2)"
            stroke="#3b82f6"
            strokeWidth={2}
          />
        </svg>
      )}
    </div>
  );
}
