import {
  ReservationStatus,
  ShapeCategory,
  type ReservationType,
  type ShapeType,
} from "../lib/types";
import { useFloorPlanStore } from "../store/floorPlanStore";
import { useFloorActions } from "./useFloorActions";

export const useReservationActions = () => {
  const { floors, setFloors } = useFloorPlanStore();
  const { addToHistory } = useFloorActions();

  const reserveTable = (floorId: string, tableId: string, partySize = 2) => {
    const chairs = getChairsForTable(floorId, tableId);
    const reservation: ReservationType = {
      id: `reservation-${Date.now()}`,
      time: new Date(),
      customerName: "Guest",
      partySize: partySize || chairs.length || 2,
      status: ReservationStatus.RESERVED,
    };

    setFloors(
      floors.map((floor) =>
        floor.id === floorId
          ? {
              ...floor,
              shapes: floor.shapes.map((shape) =>
                shape.id === tableId && shape.category === ShapeCategory.TABLE
                  ? { ...shape, reservation }
                  : shape
              ),
            }
          : floor
      )
    );
    addToHistory();
  };

  const unreserveTable = (floorId: string, tableId: string) => {
    setFloors(
      floors.map((floor) =>
        floor.id === floorId
          ? {
              ...floor,
              shapes: floor.shapes.map((shape) =>
                shape.id === tableId && shape.category === ShapeCategory.TABLE
                  ? { ...shape, reservation: undefined }
                  : shape
              ),
            }
          : floor
      )
    );
    addToHistory();
  };

  const updateReservation = (
    floorId: string,
    tableId: string,
    reservationUpdate: Partial<ReservationType>
  ) => {
    setFloors(
      floors.map((floor) =>
        floor.id === floorId
          ? {
              ...floor,
              shapes: floor.shapes.map((shape) =>
                shape.id === tableId &&
                shape.category === ShapeCategory.TABLE &&
                shape.reservation
                  ? {
                      ...shape,
                      reservation: {
                        ...shape.reservation,
                        ...reservationUpdate,
                      },
                    }
                  : shape
              ),
            }
          : floor
      )
    );
    addToHistory();
  };

  const getChairsForTable = (floorId: string, tableId: string): ShapeType[] => {
    const floor = floors.find((f) => f.id === floorId);
    if (!floor) return [];
    return floor.shapes.filter(
      (shape) =>
        shape.category === ShapeCategory.CHAIR && shape.tableId === tableId
    );
  };

  return {
    floors,
    reserveTable,
    unreserveTable,
    updateReservation,
    getChairsForTable,
  };
};
