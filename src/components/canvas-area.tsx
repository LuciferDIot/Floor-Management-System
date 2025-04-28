"use client";

import type React from "react";

import { useRef, useState } from "react";
import { useFloorContext } from "../context/floor-context";
import type { Shape } from "../types";

export default function CanvasArea() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const {
    activeFloor,
    floors,
    selectedShapes,
    selectShape,
    updateShape,
    deselectAll,
  } = useFloorContext();
  const [isDragging, setIsDragging] = useState(false);
  const [draggedShape, setDraggedShape] = useState<Shape | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const currentFloor = activeFloor
    ? floors.find((f) => f.id === activeFloor)
    : null;

  // Handle canvas click for deselection
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      deselectAll();
    }
  };

  // Handle shape click for selection
  const handleShapeClick = (e: React.MouseEvent, shape: Shape) => {
    e.stopPropagation();
    const isShift = e.shiftKey;

    if (isShift) {
      if (selectedShapes.includes(shape.id)) {
        selectShape(selectedShapes.filter((id) => id !== shape.id));
      } else {
        selectShape([...selectedShapes, shape.id]);
      }
    } else {
      selectShape([shape.id]);
    }
  };

  // Handle shape drag start
  const handleDragStart = (e: React.MouseEvent, shape: Shape) => {
    e.stopPropagation();
    setIsDragging(true);
    setDraggedShape(shape);

    // Calculate offset from mouse position to shape position
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left - shape.x,
        y: e.clientY - rect.top - shape.y,
      });
    }
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !draggedShape || !activeFloor || !canvasRef.current)
      return;

    const rect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragOffset.x;
    const newY = e.clientY - rect.top - dragOffset.y;

    // Update shape position temporarily during drag
    setDraggedShape({
      ...draggedShape,
      x: newX,
      y: newY,
    });
  };

  // Handle mouse up to end drag
  const handleMouseUp = () => {
    if (isDragging && draggedShape && activeFloor) {
      // Update shape position in state
      updateShape(activeFloor, draggedShape.id, {
        x: draggedShape.x,
        y: draggedShape.y,
      });
      setIsDragging(false);
      setDraggedShape(null);
    }
  };

  // Render a shape based on its type
  const renderShape = (shape: Shape) => {
    const isSelected = selectedShapes.includes(shape.id);
    const isBeingDragged = isDragging && draggedShape?.id === shape.id;

    // Use the dragged position if this shape is being dragged
    const posX = isBeingDragged ? draggedShape.x : shape.x;
    const posY = isBeingDragged ? draggedShape.y : shape.y;

    const shapeStyle: React.CSSProperties = {
      position: "absolute",
      left: `${posX}px`,
      top: `${posY}px`,
      width: `${shape.width}px`,
      height: `${shape.height}px`,
      cursor: "move",
      border: isSelected ? "2px solid #3b82f6" : "1px solid #666",
      backgroundColor: isSelected ? "#dbeafe" : "#ccc",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      userSelect: "none",
      zIndex: isSelected ? 10 : 1,
    };

    if (shape.type === "table") {
      if (shape.tableType === "round") {
        return (
          <div
            key={shape.id}
            style={{
              ...shapeStyle,
              borderRadius: "50%",
            }}
            onClick={(e) => handleShapeClick(e, shape)}
            onMouseDown={(e) => handleDragStart(e, shape)}
          >
            {shape.label}
          </div>
        );
      }
      return (
        <div
          key={shape.id}
          style={shapeStyle}
          onClick={(e) => handleShapeClick(e, shape)}
          onMouseDown={(e) => handleDragStart(e, shape)}
        >
          {shape.label}
        </div>
      );
    }

    if (shape.type === "chair") {
      return (
        <div
          key={shape.id}
          style={{
            ...shapeStyle,
            borderRadius: "50%",
            backgroundColor: isSelected ? "#dbeafe" : "#ddd",
          }}
          onClick={(e) => handleShapeClick(e, shape)}
          onMouseDown={(e) => handleDragStart(e, shape)}
        />
      );
    }

    // Decoration
    let bgColor = "#eee";
    if (shape.decorationType === "plant") {
      bgColor = "#c8e6c9";
    } else if (shape.decorationType === "lamp") {
      bgColor = "#fff9c4";
    }

    return (
      <div
        key={shape.id}
        style={{
          ...shapeStyle,
          backgroundColor: isSelected ? "#dbeafe" : bgColor,
        }}
        onClick={(e) => handleShapeClick(e, shape)}
        onMouseDown={(e) => handleDragStart(e, shape)}
      />
    );
  };

  // Render the floor shape
  const renderFloor = () => {
    if (!currentFloor) return null;

    const { shape } = currentFloor;
    let floorStyle: React.CSSProperties = {
      position: "absolute",
      backgroundColor: "#f5f5f5",
      border: "2px solid #ddd",
    };

    if (shape.type === "rectangle") {
      const [x, y, width, height] = shape.points;
      floorStyle = {
        ...floorStyle,
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
      };
    } else if (shape.type === "circle") {
      const [x, y, radius] = shape.points;
      floorStyle = {
        ...floorStyle,
        left: `${x - radius}px`,
        top: `${y - radius}px`,
        width: `${radius * 2}px`,
        height: `${radius * 2}px`,
        borderRadius: "50%",
      };
    } else {
      // Custom shape not supported in this simplified version
      return null;
    }

    return <div style={floorStyle} />;
  };

  return (
    <div
      ref={canvasRef}
      className="flex-1 relative bg-white overflow-auto"
      onClick={handleCanvasClick}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {renderFloor()}
      {currentFloor && currentFloor.items.map((item) => renderShape(item))}
    </div>
  );
}
