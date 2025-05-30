"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FolderOpen, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface LoadPlanDropdownProps {
  onSave: () => void;
  onLoad: (planId: string) => void;
}

export function LoadPlanDropdown({ onSave, onLoad }: LoadPlanDropdownProps) {
  const [savedPlans, setSavedPlans] = useState<
    { id: string; name: string; date: string }[]
  >([]);

  // Load saved plans from local storage
  useEffect(() => {
    loadSavedPlans();
    window.addEventListener("storage", loadSavedPlans);
    return () => window.removeEventListener("storage", loadSavedPlans);
  }, []);

  const loadSavedPlans = () => {
    try {
      const plans = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("floor-plan-")) {
          const planData = JSON.parse(localStorage.getItem(key) || "{}");
          plans.push({
            id: key.replace("floor-plan-", ""),
            name: planData.name || "Unnamed Plan",
            date: planData.savedAt || "Unknown date",
          });
        }
      }
      // Sort plans by date (newest first)
      plans.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setSavedPlans(plans);
    } catch (error) {
      console.error("Error loading saved plans:", error);
    }
  };

  const handleDeletePlan = (planId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the load action
    try {
      localStorage.removeItem(`floor-plan-${planId}`);
      loadSavedPlans(); // Refresh the list
    } catch (error) {
      console.error("Error deleting plan:", error);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={onSave}
        title="Save Floor Plan"
      >
        <Save className="h-4 w-4" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" title="Load Floor Plan">
            <FolderOpen className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-64 max-h-[320px] overflow-y-auto"
        >
          {savedPlans.length > 0 ? (
            <>
              {savedPlans.slice(0, 10).map((plan) => (
                <DropdownMenuItem
                  key={plan.id}
                  onClick={() => onLoad(plan.id)}
                  className="group"
                >
                  <div className="flex flex-col flex-1">
                    <span className="truncate">{plan.name}</span>
                    <span className="text-xs text-gray-500 truncate">
                      {plan.date}
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleDeletePlan(plan.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-1 rounded"
                    title="Delete plan"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </DropdownMenuItem>
              ))}
              {savedPlans.length > 10 && (
                <div className="text-xs text-center text-gray-500 p-2">
                  Showing 10 of {savedPlans.length} plans
                </div>
              )}
            </>
          ) : (
            <DropdownMenuItem disabled>No saved plans</DropdownMenuItem>
          )}
          {savedPlans.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  if (
                    confirm("Are you sure you want to delete ALL saved plans?")
                  ) {
                    savedPlans.forEach((plan) => {
                      localStorage.removeItem(`floor-plan-${plan.id}`);
                    });
                    loadSavedPlans();
                  }
                }}
                className="text-red-500 hover:text-red-700 focus:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete All Plans
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
