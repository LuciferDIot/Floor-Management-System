"use client";

import { create } from "zustand";
import {
  ElementType,
  type FloorType,
  type GroupType,
  type HistoryAction,
  ReservationStatus,
  type ReservationType,
  type SelectedElement,
  ShapeCategory,
  type ShapeType,
} from "../types";
import { applyRotationToPoint, calculateGroupCenter } from "../utils";

interface FloorPlanState {
  floors: FloorType[];
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

  // Floor actions
  addFloor: () => void;
  updateFloor: (id: string, floor: FloorType) => void;
  deleteFloor: (id: string) => void;
  duplicateFloor: (id: string) => void;
  bringFloorToFront: (id: string) => void;
  sendFloorToBack: (id: string) => void;

  // Shape actions
  addShape: (shape: ShapeType) => void;
  updateShape: (floorId: string, shapeId: string, shape: ShapeType) => void;
  deleteShape: (floorId: string, shapeId: string) => void;
  moveShape: (floorId: string, shapeId: string, x: number, y: number) => void;

  // Group actions
  createGroup: () => void;
  ungroupElements: () => void;
  addShapeToGroup: (shapeId: string, groupId: string) => void;
  rotateGroup: (groupId: string, angle: number) => void;
  moveGroup: (groupId: string, dx: number, dy: number) => void;
  selectGroup: (groupId: string) => void;

  // Reservation actions
  reserveTable: (floorId: string, tableId: string, partySize?: number) => void;
  unreserveTable: (floorId: string, tableId: string) => void;
  updateReservation: (
    floorId: string,
    tableId: string,
    reservation: Partial<ReservationType>
  ) => void;
  getChairsForTable: (floorId: string, tableId: string) => ShapeType[];

  // Selection actions
  setSelectedElements: (elements: SelectedElement[]) => void;
  selectShape: (shapeId: string) => void;

  // Canvas actions
  setZoom: (zoom: number) => void;
  setPanOffset: (offset: { x: number; y: number }) => void;
  setSnapToGrid: (snap: boolean) => void;
  setGridSize: (size: number) => void;

  // History actions
  addToHistory: () => void;
  undo: () => void;
  redo: () => void;

  // Tool actions
  setCurrentTool: (tool: string) => void;
  setIsDrawingCustomShape: (isDrawing: boolean) => void;

  // Save/Load actions
  saveFloorPlan: (name: string) => void;
  loadFloorPlan: (id: string) => void;

  // Custom shape actions
  saveCustomShape: (
    points: { x: number; y: number }[],
    category: string,
    label: string
  ) => void;
}

export const useFloorPlanStore = create<FloorPlanState>((set, get) => ({
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

  // Floor actions
  addFloor: () => {
    const { floors } = get();
    const newFloor: FloorType = {
      id: `floor-${Date.now()}`,
      name: `Floor ${floors.length + 1}`,
      x: 100,
      y: 100,
      width: 400,
      height: 300,
      zIndex: floors.length + 1,
      shapes: [],
    };

    set((state) => ({
      floors: [...state.floors, newFloor],
    }));

    get().addToHistory();
  },

  updateFloor: (id, floor) => {
    set((state) => ({
      floors: state.floors.map((f) => (f.id === id ? floor : f)),
    }));
  },

  deleteFloor: (id) => {
    set((state) => ({
      floors: state.floors.filter((f) => f.id !== id),
      selectedElements: state.selectedElements.filter(
        (el) => !(el.id === id && el.type === ElementType.FLOOR)
      ),
    }));

    get().addToHistory();
  },

  duplicateFloor: (id) => {
    const { floors } = get();
    const floor = floors.find((f) => f.id === id);

    if (floor) {
      const newFloor: FloorType = {
        ...floor,
        id: `floor-${Date.now()}`,
        name: `${floor.name} (Copy)`,
        x: floor.x + 20,
        y: floor.y + 20,
        zIndex: floors.length + 1,
        shapes: floor.shapes.map((shape) => ({
          ...shape,
          id: `${shape.id}-copy-${Date.now()}`,
        })),
      };

      set((state) => ({
        floors: [...state.floors, newFloor],
      }));

      get().addToHistory();
    }
  },

  bringFloorToFront: (id) => {
    const { floors } = get();
    const maxZIndex = Math.max(...floors.map((f) => f.zIndex));

    set((state) => ({
      floors: state.floors.map((f) =>
        f.id === id ? { ...f, zIndex: maxZIndex + 1 } : f
      ),
    }));
  },

  sendFloorToBack: (id) => {
    const { floors } = get();
    const minZIndex = Math.min(...floors.map((f) => f.zIndex));

    set((state) => ({
      floors: state.floors.map((f) =>
        f.id === id ? { ...f, zIndex: minZIndex - 1 } : f
      ),
    }));
  },

  // Shape actions
  addShape: (shape) => {
    const { floors, selectedElements } = get();

    // Find the selected floor or use the first one
    let floorId = floors[0].id;

    if (
      selectedElements.length === 1 &&
      selectedElements[0].type === ElementType.FLOOR
    ) {
      floorId = selectedElements[0].id;
    }

    set((state) => ({
      floors: state.floors.map((floor) => {
        if (floor.id === floorId) {
          return {
            ...floor,
            shapes: [...floor.shapes, shape],
          };
        }
        return floor;
      }),
    }));

    get().addToHistory();
  },

  updateShape: (floorId, shapeId, shape) => {
    set((state) => ({
      floors: state.floors.map((floor) => {
        if (floor.id === floorId) {
          return {
            ...floor,
            shapes: floor.shapes.map((s) => (s.id === shapeId ? shape : s)),
          };
        }
        return floor;
      }),
    }));
  },

  deleteShape: (floorId, shapeId) => {
    set((state) => ({
      floors: state.floors.map((floor) => {
        if (floor.id === floorId) {
          return {
            ...floor,
            shapes: floor.shapes.filter((s) => s.id !== shapeId),
          };
        }
        return floor;
      }),
      selectedElements: state.selectedElements.filter(
        (el) => !(el.id === shapeId && el.type === ElementType.SHAPE)
      ),
    }));

    get().addToHistory();
  },

  moveShape: (floorId, shapeId, x, y) => {
    const { groups } = get();

    // Check if shape is part of a group
    let groupId = null;
    for (const [id, group] of Object.entries(groups)) {
      if (group.shapeIds.includes(shapeId)) {
        groupId = id;
        break;
      }
    }

    if (groupId) {
      // If shape is part of a group, move the entire group
      const shape = get()
        .floors.find((f) => f.id === floorId)
        ?.shapes.find((s) => s.id === shapeId);
      if (shape) {
        const dx = x - shape.x;
        const dy = y - shape.y;
        get().moveGroup(groupId, dx, dy);
      }
    } else {
      // Move individual shape
      set((state) => ({
        floors: state.floors.map((floor) => {
          if (floor.id === floorId) {
            return {
              ...floor,
              shapes: floor.shapes.map((s) => {
                if (s.id === shapeId) {
                  return { ...s, x, y };
                }
                return s;
              }),
            };
          }
          return floor;
        }),
      }));
    }
  },

  // Group actions
  createGroup: () => {
    const { selectedElements, floors } = get();
    const shapeIds = selectedElements
      .filter((el) => el.type === ElementType.SHAPE)
      .map((el) => el.id);

    if (shapeIds.length < 2) return;

    const groupId = `group-${Date.now()}`;

    // Find all shapes in the group
    const groupShapes: ShapeType[] = [];
    for (const floor of floors) {
      for (const shape of floor.shapes) {
        if (shapeIds.includes(shape.id)) {
          groupShapes.push(shape);
        }
      }
    }

    // Calculate group center
    const center = calculateGroupCenter(groupShapes);

    const newGroup: GroupType = {
      id: groupId,
      name: `Group ${Object.keys(get().groups).length + 1}`,
      shapeIds,
      rotation: 0,
      center,
    };

    // Update shapes with groupId
    const updatedFloors = floors.map((floor) => ({
      ...floor,
      shapes: floor.shapes.map((shape) => {
        if (shapeIds.includes(shape.id)) {
          return { ...shape, groupId };
        }
        return shape;
      }),
    }));

    set((state) => ({
      floors: updatedFloors,
      groups: { ...state.groups, [groupId]: newGroup },
      selectedElements: [{ id: groupId, type: ElementType.GROUP }],
    }));

    get().addToHistory();
  },

  ungroupElements: () => {
    const { selectedElements, groups, floors } = get();

    if (
      selectedElements.length !== 1 ||
      selectedElements[0].type !== ElementType.GROUP
    )
      return;

    const groupId = selectedElements[0].id;
    const group = groups[groupId];

    if (!group) return;

    // Remove groupId from shapes
    const updatedFloors = floors.map((floor) => ({
      ...floor,
      shapes: floor.shapes.map((shape) => {
        if (shape.groupId === groupId) {
          const { groupId, ...rest } = shape;
          return rest;
        }
        return shape;
      }),
    }));

    // Remove group from groups
    const { [groupId]: removedGroup, ...remainingGroups } = groups;

    set((state) => ({
      floors: updatedFloors,
      groups: remainingGroups,
      selectedElements: group.shapeIds.map((id) => ({
        id,
        type: ElementType.SHAPE,
      })),
    }));

    get().addToHistory();
  },

  addShapeToGroup: (shapeId, groupId) => {
    const { groups, floors } = get();
    const group = groups[groupId];

    if (!group) return;

    // Add shapeId to group
    const updatedGroup = {
      ...group,
      shapeIds: [...group.shapeIds, shapeId],
    };

    // Add groupId to shape
    const updatedFloors = floors.map((floor) => ({
      ...floor,
      shapes: floor.shapes.map((shape) => {
        if (shape.id === shapeId) {
          return { ...shape, groupId };
        }
        return shape;
      }),
    }));

    set((state) => ({
      floors: updatedFloors,
      groups: { ...state.groups, [groupId]: updatedGroup },
    }));

    get().addToHistory();
  },

  rotateGroup: (groupId, angle) => {
    const { groups, floors } = get();
    const group = groups[groupId];

    if (!group) return;

    // Update group rotation
    const updatedGroup = {
      ...group,
      rotation: angle,
    };

    // Rotate all shapes in the group around the center
    const updatedFloors = floors.map((floor) => ({
      ...floor,
      shapes: floor.shapes.map((shape) => {
        if (shape.groupId === groupId) {
          // Calculate new position after rotation
          const rotatedPoint = applyRotationToPoint(
            { x: shape.x, y: shape.y },
            group.center,
            angle - (shape.rotation || 0)
          );

          return {
            ...shape,
            x: rotatedPoint.x,
            y: rotatedPoint.y,
            rotation: angle,
          };
        }
        return shape;
      }),
    }));

    set((state) => ({
      floors: updatedFloors,
      groups: { ...state.groups, [groupId]: updatedGroup },
    }));

    get().addToHistory();
  },

  moveGroup: (groupId, dx, dy) => {
    const { groups, floors } = get();
    const group = groups[groupId];

    if (!group) return;

    // Update group center
    const updatedGroup = {
      ...group,
      center: {
        x: group.center.x + dx,
        y: group.center.y + dy,
      },
    };

    // Move all shapes in the group
    const updatedFloors = floors.map((floor) => ({
      ...floor,
      shapes: floor.shapes.map((shape) => {
        if (shape.groupId === groupId) {
          return {
            ...shape,
            x: shape.x + dx,
            y: shape.y + dy,
          };
        }
        return shape;
      }),
    }));

    set((state) => ({
      floors: updatedFloors,
      groups: { ...state.groups, [groupId]: updatedGroup },
    }));
  },

  selectGroup: (groupId) => {
    const { groups } = get();
    const group = groups[groupId];

    if (!group) return;

    set({
      selectedElements: [{ id: groupId, type: ElementType.GROUP }],
    });
  },

  // Reservation actions
  reserveTable: (floorId, tableId, partySize = 2) => {
    const chairs = get().getChairsForTable(floorId, tableId);

    const reservation: ReservationType = {
      id: `reservation-${Date.now()}`,
      time: new Date(),
      customerName: "Guest",
      partySize: partySize || chairs.length || 2,
      status: ReservationStatus.RESERVED,
    };

    set((state) => ({
      floors: state.floors.map((floor) => {
        if (floor.id === floorId) {
          return {
            ...floor,
            shapes: floor.shapes.map((shape) => {
              if (
                shape.id === tableId &&
                shape.category === ShapeCategory.TABLE
              ) {
                return { ...shape, reservation };
              }
              return shape;
            }),
          };
        }
        return floor;
      }),
    }));

    get().addToHistory();
  },

  unreserveTable: (floorId, tableId) => {
    set((state) => ({
      floors: state.floors.map((floor) => {
        if (floor.id === floorId) {
          return {
            ...floor,
            shapes: floor.shapes.map((shape) => {
              if (
                shape.id === tableId &&
                shape.category === ShapeCategory.TABLE
              ) {
                const { reservation, ...rest } = shape;
                return rest;
              }
              return shape;
            }),
          };
        }
        return floor;
      }),
    }));

    get().addToHistory();
  },

  updateReservation: (floorId, tableId, reservationUpdate) => {
    set((state) => ({
      floors: state.floors.map((floor) => {
        if (floor.id === floorId) {
          return {
            ...floor,
            shapes: floor.shapes.map((shape) => {
              if (
                shape.id === tableId &&
                shape.category === ShapeCategory.TABLE &&
                shape.reservation
              ) {
                return {
                  ...shape,
                  reservation: {
                    ...shape.reservation,
                    ...reservationUpdate,
                  },
                };
              }
              return shape;
            }),
          };
        }
        return floor;
      }),
    }));

    get().addToHistory();
  },

  getChairsForTable: (floorId, tableId) => {
    const floor = get().floors.find((f) => f.id === floorId);
    if (!floor) return [];

    return floor.shapes.filter(
      (shape) =>
        shape.category === ShapeCategory.CHAIR && shape.tableId === tableId
    );
  },

  // Selection actions
  setSelectedElements: (elements) => {
    set({ selectedElements: elements });
  },

  selectShape: (shapeId) => {
    const { selectedElements, floors, groups } = get();
    let groupId = null;
    let floorId = null;

    // Find the shape and check if it's in a group
    for (const floor of floors) {
      const shape = floor.shapes.find((s) => s.id === shapeId);
      if (shape) {
        floorId = floor.id;
        if (shape.groupId) {
          groupId = shape.groupId;
        }
        break;
      }
    }

    // Check if Ctrl key is pressed (for multi-selection)
    const isCtrlPressed =
      window.event && (window.event as KeyboardEvent).ctrlKey;

    if (isCtrlPressed) {
      // Add to multi-selection
      if (groupId) {
        // If shape is part of a group, add the group to selection if not already selected
        if (
          !selectedElements.some(
            (el) => el.id === groupId && el.type === ElementType.GROUP
          )
        ) {
          set({
            selectedElements: [
              ...selectedElements,
              { id: groupId, type: ElementType.GROUP },
            ],
          });
        }
      } else if (floorId) {
        // Add the shape to selection if not already selected
        if (
          !selectedElements.some(
            (el) => el.id === shapeId && el.type === ElementType.SHAPE
          )
        ) {
          set({
            selectedElements: [
              ...selectedElements,
              { id: shapeId, type: ElementType.SHAPE },
            ],
          });
        }
      }
    } else {
      // Single selection
      if (groupId) {
        // If shape is part of a group, select the entire group
        set({
          selectedElements: [{ id: groupId, type: ElementType.GROUP }],
        });
      } else if (floorId) {
        // Otherwise just select the shape
        set({
          selectedElements: [{ id: shapeId, type: ElementType.SHAPE }],
        });
      }
    }
  },

  // Canvas actions
  setZoom: (zoom) => {
    set({ zoom });
  },

  setPanOffset: (offset) => {
    set({ panOffset: offset });
  },

  setSnapToGrid: (snap) => {
    set({ snapToGrid: snap });
  },

  setGridSize: (size) => {
    set({ gridSize: size });
  },

  // History actions
  addToHistory: () => {
    const { floors, selectedElements, history, historyIndex, groups } = get();

    // Create a deep copy of the current state
    const currentState: HistoryAction = {
      floors: JSON.parse(JSON.stringify(floors)),
      selectedElements: [...selectedElements],
      groups: JSON.parse(JSON.stringify(groups)),
    };

    // If we're not at the end of the history, remove future states
    const newHistory = history.slice(0, historyIndex + 1);

    set({
      history: [...newHistory, currentState],
      historyIndex: historyIndex + 1,
    });
  },

  undo: () => {
    const { historyIndex, history } = get();

    if (historyIndex <= 0) return;

    const prevState = history[historyIndex - 1];

    set({
      floors: prevState.floors,
      selectedElements: prevState.selectedElements,
      groups: prevState.groups || {},
      historyIndex: historyIndex - 1,
    });
  },

  redo: () => {
    const { historyIndex, history } = get();

    if (historyIndex >= history.length - 1) return;

    const nextState = history[historyIndex + 1];

    set({
      floors: nextState.floors,
      selectedElements: nextState.selectedElements,
      groups: nextState.groups || {},
      historyIndex: historyIndex + 1,
    });
  },

  // Tool actions
  setCurrentTool: (tool) => {
    set({ currentTool: tool });
  },

  setIsDrawingCustomShape: (isDrawing) => {
    set({ isDrawingCustomShape: isDrawing });
  },

  // Save/Load actions
  saveFloorPlan: (name) => {
    const { floors, groups } = get();

    const planData = {
      name,
      floors,
      groups,
      savedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(
        `floor-plan-${name}-${Date.now()}`,
        JSON.stringify(planData)
      );
    } catch (error) {
      console.error("Error saving floor plan:", error);
    }
  },

  loadFloorPlan: (id) => {
    try {
      const planData = localStorage.getItem(`floor-plan-${id}`);

      if (planData) {
        const { floors, groups } = JSON.parse(planData);

        set({
          floors,
          groups: groups || {},
          selectedElements: [],
          history: [],
          historyIndex: -1,
        });

        get().addToHistory();
      }
    } catch (error) {
      console.error("Error loading floor plan:", error);
    }
  },

  // Custom shape actions
  saveCustomShape: (points, category, label) => {
    // Convert points to SVG path
    let path = "";
    if (points.length > 0) {
      path = `M${points[0].x},${points[0].y} `;
      for (let i = 1; i < points.length; i++) {
        path += `L${points[i].x},${points[i].y} `;
      }
      path += "Z";
    }

    // Create a new shape
    const shape: ShapeType = {
      id: `custom-${Date.now()}`,
      label: label || `Custom ${category}`,
      category: category as any,
      x: Math.min(...points.map((p) => p.x)),
      y: Math.min(...points.map((p) => p.y)),
      width:
        Math.max(...points.map((p) => p.x)) -
        Math.min(...points.map((p) => p.x)),
      height:
        Math.max(...points.map((p) => p.y)) -
        Math.min(...points.map((p) => p.y)),
      rotation: 0,
      customPath: path,
    };

    get().addShape(shape);
  },
}));
