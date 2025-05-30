import { useSelectionActions } from "@/hooks/useSelectionActions";
import { useShapeActions } from "@/hooks/useShapeActions";
import { ElementType, SelectedElement } from "@/lib/types";
import { ArrowUpDown } from "lucide-react";
import { unstable_batchedUpdates } from "react-dom";
import { Button } from "../ui/button";

type Props = {};

function SelectedProperties({}: Props) {
  const { selectedElements } = useSelectionActions();
  const { updateShape, findShapeById } = useShapeActions();

  const handleTransfer = () => {
    const [shape1, shape2] = selectedElements as SelectedElement[];

    // Get fresh copies of the shapes from the store
    const currentShape1 = findShapeById(shape1.floorId || "", shape1.id);
    const currentShape2 = findShapeById(shape2.floorId || "", shape2.id);

    if (!currentShape1 || !currentShape2) return;

    // Create new objects with swapped positions
    const updatedShape1 = {
      ...currentShape1,
      x: currentShape2.x,
      y: currentShape2.y,
    };

    const updatedShape2 = {
      ...currentShape2,
      x: currentShape1.x,
      y: currentShape1.y,
    };

    unstable_batchedUpdates(() => {
      updateShape(shape1.floorId || "", shape1.id, updatedShape1);
      updateShape(shape2.floorId || "", shape2.id, updatedShape2);
    });
  };

  const canTransfer =
    selectedElements.length === 2 &&
    selectedElements.every((el) => el.type === ElementType.SHAPE);

  return (
    <>
      {canTransfer && (
        <Button
          variant="ghost"
          size="sm"
          className="gap-1"
          onClick={handleTransfer}
          disabled={!canTransfer}
          title="Transfer Reservation"
        >
          <ArrowUpDown className="h-4 w-4" />
          <span className="hidden sm:inline">Transfer</span>
        </Button>
      )}
    </>
  );
}

export default SelectedProperties;
