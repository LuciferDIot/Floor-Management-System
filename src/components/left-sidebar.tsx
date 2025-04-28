"use client";

import { Tabs, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { useFloorStore } from "../store/floor-store";
import { FurnitureCategory } from "../types/floor-types";
import ShapeSelector from "./shape-selector";
import Toolbar from "./toolbar";
import { TabsContent } from "./ui/tabs";

export default function LeftSidebar() {
  const {
    activeShape,
    selectedShapeType,
    setSelectedCategory,
    handleShapeTypeSelect,
  } = useFloorStore();

  return (
    <div className="w-64 border-r bg-white p-4 flex flex-col">
      <h2 className="font-semibold mb-4">Tools</h2>
      <Toolbar />

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
