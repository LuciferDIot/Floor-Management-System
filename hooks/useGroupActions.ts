import { ElementType, GroupType, type ShapeType } from "../lib/types";
import {
  applyRotationToPoint,
  calculateGroupBoundingBox,
  calculateGroupCenter,
} from "../lib/utils";
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
    const floorId = selectedElements[0]?.floorId;

    if (
      !floorId ||
      !selectedElements.map((el) => el.floorId).every((el) => el === floorId)
    )
      throw new Error("Cannot group shapes belongs to another floor");

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
    const boundingBox = calculateGroupBoundingBox(groupShapes);

    const newGroup: GroupType = {
      id: groupId,
      name: `Group ${Object.keys(groups).length + 1}`,
      shapeIds,
      rotation: 0,
      center,
      width: boundingBox.width,
      height: boundingBox.height,
      floorId,
    };

    const updatedFloors = floors.map((floor) => ({
      ...floor,
      shapes: floor.shapes.map((shape) =>
        shapeIds.includes(shape.id) ? { ...shape, groupId } : shape
      ),
    }));

    setFloors(updatedFloors);
    setGroups({ ...groups, [groupId]: newGroup });
    setSelectedElements([{ id: groupId, type: ElementType.GROUP, floorId }]);
    addToHistory();
  };

  const ungroupElements = () => {
    if (
      selectedElements.length !== 1 ||
      selectedElements[0].type !== ElementType.GROUP
    )
      return;

    const groupId = selectedElements[0].id;
    const floorId = selectedElements[0].floorId;
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
      group.shapeIds.map((id) => ({ id, type: ElementType.SHAPE, floorId }))
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

    // Calculate the new center position
    const newCenter = {
      x: group.center.x + dx,
      y: group.center.y + dy,
    };

    // Update all shapes in the group with their new positions
    const updatedFloors = floors.map((floor) => ({
      ...floor,
      shapes: floor.shapes.map((shape) => {
        if (shape.groupId === groupId) {
          // Calculate the shape's position relative to the new center
          const relativeX = shape.x - group.center.x;
          const relativeY = shape.y - group.center.y;

          return {
            ...shape,
            x: newCenter.x + relativeX,
            y: newCenter.y + relativeY,
          };
        }
        return shape;
      }),
    }));

    // Update the group's center
    const updatedGroup = {
      ...group,
      center: newCenter,
    };

    // Update state
    setFloors(updatedFloors);
    setGroups({ ...groups, [groupId]: updatedGroup });
  };

  const selectGroup = (groupId: string) => {
    const group = groups[groupId];
    if (!group) return;
    setSelectedElements([
      { id: groupId, type: ElementType.GROUP, floorId: group.floorId },
    ]);
  };

  const deleteGroup = (groupId: string) => {
    const group = groups[groupId];
    if (!group) return;

    // Remove all shapes belonging to this group from all floors
    const updatedFloors = floors.map((floor) => ({
      ...floor,
      shapes: floor.shapes.filter(
        (shape) => !group.shapeIds.includes(shape.id)
      ),
    }));

    // Remove the group from the state
    const { [groupId]: _, ...remainingGroups } = groups;

    // Remove from selectedElements if selected
    const updatedSelectedElements = selectedElements.filter(
      (el) => el.id !== groupId && !group.shapeIds.includes(el.id)
    );

    setFloors(updatedFloors);
    setGroups(remainingGroups);
    setSelectedElements(updatedSelectedElements);
    addToHistory();
  };

  return {
    floors,
    groups,
    selectedElements,
    deleteGroup,
    createGroup,
    ungroupElements,
    addShapeToGroup,
    rotateGroup,
    moveGroup,
    selectGroup,
  };
};
