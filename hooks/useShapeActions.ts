import { ElementType, type ShapeType } from "../lib/types";
import { useFloorPlanStore } from "../store/floorPlanStore";
import { useFloorActions } from "./useFloorActions";

export const useShapeActions = () => {
  const {
    floors,
    floorIndex,
    selectedElements,
    groups,
    setFloors,
    updateShape,
    setSelectedElements,
  } = useFloorPlanStore();
  const { addToHistory } = useFloorActions();

  const addShape = (shape: ShapeType) => {
    let floorId = floors[floorIndex].id;

    setFloors(
      floors.map((floor) =>
        floor.id === floorId
          ? { ...floor, shapes: [...floor.shapes, shape] }
          : floor
      )
    );
    addToHistory();
  };

  const deleteShape = (floorId: string, shapeId: string) => {
    setFloors(
      floors.map((floor) =>
        floor.id === floorId
          ? { ...floor, shapes: floor.shapes.filter((s) => s.id !== shapeId) }
          : floor
      )
    );
    setSelectedElements(
      selectedElements.filter(
        (el) => !(el.id === shapeId && el.type === ElementType.SHAPE)
      )
    );
    addToHistory();
  };

  const findShapeById = (floorId: string, shapeId: string) => {
    const floor = floors.find((f) => f.id === floorId);
    if (!floor) return null;
    const shape = floor.shapes.find((s) => s.id === shapeId);
    return shape ? shape : null;
  };

  const moveShape = (
    floorId: string,
    shapeId: string,
    x: number,
    y: number
  ) => {
    let groupId = null;
    for (const [id, group] of Object.entries(groups)) {
      if (group.shapeIds.includes(shapeId)) {
        groupId = id;
        break;
      }
    }

    if (groupId) {
      const shape = floors
        .find((f) => f.id === floorId)
        ?.shapes.find((s) => s.id === shapeId);
      if (shape) {
        const dx = x - shape.x;
        const dy = y - shape.y;
        // Note: moveGroup should be called here, but it's in another hook
        // This is a limitation of the current structure
      }
    } else {
      setFloors(
        floors.map((floor) =>
          floor.id === floorId
            ? {
                ...floor,
                shapes: floor.shapes.map((s) =>
                  s.id === shapeId ? { ...s, x, y } : s
                ),
              }
            : floor
        )
      );
    }
  };

  return {
    floors,
    selectedElements,
    groups,
    addShape,
    updateShape,
    findShapeById,
    deleteShape,
    moveShape,
  };
};
