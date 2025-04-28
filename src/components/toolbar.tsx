"use client";

import { Move, Pencil, Redo, Save, Trash2, Undo } from "lucide-react";
import { useFloorStore } from "../store/floor-store";
import { Button } from "./ui/button";

export default function Toolbar() {
  const { drawMode, activeShape, handleDrawModeChange, handleDeleteShape } =
    useFloorStore();

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button
        variant={drawMode === "select" ? "default" : "outline"}
        size="icon"
        onClick={() => handleDrawModeChange("select")}
        title="Select"
        className={
          drawMode === "select" ? "bg-primary text-primary-foreground" : ""
        }
      >
        <Move size={18} />
      </Button>
      <Button
        variant={drawMode === "draw" ? "default" : "outline"}
        size="icon"
        onClick={() => handleDrawModeChange("draw")}
        title="Draw custom shape"
        className={
          drawMode === "draw" ? "bg-primary text-primary-foreground" : ""
        }
      >
        <Pencil size={18} />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={handleDeleteShape}
        disabled={!activeShape}
        title="Delete selected"
      >
        <Trash2 size={18} />
      </Button>
      <Button variant="outline" size="icon" title="Undo">
        <Undo size={18} />
      </Button>
      <Button variant="outline" size="icon" title="Redo">
        <Redo size={18} />
      </Button>
      <Button variant="outline" size="icon" title="Save layout">
        <Save size={18} />
      </Button>
    </div>
  );
}
