"use client";

import { ChevronLeft, ChevronRight, Edit, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useFloorContext } from "../context/floor-context";
import { Floor } from "../types";
import FloorCreator from "./floor-creator";

interface FloorTabsProps {
  onAddFloor?: () => void;
}

export default function FloorTabs({ onAddFloor }: FloorTabsProps) {
  const { floors, activeFloor, setActiveFloor, deleteFloor, updateFloor } =
    useFloorContext();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingFloor, setEditingFloor] = useState<Floor>();

  const handleMoveFloor = (direction: "left" | "right") => {
    if (!activeFloor) return;

    const currentIndex = floors.findIndex((floor) => floor.id === activeFloor);
    if (currentIndex === -1) return;

    const newIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= floors.length) return;

    // Create a new array with the floor moved to the new position
    const newFloors = [...floors];
    const [movedFloor] = newFloors.splice(currentIndex, 1);
    newFloors.splice(newIndex, 0, movedFloor);

    // Update the floors array
    newFloors.forEach((floor, index) => {
      updateFloor(floor.id, floor, index);
    });
  };

  const handleEditFloor = () => {
    if (!activeFloor) return;
    const floor = floors.find((f) => f.id === activeFloor);
    if (floor) {
      setEditingFloor(floor);
      setIsEditDialogOpen(true);
    }
  };

  const handleDeleteFloor = () => {
    if (!activeFloor) return;
    deleteFloor(activeFloor);
  };

  return (
    <div className="flex items-center border-b p-2">
      <Tabs
        value={activeFloor || ""}
        onValueChange={setActiveFloor}
        className="flex-1"
      >
        <TabsList className="w-full justify-start h-10">
          {floors.map((floor) => (
            <TabsTrigger
              key={floor.id}
              value={floor.id}
              className="px-4 data-[state=active]:border-b-2 data-[state=active]:border-red-500"
            >
              {floor.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleMoveFloor("left")}
          disabled={
            !activeFloor || floors.findIndex((f) => f.id === activeFloor) === 0
          }
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Move Left</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleMoveFloor("right")}
          disabled={
            !activeFloor ||
            floors.findIndex((f) => f.id === activeFloor) === floors.length - 1
          }
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Move Right</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={!activeFloor}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit Floor</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleEditFloor}>
              Edit Floor
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDeleteFloor}
              className="text-red-600"
            >
              Delete Floor
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="ml-2"
              onClick={() => onAddFloor?.()}
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">Add Floor</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Floor</DialogTitle>
            </DialogHeader>
            <FloorCreator onFloorCreated={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Floor</DialogTitle>
            </DialogHeader>
            <FloorCreator
              initialFloor={editingFloor}
              onFloorCreated={() => setIsEditDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
