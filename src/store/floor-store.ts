"use client"

import { create } from "zustand"
import type { Floor, Shape } from "@/types"

interface FloorState {
  floors: Floor[]
  activeFloorId: string | null
  selectedShapes: string[]
  copiedShapes: Shape[]
  history: {
    past: Floor[][]
    future: Floor[][]
  }

  // Floor actions
  setActiveFloor: (floorId: string) => void
  addFloor: (floor: Floor) => void
  updateFloor: (floorId: string, floor: Partial<Floor>) => void
  deleteFloor: (floorId: string) => void

  // Shape actions
  addShape: (floorId: string, shape: Shape) => void
  updateShape: (floorId: string, shapeId: string, shape: Partial<Shape>) => void
  deleteShape: (floorId: string, shapeId: string) => void

  // Selection actions
  selectShape: (shapeIds: string[]) => void
  deselectAll: () => void

  // Copy/Paste actions
  copySelectedShapes: () => void
  pasteShapes: (floorId: string | null) => void

  // Group actions
  groupSelectedShapes: (floorId: string | null) => void
  ungroupSelection: (floorId: string | null) => void

  // Delete actions
  deleteSelectedShapes: (floorId: string | null) => void

  // History actions
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean

  // Save/Load actions
  saveFloorPlan: () => void
  loadFloorPlan: () => void
}

// Helper to check if shapes overlap
const doShapesOverlap = (shape1: Shape, shape2: Shape): boolean => {
  // Simple bounding box collision detection
  return !(
    shape1.x + shape1.width < shape2.x ||
    shape1.x > shape2.x + shape2.width ||
    shape1.y + shape1.height < shape2.y ||
    shape1.y > shape2.y + shape2.height
  )
}

export const useFloorStore = create<FloorState>((set, get) => ({
  floors: [],
  activeFloorId: null,
  selectedShapes: [],
  copiedShapes: [],
  history: {
    past: [],
    future: [],
  },
  canUndo: false,
  canRedo: false,

  // Save current state to history
  saveToHistory: () => {
    const { floors } = get()
    set({
      history: {
        past: [...history.past, JSON.parse(JSON.stringify(floors))],
        future: [],
      },
      canUndo: true,
      canRedo: false,
    })
  },

  // Floor actions
  setActiveFloor: (floorId) => {
    set({ activeFloorId: floorId, selectedShapes: [] })
  },

  addFloor: (floor) => {
    const { floors } = get()
    set({
      floors: [...floors, floor],
      activeFloorId: floor.id,
    })
  },

  updateFloor: (floorId, updatedFloor) => {
    const { floors } = get()
    set((state) => ({
      floors: state.floors.map((floor) => (floor.id === floorId ? { ...floor, ...updatedFloor } : floor)),
    }))
  },

  deleteFloor: (floorId) => {
    const { floors, activeFloorId } = get()
    const newFloors = floors.filter((floor) => floor.id !== floorId)

    // If we're deleting the active floor, set a new active floor
    let newActiveFloorId = activeFloorId
    if (activeFloorId === floorId) {
      newActiveFloorId = newFloors.length > 0 ? newFloors[0].id : null
    }

    set({
      floors: newFloors,
      activeFloorId: newActiveFloorId,
    })
  },

  // Shape actions
  addShape: (floorId, shape) => {
    const { floors } = get()

    // Find the floor
    const floorIndex = floors.findIndex((floor) => floor.id === floorId)
    if (floorIndex === -1) return

    // Check for collisions with existing shapes
    const existingShapes = floors[floorIndex].items
    const hasCollision = existingShapes.some((existingShape) => doShapesOverlap(existingShape, shape))

    if (hasCollision) {
      // Move the shape to avoid collision
      shape.x += 50
      shape.y += 50
    }

    // Add the shape to the floor
    const updatedFloors = [...floors]
    updatedFloors[floorIndex] = {
      ...updatedFloors[floorIndex],
      items: [...updatedFloors[floorIndex].items, shape],
    }

    set({ floors: updatedFloors, selectedShapes: [shape.id] })
  },

  updateShape: (floorId, shapeId, updatedShape) => {
    const { floors } = get()

    // Find the floor
    const floorIndex = floors.findIndex((floor) => floor.id === floorId)
    if (floorIndex === -1) return

    // Find the shape
    const shapeIndex = floors[floorIndex].items.findIndex((item) => item.id === shapeId)
    if (shapeIndex === -1) return

    // Update the shape
    const updatedFloors = [...floors]
    updatedFloors[floorIndex].items[shapeIndex] = {
      ...updatedFloors[floorIndex].items[shapeIndex],
      ...updatedShape,
    }

    set((state) => ({ floors: [...state.floors] }))
  },

  deleteShape: (floorId, shapeId) => {
    const { floors, selectedShapes } = get()

    // Find the floor
    const floorIndex = floors.findIndex((floor) => floor.id === floorId)
    if (floorIndex === -1) return

    // Remove the shape
    const updatedFloors = [...floors]
    updatedFloors[floorIndex] = {
      ...updatedFloors[floorIndex],
      items: updatedFloors[floorIndex].items.filter((item) => item.id !== shapeId),
    }

    // Update selected shapes
    const updatedSelectedShapes = selectedShapes.filter((id) => id !== shapeId)

    set({
      floors: updatedFloors,
      selectedShapes: updatedSelectedShapes,
    })
  },

  // Selection actions
  selectShape: (shapeIds) => {
    set({ selectedShapes: shapeIds })
  },

  deselectAll: () => {
    set({ selectedShapes: [] })
  },

  // Copy/Paste actions
  copySelectedShapes: () => {
    const { floors, selectedShapes } = get()

    // Find all selected shapes across all floors
    const shapesToCopy: Shape[] = []

    floors.forEach((floor) => {
      floor.items.forEach((item) => {
        if (selectedShapes.includes(item.id)) {
          shapesToCopy.push({ ...item })
        }
      })
    })

    set({ copiedShapes: shapesToCopy })
  },

  pasteShapes: (floorId) => {
    if (!floorId) return

    const { floors, copiedShapes } = get()

    // Find the floor
    const floorIndex = floors.findIndex((floor) => floor.id === floorId)
    if (floorIndex === -1 || copiedShapes.length === 0) return

    // Create new shapes with new IDs and slightly offset position
    const newShapes = copiedShapes.map((shape) => ({
      ...shape,
      id: `${shape.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      x: shape.x + 20,
      y: shape.y + 20,
    }))

    // Check for collisions
    const existingShapes = floors[floorIndex].items
    const hasCollision = newShapes.some((newShape) =>
      existingShapes.some((existingShape) => doShapesOverlap(existingShape, newShape)),
    )

    if (hasCollision) {
      // TODO: Show error message
      console.error("Cannot paste shapes due to overlap")
      return
    }

    // Add the new shapes to the floor
    const updatedFloors = [...floors]
    updatedFloors[floorIndex] = {
      ...updatedFloors[floorIndex],
      items: [...updatedFloors[floorIndex].items, ...newShapes],
    }

    // Select the newly pasted shapes
    const newShapeIds = newShapes.map((shape) => shape.id)

    set({
      floors: updatedFloors,
      selectedShapes: newShapeIds,
    })
  },

  // Group actions
  groupSelectedShapes: (floorId) => {
    if (!floorId) return

    const { floors, selectedShapes } = get()
    if (selectedShapes.length < 2) return

    // Find the floor
    const floorIndex = floors.findIndex((floor) => floor.id === floorId)
    if (floorIndex === -1) return

    // Create a new group ID
    const groupId = `group-${Date.now()}`

    // Update the shapes to be in the group
    const updatedFloors = [...floors]
    updatedFloors[floorIndex] = {
      ...updatedFloors[floorIndex],
      items: updatedFloors[floorIndex].items.map((item) => {
        if (selectedShapes.includes(item.id)) {
          return { ...item, groupId }
        }
        return item
      }),
    }

    set({ floors: updatedFloors })
  },

  ungroupSelection: (floorId) => {
    if (!floorId) return

    const { floors, selectedShapes } = get()
    if (selectedShapes.length === 0) return

    // Find the floor
    const floorIndex = floors.findIndex((floor) => floor.id === floorId)
    if (floorIndex === -1) return

    // Get all group IDs from selected shapes
    const groupIds = new Set<string>()
    floors[floorIndex].items.forEach((item) => {
      if (selectedShapes.includes(item.id) && item.groupId) {
        groupIds.add(item.groupId)
      }
    })

    if (groupIds.size === 0) return

    // Remove the group IDs from all shapes in those groups
    const updatedFloors = [...floors]
    updatedFloors[floorIndex] = {
      ...updatedFloors[floorIndex],
      items: updatedFloors[floorIndex].items.map((item) => {
        if (item.groupId && groupIds.has(item.groupId)) {
          const { groupId, ...rest } = item
          return rest
        }
        return item
      }),
    }

    set({ floors: updatedFloors })
  },

  // Delete actions
  deleteSelectedShapes: (floorId) => {
    if (!floorId) return

    const { floors, selectedShapes } = get()
    if (selectedShapes.length === 0) return

    // Find the floor
    const floorIndex = floors.findIndex((floor) => floor.id === floorId)
    if (floorIndex === -1) return

    // Remove the selected shapes
    const updatedFloors = [...floors]
    updatedFloors[floorIndex] = {
      ...updatedFloors[floorIndex],
      items: updatedFloors[floorIndex].items.filter((item) => !selectedShapes.includes(item.id)),
    }

    set({
      floors: updatedFloors,
      selectedShapes: [],
    })
  },

  // History actions
  undo: () => {
    const { history } = get()
    if (history.past.length === 0) return

    const newPast = [...history.past]
    const previousState = newPast.pop()

    set((state) => ({
      floors: previousState || [],
      history: {
        past: newPast,
        future: [state.floors, ...history.future],
      },
      canUndo: newPast.length > 0,
      canRedo: true,
    }))
  },

  redo: () => {
    const { history } = get()
    if (history.future.length === 0) return

    const newFuture = [...history.future]
    const nextState = newFuture.shift()

    set((state) => ({
      floors: nextState || [],
      history: {
        past: [...history.past, state.floors],
        future: newFuture,
      },
      canUndo: true,
      canRedo: newFuture.length > 0,
    }))
  },

  // Save/Load actions
  saveFloorPlan: () => {
    const { floors } = get()
    localStorage.setItem("floorPlan", JSON.stringify(floors))
  },

  loadFloorPlan: () => {
    const savedFloorPlan = localStorage.getItem("floorPlan")
    if (savedFloorPlan) {
      const floors = JSON.parse(savedFloorPlan)
      set({
        floors,
        activeFloorId: floors.length > 0 ? floors[0].id : null,
        selectedShapes: [],
      })
    }
  },
}))
