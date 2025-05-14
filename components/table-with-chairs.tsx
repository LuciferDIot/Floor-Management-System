"use client";

import { useFloorPlanStore } from "@/lib/store/floor-plan-store";
import { ShapeCategory, type ShapeType } from "@/lib/types";
import { useEffect, useState } from "react";
import { Shape } from "./shapes/shape";

interface TableWithChairsProps {
  tableId: string;
  floorId: string;
}

export function TableWithChairs({ tableId, floorId }: TableWithChairsProps) {
  const { floors, getChairsForTable, updateReservation } = useFloorPlanStore();
  const [table, setTable] = useState<ShapeType | null>(null);
  const [chairs, setChairs] = useState<ShapeType[]>([]);

  // Find the table and its chairs
  useEffect(() => {
    const floor = floors.find((f) => f.id === floorId);
    if (!floor) return;

    const tableShape = floor.shapes.find(
      (s) => s.id === tableId && s.category === ShapeCategory.TABLE
    );
    if (!tableShape) return;

    setTable(tableShape);
    setChairs(getChairsForTable(floorId, tableId));

    // Update reservation party size based on chair count if needed
    if (
      tableShape.reservation &&
      chairs.length > 0 &&
      tableShape.reservation.partySize !== chairs.length
    ) {
      updateReservation(floorId, tableId, { partySize: chairs.length });
    }
  }, [
    floorId,
    tableId,
    floors,
    getChairsForTable,
    updateReservation,
    chairs.length,
  ]);

  if (!table) return null;

  return (
    <>
      <Shape shape={table} floorId={floorId} />
      {chairs.map((chair) => (
        <Shape key={chair.id} shape={chair} floorId={floorId} />
      ))}
    </>
  );
}
