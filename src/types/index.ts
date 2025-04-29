export enum FloorShapeType {
  Rectangle = "rectangle",
  Circle = "circle",
  Custom = "custom",
}

export enum FurnitureType {
  Table = "table",
  Chair = "chair",
  Decoration = "decoration",
  Custom = "custom",
}

export enum ShapeType {
  Round = "round",
  Rectangular = "rectangular",
  Square = "square",
  Custom = "custom",
}

export enum DecorationType {
  Plant = "plant",
  Divider = "divider", // Fixed the typo from original interface
  Lamp = "lamp",
  Custom = "custom",
}

export enum ReservationStatus {
  Confirmed = "confirmed",
  Pending = "pending",
  Cancelled = "cancelled",
}

export interface Floor {
  id: string;
  name: string;
  shape: {
    type: FloorShapeType;
    points: number[];
  };
  items: Shape[];
}

export interface Shape {
  id: string;
  type: FurnitureType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: 1;
  tableType?: ShapeType;
  decorationType?: DecorationType;
  label?: string;
  groupId?: string;
  points?: number[];
}

export interface DrawingCategory {
  type: FurnitureType;
  subtype: DecorationType | ShapeType;
}

export interface Reservation {
  id: string;
  name: string;
  date: string;
  time: string;
  duration: number;
  partySize: number;
  notes?: string;
  status: ReservationStatus;
}
