export enum UseType {
  BASIC = "basic",
  ADVANCED = "advanced",
}

export interface FloorType {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  shapes: ShapeType[];
}

export enum ShapeCategory {
  TABLE = "table",
  CHAIR = "chair",
  CUSTOM = "custom",
}

export interface ShapeType {
  id: string;
  floorId: string | null;
  label: string;
  category: ShapeCategory;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fill?: string;
  stroke?: string;
  customPath?: string;
  groupId?: string;
  tableId?: string;
  reservation?: ReservationType;
}

export interface GroupType {
  id: string;
  name: string;
  shapeIds: string[];
  floorId: string;
  rotation: number;
  center: { x: number; y: number };
  width?: number;
  height?: number;
}

export enum ReservationStatus {
  RESERVED = "reserved",
  PENDING = "pending",
  AVAILABLE = "available",
}

export interface ReservationType {
  id: string;
  time: Date;
  customerName: string;
  partySize: number;
  notes?: string;
  status: ReservationStatus;
}

export enum ElementType {
  FLOOR = "floor",
  SHAPE = "shape",
  GROUP = "group",
}

export interface SelectedElement {
  id: string;
  type: ElementType;
  floorId: string | null;
}

export type HistoryAction = {
  floors: FloorType[];
  selectedElements: SelectedElement[];
  groups: Record<string, GroupType>;
};
