"use client";

import {
  type FloorType,
  type GroupType,
  type HistoryAction,
  type SelectedElement,
  ShapeCategory,
  UseType,
} from "@/lib/types";
import { create } from "zustand";

interface FloorPlanState {
  mode: UseType | null;
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
}

export const useFloorPlanStore = create<FloorPlanState>((set) => ({
  mode: null,
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
        {
          id: "chair-1",
          floorId: "floor-1",
          label: "Chair 1",
          category: ShapeCategory.CHAIR,
          x: 200,
          y: 100,
          width: 40,
          height: 40,
          rotation: 0,
          tableId: "table-1",
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
}));
