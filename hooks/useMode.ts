import { UseType } from "@/lib/types";
import { useFloorPlanStore } from "@/store/floorPlanStore";

export const useMode = () => {
  const { mode, setMode } = useFloorPlanStore();

  const toggleMode = (): void =>
    setMode(mode === UseType.BASIC ? UseType.ADVANCED : UseType.BASIC);

  return { mode, setMode, toggleMode };
};
