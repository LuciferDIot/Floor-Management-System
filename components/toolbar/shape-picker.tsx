"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useShapeActions } from "@/hooks/useShapeActions";
import { ShapeCategory } from "@/lib/types";
import { ChevronDown, Circle, Square } from "lucide-react";
import { useState } from "react";

export function ShapePicker() {
  const { addShape } = useShapeActions();
  const [open, setOpen] = useState(false);

  const tableTemplates = [
    {
      id: "round-table-small",
      label: "Round Table (Small)",
      width: 60,
      height: 60,
    },
    {
      id: "round-table-medium",
      label: "Round Table (Medium)",
      width: 80,
      height: 80,
    },
    {
      id: "round-table-large",
      label: "Round Table (Large)",
      width: 100,
      height: 100,
    },
    {
      id: "rect-table-small",
      label: "Rectangular Table (Small)",
      width: 80,
      height: 60,
    },
    {
      id: "rect-table-large",
      label: "Rectangular Table (Large)",
      width: 120,
      height: 80,
    },
  ];

  const chairTemplates = [
    { id: "chair-small", label: "Chair (Small)", width: 30, height: 30 },
    { id: "chair-medium", label: "Chair (Medium)", width: 40, height: 40 },
  ];

  const handleAddShape = (template: any, category: ShapeCategory) => {
    addShape({
      id: `${category}-${Date.now()}`,
      label: template.label,
      category,
      x: 100,
      y: 100,
      width: template.width,
      height: template.height,
      rotation: 0,
    });
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <span>Add Shape</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuItem className="font-medium" disabled>
            Tables
          </DropdownMenuItem>
          {tableTemplates.map((template) => (
            <DropdownMenuItem
              key={template.id}
              onClick={() => handleAddShape(template, ShapeCategory.TABLE)}
            >
              <Circle className="h-4 w-4 mr-2" />
              {template.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuGroup>
          <DropdownMenuItem className="font-medium" disabled>
            Chairs
          </DropdownMenuItem>
          {chairTemplates.map((template) => (
            <DropdownMenuItem
              key={template.id}
              onClick={() => handleAddShape(template, ShapeCategory.CHAIR)}
            >
              <Square className="h-4 w-4 mr-2" />
              {template.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
