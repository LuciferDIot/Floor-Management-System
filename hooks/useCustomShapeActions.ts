import { type ShapeType } from "../lib/types";
import { useShapeActions } from "./useShapeActions";

export const useCustomShapeActions = () => {
  const { addShape } = useShapeActions();

  const saveCustomShape = (
    points: { x: number; y: number }[],
    category: string,
    label: string
  ) => {
    let path = "";
    if (points.length > 0) {
      path = `M${points[0].x},${points[0].y} `;
      for (let i = 1; i < points.length; i++) {
        path += `L${points[i].x},${points[i].y} `;
      }
      path += "Z";
    }

    const shape: ShapeType = {
      id: `custom-${Date.now()}`,
      label: label || `Custom ${category}`,
      floorId: null,
      category: category as any,
      x: Math.min(...points.map((p) => p.x)),
      y: Math.min(...points.map((p) => p.y)),
      width:
        Math.max(...points.map((p) => p.x)) -
        Math.min(...points.map((p) => p.x)),
      height:
        Math.max(...points.map((p) => p.y)) -
        Math.min(...points.map((p) => p.y)),
      rotation: 0,
      customPath: path,
    };

    addShape(shape);
  };

  return {
    saveCustomShape,
  };
};
