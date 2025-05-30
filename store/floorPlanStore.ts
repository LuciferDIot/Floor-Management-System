"use client";

import {
  type FloorType,
  type GroupType,
  type HistoryAction,
  type SelectedElement,
  ShapeCategory,
  ShapeType,
  UseType,
} from "@/lib/types";
import { create } from "zustand";

interface FloorPlanState {
  mode: UseType;
  floors: FloorType[];
  floorIndex: number;
  groups: Record<string, GroupType>;
  selectedElements: SelectedElement[];
  zoom: number;
  panOffset: { x: number; y: number };
  snapToGrid: boolean;
  gridSize: number;
  history: HistoryAction[];
  historyIndex: number;
  currentTool: string;
  isDrawingCustomShape: boolean;

  // State setters
  setMode: (mode: UseType) => void;
  setFloorIndex: (index: number) => void;
  setFloors: (floors: FloorType[]) => void;
  setGroups: (groups: Record<string, GroupType>) => void;
  setSelectedElements: (elements: SelectedElement[]) => void;
  setZoom: (zoom: number) => void;
  setPanOffset: (offset: { x: number; y: number }) => void;
  setSnapToGrid: (snap: boolean) => void;
  setGridSize: (size: number) => void;
  setHistory: (history: HistoryAction[]) => void;
  setHistoryIndex: (index: number) => void;
  setCurrentTool: (tool: string) => void;
  setIsDrawingCustomShape: (isDrawing: boolean) => void;
  updateShape: (
    floorId: string,
    shapeId: string,
    updates: Partial<ShapeType>
  ) => void;
}

export const useFloorPlanStore = create<FloorPlanState>((set) => ({
  mode: UseType.BASIC,
  floorIndex: 0,
  floors: [
    {
      id: "floor-1",
      name: "Main Floor",
      x: 100,
      y: 100,
      width: 600,
      height: 400,
      zIndex: 1,
      shapes: [
        {
          id: "table-1",
          floorId: "floor-1",
          label: "Table 1",
          category: ShapeCategory.TABLE,
          x: 100,
          y: 100,
          width: 80,
          height: 80,
          rotation: 0,
        },
      ],
    },
  ],
  groups: {},
  selectedElements: [],
  zoom: 1,
  panOffset: { x: 0, y: 0 },
  snapToGrid: true,
  gridSize: 20,
  history: [],
  historyIndex: -1,
  currentTool: "select",
  isDrawingCustomShape: false,

  setMode: (mode) => set({ mode }),
  setFloorIndex: (index) => set({ floorIndex: index }),
  setFloors: (floors) => set({ floors }),
  setGroups: (groups) => set({ groups }),
  setSelectedElements: (elements) => set({ selectedElements: elements }),
  setZoom: (zoom) => set({ zoom }),
  setPanOffset: (offset) => set({ panOffset: offset }),
  setSnapToGrid: (snap) => set({ snapToGrid: snap }),
  setGridSize: (size) => set({ gridSize: size }),
  setHistory: (history) => set({ history }),
  setHistoryIndex: (index) => set({ historyIndex: index }),
  setCurrentTool: (tool) => set({ currentTool: tool }),
  setIsDrawingCustomShape: (isDrawing) =>
    set({ isDrawingCustomShape: isDrawing }),

  updateShape: (floorId, shapeId, updates) => {
    set((state) => {
      const floorIndex = state.floors.findIndex(
        (floor) => floor.id === floorId
      );
      if (floorIndex === -1) return state; // Floor not found

      const shapeIndex = state.floors[floorIndex].shapes.findIndex(
        (shape) => shape.id === shapeId
      );
      if (shapeIndex === -1) return state; // Shape not found

      // Create optimized update
      const newFloors = [...state.floors];
      newFloors[floorIndex] = {
        ...newFloors[floorIndex],
        shapes: [
          ...newFloors[floorIndex].shapes.slice(0, shapeIndex),
          {
            ...newFloors[floorIndex].shapes[shapeIndex],
            ...updates,
          },
          ...newFloors[floorIndex].shapes.slice(shapeIndex + 1),
        ],
      };

      return { floors: newFloors };
    });
  },
}));
