"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { Move, Pencil, Redo, Save, Trash2, Undo } from "lucide-react";
import { useFloorStore } from "../store/floor-store";
import { FurnitureCategory } from "../types/floor-types";
import ShapeSelector from "./shape-selector";
import { Button } from "./ui/button";

export default function LeftSidebar() {
  const {
    drawMode,
    activeShape,
    selectedShapeType,
    setSelectedCategory,
    handleDrawModeChange,
    handleDeleteShape,
    handleShapeTypeSelect,
  } = useFloorStore();

  return (
    <div className="w-64 border-r bg-white p-4 flex flex-col">
      <h2 className="font-semibold mb-4">Tools</h2>

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

      <h2 className="font-semibold mb-2">Add Furniture</h2>

      <div className="mb-4">
        <Tabs
          defaultValue="table"
          onValueChange={(value) =>
            setSelectedCategory(value as FurnitureCategory)
          }
        >
          <TabsList className="w-full">
            <TabsTrigger value="table" className="flex-1">
              Tables
            </TabsTrigger>
            <TabsTrigger value="chair" className="flex-1">
              Chairs
            </TabsTrigger>
            <TabsTrigger value="other" className="flex-1">
              Other
            </TabsTrigger>
          </TabsList>

          <TabsContent value="table" className="mt-2">
            <ShapeSelector
              onSelectShape={handleShapeTypeSelect}
              category="table"
              selectedShape={selectedShapeType}
            />
          </TabsContent>

          <TabsContent value="chair" className="mt-2">
            <ShapeSelector
              onSelectShape={handleShapeTypeSelect}
              category="chair"
              selectedShape={selectedShapeType}
            />
          </TabsContent>

          <TabsContent value="other" className="mt-2">
            <ShapeSelector
              onSelectShape={handleShapeTypeSelect}
              category="other"
              selectedShape={selectedShapeType}
            />
          </TabsContent>
        </Tabs>
      </div>

      {activeShape && (
        <div className="mt-auto">
          <h2 className="font-semibold mb-2">Properties</h2>
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm font-medium">{activeShape}</p>
            <p className="text-xs text-gray-500">Selected item</p>
          </div>
        </div>
      )}
    </div>
  );
}
