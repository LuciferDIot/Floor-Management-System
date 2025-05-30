"use client";

import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useCanvasActions } from "@/hooks/useCanvasActions";
import { useFloorActions } from "@/hooks/useFloorActions";
import { useGroupActions } from "@/hooks/useGroupActions";
import { useToolActions } from "@/hooks/useToolActions";
import { ShapeCategory } from "@/lib/types";
import {
  Circle,
  Grid,
  Group,
  Pencil,
  Redo,
  RotateCcw,
  Save,
  Square,
  Undo,
  Ungroup,
} from "lucide-react";
import { LoadPlanDropdown } from "./load-plan-dropdown";
import { ShapePicker } from "./shape-picker";

interface ToolbarProps {
  onCustomShapeClick: () => void;
  onSave: () => void;
  onLoad: (planId: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export function Toolbar({
  onCustomShapeClick,
  onSave,
  onLoad,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: ToolbarProps) {
  const { snapToGrid, selectedElements } = useFloorActions();

  const { updateSnapToGrid } = useCanvasActions();
  const { createGroup, ungroupElements } = useGroupActions();
  const { currentTool, updateCurrentTool } = useToolActions();

  const hasSelection = selectedElements.length > 0;
  const hasMultiSelection = selectedElements.length > 1;

  return (
    <div className="border-b p-2 flex items-center gap-2 bg-white">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onSave}
          title="Save Floor Plan"
        >
          <Save className="h-4 w-4" />
        </Button>

        <LoadPlanDropdown onLoad={onLoad} />

        <div className="h-6 w-px bg-gray-200 mx-1" />

        <Button
          variant="ghost"
          size="icon"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>

        <div className="h-6 w-px bg-gray-200 mx-1" />

        <Button
          variant={snapToGrid ? "default" : "ghost"}
          size="sm"
          onClick={() => updateSnapToGrid(!snapToGrid)}
          className="gap-1"
          title="Snap to Grid"
        >
          <Grid className="h-4 w-4" />
          <span className="hidden sm:inline">Snap to Grid</span>
        </Button>
      </div>

      <div className="h-6 w-px bg-gray-200 mx-1" />

      <ToggleGroup
        type="single"
        value={currentTool}
        onValueChange={(value) => value && updateCurrentTool(value)}
      >
        <ToggleGroupItem value="select" title="Select Tool">
          <RotateCcw className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value={ShapeCategory.TABLE} title="Add Table">
          <Circle className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value={ShapeCategory.CHAIR} title="Add Chair">
          <Square className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      <Button
        variant="ghost"
        size="sm"
        onClick={onCustomShapeClick}
        className="gap-1"
        title="Draw Custom Shape"
      >
        <Pencil className="h-4 w-4" />
        <span className="hidden sm:inline">Custom Shape</span>
      </Button>

      <div className="h-6 w-px bg-gray-200 mx-1" />

      <ShapePicker />

      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => createGroup()}
          disabled={!hasMultiSelection}
          className="gap-1"
          title="Group Selected Elements"
        >
          <Group className="h-4 w-4" />
          <span className="hidden sm:inline">Group</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => ungroupElements()}
          disabled={!hasSelection}
          className="gap-1"
          title="Ungroup Selected Elements"
        >
          <Ungroup className="h-4 w-4" />
          <span className="hidden sm:inline">Ungroup</span>
        </Button>
      </div>
    </div>
  );
}
