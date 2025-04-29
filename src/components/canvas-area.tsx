"use client";

import { Pencil, X } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useFloorContext } from "../context/floor-context";
import type { Floor, Shape } from "../types";

function suppressResizeObserverErrors() {
  // This is a more robust way to suppress the specific ResizeObserver error
  const originalError = window.console.error;
  window.console.error = (...args) => {
    if (
      args.length > 0 &&
      typeof args[0] === "string" &&
      args[0].includes("ResizeObserver loop")
    ) {
      // Ignore the ResizeObserver loop error
      return;
    }
    originalError.apply(window.console, args);
  };

  return () => {
    window.console.error = originalError;
  };
}

export default function CanvasArea() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const resizeTimeoutRef = useRef<number | null>(null);
  const {
    activeFloor,
    floors,
    selectedShapes,
    selectShape,
    updateShape,
    deselectAll,
    groupSelectedShapes,
    ungroupSelection,
    isDrawingMode,
    setDrawingMode,
    addCustomShape,
    drawingCategory,
    isReservationMode,
  } = useFloorContext();
  const [isDragging, setIsDragging] = useState(false);
  const [draggedShape, setDraggedShape] = useState<Shape | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [labelText, setLabelText] = useState("");
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const [resizeShape, setResizeShape] = useState<Shape | null>(null);
  const [, setHoveredShape] = useState<Shape | null>(null);
  const [groupedShapes, setGroupedShapes] = useState<Shape[]>([]);
  const [, setInitialGroupDimensions] = useState({ width: 0, height: 0 });
  const [drawingPoints, setDrawingPoints] = useState<number[]>([]);
  const [, setGroupBounds] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [drawingPreviewPath, setDrawingPreviewPath] = useState<string>("");

  useEffect(() => {
    const cleanup = suppressResizeObserverErrors();
    return cleanup;
  }, []);

  const currentFloor = activeFloor
    ? floors.find((f) => f.id === activeFloor)
    : null;

  // Set up keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isDrawingMode) {
          setDrawingMode(false);
          setDrawingPoints([]);
        } else {
          deselectAll();
        }
      } else if (e.key === "g" && e.ctrlKey) {
        e.preventDefault();
        if (activeFloor && selectedShapes.length > 1) {
          groupSelectedShapes(activeFloor);
        }
      } else if (e.key === "u" && e.ctrlKey) {
        e.preventDefault();
        if (activeFloor && selectedShapes.length > 0) {
          ungroupSelection(activeFloor);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    activeFloor,
    selectedShapes,
    deselectAll,
    groupSelectedShapes,
    ungroupSelection,
    isDrawingMode,
    setDrawingMode,
  ]);

  // Calculate group bounds when selection changes
  useEffect(() => {
    if (!currentFloor || selectedShapes.length === 0) {
      setGroupBounds(null);
      return;
    }

    // Check if all selected shapes are in the same group
    const selectedItems = currentFloor.items.filter((item) =>
      selectedShapes.includes(item.id)
    );

    if (selectedItems.length === 0) {
      setGroupBounds(null);
      return;
    }

    // Calculate the bounding box for all selected shapes
    const minX = Math.min(...selectedItems.map((item) => item.x));
    const minY = Math.min(...selectedItems.map((item) => item.y));
    const maxX = Math.max(...selectedItems.map((item) => item.x + item.width));
    const maxY = Math.max(...selectedItems.map((item) => item.y + item.height));

    setGroupBounds({
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    });
  }, [currentFloor, selectedShapes]);

  // Update drawing preview path when points change
  useEffect(() => {
    if (drawingPoints.length < 2) {
      setDrawingPreviewPath("");
      return;
    }

    let path = "";
    for (let i = 0; i < drawingPoints.length; i += 2) {
      const x = drawingPoints[i];
      const y = drawingPoints[i + 1];
      path += (i === 0 ? "M" : "L") + `${x},${y}`;
    }

    // Close the path if we have at least 3 points (6 coordinates)
    if (drawingPoints.length >= 6) {
      path += "Z";
    }

    setDrawingPreviewPath(path);
  }, [drawingPoints]);

  // Handle canvas click for deselection or drawing
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target !== canvasRef.current) return;

    if (isReservationMode) {
      deselectAll();
      return;
    }

    if (isDrawingMode) {
      // Add point to drawing
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setDrawingPoints([...drawingPoints, x, y]);
      }
    } else {
      deselectAll();
    }
  };

  // Handle canvas double click to finish drawing
  const handleCanvasDoubleClick = () => {
    if (!isDrawingMode || drawingPoints.length < 6 || !activeFloor) return;

    // Finish drawing and create custom shape
    addCustomShape(activeFloor, drawingPoints);
    setDrawingPoints([]);
    setDrawingMode(false);
  };

  // Handle shape click for selection
  const handleShapeClick = (e: React.MouseEvent, shape: Shape) => {
    if (isDrawingMode) return; // Ignore shape clicks in drawing mode

    e.stopPropagation();
    const isShift = e.shiftKey;

    // If the shape is part of a group and not using shift, select all shapes in the group
    if (shape.groupId && !isShift && currentFloor) {
      const groupShapes = currentFloor.items.filter(
        (item) => item.groupId === shape.groupId
      );
      const groupIds = groupShapes.map((item) => item.id);
      selectShape(groupIds);
      return;
    }

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
    if (isDrawingMode || isReservationMode) return; // Ignore drag in drawing or reservation mode

    e.stopPropagation();
    setIsDragging(true);
    setDraggedShape(shape);

    // If the shape is part of a group, store all shapes in the group
    if (shape.groupId && currentFloor) {
      const groupShapes = currentFloor.items.filter(
        (item) => item.groupId === shape.groupId
      );
      setGroupedShapes(groupShapes);

      // Select all shapes in the group if not already selected
      if (!selectedShapes.includes(shape.id)) {
        const groupIds = groupShapes.map((item) => item.id);
        selectShape(groupIds);
      }
    } else {
      setGroupedShapes([]);
    }

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
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!canvasRef.current || !currentFloor) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Handle drawing preview for drawing mode
      if (isDrawingMode && drawingPoints.length > 0) {
        // Create a temporary path that includes the current mouse position
        let path = "";
        for (let i = 0; i < drawingPoints.length; i += 2) {
          const x = drawingPoints[i];
          const y = drawingPoints[i + 1];
          path += (i === 0 ? "M" : "L") + `${x},${y}`;
        }
        path += `L${mouseX},${mouseY}`;

        // Close the path if we have at least 3 points (6 coordinates)
        if (drawingPoints.length >= 4) {
          path += "Z";
        }

        setDrawingPreviewPath(path);
        return;
      }

      // Handle resizing
      if (isResizing && resizeShape && activeFloor) {
        e.preventDefault();
        const deltaX = mouseX - resizeStart.x;
        const deltaY = mouseY - resizeStart.y;

        let newWidth = resizeShape.width;
        let newHeight = resizeShape.height;
        let newX = resizeShape.x;
        let newY = resizeShape.y;

        // Update dimensions based on resize direction
        if (
          resizeDirection === "e" ||
          resizeDirection === "ne" ||
          resizeDirection === "se"
        ) {
          newWidth = Math.max(20, resizeShape.width + deltaX);
        }
        if (
          resizeDirection === "s" ||
          resizeDirection === "sw" ||
          resizeDirection === "se"
        ) {
          newHeight = Math.max(20, resizeShape.height + deltaY);
        }
        if (
          resizeDirection === "w" ||
          resizeDirection === "nw" ||
          resizeDirection === "sw"
        ) {
          const widthChange =
            resizeShape.width - Math.max(20, resizeShape.width - deltaX);
          newWidth = Math.max(20, resizeShape.width - deltaX);
          newX = resizeShape.x + widthChange;
        }
        if (
          resizeDirection === "n" ||
          resizeDirection === "nw" ||
          resizeDirection === "ne"
        ) {
          const heightChange =
            resizeShape.height - Math.max(20, resizeShape.height - deltaY);
          newHeight = Math.max(20, resizeShape.height - deltaY);
          newY = resizeShape.y + heightChange;
        }

        // Get floor boundaries
        const floorBounds = getFloorBounds(currentFloor);

        // If this is a grouped shape, we need to resize the entire group
        if (resizeShape.groupId && currentFloor) {
          const groupShapes = currentFloor.items.filter(
            (item) => item.groupId === resizeShape.groupId
          );

          // Calculate the original group bounds
          const originalGroupBounds = calculateGroupBounds(groupShapes);

          // Calculate scale factors
          const scaleX = newWidth / resizeShape.width;
          const scaleY = newHeight / resizeShape.height;

          // Calculate position delta
          const deltaX = newX - resizeShape.x;
          const deltaY = newY - resizeShape.y;

          // Create updated shapes for the entire group
          const updatedGroupShapes = groupShapes.map((shape) => {
            if (shape.id === resizeShape.id) {
              // This is the shape being directly modified
              return {
                ...shape,
                x: newX,
                y: newY,
                width: newWidth,
                height: newHeight,
              };
            } else {
              // Calculate new position relative to the group
              const relativeX = shape.x - originalGroupBounds.x;
              const relativeY = shape.y - originalGroupBounds.y;

              // Apply scale and translation
              return {
                ...shape,
                x: originalGroupBounds.x + deltaX + relativeX * scaleX,
                y: originalGroupBounds.y + deltaY + relativeY * scaleY,
                width: shape.width * scaleX,
                height: shape.height * scaleY,
              };
            }
          });

          // Check if any shape in the group would go outside floor boundaries
          const wouldExceedBoundaries = updatedGroupShapes.some(
            (shape) =>
              shape.x < floorBounds.x ||
              shape.y < floorBounds.y ||
              shape.x + shape.width > floorBounds.x + floorBounds.width ||
              shape.y + shape.height > floorBounds.y + floorBounds.height
          );

          if (wouldExceedBoundaries) {
            // Don't update if it would exceed boundaries
            return;
          }

          // Check for collisions with shapes outside the group
          const otherShapes = currentFloor.items.filter(
            (item) => !groupShapes.some((gs) => gs.id === item.id)
          );
          const wouldCollide = updatedGroupShapes.some((groupShape) =>
            otherShapes.some((otherShape) =>
              doShapesOverlap(groupShape, otherShape)
            )
          );

          if (wouldCollide) {
            // Don't update if it would collide
            return;
          }

          // Update the resize shape temporarily during resize
          setResizeShape({
            ...resizeShape,
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight,
          });
        } else {
          // For single shapes
          // Constrain to floor boundaries
          newX = Math.max(
            floorBounds.x,
            Math.min(floorBounds.x + floorBounds.width - newWidth, newX)
          );
          newY = Math.max(
            floorBounds.y,
            Math.min(floorBounds.y + floorBounds.height - newHeight, newY)
          );

          // Check for collisions with other shapes
          const otherShapes = currentFloor.items.filter(
            (item) => item.id !== resizeShape.id
          );
          const wouldCollide = otherShapes.some((shape) =>
            doShapesOverlap(
              {
                ...resizeShape,
                x: newX,
                y: newY,
                width: newWidth,
                height: newHeight,
              },
              shape
            )
          );

          if (wouldCollide) {
            return;
          }

          // Debounce resize updates to prevent layout thrashing
          if (resizeTimeoutRef.current) {
            cancelAnimationFrame(resizeTimeoutRef.current);
          }

          resizeTimeoutRef.current = requestAnimationFrame(() => {
            setResizeShape({
              ...resizeShape,
              x: newX,
              y: newY,
              width: newWidth,
              height: newHeight,
            });
          });
        }

        return;
      }

      // Handle dragging
      if (isDragging && draggedShape && activeFloor) {
        let newX = mouseX - dragOffset.x;
        let newY = mouseY - dragOffset.y;

        // Get floor boundaries
        const floorBounds = getFloorBounds(currentFloor);

        // If this is a grouped shape, move all shapes in the group
        if (draggedShape.groupId && groupedShapes.length > 0) {
          // Calculate the delta from the original position
          const deltaX = newX - draggedShape.x;
          const deltaY = newY - draggedShape.y;

          // Create updated positions for all shapes in the group
          const updatedGroupShapes = groupedShapes.map((shape) => ({
            ...shape,
            x: shape.x + deltaX,
            y: shape.y + deltaY,
          }));

          // Check if any shape in the group would go outside boundaries
          const wouldExceedBoundaries = updatedGroupShapes.some(
            (shape) =>
              shape.x < floorBounds.x ||
              shape.y < floorBounds.y ||
              shape.x + shape.width > floorBounds.x + floorBounds.width ||
              shape.y + shape.height > floorBounds.y + floorBounds.height
          );

          if (wouldExceedBoundaries) {
            // Don't update if it would exceed boundaries
            return;
          }

          // Check for collisions with shapes outside the group
          const otherShapes = currentFloor.items.filter(
            (item) => !groupedShapes.some((gs) => gs.id === item.id)
          );
          const wouldCollide = updatedGroupShapes.some((groupShape) =>
            otherShapes.some((otherShape) =>
              doShapesOverlap(groupShape, otherShape)
            )
          );

          if (wouldCollide) {
            // Don't update if it would collide
            return;
          }

          // Update the dragged shape temporarily during drag
          setDraggedShape({
            ...draggedShape,
            x: newX,
            y: newY,
          });
        } else {
          // Constrain to floor boundaries
          newX = Math.max(
            floorBounds.x,
            Math.min(
              floorBounds.x + floorBounds.width - draggedShape.width,
              newX
            )
          );
          newY = Math.max(
            floorBounds.y,
            Math.min(
              floorBounds.y + floorBounds.height - draggedShape.height,
              newY
            )
          );

          // Check for collisions with other shapes
          const otherShapes = currentFloor.items.filter(
            (item) => item.id !== draggedShape.id
          );
          const wouldCollide = otherShapes.some((shape) =>
            doShapesOverlap({ ...draggedShape, x: newX, y: newY }, shape)
          );

          if (wouldCollide) {
            return;
          }

          // Update shape position temporarily during drag
          setDraggedShape({
            ...draggedShape,
            x: newX,
            y: newY,
          });
        }
      }
    },
    [
      canvasRef,
      currentFloor,
      isResizing,
      resizeShape,
      activeFloor,
      resizeStart,
      resizeDirection,
      isDragging,
      draggedShape,
      dragOffset,
      groupedShapes,
      isDrawingMode,
      drawingPoints,
    ]
  );

  // Calculate group bounds
  const calculateGroupBounds = (shapes: Shape[]) => {
    if (shapes.length === 0) return { x: 0, y: 0, width: 0, height: 0 };

    const minX = Math.min(...shapes.map((s) => s.x));
    const minY = Math.min(...shapes.map((s) => s.y));
    const maxX = Math.max(...shapes.map((s) => s.x + s.width));
    const maxY = Math.max(...shapes.map((s) => s.y + s.height));

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  };

  // Check if shapes overlap
  const doShapesOverlap = (shape1: Shape, shape2: Shape) => {
    return !(
      shape1.x + shape1.width < shape2.x ||
      shape1.x > shape2.x + shape2.width ||
      shape1.y + shape1.height < shape2.y ||
      shape1.y > shape2.y + shape2.height
    );
  };

  // Handle mouse up to end drag or resize
  const handleMouseUp = () => {
    if (isDragging && draggedShape && activeFloor) {
      // If this is a grouped shape, update all shapes in the group
      if (draggedShape.groupId && groupedShapes.length > 0) {
        const deltaX =
          draggedShape.x -
          (groupedShapes.find((item) => item.id === draggedShape.id)?.x ||
            draggedShape.x);
        const deltaY =
          draggedShape.y -
          (groupedShapes.find((item) => item.id === draggedShape.id)?.y ||
            draggedShape.y);

        // Update all shapes in the group
        groupedShapes.forEach((shape) => {
          updateShape(activeFloor, shape.id, {
            x: shape.x + deltaX,
            y: shape.y + deltaY,
          });
        });
      } else {
        // Update shape position in state
        updateShape(activeFloor, draggedShape.id, {
          x: draggedShape.x,
          y: draggedShape.y,
        });
      }
      setIsDragging(false);
      setDraggedShape(null);
      setGroupedShapes([]);
    }

    if (isResizing && resizeShape && activeFloor) {
      // If this is a grouped shape, update all shapes in the group
      if (resizeShape.groupId && currentFloor) {
        const groupShapes = currentFloor.items.filter(
          (item) => item.groupId === resizeShape.groupId
        );

        // Calculate the original group bounds
        const originalGroupBounds = calculateGroupBounds(groupShapes);

        // Calculate scale factors
        const scaleX =
          resizeShape.width /
          (groupShapes.find((item) => item.id === resizeShape.id)?.width ||
            resizeShape.width);
        const scaleY =
          resizeShape.height /
          (groupShapes.find((item) => item.id === resizeShape.id)?.height ||
            resizeShape.height);

        // Calculate position delta
        const deltaX =
          resizeShape.x -
          (groupShapes.find((item) => item.id === resizeShape.id)?.x ||
            resizeShape.x);
        const deltaY =
          resizeShape.y -
          (groupShapes.find((item) => item.id === resizeShape.id)?.y ||
            resizeShape.y);

        // Update all shapes in the group
        groupShapes.forEach((shape) => {
          if (shape.id === resizeShape.id) {
            // The shape being directly resized
            updateShape(activeFloor, shape.id, {
              x: resizeShape.x,
              y: resizeShape.y,
              width: resizeShape.width,
              height: resizeShape.height,
            });
          } else {
            // Calculate new position relative to the group
            const relativeX = shape.x - originalGroupBounds.x;
            const relativeY = shape.y - originalGroupBounds.y;

            updateShape(activeFloor, shape.id, {
              x: originalGroupBounds.x + deltaX + relativeX * scaleX,
              y: originalGroupBounds.y + deltaY + relativeY * scaleY,
              width: shape.width * scaleX,
              height: shape.height * scaleY,
            });
          }
        });
      } else {
        // Update shape dimensions in state
        updateShape(activeFloor, resizeShape.id, {
          x: resizeShape.x,
          y: resizeShape.y,
          width: resizeShape.width,
          height: resizeShape.height,
        });
      }

      setIsResizing(false);
      setResizeShape(null);
      setResizeDirection(null);
      setInitialGroupDimensions({ width: 0, height: 0 });
    }
  };

  // Handle resize start
  const handleResizeStart = (
    e: React.MouseEvent,
    shape: Shape,
    direction: string
  ) => {
    if (isDrawingMode || isReservationMode) return; // Ignore resize in drawing or reservation mode

    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setResizeShape(shape);
    setResizeDirection(direction);
    setInitialGroupDimensions({ width: 0, height: 0 });

    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setResizeStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }

    // If the shape is part of a group, select all shapes in the group
    if (shape.groupId && currentFloor) {
      const groupShapes = currentFloor.items.filter(
        (item) => item.groupId === shape.groupId
      );
      const groupIds = groupShapes.map((item) => item.id);
      selectShape(groupIds);
    }
  };

  // Get floor boundaries
  const getFloorBounds = (floor: Floor) => {
    const { shape } = floor;

    if (shape.type === "rectangle") {
      const [x, y, width, height] = shape.points;
      return { x, y, width, height };
    } else if (shape.type === "circle") {
      const [x, y, radius] = shape.points;
      return {
        x: x - radius,
        y: y - radius,
        width: radius * 2,
        height: radius * 2,
      };
    }

    // Default bounds for custom shapes
    return { x: 0, y: 0, width: 1000, height: 1000 };
  };

  // Start editing a label
  const handleLabelEdit = (e: React.MouseEvent, shape: Shape) => {
    if (isDrawingMode || isReservationMode) return; // Ignore label edit in drawing or reservation mode

    e.stopPropagation();
    setEditingLabel(shape.id);
    setLabelText(shape.label || "");
  };

  // Save the edited label
  const handleLabelSave = (shapeId: string) => {
    if (activeFloor) {
      updateShape(activeFloor, shapeId, { label: labelText });
    }
    setEditingLabel(null);
  };

  // Handle mouse enter for tooltip
  const handleMouseEnter = (shape: Shape) => {
    setHoveredShape(shape);
  };

  // Handle mouse leave for tooltip
  const handleMouseLeave = () => {
    setHoveredShape(null);
  };

  // Cancel drawing mode
  const cancelDrawing = () => {
    setDrawingPoints([]);
    setDrawingMode(false);
  };

  // Render resize handles
  const renderResizeHandles = (shape: Shape) => {
    const handleStyle: React.CSSProperties = {
      position: "absolute",
      width: "8px",
      height: "8px",
      backgroundColor: "#3b82f6",
      border: "1px solid white",
      zIndex: 20,
    };

    return (
      <>
        {/* North */}
        <div
          style={{
            ...handleStyle,
            top: "-4px",
            left: "calc(50% - 4px)",
            cursor: "n-resize",
          }}
          onMouseDown={(e) => handleResizeStart(e, shape, "n")}
        />
        {/* East */}
        <div
          style={{
            ...handleStyle,
            top: "calc(50% - 4px)",
            right: "-4px",
            cursor: "e-resize",
          }}
          onMouseDown={(e) => handleResizeStart(e, shape, "e")}
        />
        {/* South */}
        <div
          style={{
            ...handleStyle,
            bottom: "-4px",
            left: "calc(50% - 4px)",
            cursor: "s-resize",
          }}
          onMouseDown={(e) => handleResizeStart(e, shape, "s")}
        />
        {/* West */}
        <div
          style={{
            ...handleStyle,
            top: "calc(50% - 4px)",
            left: "-4px",
            cursor: "w-resize",
          }}
          onMouseDown={(e) => handleResizeStart(e, shape, "w")}
        />
        {/* North East */}
        <div
          style={{
            ...handleStyle,
            top: "-4px",
            right: "-4px",
            cursor: "ne-resize",
          }}
          onMouseDown={(e) => handleResizeStart(e, shape, "ne")}
        />
        {/* South East */}
        <div
          style={{
            ...handleStyle,
            bottom: "-4px",
            right: "-4px",
            cursor: "se-resize",
          }}
          onMouseDown={(e) => handleResizeStart(e, shape, "se")}
        />
        {/* South West */}
        <div
          style={{
            ...handleStyle,
            bottom: "-4px",
            left: "-4px",
            cursor: "sw-resize",
          }}
          onMouseDown={(e) => handleResizeStart(e, shape, "sw")}
        />
        {/* North West */}
        <div
          style={{
            ...handleStyle,
            top: "-4px",
            left: "-4px",
            cursor: "nw-resize",
          }}
          onMouseDown={(e) => handleResizeStart(e, shape, "nw")}
        />
      </>
    );
  };

  // Render a shape based on its type
  const renderShape = (shape: Shape) => {
    const isSelected = selectedShapes.includes(shape.id);
    const isBeingDragged = isDragging && draggedShape?.id === shape.id;
    const isBeingResized = isResizing && resizeShape?.id === shape.id;
    const isInGroup = !!shape.groupId;

    // Check if any shape in the same group is being dragged
    const isGroupBeingDragged =
      isInGroup && isDragging && draggedShape?.groupId === shape.groupId;
    const isGroupBeingResized =
      isInGroup && isResizing && resizeShape?.groupId === shape.groupId;

    // Use the dragged/resized position and dimensions if applicable
    let posX = shape.x;
    let posY = shape.y;
    let width = shape.width;
    let height = shape.height;

    if (isBeingDragged) {
      posX = draggedShape.x;
      posY = draggedShape.y;
    } else if (isGroupBeingDragged && draggedShape) {
      // Calculate the delta from the original position of the dragged shape
      const deltaX =
        draggedShape.x -
        (groupedShapes.find((item) => item.id === draggedShape.id)?.x ||
          draggedShape.x);
      const deltaY =
        draggedShape.y -
        (groupedShapes.find((item) => item.id === draggedShape.id)?.y ||
          draggedShape.y);

      posX = shape.x + deltaX;
      posY = shape.y + deltaY;
    } else if (isBeingResized) {
      posX = resizeShape.x;
      posY = resizeShape.y;
      width = resizeShape.width;
      height = resizeShape.height;
    } else if (isGroupBeingResized && resizeShape) {
      // For shapes in a group being resized
      const groupShapes =
        currentFloor?.items.filter((item) => item.groupId === shape.groupId) ||
        [];
      const originalGroupBounds = calculateGroupBounds(groupShapes);

      // Calculate scale factors
      const scaleX =
        resizeShape.width /
        (groupShapes.find((item) => item.id === resizeShape.id)?.width ||
          resizeShape.width);
      const scaleY =
        resizeShape.height /
        (groupShapes.find((item) => item.id === resizeShape.id)?.height ||
          resizeShape.height);

      // Calculate position delta
      const deltaX =
        resizeShape.x -
        (groupShapes.find((item) => item.id === resizeShape.id)?.x ||
          resizeShape.x);
      const deltaY =
        resizeShape.y -
        (groupShapes.find((item) => item.id === resizeShape.id)?.y ||
          resizeShape.y);

      // Calculate new position relative to the group
      const relativeX = shape.x - originalGroupBounds.x;
      const relativeY = shape.y - originalGroupBounds.y;

      posX = originalGroupBounds.x + deltaX + relativeX * scaleX;
      posY = originalGroupBounds.y + deltaY + relativeY * scaleY;
      width = shape.width * scaleX;
      height = shape.height * scaleY;
    }

    // Create tooltip text
    const tooltipText = `Type: ${shape.type}${
      shape.tableType ? ` (${shape.tableType})` : ""
    }${
      shape.decorationType ? ` (${shape.decorationType})` : ""
    } | Size: ${width}x${height} | Position: ${posX},${posY}${
      shape.label ? ` | Label: ${shape.label}` : ""
    }${shape.groupId ? ` | Group: ${shape.groupId}` : ""}`;

    // Determine background color
    let bgColor = "#ccc";
    if (shape.type === "chair") {
      bgColor = "#ddd";
    } else if (shape.type === "decoration") {
      if (shape.decorationType === "plant") {
        bgColor = "#c8e6c9";
      } else if (shape.decorationType === "lamp") {
        bgColor = "#fff9c4";
      } else {
        bgColor = "#eee";
      }
    } else if (shape.type === "custom") {
      bgColor = "#e3f2fd";
    }

    if (isSelected) {
      bgColor = "#dbeafe";
    }

    // For custom shapes, we render a polygon
    if (shape.type === "custom" && shape.points) {
      // Calculate the bounding box for positioning
      const xPoints = shape.points.filter((_, i) => i % 2 === 0);
      const yPoints = shape.points.filter((_, i) => i % 2 === 1);
      const minX = Math.min(...xPoints);
      const minY = Math.min(...yPoints);
      const maxX = Math.max(...xPoints);
      const maxY = Math.max(...yPoints);

      // Create SVG path
      let pathData = "";
      for (let i = 0; i < shape.points.length; i += 2) {
        const x = shape.points[i] - minX;
        const y = shape.points[i + 1] - minY;
        pathData += (i === 0 ? "M" : "L") + `${x},${y}`;
      }
      pathData += "Z"; // Close the path

      const shapeStyle: React.CSSProperties = {
        position: "absolute",
        left: `${posX}px`,
        top: `${posY}px`,
        width: `${width}px`,
        height: `${height}px`,
        cursor: isReservationMode ? "pointer" : "move",
        border: isSelected
          ? "2px solid #3b82f6"
          : isInGroup
          ? "1px dashed #666"
          : "1px solid #666",
        backgroundColor: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
        zIndex: isSelected ? 10 : 1,
      };

      return (
        <div
          key={shape.id}
          style={shapeStyle}
          onClick={(e) => handleShapeClick(e, shape)}
          onMouseDown={(e) => handleDragStart(e, shape)}
          onMouseEnter={() => handleMouseEnter(shape)}
          onMouseLeave={handleMouseLeave}
          title={tooltipText}
        >
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${maxX - minX} ${maxY - minY}`}
          >
            <path
              d={pathData}
              fill={bgColor}
              stroke={isSelected ? "#3b82f6" : "#666"}
              strokeWidth="1"
            />
          </svg>
          {shape.label && (
            <div className="absolute inset-0 flex items-center justify-center text-sm pointer-events-none">
              {shape.label}
            </div>
          )}
          {isSelected && !isReservationMode && renderResizeHandles(shape)}
        </div>
      );
    }

    const shapeStyle: React.CSSProperties = {
      position: "absolute",
      left: `${posX}px`,
      top: `${posY}px`,
      width: `${width}px`,
      height: `${height}px`,
      cursor: isReservationMode ? "pointer" : "move",
      border: isSelected
        ? "2px solid #3b82f6"
        : isInGroup
        ? "1px dashed #666"
        : "1px solid #666",
      backgroundColor: bgColor,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      userSelect: "none",
      zIndex: isSelected ? 10 : 1,
      borderRadius:
        (shape.type === "table" && shape.tableType === "round") ||
        shape.type === "chair"
          ? "50%"
          : undefined,
    };

    return (
      <div
        key={shape.id}
        style={shapeStyle}
        onClick={(e) => handleShapeClick(e, shape)}
        onMouseDown={(e) => handleDragStart(e, shape)}
        onMouseEnter={() => handleMouseEnter(shape)}
        onMouseLeave={handleMouseLeave}
        title={tooltipText}
      >
        {editingLabel === shape.id ? (
          <div onClick={(e) => e.stopPropagation()} className="relative z-20">
            <Input
              value={labelText}
              onChange={(e) => setLabelText(e.target.value)}
              onBlur={() => handleLabelSave(shape.id)}
              onKeyDown={(e) => e.key === "Enter" && handleLabelSave(shape.id)}
              autoFocus
              className="w-16 h-8 text-center"
            />
          </div>
        ) : (
          <>
            {shape.label}
            {isSelected && !isReservationMode && (
              <button
                className="absolute top-0 right-0 bg-white rounded-full p-1 shadow-sm"
                onClick={(e) => handleLabelEdit(e, shape)}
              >
                <Pencil size={12} />
              </button>
            )}
          </>
        )}
        {isSelected && !isReservationMode && renderResizeHandles(shape)}
      </div>
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

  // Render drawing preview
  const renderDrawingPreview = () => {
    if (!isDrawingMode || drawingPoints.length < 2) return null;

    return (
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 100,
        }}
      >
        <path
          d={drawingPreviewPath}
          fill="rgba(59, 130, 246, 0.2)"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
        {drawingPoints.map((_, i) => {
          if (i % 2 === 0) {
            return (
              <circle
                key={i}
                cx={drawingPoints[i]}
                cy={drawingPoints[i + 1]}
                r="4"
                fill="#3b82f6"
              />
            );
          }
          return null;
        })}
      </svg>
    );
  };

  // Render drawing mode UI
  const renderDrawingModeUI = () => {
    if (!isDrawingMode) return null;

    return (
      <div className="absolute top-4 left-4 bg-white p-4 rounded-md shadow-md z-50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">
            Drawing {drawingCategory.type}
          </h3>
          <Button variant="ghost" size="sm" onClick={cancelDrawing}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mb-2">
          Click to add points. Double-click to finish.
        </p>
        <p className="text-xs text-gray-500">
          Points: {drawingPoints.length / 2}
        </p>
        {drawingPoints.length >= 6 && (
          <Button
            size="sm"
            className="mt-2 w-full"
            onClick={handleCanvasDoubleClick as (e: React.MouseEvent) => void}
          >
            Finish Drawing
          </Button>
        )}
      </div>
    );
  };

  return (
    <div
      ref={canvasRef}
      className="flex-1 relative bg-white overflow-auto"
      onClick={handleCanvasClick}
      onDoubleClick={handleCanvasDoubleClick}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {renderFloor()}
      {currentFloor && currentFloor.items.map((item) => renderShape(item))}
      {renderDrawingPreview()}
      {renderDrawingModeUI()}
    </div>
  );
}
