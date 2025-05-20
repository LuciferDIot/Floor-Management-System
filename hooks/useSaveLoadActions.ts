import { useFloorPlanStore } from "../store/floorPlanStore";
import { useFloorActions } from "./useFloorActions";

export const useSaveLoadActions = () => {
  const {
    floors,
    groups,
    setFloors,
    setGroups,
    setSelectedElements,
    setHistory,
    setHistoryIndex,
  } = useFloorPlanStore();
  const { addToHistory } = useFloorActions();

  const saveFloorPlan = (name: string) => {
    const planData = {
      name,
      floors,
      groups,
      savedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(
        `floor-plan-${name}-${Date.now()}`,
        JSON.stringify(planData)
      );
    } catch (error) {
      console.error("Error saving floor plan:", error);
    }
  };

  const loadFloorPlan = (id: string) => {
    try {
      const planData = localStorage.getItem(`floor-plan-${id}`);
      if (planData) {
        const { floors, groups } = JSON.parse(planData);
        setFloors(floors);
        setGroups(groups || {});
        setSelectedElements([]);
        setHistory([]);
        setHistoryIndex(-1);
        addToHistory();
      }
    } catch (error) {
      console.error("Error loading floor plan:", error);
    }
  };

  return {
    floors,
    groups,
    saveFloorPlan,
    loadFloorPlan,
  };
};
