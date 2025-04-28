import { useCallback, useState } from "react";
import { useFloorStore } from "../store/floor-store";
import { Floor, Shape } from "../types/floor-types";

export function useCanvasInteractions(
  canvasRef: React.RefObject<HTMLDivElement | null>,
  floor: Floor
) {
  const {
    activeShape,
    drawMode,
    selectedShapeType,
    selectedCategory,
    onAddShape,
    onShapeSelect,
    onUpdateShape,
  } = useFloorStore();

  const [isDragging, setIsDragging] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [customPathPoints, setCustomPathPoints] = useState<
    { x: number; y: number }[]
  >([]);
  const [isDrawing, setIsDrawing] = useState(false);

  const isPointInShape = useCallback((x: number, y: number, shape: Shape) => {
    if (shape.type === "circle") {
      const dx = x - shape.x;
      const dy = y - shape.y;
      return Math.sqrt(dx * dx + dy * dy) <= shape.width / 2;
    } else if (shape.type === "square" || shape.type === "rectangle") {
      return (
        x >= shape.x - shape.width / 2 &&
        x <= shape.x + shape.width / 2 &&
        y >= shape.y - shape.height / 2 &&
        y <= shape.y + shape.height / 2
      );
    } else if (shape.type === "custom" && shape.customPath) {
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
  }, []);

  const checkForOverlap = useCallback(
    (shape: Shape) => {
      for (const otherShape of floor.shapes) {
        if (otherShape.id === shape.id) continue;
        const dx = Math.abs(shape.x - otherShape.x);
        const dy = Math.abs(shape.y - otherShape.y);
        const minDistance = (shape.width + otherShape.width) / 2;
        if (dx < minDistance && dy < minDistance) return true;
      }
      return false;
    },
    [floor.shapes]
  );

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (drawMode === "place" && selectedShapeType) {
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
        if (!checkForOverlap(newShape)) {
          onAddShape(newShape);
        }
      } else if (drawMode === "select") {
        let clickedShape = null;
        for (const shape of floor.shapes) {
          if (isPointInShape(x, y, shape)) {
            clickedShape = shape.id;
            break;
          }
        }
        onShapeSelect(clickedShape);
      }
    },
    [
      canvasRef,
      drawMode,
      selectedShapeType,
      selectedCategory,
      floor.shapes,
      checkForOverlap,
      isPointInShape,
      onAddShape,
      onShapeSelect,
    ]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (drawMode !== "draw") return;
      const rect = canvasRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setCustomPathPoints([{ x, y }]);
      setIsDrawing(true);
    },
    [canvasRef, drawMode]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDrawing) {
        const rect = canvasRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const lastPoint = customPathPoints[customPathPoints.length - 1];
        const dx = x - lastPoint.x;
        const dy = y - lastPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 5) {
          setCustomPathPoints((prev) => [...prev, { x, y }]);
        }
      } else if (isDragging && activeShape) {
        const rect = canvasRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const shape = floor.shapes.find((s) => s.id === activeShape);
        if (!shape) return;
        const newX = x - dragOffset.x;
        const newY = y - dragOffset.y;
        const tempShape = { ...shape, x: newX, y: newY };
        if (!checkForOverlap(tempShape)) {
          onUpdateShape(tempShape);
        }
      }
    },
    [
      isDrawing,
      isDragging,
      activeShape,
      canvasRef,
      customPathPoints,
      dragOffset,
      floor.shapes,
      checkForOverlap,
      onUpdateShape,
    ]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (isDrawing && customPathPoints.length >= 3) {
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
      if (
        !checkForOverlap(newShape) &&
        newShape.width > 20 &&
        newShape.height > 20
      ) {
        onAddShape(newShape);
      }
    }
    setIsDrawing(false);
    setCustomPathPoints([]);
  }, [
    isDrawing,
    customPathPoints,
    selectedCategory,
    floor.shapes,
    checkForOverlap,
    onAddShape,
  ]);

  return {
    handleCanvasClick,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    customPathPoints,
    isDrawing,
  };
}
