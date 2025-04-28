"use client";

import { useFloorContext } from "../context/floor-context";
import { Plus } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import FloorCreator from "./floor-creator";

export default function FloorTabs() {
  const { floors, activeFloor, setActiveFloor } = useFloorContext();

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

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="ml-2">
            <Plus className="h-4 w-4" />
            <span className="sr-only">Add Floor</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Floor</DialogTitle>
          </DialogHeader>
          <FloorCreator />
        </DialogContent>
      </Dialog>
    </div>
  );
}
