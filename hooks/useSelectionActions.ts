import { ElementType } from "../lib/types";
import { useFloorPlanStore } from "../store/floorPlanStore";

export const useSelectionActions = () => {
  const { floors, selectedElements, setSelectedElements } = useFloorPlanStore();

  const selectShape = (shapeId: string) => {
    let groupId = null;
    let floorId = null;

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

    const isCtrlPressed =
      window.event && (window.event as KeyboardEvent).ctrlKey;

    if (isCtrlPressed) {
      if (groupId) {
        if (
          !selectedElements.some(
            (el) => el.id === groupId && el.type === ElementType.GROUP
          )
        ) {
          setSelectedElements([
            ...selectedElements,
            { id: groupId, type: ElementType.GROUP },
          ]);
        }
      } else if (floorId) {
        if (
          !selectedElements.some(
            (el) => el.id === shapeId && el.type === ElementType.SHAPE
          )
        ) {
          setSelectedElements([
            ...selectedElements,
            { id: shapeId, type: ElementType.SHAPE },
          ]);
        }
      }
    } else {
      if (groupId) {
        setSelectedElements([{ id: groupId, type: ElementType.GROUP }]);
      } else if (floorId) {
        setSelectedElements([{ id: shapeId, type: ElementType.SHAPE }]);
      }
    }
  };

  return { floors, selectedElements, selectShape, setSelectedElements };
};
