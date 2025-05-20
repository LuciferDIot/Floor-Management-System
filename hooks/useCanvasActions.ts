import { useFloorPlanStore } from "../store/floorPlanStore";

export const useCanvasActions = () => {
  const { setZoom, setPanOffset, setSnapToGrid, setGridSize } =
    useFloorPlanStore();

  const updateZoom = (zoom: number) => {
    setZoom(zoom);
  };

  const updatePanOffset = (offset: { x: number; y: number }) => {
    setPanOffset(offset);
  };

  const updateSnapToGrid = (snap: boolean) => {
    setSnapToGrid(snap);
  };

  const updateGridSize = (size: number) => {
    setGridSize(size);
  };

  return {
    updateZoom,
    updatePanOffset,
    updateSnapToGrid,
    updateGridSize,
  };
};
