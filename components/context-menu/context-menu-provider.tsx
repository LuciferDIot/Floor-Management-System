"use client"

import { createContext, useContext, type ReactNode } from "react"

type ContextMenuContextType = {}

const ContextMenuContext = createContext<ContextMenuContextType | undefined>(undefined)

export function ContextMenuProvider({ children }: { children: ReactNode }) {
  // Context menu state and functions

  return <ContextMenuContext.Provider value={{}}>{children}</ContextMenuContext.Provider>
}

export function useContextMenu() {
  const context = useContext(ContextMenuContext)
  if (context === undefined) {
    throw new Error("useContextMenu must be used within a ContextMenuProvider")
  }
  return context
}
