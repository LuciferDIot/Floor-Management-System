import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ShapeType } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(date);
}

export function calculateGroupCenter(shapes: ShapeType[]): {
  x: number;
  y: number;
} {
  if (shapes.length === 0) return { x: 0, y: 0 };

  // Calculate the center point of all shapes
  const totalX = shapes.reduce(
    (sum, shape) => sum + shape.x + shape.width / 2,
    0
  );
  const totalY = shapes.reduce(
    (sum, shape) => sum + shape.y + shape.height / 2,
    0
  );

  return {
    x: totalX / shapes.length,
    y: totalY / shapes.length,
  };
}

export function calculateGroupBoundingBox(
  shapes: ShapeType[],
  padding: number = 10
): {
  x: number;
  y: number;
  width: number;
  height: number;
  center: { x: number; y: number };
} {
  if (shapes.length === 0) {
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      center: { x: 0, y: 0 },
    };
  }

  const groupCenter = calculateGroupCenter(shapes);

  // Calculate distances from center to edges
  const distances = shapes.map((shape) => {
    return {
      left: groupCenter.x - (shape.x - padding),
      right: shape.x + shape.width + padding - groupCenter.x,
      top: groupCenter.y - (shape.y - padding),
      bottom: shape.y + shape.height + padding - groupCenter.y,
    };
  });

  const maxLeft = Math.max(...distances.map((d) => d.left));
  const maxRight = Math.max(...distances.map((d) => d.right));
  const maxTop = Math.max(...distances.map((d) => d.top));
  const maxBottom = Math.max(...distances.map((d) => d.bottom));

  const width = maxLeft + maxRight;
  const height = maxTop + maxBottom;

  return {
    x: groupCenter.x - maxLeft,
    y: groupCenter.y - maxTop,
    width,
    height,
    center: groupCenter,
  };
}

export function applyRotationToPoint(
  point: { x: number; y: number },
  center: { x: number; y: number },
  angleDegrees: number
): { x: number; y: number } {
  // Convert angle from degrees to radians
  const angleRadians = (angleDegrees * Math.PI) / 180;

  // Translate point to origin
  const translatedX = point.x - center.x;
  const translatedY = point.y - center.y;

  // Apply rotation
  const rotatedX =
    translatedX * Math.cos(angleRadians) - translatedY * Math.sin(angleRadians);
  const rotatedY =
    translatedX * Math.sin(angleRadians) + translatedY * Math.cos(angleRadians);

  // Translate back
  return {
    x: rotatedX + center.x,
    y: rotatedY + center.y,
  };
}

export function checkCollision(shape1: ShapeType, shape2: ShapeType): boolean {
  // Simple AABB collision detection
  return !(
    shape1.x + shape1.width < shape2.x ||
    shape1.x > shape2.x + shape2.width ||
    shape1.y + shape1.height < shape2.y ||
    shape1.y > shape2.y + shape2.height
  );
}

export function isPointInShape(
  point: { x: number; y: number },
  shape: ShapeType
): boolean {
  // For rectangular shapes
  return (
    point.x >= shape.x &&
    point.x <= shape.x + shape.width &&
    point.y >= shape.y &&
    point.y <= shape.y + shape.height
  );
}
