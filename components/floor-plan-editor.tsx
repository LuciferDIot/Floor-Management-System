"use client";

import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useFloorActions } from "@/hooks/useFloorActions";
import { useHistoryActions } from "@/hooks/useHistoryActions";
import { useSaveLoadActions } from "@/hooks/useSaveLoadActions";
import { useEffect, useState } from "react";
import { Canvas } from "./canvas/canvas";
import { ContextMenuProvider } from "./context-menu/context-menu-provider";
import { PropertiesPanel } from "./properties/properties-panel";
import { CustomShapeWizard } from "./shapes/custom-shape-wizard";
import { Toolbar } from "./toolbar/toolbar";

export default function FloorPlanEditor() {
  const { toast } = useToast();
  const [showCustomShapeWizard, setShowCustomShapeWizard] = useState(false);

  const { selectedElements } = useFloorActions();
  const { saveFloorPlan, loadFloorPlan } = useSaveLoadActions();
  const { canRedo, canUndo, undo, redo } = useHistoryActions();

  // Auto-save every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      saveFloorPlan("auto-save");
      toast({
        title: "Auto-saved",
        description: "Your floor plan has been automatically saved",
        duration: 3000,
      });
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [saveFloorPlan, toast]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo: Ctrl+Z
      if (e.ctrlKey && e.key === "z" && canUndo) {
        e.preventDefault();
        undo();
      }

      // Redo: Ctrl+Y or Ctrl+Shift+Z
      if (
        (e.ctrlKey && e.key === "y") ||
        (e.ctrlKey && e.shiftKey && e.key === "z")
      ) {
        if (canRedo) {
          e.preventDefault();
          redo();
        }
      }

      // Toggle grid: Ctrl+G
      if (e.ctrlKey && e.key === "g") {
        e.preventDefault();
        // Toggle grid visibility
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canUndo, canRedo, undo, redo]);

  return (
    <TooltipProvider>
      <ContextMenuProvider>
        <div className="flex flex-col h-screen">
          <Toolbar
            onCustomShapeClick={() => setShowCustomShapeWizard(true)}
            onSave={() => saveFloorPlan("manual-save")}
            onLoad={loadFloorPlan}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={undo}
            onRedo={redo}
          />
          <div className="flex flex-1 overflow-hidden">
            <Canvas />
            {selectedElements.length > 0 && <PropertiesPanel />}
          </div>
          {showCustomShapeWizard && (
            <CustomShapeWizard
              onClose={() => setShowCustomShapeWizard(false)}
              onSave={() => {
                // Add shape to templates
                setShowCustomShapeWizard(false);
                toast({
                  title: "Shape created",
                  description:
                    "Your custom shape has been added to the shape picker",
                });
              }}
            />
          )}
        </div>
        <Toaster />
      </ContextMenuProvider>
    </TooltipProvider>
  );
}
