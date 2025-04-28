import { create } from "zustand";
import {
  Floor,
  FurnitureCategory,
  Shape,
  ShapeType,
} from "../types/floor-types";

type FloorState = {
  floors: Floor[];
  activeFloor: string;
  activeShape: string | null;
  drawMode: "select" | "draw" | "place";
  selectedShapeType: ShapeType | null;
  selectedCategory: FurnitureCategory;
  setFloors: (floors: Floor[]) => void;
  setActiveFloor: (id: string) => void;
  setActiveShape: (id: string | null) => void;
  setDrawMode: (mode: "select" | "draw" | "place") => void;
  setSelectedShapeType: (type: ShapeType | null) => void;
  setSelectedCategory: (category: FurnitureCategory) => void;
  handleAddFloor: () => void;
  handleShapeSelect: (shapeId: string | null) => void;
  handleDrawModeChange: (mode: "select" | "draw" | "place") => void;
  handleShapeTypeSelect: (type: ShapeType) => void;
  handleAddShape: (shape: Shape) => void;
  handleUpdateShape: (updatedShape: Shape) => void;
  handleDeleteShape: () => void;

  onShapeSelect: (shapeId: string | null) => void;
  onAddShape: (shape: Shape) => void;
  onUpdateShape: (shape: Shape) => void;
};

export const useFloorStore = create<FloorState>((set) => ({
  floors: [
    { id: "floor-01", name: "Floor 01", shapes: [] },
    { id: "floor-02", name: "Floor 02", shapes: [] },
  ],
  activeFloor: "floor-01",
  activeShape: null,
  drawMode: "select",
  selectedShapeType: null,
  selectedCategory: "table",

  // Actions
  setFloors: (floors) => set({ floors }),
  setActiveFloor: (activeFloor) => set({ activeFloor }),
  setActiveShape: (activeShape) => set({ activeShape }),
  setDrawMode: (drawMode) => set({ drawMode }),
  setSelectedShapeType: (selectedShapeType) => set({ selectedShapeType }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),

  handleAddFloor: () =>
    set((state) => {
      const newFloorId = `floor-${state.floors.length + 1}`;
      const newFloor = {
        id: newFloorId,
        name: `Floor ${String(state.floors.length + 1).padStart(2, "0")}`,
        shapes: [],
      };
      return {
        floors: [...state.floors, newFloor],
        activeFloor: newFloorId,
      };
    }),

  handleShapeSelect: (shapeId) =>
    set((state) => {
      const updatedFloors = state.floors.map((floor) => {
        if (floor.id === state.activeFloor) {
          return {
            ...floor,
            shapes: floor.shapes.map((shape) => ({
              ...shape,
              selected: shape.id === shapeId,
            })),
          };
        }
        return floor;
      });

      return {
        activeShape: shapeId,
        floors: updatedFloors,
      };
    }),

  handleDrawModeChange: (mode) =>
    set((state) => {
      let updatedFloors = state.floors;

      if (mode === "draw" || mode === "place") {
        updatedFloors = state.floors.map((floor) => {
          if (floor.id === state.activeFloor) {
            return {
              ...floor,
              shapes: floor.shapes.map((shape) => ({
                ...shape,
                selected: false,
              })),
            };
          }
          return floor;
        });
      }

      return {
        drawMode: mode,
        activeShape:
          mode === "draw" || mode === "place" ? null : state.activeShape,
        selectedShapeType: mode !== "place" ? null : state.selectedShapeType,
        floors: updatedFloors,
      };
    }),

  handleShapeTypeSelect: (type) =>
    set((state) => {
      const updatedFloors = state.floors.map((floor) => {
        if (floor.id === state.activeFloor) {
          return {
            ...floor,
            shapes: floor.shapes.map((shape) => ({
              ...shape,
              selected: false,
            })),
          };
        }
        return floor;
      });

      return {
        selectedShapeType: type,
        drawMode: "place",
        activeShape: null,
        floors: updatedFloors,
      };
    }),

  handleAddShape: (shape) =>
    set((state) => {
      const updatedFloors = state.floors.map((floor) => {
        if (floor.id === state.activeFloor) {
          return {
            ...floor,
            shapes: [...floor.shapes, shape],
          };
        }
        return floor;
      });

      return {
        floors: updatedFloors,
        activeShape: shape.id,
      };
    }),

  handleUpdateShape: (updatedShape) =>
    set((state) => {
      const updatedFloors = state.floors.map((floor) => {
        if (floor.id === state.activeFloor) {
          return {
            ...floor,
            shapes: floor.shapes.map((shape) =>
              shape.id === updatedShape.id ? updatedShape : shape
            ),
          };
        }
        return floor;
      });

      return {
        floors: updatedFloors,
      };
    }),

  handleDeleteShape: () =>
    set((state) => {
      if (!state.activeShape) return {};

      const updatedFloors = state.floors.map((floor) => {
        if (floor.id === state.activeFloor) {
          return {
            ...floor,
            shapes: floor.shapes.filter(
              (shape) => shape.id !== state.activeShape
            ),
          };
        }
        return floor;
      });

      return {
        floors: updatedFloors,
        activeShape: null,
      };
    }),

  onShapeSelect: (shapeId) =>
    set((state) => {
      const updatedFloors = state.floors.map((floor) => {
        if (floor.id === state.activeFloor) {
          return {
            ...floor,
            shapes: floor.shapes.map((shape) => ({
              ...shape,
              selected: shape.id === shapeId,
            })),
          };
        }
        return floor;
      });

      return {
        activeShape: shapeId,
        floors: updatedFloors,
      };
    }),

  onAddShape: (shape) =>
    set((state) => {
      const updatedFloors = state.floors.map((floor) => {
        if (floor.id === state.activeFloor) {
          return {
            ...floor,
            shapes: [...floor.shapes, shape],
          };
        }
        return floor;
      });

      return {
        floors: updatedFloors,
        activeShape: shape.id,
      };
    }),

  onUpdateShape: (updatedShape) =>
    set((state) => {
      const updatedFloors = state.floors.map((floor) => {
        if (floor.id === state.activeFloor) {
          return {
            ...floor,
            shapes: floor.shapes.map((shape) =>
              shape.id === updatedShape.id ? updatedShape : shape
            ),
          };
        }
        return floor;
      });

      return {
        floors: updatedFloors,
      };
    }),
}));
