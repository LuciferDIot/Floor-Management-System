"use client";

import Konva from "konva";
import type { KonvaEventObject, Node, NodeConfig } from "konva/lib/Node";
import { useEffect, useRef, useState } from "react";
import { Circle, Group, Rect, Text, Transformer } from "react-konva";
import { useFloorStore } from "../store/floor-store";
import type { Floor, Shape } from "../types";

interface ShapeLayerProps {
  floorId: string;
}

export default function ShapeLayer({ floorId }: ShapeLayerProps) {
  const { floors, updateShape, selectedShapes, selectShape } = useFloorStore();
  const transformerRef = useRef<Konva.Transformer>(null);
  const shapeRefs = useRef<Map<string, Konva.Node>>(new Map());
  const [, setIsDragging] = useState(false);

  const floorIndex = floors.findIndex((f: Floor) => f.id === floorId);

  const handleSelect = (
    e: KonvaEventObject<Event, Node<NodeConfig>>,
    shape: Shape
  ) => {
    const isShift = (e.evt as MouseEvent).shiftKey;

    if (isShift) {
      // Multi-select with shift
      if (selectedShapes.includes(shape.id)) {
        selectShape(selectedShapes.filter((id) => id !== shape.id));
      } else {
        selectShape([...selectedShapes, shape.id]);
      }
    } else {
      // Single select
      selectShape([shape.id]);
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (e: KonvaEventObject<DragEvent>, shape: Shape) => {
    setIsDragging(false);

    // Update shape position
    updateShape(floorId, shape.id, {
      ...shape,
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const handleTransformEnd = (shape: Shape) => {
    // Get transformer node
    const node = transformerRef.current;
    if (!node) return;

    // Get the first attached node (we only transform one at a time for now)
    const transformedNode = node.getNodes()[0];
    if (!transformedNode) return;

    // Get new scale and position
    const scaleX = transformedNode.scaleX();
    const scaleY = transformedNode.scaleY();

    // Update shape with new dimensions
    updateShape(floorId, shape.id, {
      ...shape,
      width: shape.width * scaleX,
      height: shape.height * scaleY,
      // Reset scale to avoid accumulation
      scaleX: 1,
      scaleY: 1,
    });
  };

  // Update transformer nodes when selection changes
  useEffect(() => {
    let nodes: Konva.Node[] = [];
    if (transformerRef.current) {
      nodes = selectedShapes
        .map((id) => shapeRefs.current.get(id))
        .filter((node): node is Konva.Node => node !== undefined);
    }

    if (transformerRef.current) {
      if (nodes.length === 1) {
        transformerRef.current.nodes(nodes);
        transformerRef.current.getLayer()?.batchDraw();
      } else {
        transformerRef.current.nodes([]);
      }
    }
  }, [selectedShapes]);

  if (floorIndex < 0) return null;

  // Get selected shapes
  const selectedShapeObjects: Shape[] = floors[floorIndex].items.filter(
    (item: Shape) => selectedShapes.includes(item.id)
  );

  return (
    <>
      {floors[floorIndex].items.map((shape: Shape) => {
        const isSelected: boolean = selectedShapes.includes(shape.id);

        // Store ref for the shape
        const setRef = (ref: Konva.Node | null): void => {
          if (ref) {
            shapeRefs.current.set(shape.id, ref);
          } else {
            shapeRefs.current.delete(shape.id);
          }
        };

        if (shape.type === "table") {
          if (shape.tableType === "round") {
            return (
              <Group
                key={shape.id}
                id={shape.id}
                x={shape.x}
                y={shape.y}
                draggable
                onClick={(e) => handleSelect(e, shape)}
                onTap={(e) => handleSelect(e, shape)}
                onDragStart={handleDragStart}
                onDragEnd={(e) => handleDragEnd(e, shape)}
                ref={setRef}
              >
                <Circle
                  radius={shape.width / 2}
                  fill={isSelected ? "#b3d1ff" : "#ccc"}
                  stroke="#666"
                  strokeWidth={1}
                />
                <Text
                  text={shape.label || ""}
                  fontSize={14}
                  fill="white"
                  align="center"
                  verticalAlign="middle"
                  width={shape.width}
                  height={shape.height}
                  offsetX={shape.width / 2}
                  offsetY={shape.height / 2}
                />
              </Group>
            );
          } else {
            // Rectangle table
            return (
              <Group
                key={shape.id}
                id={shape.id}
                x={shape.x}
                y={shape.y}
                draggable
                onClick={(e) => handleSelect(e, shape)}
                onTap={(e) => handleSelect(e, shape)}
                onDragStart={handleDragStart}
                onDragEnd={(e) => handleDragEnd(e, shape)}
                ref={setRef}
              >
                <Rect
                  width={shape.width}
                  height={shape.height}
                  fill={isSelected ? "#b3d1ff" : "#ccc"}
                  stroke="#666"
                  strokeWidth={1}
                />
                <Text
                  text={shape.label || ""}
                  fontSize={14}
                  fill="white"
                  align="center"
                  verticalAlign="middle"
                  width={shape.width}
                  height={shape.height}
                />
              </Group>
            );
          }
        }

        if (shape.type === "chair") {
          return (
            <Group
              key={shape.id}
              id={shape.id}
              x={shape.x}
              y={shape.y}
              draggable
              onClick={(e) => handleSelect(e, shape)}
              onTap={(e) => handleSelect(e, shape)}
              onDragStart={handleDragStart}
              onDragEnd={(e) => handleDragEnd(e, shape)}
              ref={setRef}
            >
              <Circle
                radius={shape.width / 2}
                fill={isSelected ? "#b3d1ff" : "#ddd"}
                stroke="#999"
                strokeWidth={1}
              />
            </Group>
          );
        }

        // Default to rectangle for other items
        return (
          <Group
            key={shape.id}
            id={shape.id}
            x={shape.x}
            y={shape.y}
            draggable
            onClick={(e) => handleSelect(e, shape)}
            onTap={(e) => handleSelect(e, shape)}
            onDragStart={handleDragStart}
            onDragEnd={(e) => handleDragEnd(e, shape)}
            ref={setRef}
          >
            <Rect
              width={shape.width}
              height={shape.height}
              fill={isSelected ? "#b3d1ff" : "#eee"}
              stroke="#999"
              strokeWidth={1}
            />
          </Group>
        );
      })}

      {selectedShapeObjects.length === 1 && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit minimum size
            if (newBox.width < 10 || newBox.height < 10) {
              return oldBox;
            }
            return newBox;
          }}
          onTransformEnd={() => handleTransformEnd(selectedShapeObjects[0])}
        />
      )}
    </>
  );
}
