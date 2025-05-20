import { useFloorPlanStore } from "../store/floorPlanStore";

export const useToolActions = () => {
  const { currentTool, setCurrentTool, setIsDrawingCustomShape } =
    useFloorPlanStore();

  const updateCurrentTool = (tool: string) => {
    setCurrentTool(tool);
  };

  const updateIsDrawingCustomShape = (isDrawing: boolean) => {
    setIsDrawingCustomShape(isDrawing);
  };

  return {
    currentTool,
    updateCurrentTool,
    updateIsDrawingCustomShape,
  };
};
