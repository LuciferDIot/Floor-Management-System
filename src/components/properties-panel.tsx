"use client";

import { Save } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Slider } from "../components/ui/slider";
import { useFloorContext } from "../context/floor-context";
import { Shape } from "../types";
import { ColorPicker } from "./color-picker";

// // Debounce function to limit the rate of updates
// function debounce(func, wait) {
//   let timeout;
//   return function (...args) {
//     clearTimeout(timeout);
//     timeout = setTimeout(() => func.apply(this, args), wait);
//   };
// }

export default function PropertiesPanel() {
  const { activeFloor, floors, selectedShapes, updateShape } =
    useFloorContext();
  const [selectedShape, setSelectedShape] = useState<Shape>();
  const [label, setLabel] = useState("");
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [color, setColor] = useState("#cccccc");
  const [saveAsCustomOpen, setSaveAsCustomOpen] = useState(false);
  const [customShapeName, setCustomShapeName] = useState("");
  const [isGrouped, setIsGrouped] = useState(false);
  const [groupId, setGroupId] = useState("");

  const isUpdatingRef = useRef(false);

  // Update selected shape when selection changes
  useEffect(() => {
    if (activeFloor && selectedShapes.length === 1) {
      const floor = floors.find((f) => f.id === activeFloor);
      if (floor) {
        const shape = floor.items.find((item) => item.id === selectedShapes[0]);
        if (shape) {
          setSelectedShape(shape);
          setLabel(shape.label || "");
          setWidth(shape.width);
          setHeight(shape.height);
          setX(shape.x);
          setY(shape.y);
          setColor("#cccccc"); // Default color, would be from shape in a real implementation
          setIsGrouped(!!shape.groupId);
          setGroupId(shape.groupId || "");
        }
      }
    } else if (activeFloor && selectedShapes.length > 1) {
      // Check if all selected shapes are in the same group
      const floor = floors.find((f) => f.id === activeFloor);
      if (floor) {
        const selectedItems = floor.items.filter((item) =>
          selectedShapes.includes(item.id)
        );
        const allGrouped =
          selectedItems.every((item) => item.groupId) &&
          selectedItems.every(
            (item) => item.groupId === selectedItems[0].groupId
          );

        if (allGrouped) {
          setIsGrouped(true);
          setGroupId(selectedItems[0].groupId || "");
          // Use average values for multiple selection
          const avgWidth = Math.round(
            selectedItems.reduce((sum, item) => sum + item.width, 0) /
              selectedItems.length
          );
          const avgHeight = Math.round(
            selectedItems.reduce((sum, item) => sum + item.height, 0) /
              selectedItems.length
          );
          setWidth(avgWidth);
          setHeight(avgHeight);
          setLabel("Multiple items");
          setSelectedShape(undefined);
        } else {
          setSelectedShape(undefined);
          setIsGrouped(false);
        }
      }
    } else {
      setSelectedShape(undefined);
      setIsGrouped(false);
      setGroupId("");
    }
  }, [activeFloor, floors, selectedShapes]);

  // Update shape when properties change - with immediate UI update
  const handleUpdate = useCallback(() => {
    if (activeFloor && !isUpdatingRef.current) {
      isUpdatingRef.current = true;

      // Use requestAnimationFrame to batch updates
      requestAnimationFrame(() => {
        if (selectedShape) {
          // Single shape update
          updateShape(activeFloor, selectedShape.id, {
            label,
            width,
            height,
            x,
            y,
          });
        } else if (isGrouped && groupId && selectedShapes.length > 0) {
          // Update all shapes in the group
          const floor = floors.find((f) => f.id === activeFloor);
          if (floor) {
            // Get all shapes in this group
            const groupShapes = floor.items.filter(
              (item) => item.groupId === groupId
            );

            // Calculate scale factors
            const scaleX =
              width /
              (groupShapes.reduce((sum, item) => sum + item.width, 0) /
                groupShapes.length);
            const scaleY =
              height /
              (groupShapes.reduce((sum, item) => sum + item.height, 0) /
                groupShapes.length);

            // Update each shape proportionally
            groupShapes.forEach((shape) => {
              updateShape(activeFloor, shape.id, {
                width: Math.round(shape.width * scaleX),
                height: Math.round(shape.height * scaleY),
              });
            });
          }
        }

        // Reset the updating flag after a short delay
        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 100);
      });
    }
  }, [
    activeFloor,
    selectedShape,
    isGrouped,
    groupId,
    label,
    width,
    height,
    x,
    y,
    updateShape,
    floors,
    selectedShapes,
  ]);

  // Handle slider change with immediate UI update
  const handleSliderChange = (value: number[], type: "width" | "height") => {
    if (type === "width") {
      setWidth(value[0]);
    } else {
      setHeight(value[0]);
    }
    // Update UI immediately
    handleUpdate();
  };

  // Save as custom shape
  const handleSaveAsCustom = () => {
    // This would save the shape to a custom shapes library
    // For now, we'll just close the dialog
    setSaveAsCustomOpen(false);
  };

  if (!selectedShape && !isGrouped) {
    return (
      <div className="border-t mt-auto p-4 bg-gray-50">
        <h3 className="text-sm font-medium text-gray-500">Properties</h3>
        <p className="text-xs text-gray-400 mt-2">
          Select an item to view and edit its properties
        </p>
      </div>
    );
  }

  return (
    <div className="border-t mt-auto p-4 bg-gray-50 overflow-auto max-h-[50vh]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium">Properties</h3>
        {isGrouped && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            Grouped
          </span>
        )}
      </div>

      <div className="space-y-4">
        {selectedShape && (
          <>
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Input id="type" value={selectedShape.type} disabled />
            </div>

            {selectedShape.type === "table" && (
              <div className="grid gap-2">
                <Label htmlFor="tableType">Table Type</Label>
                <Input
                  id="tableType"
                  value={selectedShape.tableType}
                  disabled
                />
              </div>
            )}

            {selectedShape.type === "decoration" && (
              <div className="grid gap-2">
                <Label htmlFor="decorationType">Decoration Type</Label>
                <Input
                  id="decorationType"
                  value={selectedShape.decorationType}
                  disabled
                />
              </div>
            )}
          </>
        )}

        <div className="grid gap-2">
          <Label htmlFor="label">Label</Label>
          <Input
            id="label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleUpdate}
            placeholder="No label"
            disabled={!selectedShape}
          />
        </div>

        {selectedShape && (
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="x">X Position</Label>
              <Input
                id="x"
                type="number"
                value={x}
                onChange={(e) => setX(Number(e.target.value))}
                onBlur={handleUpdate}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="y">Y Position</Label>
              <Input
                id="y"
                type="number"
                value={y}
                onChange={(e) => setY(Number(e.target.value))}
                onBlur={handleUpdate}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="width">Width: {width}px</Label>
            <Slider
              id="width"
              min={20}
              max={300}
              step={1}
              value={[width]}
              onValueChange={(value) => handleSliderChange(value, "width")}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="height">Height: {height}px</Label>
            <Slider
              id="height"
              min={20}
              max={300}
              step={1}
              value={[height]}
              onValueChange={(value) => handleSliderChange(value, "height")}
            />
          </div>
        </div>

        {selectedShape && (
          <div className="grid gap-2">
            <Label>Color</Label>
            <ColorPicker color={color} onChange={setColor} />
          </div>
        )}

        {isGrouped && (
          <div className="grid gap-2">
            <Label htmlFor="groupId">Group ID</Label>
            <Input id="groupId" value={groupId} disabled />
          </div>
        )}

        <Button
          variant="outline"
          className="w-full"
          onClick={() => setSaveAsCustomOpen(true)}
          disabled={!isGrouped}
        >
          <Save className="h-4 w-4 mr-2" />
          Save as Custom Shape
        </Button>
      </div>

      <Dialog open={saveAsCustomOpen} onOpenChange={setSaveAsCustomOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Custom Shape</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="customName">Shape Name</Label>
              <Input
                id="customName"
                value={customShapeName}
                onChange={(e) => setCustomShapeName(e.target.value)}
                placeholder="My Custom Shape"
              />
            </div>
            <Button onClick={handleSaveAsCustom} disabled={!customShapeName}>
              Save Shape
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
