import { ElementType, type ShapeType } from "../lib/types";
import { applyRotationToPoint, calculateGroupCenter } from "../lib/utils";
import { useFloorPlanStore } from "../store/floorPlanStore";
import { useFloorActions } from "./useFloorActions";

export const useGroupActions = () => {
  const {
    floors,
    groups,
    selectedElements,
    setFloors,
    setGroups,
    setSelectedElements,
  } = useFloorPlanStore();
  const { addToHistory } = useFloorActions();

  const createGroup = () => {
    const shapeIds = selectedElements
      .filter((el) => el.type === ElementType.SHAPE)
      .map((el) => el.id);

    if (shapeIds.length < 2) return;

    const groupId = `group-${Date.now()}`;
    const groupShapes: ShapeType[] = [];
    for (const floor of floors) {
      for (const shape of floor.shapes) {
        if (shapeIds.includes(shape.id)) {
          groupShapes.push(shape);
        }
      }
    }

    const center = calculateGroupCenter(groupShapes);
    const newGroup = {
      id: groupId,
      name: `Group ${Object.keys(groups).length + 1}`,
      shapeIds,
      rotation: 0,
      center,
    };

    const updatedFloors = floors.map((floor) => ({
      ...floor,
      shapes: floor.shapes.map((shape) =>
        shapeIds.includes(shape.id) ? { ...shape, groupId } : shape
      ),
    }));

    setFloors(updatedFloors);
    setGroups({ ...groups, [groupId]: newGroup });
    setSelectedElements([{ id: groupId, type: ElementType.GROUP }]);
    addToHistory();
  };

  const ungroupElements = () => {
    if (
      selectedElements.length !== 1 ||
      selectedElements[0].type !== ElementType.GROUP
    )
      return;

    const groupId = selectedElements[0].id;
    const group = groups[groupId];
    if (!group) return;

    const updatedFloors = floors.map((floor) => ({
      ...floor,
      shapes: floor.shapes.map((shape) =>
        shape.groupId === groupId ? { ...shape, groupId: undefined } : shape
      ),
    }));

    const { [groupId]: _, ...remainingGroups } = groups;
    setFloors(updatedFloors);
    setGroups(remainingGroups);
    setSelectedElements(
      group.shapeIds.map((id) => ({ id, type: ElementType.SHAPE }))
    );
    addToHistory();
  };

  const addShapeToGroup = (shapeId: string, groupId: string) => {
    const group = groups[groupId];
    if (!group) return;

    const updatedGroup = {
      ...group,
      shapeIds: [...group.shapeIds, shapeId],
    };

    const updatedFloors = floors.map((floor) => ({
      ...floor,
      shapes: floor.shapes.map((shape) =>
        shape.id === shapeId ? { ...shape, groupId } : shape
      ),
    }));

    setFloors(updatedFloors);
    setGroups({ ...groups, [groupId]: updatedGroup });
    addToHistory();
  };

  const rotateGroup = (groupId: string, angle: number) => {
    const group = groups[groupId];
    if (!group) return;

    const updatedGroup = { ...group, rotation: angle };
    const updatedFloors = floors.map((floor) => ({
      ...floor,
      shapes: floor.shapes.map((shape) => {
        if (shape.groupId === groupId) {
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

    setFloors(updatedFloors);
    setGroups({ ...groups, [groupId]: updatedGroup });
    addToHistory();
  };

  const moveGroup = (groupId: string, dx: number, dy: number) => {
    const group = groups[groupId];
    if (!group) return;

    const updatedGroup = {
      ...group,
      center: {
        x: group.center.x + dx,
        y: group.center.y + dy,
      },
    };

    const updatedFloors = floors.map((floor) => ({
      ...floor,
      shapes: floor.shapes.map((shape) =>
        shape.groupId === groupId
          ? { ...shape, x: shape.x + dx, y: shape.y + dy }
          : shape
      ),
    }));

    setFloors(updatedFloors);
    setGroups({ ...groups, [groupId]: updatedGroup });
  };

  const selectGroup = (groupId: string) => {
    const group = groups[groupId];
    if (!group) return;
    setSelectedElements([{ id: groupId, type: ElementType.GROUP }]);
  };

  return {
    floors,
    groups,
    selectedElements,
    createGroup,
    ungroupElements,
    addShapeToGroup,
    rotateGroup,
    moveGroup,
    selectGroup,
  };
};
