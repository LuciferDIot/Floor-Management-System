"use client";

import { Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Slider } from "../components/ui/slider";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useFloorContext } from "../context/floor-context";
import { DecorationType, FurnitureType, ShapeType } from "../types";

export default function ShapePicker() {
  const { activeFloor, addShape, setDrawingMode, setDrawingCategory } =
    useFloorContext();
  const [category, setCategory] = useState("tables");
  const [customWidth, setCustomWidth] = useState(80);
  const [customHeight, setCustomHeight] = useState(80);
  const [customRadius, setCustomRadius] = useState(40);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [customizingType, setCustomizingType] = useState<FurnitureType>(
    FurnitureType.Table
  );
  const [customizingSubtype, setCustomizingSubtype] = useState<string>("");
  const [isDrawingDialogOpen, setIsDrawingDialogOpen] = useState(false);
  const [selectedDrawingCategory, setSelectedDrawingCategory] =
    useState<FurnitureType>(FurnitureType.Table);
  const [selectedDrawingSubtype, setSelectedDrawingSubtype] = useState<
    ShapeType | DecorationType
  >(ShapeType.Rectangular);

  const handleAddTable = (tableType: ShapeType) => {
    if (!activeFloor) return;

    let width = 80;
    let height = 80;

    if (tableType === "rectangular") {
      width = 120;
      height = 80;
    } else if (tableType === "square") {
      width = 80;
      height = 80;
    } else if (tableType === "custom") {
      width = customWidth;
      height = customHeight;
    }

    addShape(activeFloor, {
      id: `table-${Date.now()}`,
      type: FurnitureType.Table,
      tableType:
        tableType === ShapeType.Custom ? ShapeType.Rectangular : tableType,
      x: 100,
      y: 100,
      width,
      height,
      label: `T${Math.floor(Math.random() * 100)}`,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    });
  };

  const handleAddChair = () => {
    if (!activeFloor) return;

    addShape(activeFloor, {
      id: `chair-${Date.now()}`,
      type: FurnitureType.Chair,
      x: 100,
      y: 100,
      width: customizingSubtype === "custom" ? customRadius * 2 : 40,
      height: customizingSubtype === "custom" ? customRadius * 2 : 40,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    });
  };

  const handleAddDecoration = (decorationType: DecorationType) => {
    if (!activeFloor) return;

    let width = 40;
    let height = 40;

    if (decorationType === "divider") {
      width = 100;
      height = 10;
    } else if (decorationType === "lamp") {
      width = 30;
      height = 30;
    } else if (decorationType === "custom") {
      width = customWidth;
      height = customHeight;
    }

    addShape(activeFloor, {
      id: `decoration-${Date.now()}`,
      type: FurnitureType.Decoration,
      decorationType:
        decorationType === DecorationType.Custom
          ? DecorationType.Custom
          : decorationType,
      x: 100,
      y: 100,
      width,
      height,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    });
  };

  const openCustomizer = (type: FurnitureType, subtype: string) => {
    setCustomizingType(type);
    setCustomizingSubtype(subtype);
    setIsCustomizing(true);
  };

  const handleCustomShapeAdd = () => {
    if (customizingType === FurnitureType.Table) {
      handleAddTable(ShapeType.Custom);
    } else if (customizingType === FurnitureType.Chair) {
      handleAddChair();
    } else if (customizingType === FurnitureType.Decoration) {
      handleAddDecoration(DecorationType.Custom);
    }
    setIsCustomizing(false);
  };

  const openDrawingDialog = () => {
    setIsDrawingDialogOpen(true);
  };

  const startDrawingMode = () => {
    setDrawingCategory({
      type: selectedDrawingCategory,
      subtype: selectedDrawingSubtype,
    });
    setDrawingMode(true);
    setIsDrawingDialogOpen(false);
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Shape Picker</h2>

      <Tabs value={category} onValueChange={setCategory}>
        <TabsList className="w-full">
          <TabsTrigger value="tables" className="flex-1">
            Tables
          </TabsTrigger>
          <TabsTrigger value="chairs" className="flex-1">
            Chairs
          </TabsTrigger>
          <TabsTrigger value="decorations" className="flex-1">
            Decor
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex-1">
            Custom
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tables" className="mt-4 space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleAddTable(ShapeType.Round)}
          >
            <div className="w-6 h-6 rounded-full bg-gray-300 mr-2"></div>
            Round Table
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleAddTable(ShapeType.Rectangular)}
          >
            <div className="w-8 h-5 bg-gray-300 mr-2"></div>
            Rectangular Table
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleAddTable(ShapeType.Square)}
          >
            <div className="w-6 h-6 bg-gray-300 mr-2"></div>
            Square Table
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => openCustomizer(FurnitureType.Table, "custom")}
          >
            <div className="w-6 h-6 bg-gray-300 mr-2 flex items-center justify-center">
              <Plus className="h-3 w-3" />
            </div>
            Custom Table
          </Button>
        </TabsContent>

        <TabsContent value="chairs" className="mt-4 space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleAddChair}
          >
            <div className="w-5 h-5 rounded-full bg-gray-300 mr-2"></div>
            Chair
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => openCustomizer(FurnitureType.Chair, "custom")}
          >
            <div className="w-5 h-5 rounded-full bg-gray-300 mr-2 flex items-center justify-center">
              <Plus className="h-3 w-3" />
            </div>
            Custom Chair
          </Button>
        </TabsContent>

        <TabsContent value="decorations" className="mt-4 space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleAddDecoration(DecorationType.Plant)}
          >
            <div className="w-6 h-6 bg-green-200 mr-2"></div>
            Plant
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleAddDecoration(DecorationType.Divider)}
          >
            <div className="w-8 h-3 bg-gray-300 mr-2"></div>
            Divider
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleAddDecoration(DecorationType.Lamp)}
          >
            <div className="w-5 h-5 rounded-full bg-yellow-200 mr-2"></div>
            Lamp
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => openCustomizer(FurnitureType.Decoration, "custom")}
          >
            <div className="w-6 h-6 bg-gray-300 mr-2 flex items-center justify-center">
              <Plus className="h-3 w-3" />
            </div>
            Custom Decoration
          </Button>
        </TabsContent>

        <TabsContent value="custom" className="mt-4 space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={openDrawingDialog}
          >
            <div className="w-6 h-6 flex items-center justify-center mr-2">
              <Pencil className="h-4 w-4" />
            </div>
            Draw Custom Shape
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            Draw a custom shape and add it as a table, chair, or decoration.
          </p>
        </TabsContent>
      </Tabs>

      <Dialog open={isCustomizing} onOpenChange={setIsCustomizing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Customize {customizingType}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {(customizingType === "table" ||
              (customizingType === "decoration" &&
                customizingSubtype === "custom")) && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="width">Width: {customWidth}px</Label>
                  <Slider
                    id="width"
                    min={20}
                    max={200}
                    step={1}
                    value={[customWidth]}
                    onValueChange={(value) => setCustomWidth(value[0])}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="height">Height: {customHeight}px</Label>
                  <Slider
                    id="height"
                    min={20}
                    max={200}
                    step={1}
                    value={[customHeight]}
                    onValueChange={(value) => setCustomHeight(value[0])}
                  />
                </div>
              </>
            )}

            {customizingType === "chair" && (
              <div className="grid gap-2">
                <Label htmlFor="radius">Radius: {customRadius}px</Label>
                <Slider
                  id="radius"
                  min={10}
                  max={50}
                  step={1}
                  value={[customRadius]}
                  onValueChange={(value) => setCustomRadius(value[0])}
                />
              </div>
            )}

            <div className="border rounded-md p-4 bg-gray-50">
              <div className="flex items-center justify-center">
                <div
                  className={`bg-gray-300 ${
                    customizingType === FurnitureType.Chair
                      ? "rounded-full"
                      : ""
                  }`}
                  style={{
                    width:
                      customizingType === FurnitureType.Chair
                        ? `${customRadius * 2}px`
                        : `${customWidth}px`,
                    height:
                      customizingType === FurnitureType.Chair
                        ? `${customRadius * 2}px`
                        : `${customHeight}px`,
                  }}
                ></div>
              </div>
            </div>

            <Button onClick={handleCustomShapeAdd}>
              Add Custom {customizingType}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDrawingDialogOpen} onOpenChange={setIsDrawingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Draw Custom Shape</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Shape Type</Label>
              <RadioGroup
                value={selectedDrawingCategory}
                onValueChange={(value) =>
                  setSelectedDrawingCategory(value as FurnitureType)
                }
              >
                {Object.keys(FurnitureType).map((key) => (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={FurnitureType[key as keyof typeof FurnitureType]}
                      id={FurnitureType[key as keyof typeof FurnitureType]}
                    />
                    <Label htmlFor="table">{key}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {selectedDrawingCategory === "table" && (
              <div className="grid gap-2">
                <Label>Table Type</Label>
                <RadioGroup
                  value={selectedDrawingSubtype}
                  onValueChange={(value) =>
                    setSelectedDrawingSubtype(value as ShapeType)
                  }
                >
                  {Object.keys(ShapeType).map((key) => (
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={ShapeType[key as keyof typeof ShapeType]}
                        id={ShapeType[key as keyof typeof ShapeType]}
                      />
                      <Label htmlFor="rectangular">{key}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {selectedDrawingCategory === "decoration" && (
              <div className="grid gap-2">
                <Label>Decoration Type</Label>
                <RadioGroup
                  value={selectedDrawingSubtype}
                  onValueChange={(value) =>
                    setSelectedDrawingSubtype(value as DecorationType)
                  }
                >
                  {Object.keys(DecorationType).map((key) => (
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={
                          DecorationType[key as keyof typeof DecorationType]
                        }
                        id={DecorationType[key as keyof typeof DecorationType]}
                      />
                      <Label htmlFor="plant">{key}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            <div className="border rounded-md p-4 bg-gray-50">
              <p className="text-sm text-center">
                Click on the canvas to add points. Double-click to finish
                drawing.
              </p>
              <p className="text-xs text-gray-500 text-center mt-2">
                Press ESC at any time to cancel drawing mode.
              </p>
            </div>

            <Button onClick={startDrawingMode}>Start Drawing</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
