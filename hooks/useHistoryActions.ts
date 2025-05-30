import { useMemo } from "react";
import { useFloorPlanStore } from "../store/floorPlanStore";

export const useHistoryActions = () => {
  const {
    floors,
    selectedElements,
    history,
    historyIndex,
    setFloors,
    setSelectedElements,
    setGroups,
    setHistory,
    setHistoryIndex,
  } = useFloorPlanStore();

  const canUndo = useMemo(() => historyIndex > 0, [historyIndex]);
  const canRedo = useMemo(
    () => historyIndex < history.length - 1,
    [historyIndex]
  );

  const undo = () => {
    if (!canUndo) return;
    const prevState = history[historyIndex - 1];
    setFloors(prevState.floors);
    setSelectedElements(prevState.selectedElements);
    setGroups(prevState.groups || {});
    setHistoryIndex(historyIndex - 1);
  };

  const redo = () => {
    if (!canRedo) return;
    const nextState = history[historyIndex + 1];
    setFloors(nextState.floors);
    setSelectedElements(nextState.selectedElements);
    setGroups(nextState.groups || {});
    setHistoryIndex(historyIndex + 1);
  };

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

  return {
    history,
    historyIndex,
    addToHistory,
    setHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  };
};
