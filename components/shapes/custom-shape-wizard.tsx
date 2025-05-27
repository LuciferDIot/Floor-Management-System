"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCustomShapeActions } from "@/hooks/useCustomShapeActions";
import { ShapeCategory } from "@/lib/types";
import { useEffect, useRef, useState } from "react";

interface CustomShapeWizardProps {
  onClose: () => void;
  onSave: () => void;
}

export function CustomShapeWizard({ onClose }: CustomShapeWizardProps) {
  const [step, setStep] = useState(1);
  const [drawingMode, setDrawingMode] = useState<"polygon" | "freehand">(
    "polygon"
  );
  const [category, setCategory] = useState<ShapeCategory>(ShapeCategory.TABLE);
  const [label, setLabel] = useState("Custom Shape");
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const { saveCustomShape } = useCustomShapeActions();

  // Clear canvas when drawing mode changes
  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
    setPoints([]);
  }, [drawingMode]);

  const handleModeSelect = (mode: "polygon" | "freehand") => {
    setDrawingMode(mode);
    setStep(2);
  };

  const handleCategorySelect = (cat: ShapeCategory) => {
    setCategory(cat);
    setStep(4);
  };

  const handleStartDrawing = () => {
    setIsDrawing(true);
    setPoints([]);

    // Clear canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 2;
      }
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (drawingMode !== "polygon" || !isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newPoints = [...points, { x, y }];
    setPoints(newPoints);

    // Draw point
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();

      // Connect points
      if (points.length > 0) {
        const lastPoint = points[points.length - 1];
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      // If we have at least 3 points, show a preview of the closed shape
      if (newPoints.length >= 3) {
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(
          newPoints[newPoints.length - 1].x,
          newPoints[newPoints.length - 1].y
        );
        ctx.lineTo(newPoints[0].x, newPoints[0].y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (drawingMode !== "freehand" || !isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setPoints([{ x, y }]);

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (drawingMode !== "freehand" || !isDrawing || points.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setPoints([...points, { x, y }]);

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const handleCanvasMouseUp = () => {
    if (drawingMode !== "freehand" || !isDrawing) return;

    // Close the shape if we have enough points
    if (points.length >= 3) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineTo(points[0].x, points[0].y);
        ctx.stroke();
      }

      setIsDrawing(false);
      setStep(3);
    }
  };

  const handleFinishDrawing = () => {
    setIsDrawing(false);

    // Close the shape
    if (drawingMode === "polygon" && points.length > 2) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(points[points.length - 1].x, points[points.length - 1].y);
        ctx.lineTo(points[0].x, points[0].y);
        ctx.stroke();
      }
    }

    setStep(3);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isDrawing && points.length > 2) {
      handleFinishDrawing();
    }
  };

  const handleSave = () => {
    if (points.length < 3) {
      alert("Please draw a shape with at least 3 points");
      return;
    }

    saveCustomShape(points, category, label);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Create Custom Shape</h2>

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-medium">Choose Drawing Mode</h3>
            <RadioGroup
              defaultValue="polygon"
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  id="polygon"
                  value="polygon"
                  onClick={() => handleModeSelect("polygon")}
                />
                <Label htmlFor="polygon">Polygon (Click Vertices)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  id="freehand"
                  value="freehand"
                  onClick={() => handleModeSelect("freehand")}
                />
                <Label htmlFor="freehand">Freehand (Draw Shape)</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-medium">Draw Your Shape</h3>
            <p className="text-sm text-gray-500">
              {drawingMode === "polygon"
                ? "Click to add vertices. Press Enter when finished."
                : "Click and drag to draw. Release when finished."}
            </p>
            <div className="border border-gray-300 rounded-md overflow-hidden">
              <canvas
                ref={canvasRef}
                width={400}
                height={300}
                className="w-full bg-gray-50"
                onClick={handleCanvasClick}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
              />
            </div>
            <div className="flex justify-between">
              {!isDrawing ? (
                <Button onClick={handleStartDrawing}>Start Drawing</Button>
              ) : (
                <Button onClick={handleFinishDrawing}>Finish Drawing</Button>
              )}
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-medium">Assign Category</h3>
            <RadioGroup
              defaultValue={ShapeCategory.TABLE}
              className="grid gap-2"
            >
              {Object.keys(ShapeCategory).map((key, index) => (
                <div className="flex items-center space-x-2" key={index}>
                  <RadioGroupItem
                    id={key}
                    value={ShapeCategory[key as keyof typeof ShapeCategory]}
                    onClick={() =>
                      handleCategorySelect(
                        ShapeCategory[key as keyof typeof ShapeCategory]
                      )
                    }
                  />
                  <Label htmlFor={key}>
                    {ShapeCategory[key as keyof typeof ShapeCategory]}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            <Button variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-medium">Name Your Shape</h3>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Enter shape name"
            />
            <div className="flex justify-between">
              <Button onClick={handleSave}>Save Shape</Button>
              <Button variant="outline" onClick={() => setStep(3)}>
                Back
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
