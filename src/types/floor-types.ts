export type ShapeType = "circle" | "square" | "rectangle" | "custom";
export type FurnitureCategory = "table" | "chair" | "other";

export interface Chair {
  angle: number;
  distance: number;
}

export interface Shape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  category: FurnitureCategory;
  label: string;
  color: string;
  selected: boolean;
  chairs?: Chair[];
  customPath?: { x: number; y: number }[];
}

export interface Floor {
  id: string;
  name: string;
  shapes: Shape[];
}
