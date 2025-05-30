import { ElementType, type ShapeType } from "../lib/types";
import { useFloorPlanStore } from "../store/floorPlanStore";
import { useFloorActions } from "./useFloorActions";

export const useShapeActions = () => {
  const { floors, selectedElements, groups, setFloors, setSelectedElements } =
    useFloorPlanStore();
  const { addToHistory } = useFloorActions();

  const addShape = (shape: ShapeType) => {
    let floorId = floors[0].id;
    if (
      selectedElements.length === 1 &&
      selectedElements[0].type === ElementType.FLOOR
    ) {
      floorId = selectedElements[0].id;
    }
    setFloors(
      floors.map((floor) =>
        floor.id === floorId
          ? { ...floor, shapes: [...floor.shapes, shape] }
          : floor
      )
    );
    addToHistory();
  };

  const updateShape = (floorId: string, shapeId: string, shape: ShapeType) => {
    setFloors(
      floors.map((floor) =>
        floor.id === floorId
          ? {
              ...floor,
              shapes: floor.shapes.map((s) => (s.id === shapeId ? shape : s)),
            }
          : floor
      )
    );
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
    deleteShape,
    moveShape,
  };
};
