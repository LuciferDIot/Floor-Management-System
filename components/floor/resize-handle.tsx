"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface ResizeHandleProps {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right"
  onResizeStart: () => void
  onResize: (dx: number, dy: number) => void
  onResizeEnd: () => void
}

export function ResizeHandle({ position, onResizeStart, onResize, onResizeEnd }: ResizeHandleProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })

  const positionClasses = {
    "top-left": "top-0 left-0 cursor-nwse-resize",
    "top-right": "top-0 right-0 cursor-nesw-resize",
    "bottom-left": "bottom-0 left-0 cursor-nesw-resize",
    "bottom-right": "bottom-0 right-0 cursor-nwse-resize",
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDragging(true)
    setStartPos({ x: e.clientX, y: e.clientY })
    onResizeStart()
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - startPos.x
      const dy = e.clientY - startPos.y
      onResize(dx, dy)
      setStartPos({ x: e.clientX, y: e.clientY })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      onResizeEnd()
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, onResize, onResizeEnd, startPos])

  return (
    <div
      className={cn("absolute w-3 h-3 bg-blue-500 rounded-full z-10", positionClasses[position])}
      style={{ transform: "translate(-50%, -50%)" }}
      onMouseDown={handleMouseDown}
    />
  )
}
