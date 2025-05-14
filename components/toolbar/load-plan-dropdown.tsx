"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FolderOpen } from "lucide-react"

interface LoadPlanDropdownProps {
  onLoad: (planId: string) => void
}

export function LoadPlanDropdown({ onLoad }: LoadPlanDropdownProps) {
  const [savedPlans, setSavedPlans] = useState<{ id: string; name: string; date: string }[]>([])

  // Load saved plans from local storage
  useEffect(() => {
    const loadSavedPlans = () => {
      try {
        const plans = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith("floor-plan-")) {
            const planData = JSON.parse(localStorage.getItem(key) || "{}")
            plans.push({
              id: key.replace("floor-plan-", ""),
              name: planData.name || "Unnamed Plan",
              date: planData.savedAt || "Unknown date",
            })
          }
        }
        setSavedPlans(plans)
      } catch (error) {
        console.error("Error loading saved plans:", error)
      }
    }

    loadSavedPlans()

    // Listen for storage changes
    window.addEventListener("storage", loadSavedPlans)
    return () => window.removeEventListener("storage", loadSavedPlans)
  }, [])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" title="Load Floor Plan">
          <FolderOpen className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {savedPlans.length > 0 ? (
          savedPlans.map((plan) => (
            <DropdownMenuItem key={plan.id} onClick={() => onLoad(plan.id)}>
              <div className="flex flex-col">
                <span>{plan.name}</span>
                <span className="text-xs text-gray-500">{plan.date}</span>
              </div>
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>No saved plans</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
