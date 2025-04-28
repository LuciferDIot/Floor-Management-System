"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Floor, Shape } from "../types";

interface FloorContextType {
  floors: Floor[];
  activeFloor: string | null;
  selectedShapes: string[];
  copiedShapes: Shape[];
  canUndo: boolean;
  canRedo: boolean;

  // Floor actions
  setActiveFloor: (floorId: string) => void;
  addFloor: (floor: Floor) => void;
  updateFloor: (floorId: string, floor: Partial<Floor>) => void;
  deleteFloor: (floorId: string) => void;

  // Shape actions
  addShape: (floorId: string, shape: Shape) => void;
  updateShape: (
    floorId: string,
    shapeId: string,
    shape: Partial<Shape>
  ) => void;
  deleteShape: (floorId: string, shapeId: string) => void;

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

export function FloorProvider({ children }: { children: ReactNode }) {
  const [floors, setFloors] = useState<Floor[]>([]);
  const [activeFloor, setActiveFloor] = useState<string | null>(null);
  const [selectedShapes, setSelectedShapes] = useState<string[]>([]);
  const [copiedShapes, setCopiedShapes] = useState<Shape[]>([]);
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
    setFloors((prev) =>
      prev.map((floor) =>
        floor.id === floorId ? { ...floor, ...updatedFloor } : floor
      )
    );
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

    // Check for collisions with existing shapes
    const existingShapes = floors[floorIndex].items;
    const hasCollision = existingShapes.some((existingShape) =>
      doShapesOverlap(existingShape, shape)
    );

    if (hasCollision) {
      // Move the shape to avoid collision
      shape.x += 50;
      shape.y += 50;
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

    // Update the shape
    const updatedFloors = [...floors];
    updatedFloors[floorIndex].items[shapeIndex] = {
      ...updatedFloors[floorIndex].items[shapeIndex],
      ...updatedShape,
    };

    setFloors(updatedFloors);
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

    // Create new shapes with new IDs and slightly offset position
    const newShapes = copiedShapes.map((shape) => ({
      ...shape,
      id: `${shape.type}-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      x: shape.x + 20,
      y: shape.y + 20,
    }));

    // Adjust positions to avoid overlaps
    const existingShapes = floors[floorIndex].items;
    let offsetX = 0;
    let offsetY = 0;
    let maxAttempts = 10;
    let hasCollision = true;

    // Try different positions until no collision or max attempts reached
    while (hasCollision && maxAttempts > 0) {
      hasCollision = false;

      // Check if any new shape overlaps with existing shapes
      for (const newShape of newShapes) {
        const adjustedShape = {
          ...newShape,
          x: newShape.x + offsetX,
          y: newShape.y + offsetY,
        };

        if (
          existingShapes.some((existingShape) =>
            doShapesOverlap(existingShape, adjustedShape)
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
  };

  const value = {
    floors,
    activeFloor,
    selectedShapes,
    copiedShapes,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,

    // Floor actions
    setActiveFloor: handleSetActiveFloor,
    addFloor: handleAddFloor,
    updateFloor: handleUpdateFloor,
    deleteFloor: handleDeleteFloor,

    // Shape actions
    addShape: handleAddShape,
    updateShape: handleUpdateShape,
    deleteShape: handleDeleteShape,

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
