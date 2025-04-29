"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  DecorationType,
  FloorShapeType,
  FurnitureType,
  ShapeType,
  type DrawingCategory,
  type Floor,
  type Shape,
} from "../types";

interface Reservation {
  id: string;
  name: string;
  time: string;
}

interface FloorContextType {
  floors: Floor[];
  activeFloor: string | null;
  selectedShapes: string[];
  copiedShapes: Shape[];
  canUndo: boolean;
  canRedo: boolean;
  isDrawingMode: boolean;
  drawingCategory: DrawingCategory;

  // Floor actions
  setActiveFloor: (floorId: string) => void;
  addFloor: (floor: Floor) => void;
  updateFloor: (floorId: string, floor: Partial<Floor>, order?: number) => void;
  deleteFloor: (floorId: string) => void;

  // Shape actions
  addShape: (floorId: string, shape: Shape) => void;
  updateShape: (
    floorId: string,
    shapeId: string,
    shape: Partial<Shape>
  ) => void;
  deleteShape: (floorId: string, shapeId: string) => void;
  addCustomShape: (floorId: string, points: number[]) => void;

  // Selection actions
  selectShape: (shapeIds: string[]) => void;
  deselectAll: () => void;

  // Copy/Paste actions
  copySelectedShapes: () => void;
  pasteShapes: (floorId: string) => void;

  // Group actions
  groupSelectedShapes: (floorId: string) => void;
  ungroupSelection: (floorId: string) => void;

  // Delete actions
  deleteSelectedShapes: (floorId: string) => void;

  // History actions
  undo: () => void;
  redo: () => void;

  // Save/Load actions
  saveFloorPlan: () => void;
  loadFloorPlan: () => void;

  // Drawing mode
  setDrawingMode: (isDrawing: boolean) => void;
  setDrawingCategory: (category: DrawingCategory) => void;

  // Reservation mode
  enterReservationMode: () => void;
  exitReservationMode: () => void;
  isReservationMode: boolean;
  addReservation: (tableId: string, reservation: Reservation) => void;
  getReservations: (tableId: string) => Reservation[];
  deleteReservation: (tableId: string, reservationId: string) => void;
}

const FloorContext = createContext<FloorContextType | undefined>(undefined);

// Helper to check if shapes overlap
const doShapesOverlap = (shape1: Shape, shape2: Shape): boolean => {
  // Simple bounding box collision detection
  return !(
    shape1.x + shape1.width < shape2.x ||
    shape1.x > shape2.x + shape2.width ||
    shape1.y + shape1.height < shape2.y ||
    shape1.y > shape2.y + shape2.height
  );
};

// Helper to check if shape is within floor boundaries
const isWithinFloor = (shape: Shape, floor: Floor): boolean => {
  const { x, y, width, height } = shape;

  if (floor.shape.type === FloorShapeType.Rectangle) {
    const [floorX, floorY, floorWidth, floorHeight] = floor.shape.points;
    return (
      x >= floorX &&
      y >= floorY &&
      x + width <= floorX + floorWidth &&
      y + height <= floorY + floorHeight
    );
  } else if (floor.shape.type === FloorShapeType.Circle) {
    const [centerX, centerY, radius] = floor.shape.points;
    const floorX = centerX - radius;
    const floorY = centerY - radius;
    const floorWidth = radius * 2;
    const floorHeight = radius * 2;

    return (
      x >= floorX &&
      y >= floorY &&
      x + width <= floorX + floorWidth &&
      y + height <= floorY + floorHeight
    );
  }

  return true; // Default for custom shapes
};

// Calculate bounding box for a group of shapes
const calculateGroupBounds = (
  shapes: Shape[]
): { x: number; y: number; width: number; height: number } => {
  if (shapes.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

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

export function FloorProvider({ children }: { children: ReactNode }) {
  const [floors, setFloors] = useState<Floor[]>([]);
  const [activeFloor, setActiveFloor] = useState<string | null>(null);
  const [selectedShapes, setSelectedShapes] = useState<string[]>([]);
  const [copiedShapes, setCopiedShapes] = useState<Shape[]>([]);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawingCategory, setDrawingCategory] = useState<DrawingCategory>({
    type: FurnitureType.Table,
    subtype: ShapeType.Rectangular,
  });
  const [isReservationMode, setIsReservationMode] = useState(false);
  const [reservations, setReservations] = useState<
    Record<string, Reservation[]>
  >({});
  const [history, setHistory] = useState<{
    past: Floor[][];
    future: Floor[][];
  }>({
    past: [],
    future: [],
  });

  // Load floors from localStorage on initial render
  useEffect(() => {
    const savedFloors = localStorage.getItem("floorPlan");
    if (savedFloors) {
      try {
        const parsedFloors = JSON.parse(savedFloors);
        setFloors(parsedFloors);
        if (parsedFloors.length > 0) {
          setActiveFloor(parsedFloors[0].id);
        }
      } catch (error) {
        console.error("Error loading floor plan:", error);
      }
    }

    // Load reservations
    const savedReservations = localStorage.getItem("reservations");
    if (savedReservations) {
      try {
        setReservations(JSON.parse(savedReservations));
      } catch (error) {
        console.error("Error loading reservations:", error);
      }
    }
  }, []);

  // Save current state to history
  const saveToHistory = () => {
    setHistory((prev) => ({
      past: [...prev.past, JSON.parse(JSON.stringify(floors))],
      future: [],
    }));
  };

  // Floor actions
  const handleSetActiveFloor = (floorId: string) => {
    setActiveFloor(floorId);
    setSelectedShapes([]);
  };

  const handleAddFloor = (floor: Floor) => {
    saveToHistory();
    setFloors((prev) => [...prev, floor]);
    setActiveFloor(floor.id);
  };

  const handleUpdateFloor = (floorId: string, updatedFloor: Partial<Floor>) => {
    saveToHistory();

    const floorIndex = floors.findIndex((val) => val.id === floorId);
    if (floorIndex >= 0) {
      // Note: findIndex returns -1 if not found
      // Create the updated floor object
      const floorAfter = { ...floors[floorIndex], ...updatedFloor };

      // Remove the old floor and add the updated one
      floors.splice(floorIndex, 1); // Remove 1 item at floorIndex
      floors.push(floorAfter);

      // Alternatively, you could replace in place:
      // floors.splice(floorIndex, 1, floorAfter);
    }
  };

  const handleDeleteFloor = (floorId: string) => {
    saveToHistory();
    const newFloors = floors.filter((floor) => floor.id !== floorId);
    setFloors(newFloors);

    // If we're deleting the active floor, set a new active floor
    if (activeFloor === floorId) {
      setActiveFloor(newFloors.length > 0 ? newFloors[0].id : null);
    }
  };

  // Shape actions
  const handleAddShape = (floorId: string, shape: Shape) => {
    saveToHistory();

    // Find the floor
    const floorIndex = floors.findIndex((floor) => floor.id === floorId);
    if (floorIndex === -1) return;

    const floor = floors[floorIndex];

    // Check if shape is within floor boundaries
    if (!isWithinFloor(shape, floor)) {
      // Adjust position to be within floor
      if (floor.shape.type === "rectangle") {
        const [floorX, floorY, floorWidth, floorHeight] = floor.shape.points;
        shape.x = Math.max(
          floorX,
          Math.min(floorX + floorWidth - shape.width, shape.x)
        );
        shape.y = Math.max(
          floorY,
          Math.min(floorY + floorHeight - shape.height, shape.y)
        );
      } else if (floor.shape.type === "circle") {
        const [centerX, centerY, radius] = floor.shape.points;
        const floorX = centerX - radius;
        const floorY = centerY - radius;
        const floorWidth = radius * 2;
        const floorHeight = radius * 2;

        shape.x = Math.max(
          floorX,
          Math.min(floorX + floorWidth - shape.width, shape.x)
        );
        shape.y = Math.max(
          floorY,
          Math.min(floorY + floorHeight - shape.height, shape.y)
        );
      }
    }

    // Check for collisions with existing shapes
    const existingShapes = floors[floorIndex].items;
    let hasCollision = true;
    let offsetX = 0;
    let offsetY = 0;
    let attempts = 0;
    const maxAttempts = 10;

    // Try different positions until no collision or max attempts reached
    while (hasCollision && attempts < maxAttempts) {
      hasCollision = existingShapes.some((existingShape) =>
        doShapesOverlap(
          { ...shape, x: shape.x + offsetX, y: shape.y + offsetY },
          existingShape
        )
      );

      if (hasCollision) {
        offsetX += 20;
        offsetY += 20;
        attempts++;
      }
    }

    // Apply the offset to avoid collision
    shape.x += offsetX;
    shape.y += offsetY;

    // Ensure the shape is still within floor boundaries after collision avoidance
    if (!isWithinFloor(shape, floor)) {
      if (floor.shape.type === "rectangle") {
        const [floorX, floorY, floorWidth, floorHeight] = floor.shape.points;
        shape.x = Math.max(
          floorX,
          Math.min(floorX + floorWidth - shape.width, shape.x)
        );
        shape.y = Math.max(
          floorY,
          Math.min(floorY + floorHeight - shape.height, shape.y)
        );
      } else if (floor.shape.type === "circle") {
        const [centerX, centerY, radius] = floor.shape.points;
        const floorX = centerX - radius;
        const floorY = centerY - radius;
        const floorWidth = radius * 2;
        const floorHeight = radius * 2;

        shape.x = Math.max(
          floorX,
          Math.min(floorX + floorWidth - shape.width, shape.x)
        );
        shape.y = Math.max(
          floorY,
          Math.min(floorY + floorHeight - shape.height, shape.y)
        );
      }
    }

    // Add the shape to the floor
    const updatedFloors = [...floors];
    updatedFloors[floorIndex] = {
      ...updatedFloors[floorIndex],
      items: [...updatedFloors[floorIndex].items, shape],
    };

    setFloors(updatedFloors);
    setSelectedShapes([shape.id]);
  };

  // Add custom shape from drawn points
  const handleAddCustomShape = (floorId: string, points: number[]) => {
    if (points.length < 6) return; // Need at least 3 points to make a shape

    saveToHistory();

    // Find the floor
    const floorIndex = floors.findIndex((floor) => floor.id === floorId);
    if (floorIndex === -1) return;

    // Calculate bounding box
    const xPoints = points.filter((_, i) => i % 2 === 0);
    const yPoints = points.filter((_, i) => i % 2 === 1);
    const minX = Math.min(...xPoints);
    const minY = Math.min(...yPoints);
    const width = Math.max(...xPoints) - minX;
    const height = Math.max(...yPoints) - minY;

    // Create shape based on the selected category
    const shapeId = `${drawingCategory.type}-${Date.now()}`;
    const customShape: Shape = {
      id: shapeId,
      type: drawingCategory.type,
      x: minX,
      y: minY,
      width,
      height,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      points: [...points], // Store the original points
    };

    // Add category-specific properties
    if (drawingCategory.type === FurnitureType.Table) {
      customShape.tableType = drawingCategory.subtype as ShapeType;
      customShape.label = `T${Math.floor(Math.random() * 100)}`;
    } else if (drawingCategory.type === "decoration") {
      customShape.decorationType = drawingCategory.subtype as DecorationType;
    }

    // Add the shape to the floor
    const updatedFloors = [...floors];
    updatedFloors[floorIndex] = {
      ...updatedFloors[floorIndex],
      items: [...updatedFloors[floorIndex].items, customShape],
    };

    setFloors(updatedFloors);
    setSelectedShapes([customShape.id]);
  };

  const handleUpdateShape = (
    floorId: string,
    shapeId: string,
    updatedShape: Partial<Shape>
  ) => {
    // Find the floor
    const floorIndex = floors.findIndex((floor) => floor.id === floorId);
    if (floorIndex === -1) return;

    // Find the shape
    const shapeIndex = floors[floorIndex].items.findIndex(
      (item) => item.id === shapeId
    );
    if (shapeIndex === -1) return;

    const floor = floors[floorIndex];
    const currentShape = floors[floorIndex].items[shapeIndex];
    const newShape = { ...currentShape, ...updatedShape };

    // If this is a grouped shape, we need to update all shapes in the group
    if (currentShape.groupId) {
      const groupShapes = floors[floorIndex].items.filter(
        (item) => item.groupId === currentShape.groupId
      );

      // If position or size is being updated
      if (
        updatedShape.x !== undefined ||
        updatedShape.y !== undefined ||
        updatedShape.width !== undefined ||
        updatedShape.height !== undefined
      ) {
        // Calculate the original group bounds
        const originalGroupBounds = calculateGroupBounds(groupShapes);

        // Calculate scale factors if width or height is changing
        let scaleX = 1;
        let scaleY = 1;

        if (updatedShape.width !== undefined) {
          scaleX = updatedShape.width / currentShape.width;
        }

        if (updatedShape.height !== undefined) {
          scaleY = updatedShape.height / currentShape.height;
        }

        // Calculate position delta if x or y is changing
        const deltaX =
          updatedShape.x !== undefined ? updatedShape.x - currentShape.x : 0;
        const deltaY =
          updatedShape.y !== undefined ? updatedShape.y - currentShape.y : 0;

        // Create updated shapes for the entire group
        const updatedGroupShapes = groupShapes.map((shape) => {
          if (shape.id === shapeId) {
            // This is the shape being directly modified
            return newShape;
          } else {
            // Calculate new position relative to the group
            const relativeX = shape.x - originalGroupBounds.x;
            const relativeY = shape.y - originalGroupBounds.y;

            // Apply scale and translation
            const updatedGroupShape = {
              ...shape,
              x: originalGroupBounds.x + deltaX + relativeX * scaleX,
              y: originalGroupBounds.y + deltaY + relativeY * scaleY,
              width: shape.width * scaleX,
              height: shape.height * scaleY,
            };

            return updatedGroupShape;
          }
        });

        // Check if any shape in the group would go outside floor boundaries
        const floorBounds = getFloorBounds(floor);
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
        const otherShapes = floors[floorIndex].items.filter(
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

        // Update all shapes in the group
        const updatedFloors = [...floors];
        updatedFloors[floorIndex] = {
          ...updatedFloors[floorIndex],
          items: updatedFloors[floorIndex].items.map((item) => {
            const updatedGroupShape = updatedGroupShapes.find(
              (gs) => gs.id === item.id
            );
            return updatedGroupShape || item;
          }),
        };

        setFloors(updatedFloors);
        return;
      }
    }

    // For single shapes or other properties
    // Check if updated shape would be within floor boundaries
    if (
      updatedShape.x !== undefined ||
      updatedShape.y !== undefined ||
      updatedShape.width !== undefined ||
      updatedShape.height !== undefined
    ) {
      if (!isWithinFloor(newShape, floor)) {
        // Adjust position to be within floor
        if (floor.shape.type === "rectangle") {
          const [floorX, floorY, floorWidth, floorHeight] = floor.shape.points;
          newShape.x = Math.max(
            floorX,
            Math.min(floorX + floorWidth - newShape.width, newShape.x)
          );
          newShape.y = Math.max(
            floorY,
            Math.min(floorY + floorHeight - newShape.height, newShape.y)
          );
        } else if (floor.shape.type === "circle") {
          const [centerX, centerY, radius] = floor.shape.points;
          const floorX = centerX - radius;
          const floorY = centerY - radius;
          const floorWidth = radius * 2;
          const floorHeight = radius * 2;

          newShape.x = Math.max(
            floorX,
            Math.min(floorX + floorWidth - newShape.width, newShape.x)
          );
          newShape.y = Math.max(
            floorY,
            Math.min(floorY + floorHeight - newShape.height, newShape.y)
          );
        }
      }

      // Check for collisions with other shapes
      const otherShapes = floors[floorIndex].items.filter(
        (item) => item.id !== shapeId
      );

      // Don't check collisions with shapes in the same group
      const shapesToCheck = newShape.groupId
        ? otherShapes.filter((item) => item.groupId !== newShape.groupId)
        : otherShapes;

      const wouldCollide = shapesToCheck.some((shape) =>
        doShapesOverlap(newShape, shape)
      );

      if (wouldCollide) {
        // If would collide, don't update position
        newShape.x = currentShape.x;
        newShape.y = currentShape.y;
        newShape.width = currentShape.width;
        newShape.height = currentShape.height;
      }
    }

    // Update the shape
    const updatedFloors = [...floors];
    updatedFloors[floorIndex].items[shapeIndex] = newShape;

    setFloors(updatedFloors);
  };

  // Helper function to get floor boundaries
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

  const handleDeleteShape = (floorId: string, shapeId: string) => {
    saveToHistory();

    // Find the floor
    const floorIndex = floors.findIndex((floor) => floor.id === floorId);
    if (floorIndex === -1) return;

    // Remove the shape
    const updatedFloors = [...floors];
    updatedFloors[floorIndex] = {
      ...updatedFloors[floorIndex],
      items: updatedFloors[floorIndex].items.filter(
        (item) => item.id !== shapeId
      ),
    };

    // Update selected shapes
    const updatedSelectedShapes = selectedShapes.filter((id) => id !== shapeId);

    setFloors(updatedFloors);
    setSelectedShapes(updatedSelectedShapes);
  };

  // Selection actions
  const handleSelectShape = (shapeIds: string[]) => {
    setSelectedShapes(shapeIds);
  };

  const handleDeselectAll = () => {
    setSelectedShapes([]);
  };

  // Copy/Paste actions
  const handleCopySelectedShapes = () => {
    // Find all selected shapes across all floors
    const shapesToCopy: Shape[] = [];

    floors.forEach((floor) => {
      floor.items.forEach((item) => {
        if (selectedShapes.includes(item.id)) {
          shapesToCopy.push({ ...item });
        }
      });
    });

    setCopiedShapes(shapesToCopy);
  };

  const handlePasteShapes = (floorId: string) => {
    if (copiedShapes.length === 0) return;

    saveToHistory();

    // Find the floor
    const floorIndex = floors.findIndex((floor) => floor.id === floorId);
    if (floorIndex === -1) return;

    const floor = floors[floorIndex];

    // Create new shapes with new IDs and slightly offset position
    const newShapes = copiedShapes.map((shape) => ({
      ...shape,
      id: `${shape.type}-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      x: shape.x + 20,
      y: shape.y + 20,
    }));

    // Adjust positions to avoid overlaps and stay within floor boundaries
    let offsetX = 0;
    let offsetY = 0;
    let maxAttempts = 10;
    let hasCollision = true;

    // Try different positions until no collision or max attempts reached
    while (hasCollision && maxAttempts > 0) {
      hasCollision = false;

      // Check if any new shape overlaps with existing shapes or is outside floor
      for (const newShape of newShapes) {
        const adjustedShape = {
          ...newShape,
          x: newShape.x + offsetX,
          y: newShape.y + offsetY,
        };

        // Check floor boundaries
        if (!isWithinFloor(adjustedShape, floor)) {
          hasCollision = true;
          break;
        }

        // Check collisions with existing shapes
        if (
          floor.items.some((existingShape) =>
            doShapesOverlap(adjustedShape, existingShape)
          )
        ) {
          hasCollision = true;
          break;
        }
      }

      if (hasCollision) {
        // Try a new position
        offsetX += 20;
        offsetY += 20;
        maxAttempts--;
      }
    }

    // Apply the final offset to all shapes
    const finalShapes = newShapes.map((shape) => ({
      ...shape,
      x: shape.x + offsetX,
      y: shape.y + offsetY,
    }));

    // Add the new shapes to the floor
    const updatedFloors = [...floors];
    updatedFloors[floorIndex] = {
      ...updatedFloors[floorIndex],
      items: [...updatedFloors[floorIndex].items, ...finalShapes],
    };

    // Select the newly pasted shapes
    const newShapeIds = finalShapes.map((shape) => shape.id);

    setFloors(updatedFloors);
    setSelectedShapes(newShapeIds);
  };

  // Group actions
  const handleGroupSelectedShapes = (floorId: string) => {
    if (selectedShapes.length < 2) return;

    saveToHistory();

    // Find the floor
    const floorIndex = floors.findIndex((floor) => floor.id === floorId);
    if (floorIndex === -1) return;

    // Create a new group ID
    const groupId = `group-${Date.now()}`;

    // Update the shapes to be in the group
    const updatedFloors = [...floors];
    updatedFloors[floorIndex] = {
      ...updatedFloors[floorIndex],
      items: updatedFloors[floorIndex].items.map((item) => {
        if (selectedShapes.includes(item.id)) {
          return { ...item, groupId };
        }
        return item;
      }),
    };

    setFloors(updatedFloors);
  };

  const handleUngroupSelection = (floorId: string) => {
    if (selectedShapes.length === 0) return;

    saveToHistory();

    // Find the floor
    const floorIndex = floors.findIndex((floor) => floor.id === floorId);
    if (floorIndex === -1) return;

    // Get all group IDs from selected shapes
    const groupIds = new Set<string>();
    floors[floorIndex].items.forEach((item) => {
      if (selectedShapes.includes(item.id) && item.groupId) {
        groupIds.add(item.groupId);
      }
    });

    if (groupIds.size === 0) return;

    // Remove the group IDs from all shapes in those groups
    const updatedFloors = [...floors];
    updatedFloors[floorIndex] = {
      ...updatedFloors[floorIndex],
      items: updatedFloors[floorIndex].items.map((item) => {
        if (item.groupId && groupIds.has(item.groupId)) {
          const { ...rest } = item;
          return rest;
        }
        return item;
      }),
    };

    setFloors(updatedFloors);
  };

  // Delete actions
  const handleDeleteSelectedShapes = (floorId: string) => {
    if (selectedShapes.length === 0) return;

    saveToHistory();

    // Find the floor
    const floorIndex = floors.findIndex((floor) => floor.id === floorId);
    if (floorIndex === -1) return;

    // Remove the selected shapes
    const updatedFloors = [...floors];
    updatedFloors[floorIndex] = {
      ...updatedFloors[floorIndex],
      items: updatedFloors[floorIndex].items.filter(
        (item) => !selectedShapes.includes(item.id)
      ),
    };

    setFloors(updatedFloors);
    setSelectedShapes([]);
  };

  // History actions
  const handleUndo = () => {
    if (history.past.length === 0) return;

    const newPast = [...history.past];
    const previousState = newPast.pop();

    setHistory({
      past: newPast,
      future: [floors, ...history.future],
    });

    if (previousState) {
      setFloors(previousState);
    }
  };

  const handleRedo = () => {
    if (history.future.length === 0) return;

    const newFuture = [...history.future];
    const nextState = newFuture.shift();

    setHistory({
      past: [...history.past, floors],
      future: newFuture,
    });

    if (nextState) {
      setFloors(nextState);
    }
  };

  // Save/Load actions
  const handleSaveFloorPlan = () => {
    localStorage.setItem("floorPlan", JSON.stringify(floors));
    localStorage.setItem("reservations", JSON.stringify(reservations));
  };

  const handleLoadFloorPlan = () => {
    const savedFloorPlan = localStorage.getItem("floorPlan");
    if (savedFloorPlan) {
      try {
        const parsedFloors = JSON.parse(savedFloorPlan);
        setFloors(parsedFloors);
        setActiveFloor(parsedFloors.length > 0 ? parsedFloors[0].id : null);
        setSelectedShapes([]);
      } catch (error) {
        console.error("Error loading floor plan:", error);
      }
    }

    const savedReservations = localStorage.getItem("reservations");
    if (savedReservations) {
      try {
        setReservations(JSON.parse(savedReservations));
      } catch (error) {
        console.error("Error loading reservations:", error);
      }
    }
  };

  // Drawing mode
  const handleSetDrawingMode = (isDrawing: boolean) => {
    setIsDrawingMode(isDrawing);
    if (isDrawing) {
      setSelectedShapes([]);
    }
  };

  const handleSetDrawingCategory = (category: DrawingCategory) => {
    setDrawingCategory(category);
  };

  // Reservation mode
  const handleEnterReservationMode = () => {
    setIsReservationMode(true);
    setSelectedShapes([]);
  };

  const handleExitReservationMode = () => {
    setIsReservationMode(false);
  };

  const handleAddReservation = (tableId: string, reservation: Reservation) => {
    setReservations((prev) => {
      return {
        ...prev,
        [tableId]: [...(prev[tableId] || []), reservation],
      };
    });
  };

  const handleGetReservations = (tableId: string) => {
    return reservations[tableId] || [];
  };

  const handleDeleteReservation = (tableId: string, reservationId: string) => {
    setReservations((prev) => {
      return {
        ...prev,
        [tableId]: (prev[tableId] || []).filter((r) => r.id !== reservationId),
      };
    });
  };

  const value = {
    floors,
    activeFloor,
    selectedShapes,
    copiedShapes,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    isDrawingMode,
    drawingCategory,
    isReservationMode,

    // Floor actions
    setActiveFloor: handleSetActiveFloor,
    addFloor: handleAddFloor,
    updateFloor: handleUpdateFloor,
    deleteFloor: handleDeleteFloor,

    // Shape actions
    addShape: handleAddShape,
    updateShape: handleUpdateShape,
    deleteShape: handleDeleteShape,
    addCustomShape: handleAddCustomShape,

    // Selection actions
    selectShape: handleSelectShape,
    deselectAll: handleDeselectAll,

    // Copy/Paste actions
    copySelectedShapes: handleCopySelectedShapes,
    pasteShapes: handlePasteShapes,

    // Group actions
    groupSelectedShapes: handleGroupSelectedShapes,
    ungroupSelection: handleUngroupSelection,

    // Delete actions
    deleteSelectedShapes: handleDeleteSelectedShapes,

    // History actions
    undo: handleUndo,
    redo: handleRedo,

    // Save/Load actions
    saveFloorPlan: handleSaveFloorPlan,
    loadFloorPlan: handleLoadFloorPlan,

    // Drawing mode
    setDrawingMode: handleSetDrawingMode,
    setDrawingCategory: handleSetDrawingCategory,

    // Reservation mode
    enterReservationMode: handleEnterReservationMode,
    exitReservationMode: handleExitReservationMode,
    addReservation: handleAddReservation,
    getReservations: handleGetReservations,
    deleteReservation: handleDeleteReservation,
  };

  return (
    <FloorContext.Provider value={value}>{children}</FloorContext.Provider>
  );
}

export function useFloorContext() {
  const context = useContext(FloorContext);
  if (context === undefined) {
    throw new Error("useFloorContext must be used within a FloorProvider");
  }
  return context;
}
