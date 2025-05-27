import { useFloorPlanStore } from "@/store/floorPlanStore";

export const useMode = () => {
  const { mode, setMode } = useFloorPlanStore();

  return { mode, setMode };
};
