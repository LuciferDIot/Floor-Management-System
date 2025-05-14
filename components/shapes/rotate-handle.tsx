"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"

interface RotateHandleProps {
  onRotate: (angle: number) => void
  initialRotation: number
}

export function RotateHandle({ onRotate, initialRotation }: RotateHandleProps) {
  const [isDragging, setIsDragging] = useState(false)
  const handleRef = useRef<HTMLDivElement>(null)
  const centerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const currentRotationRef = useRef<number>(initialRotation)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    setIsDragging(true)

    // Calculate center of parent element
    if (handleRef.current) {
      const parent = handleRef.current.parentElement
      if (parent) {
        const rect = parent.getBoundingClientRect()
        centerRef.current = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        }
      }
    }

    currentRotationRef.current = initialRotation
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate angle between center and mouse position
      const angle = Math.atan2(e.clientY - centerRef.current.y, e.clientX - centerRef.current.x) * (180 / Math.PI)

      // Add 90 degrees to make it intuitive (0 degrees is up)
      let newAngle = angle + 90

      // Snap to 15-degree increments if holding Shift
      if (e.shiftKey) {
        newAngle = Math.round(newAngle / 15) * 15
      }

      onRotate(newAngle)
      currentRotationRef.current = newAngle
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, onRotate])

  return (
    <div
      ref={handleRef}
      className="absolute w-4 h-4 bg-blue-500 rounded-full cursor-move"
      style={{
        top: -20,
        left: "50%",
        transform: "translateX(-50%)",
      }}
      onMouseDown={handleMouseDown}
    />
  )
}
