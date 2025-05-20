"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useFloorActions } from "@/hooks/useFloorActions";
import { useShapeActions } from "@/hooks/useShapeActions";
import { ElementType, ShapeCategory } from "@/lib/types";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { ReservationForm } from "../reservation/reservation-form";

export function PropertiesPanel() {
  const { selectedElements, floors, updateShape } = useShapeActions();
  const { updateFloor, addToHistory } = useFloorActions();

  const [properties, setProperties] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    label: string;
  }>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    rotation: 0,
    label: "",
  });

  const [showReservationForm, setShowReservationForm] = useState(false);

  // Get the selected element
  useEffect(() => {
    if (selectedElements.length !== 1) return;

    const element = selectedElements[0];

    if (element.type === ElementType.SHAPE) {
      // Find the shape in floors
      for (const floor of floors) {
        const shape = floor.shapes.find((s) => s.id === element.id);
        if (shape) {
          setProperties({
            x: shape.x,
            y: shape.y,
            width: shape.width,
            height: shape.height,
            rotation: shape.rotation,
            label: shape.label,
          });
          break;
        }
      }
    } else if (element.type === ElementType.FLOOR) {
      // Find the floor
      const floor = floors.find((f) => f.id === element.id);
      if (floor) {
        setProperties({
          x: floor.x,
          y: floor.y,
          width: floor.width,
          height: floor.height,
          rotation: 0,
          label: floor.name,
        });
      }
    }
  }, [selectedElements, floors]);

  const handlePropertyChange = (property: string, value: number | string) => {
    setProperties({
      ...properties,
      [property]: value,
    });
  };

  const handleApplyChanges = () => {
    if (selectedElements.length !== 1) return;

    const element = selectedElements[0];

    if (element.type === ElementType.SHAPE) {
      // Find the shape in floors and update it
      for (const floor of floors) {
        const shapeIndex = floor.shapes.findIndex((s) => s.id === element.id);
        if (shapeIndex !== -1) {
          const shape = floor.shapes[shapeIndex];
          updateShape(floor.id, shape.id, {
            ...shape,
            x: properties.x,
            y: properties.y,
            width: properties.width,
            height: properties.height,
            rotation: properties.rotation,
            label: properties.label,
          });
          break;
        }
      }
    } else if (element.type === ElementType.FLOOR) {
      // Find the floor and update it
      const floorIndex = floors.findIndex((f) => f.id === element.id);
      if (floorIndex !== -1) {
        const floor = floors[floorIndex];
        updateFloor(floor.id, {
          ...floor,
          x: properties.x,
          y: properties.y,
          width: properties.width,
          height: properties.height,
          name: properties.label,
        });
      }
    }

    addToHistory();
  };

  // Check if selected element is a table
  const isTable = () => {
    if (
      selectedElements.length !== 1 ||
      selectedElements[0].type !== ElementType.SHAPE
    )
      return false;

    for (const floor of floors) {
      const shape = floor.shapes.find((s) => s.id === selectedElements[0].id);
      if (shape && shape.category === ShapeCategory.TABLE) return true;
    }

    return false;
  };

  return (
    <div className="w-80 border-l bg-white p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Properties</h2>
        <Button variant="ghost" size="icon">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="x">X Position</Label>
            <Input
              id="x"
              type="number"
              value={properties.x}
              onChange={(e) =>
                handlePropertyChange("x", Number(e.target.value))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="y">Y Position</Label>
            <Input
              id="y"
              type="number"
              value={properties.y}
              onChange={(e) =>
                handlePropertyChange("y", Number(e.target.value))
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="width">Width</Label>
            <Input
              id="width"
              type="number"
              value={properties.width}
              onChange={(e) =>
                handlePropertyChange("width", Number(e.target.value))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Height</Label>
            <Input
              id="height"
              type="number"
              value={properties.height}
              onChange={(e) =>
                handlePropertyChange("height", Number(e.target.value))
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="label">Label</Label>
          <Input
            id="label"
            value={properties.label}
            onChange={(e) => handlePropertyChange("label", e.target.value)}
          />
        </div>

        {selectedElements.length === 1 &&
          selectedElements[0].type === ElementType.SHAPE && (
            <div className="space-y-2">
              <Label htmlFor="rotation">
                Rotation ({properties.rotation}°)
              </Label>
              <Slider
                id="rotation"
                min={0}
                max={360}
                step={1}
                value={[properties.rotation]}
                onValueChange={(value) =>
                  handlePropertyChange("rotation", value[0])
                }
              />
            </div>
          )}

        <Button onClick={handleApplyChanges} className="w-full">
          Apply Changes
        </Button>

        {isTable() && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowReservationForm(true)}
          >
            Manage Reservation
          </Button>
        )}

        {showReservationForm && (
          <ReservationForm
            onClose={() => setShowReservationForm(false)}
            onSave={(reservation) => {
              // Save reservation to the selected table
              setShowReservationForm(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
