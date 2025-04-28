export interface Floor {
  id: string
  name: string
  shape: {
    type: "rectangle" | "circle" | "custom"
    points: number[]
  }
  items: Shape[]
}

export interface Shape {
  id: string
  type: "table" | "chair" | "decoration"
  x: number
  y: number
  width: number
  height: number
  rotation: number
  scaleX: number
  scaleY: 1
  tableType?: "round" | "rectangular" | "square"
  decorationType?: "plant" | "divider" | "lamp"
  label?: string
  groupId?: string
}
