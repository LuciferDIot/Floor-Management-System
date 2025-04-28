"use client";

import { Copy, Group, Redo, Save, Trash2, Undo, Upload } from "lucide-react";
import { useEffect } from "react";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
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
  ]);

  return (
    <div className="border-t p-2 flex items-center">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => copySelectedShapes()}
        disabled={selectedShapes.length === 0}
        title="Copy (Ctrl+C)"
      >
        <Copy className="h-4 w-4" />
        <span className="sr-only">Copy</span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => activeFloor && pasteShapes(activeFloor)}
        disabled={!activeFloor}
        title="Paste (Ctrl+V)"
      >
        <Copy className="h-4 w-4" />
        <span className="sr-only">Paste</span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => activeFloor && deleteSelectedShapes(activeFloor)}
        disabled={selectedShapes.length === 0 || !activeFloor}
        title="Delete (Del)"
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Delete</span>
      </Button>

      <Separator orientation="vertical" className="mx-2 h-6" />

      <Button
        variant="ghost"
        size="icon"
        onClick={() => activeFloor && groupSelectedShapes(activeFloor)}
        disabled={selectedShapes.length < 2 || !activeFloor}
        title="Group"
      >
        <Group className="h-4 w-4" />
        <span className="sr-only">Group</span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => activeFloor && ungroupSelection(activeFloor)}
        disabled={selectedShapes.length === 0 || !activeFloor}
        title="Ungroup"
      >
        <Group className="h-4 w-4" />
        <span className="sr-only">Ungroup</span>
      </Button>

      <Separator orientation="vertical" className="mx-2 h-6" />

      <Button
        variant="ghost"
        size="icon"
        onClick={() => undo()}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
      >
        <Undo className="h-4 w-4" />
        <span className="sr-only">Undo</span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => redo()}
        disabled={!canRedo}
        title="Redo (Ctrl+Y)"
      >
        <Redo className="h-4 w-4" />
        <span className="sr-only">Redo</span>
      </Button>

      <div className="flex-1"></div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => saveFloorPlan()}
        className="mr-2"
        title="Save Floor Plan"
      >
        <Save className="h-4 w-4 mr-1" />
        Save
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => loadFloorPlan()}
        title="Load Floor Plan"
      >
        <Upload className="h-4 w-4 mr-1" />
        Load
      </Button>
    </div>
  );
}
