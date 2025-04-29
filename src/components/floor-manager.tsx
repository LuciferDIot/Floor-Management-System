"use client";
import { useEffect, useState } from "react";
import { FloorProvider, useFloorContext } from "../context/floor-context";
import CanvasArea from "./canvas-area";
import FloorCreator from "./floor-creator";
import FloorTabs from "./floor-tabs";
import PropertiesPanel from "./properties-panel";
import ReservationPanel from "./reservation-panel";
import ShapePicker from "./shape-picker";
import ToolBar from "./tool-bar";
// Add error boundary to catch and handle ResizeObserver errors
// Add at the top of the file, after the existing imports
import { ErrorBoundary } from "react-error-boundary";

// Create a fallback component
function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  // Check if it's a ResizeObserver error
  const isResizeObserverError =
    error.message && error.message.includes("ResizeObserver");

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] border rounded-lg p-8">
      <h2 className="text-xl font-bold mb-6">
        {isResizeObserverError
          ? "Layout Issue Detected"
          : "Something went wrong"}
      </h2>
      <p className="text-red-500 mb-4">
        {isResizeObserverError
          ? "The application encountered a layout issue. This is usually temporary."
          : error.message}
      </p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Try again
      </button>
    </div>
  );
}

function FloorManagerContent() {
  const { floors } = useFloorContext();
  const [showFloorCreator, setShowFloorCreator] = useState(false);

  // Show floor creator if no floors exist
  useEffect(() => {
    if (floors.length === 0) {
      setShowFloorCreator(true);
    } else {
      setShowFloorCreator(false);
    }
  }, [floors.length]);

  if (showFloorCreator || floors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] border rounded-lg p-8">
        <h2 className="text-xl font-bold mb-6">Create Your First Floor</h2>
        <div className="w-full max-w-md">
          <FloorCreator onFloorCreated={() => setShowFloorCreator(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full h-[calc(100vh-100px)] border rounded-lg overflow-hidden">
      <div className="w-64 border-r bg-gray-50 flex flex-col">
        <ShapePicker />
        <PropertiesPanel />
      </div>
      <div className="flex-1 flex flex-col relative">
        <FloorTabs onAddFloor={() => setShowFloorCreator(true)} />
        <CanvasArea />
        <ToolBar />
        <ReservationPanel />
      </div>
    </div>
  );
}

// Wrap the FloorManagerContent component with ErrorBoundary
export default function FloorManager() {
  return (
    <FloorProvider>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={(error) => {
          // For ResizeObserver errors, we don't need a full reload
          if (
            error instanceof Error &&
            error.message.includes("ResizeObserver")
          ) {
            // Just reset the state
          } else {
            // For other errors, reload the page
            window.location.reload();
          }
        }}
      >
        <FloorManagerContent />
      </ErrorBoundary>
    </FloorProvider>
  );
}
