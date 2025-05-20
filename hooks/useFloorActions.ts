import { ElementType, type FloorType } from "../lib/types";
import { useFloorPlanStore } from "../store/floorPlanStore";

export const useFloorActions = () => {
  const {
    zoom,
    floors,
    selectedElements,
    panOffset,
    snapToGrid,
    gridSize,
    isDrawingCustomShape,
    setFloors,
    setSelectedElements,
    setHistory,
    setHistoryIndex,
  } = useFloorPlanStore();

  const addToHistory = () => {
    const currentState = {
      floors,
      selectedElements,
      groups: useFloorPlanStore.getState().groups,
    };
    const history = useFloorPlanStore.getState().history;
    const historyIndex = useFloorPlanStore.getState().historyIndex;
    const newHistory = history.slice(0, historyIndex + 1);
    setHistory([...newHistory, currentState]);
    setHistoryIndex(historyIndex + 1);
  };

  const addFloor = () => {
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
    setFloors([...floors, newFloor]);
    addToHistory();
  };

  const updateFloor = (id: string, floor: FloorType) => {
    setFloors(floors.map((f) => (f.id === id ? floor : f)));
  };

  const deleteFloor = (id: string) => {
    setFloors(floors.filter((f) => f.id !== id));
    setSelectedElements(
      selectedElements.filter(
        (el) => !(el.id === id && el.type === ElementType.FLOOR)
      )
    );
    addToHistory();
  };

  const duplicateFloor = (id: string) => {
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
      setFloors([...floors, newFloor]);
      addToHistory();
    }
  };

  const bringFloorToFront = (id: string) => {
    const maxZIndex = Math.max(...floors.map((f) => f.zIndex));
    setFloors(
      floors.map((f) => (f.id === id ? { ...f, zIndex: maxZIndex + 1 } : f))
    );
  };

  const sendFloorToBack = (id: string) => {
    const minZIndex = Math.min(...floors.map((f) => f.zIndex));
    setFloors(
      floors.map((f) => (f.id === id ? { ...f, zIndex: minZIndex - 1 } : f))
    );
  };

  return {
    zoom,
    floors,
    selectedElements,
    panOffset,
    snapToGrid,
    gridSize,
    isDrawingCustomShape,
    addFloor,
    updateFloor,
    deleteFloor,
    duplicateFloor,
    bringFloorToFront,
    setSelectedElements,
    sendFloorToBack,
    addToHistory,
  };
};
