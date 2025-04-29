"use client"

import { useEffect, useCallback } from "react"

export function useHotkeys(key: string, callback: () => void) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Parse the key combination
      const keys = key.toLowerCase().split("+")
      const mainKey = keys[keys.length - 1]

      // Check if modifiers are pressed
      const ctrlRequired = keys.includes("ctrl")
      const shiftRequired = keys.includes("shift")
      const altRequired = keys.includes("alt")

      // Check if the event matches the required key combination
      const isCtrlPressed = event.ctrlKey || !ctrlRequired
      const isShiftPressed = event.shiftKey || !shiftRequired
      const isAltPressed = event.altKey || !altRequired

      // Handle special keys like "delete"
      let keyMatches = false
      if (mainKey === "delete" && event.key === "Delete") {
        keyMatches = true
      } else {
        keyMatches = event.key.toLowerCase() === mainKey
      }

      if (isCtrlPressed && isShiftPressed && isAltPressed && keyMatches) {
        event.preventDefault()
        callback()
      }
    },
    [key, callback],
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyDown])
}
