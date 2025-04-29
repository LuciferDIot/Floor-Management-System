"use client";

import {
  Calendar,
  Copy,
  Group,
  Redo,
  Save,
  Trash2,
  Undo,
  Ungroup,
  Upload,
} from "lucide-react";
import { useEffect } from "react";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { useFloorContext } from "../context/floor-context";

export default function ToolBar() {
  const {
    selectedShapes,
    copySelectedShapes,
    pasteShapes,
    deleteSelectedShapes,
    groupSelectedShapes,
    ungroupSelection,
    activeFloor,
    undo,
    redo,
    canUndo,
    canRedo,
    saveFloorPlan,
    loadFloorPlan,
    enterReservationMode,
    isReservationMode,
  } = useFloorContext();

  // Set up keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "c") {
        e.preventDefault();
        copySelectedShapes();
      } else if (e.ctrlKey && e.key === "v") {
        e.preventDefault();
        if (activeFloor) pasteShapes(activeFloor);
      } else if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        undo();
      } else if (e.ctrlKey && e.key === "y") {
        e.preventDefault();
        redo();
      } else if (e.key === "Delete") {
        e.preventDefault();
        if (activeFloor) deleteSelectedShapes(activeFloor);
      } else if (e.ctrlKey && e.key === "g") {
        e.preventDefault();
        if (activeFloor) groupSelectedShapes(activeFloor);
      } else if (e.ctrlKey && e.key === "u") {
        e.preventDefault();
        if (activeFloor) ungroupSelection(activeFloor);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    activeFloor,
    copySelectedShapes,
    pasteShapes,
    undo,
    redo,
    deleteSelectedShapes,
    groupSelectedShapes,
    ungroupSelection,
  ]);

  return (
    <div className="border-t p-2 flex items-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => copySelectedShapes()}
              disabled={selectedShapes.length === 0 || isReservationMode}
            >
              <Copy className="h-4 w-4" />
              <span className="sr-only">Copy</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy (Ctrl+C)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => activeFloor && pasteShapes(activeFloor)}
              disabled={!activeFloor || isReservationMode}
            >
              <Copy className="h-4 w-4" />
              <span className="sr-only">Paste</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Paste (Ctrl+V)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => activeFloor && deleteSelectedShapes(activeFloor)}
              disabled={
                selectedShapes.length === 0 || !activeFloor || isReservationMode
              }
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete (Del)</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="mx-2 h-6" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => activeFloor && groupSelectedShapes(activeFloor)}
              disabled={
                selectedShapes.length < 2 || !activeFloor || isReservationMode
              }
            >
              <Group className="h-4 w-4" />
              <span className="sr-only">Group</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Group (Ctrl+G)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => activeFloor && ungroupSelection(activeFloor)}
              disabled={
                selectedShapes.length === 0 || !activeFloor || isReservationMode
              }
            >
              <Ungroup className="h-4 w-4" />
              <span className="sr-only">Ungroup</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Ungroup (Ctrl+U)</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="mx-2 h-6" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => undo()}
              disabled={!canUndo || isReservationMode}
            >
              <Undo className="h-4 w-4" />
              <span className="sr-only">Undo</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => redo()}
              disabled={!canRedo || isReservationMode}
            >
              <Redo className="h-4 w-4" />
              <span className="sr-only">Redo</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
        </Tooltip>

        <div className="flex-1"></div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isReservationMode ? "default" : "ghost"}
              size="sm"
              onClick={() => enterReservationMode()}
              className="mr-2"
              disabled={isReservationMode}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Reservations
            </Button>
          </TooltipTrigger>
          <TooltipContent>Manage Table Reservations</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => saveFloorPlan()}
              className="mr-2"
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          </TooltipTrigger>
          <TooltipContent>Save Floor Plan</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={() => loadFloorPlan()}>
              <Upload className="h-4 w-4 mr-1" />
              Load
            </Button>
          </TooltipTrigger>
          <TooltipContent>Load Floor Plan</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
