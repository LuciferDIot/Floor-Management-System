"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useFloorActions } from "@/hooks/useFloorActions";
import { useReservationActions } from "@/hooks/useReservationActions";
import { useShapeActions } from "@/hooks/useShapeActions";
import {
  ElementType,
  ReservationStatus,
  ShapeCategory,
  type ReservationType,
} from "@/lib/types";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface ReservationFormProps {
  onClose: () => void;
  onSave?: (reservation: ReservationType) => void;
}

export function ReservationForm({ onClose }: ReservationFormProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("18:00");
  const [customerName, setCustomerName] = useState("");
  const [partySize, setPartySize] = useState("2");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<ReservationStatus>(
    ReservationStatus.RESERVED
  );

  const { addToHistory } = useFloorActions();
  const { floors, getChairsForTable } = useReservationActions();
  const { selectedElements, updateShape } = useShapeActions();

  // Get chair count for the selected table
  const [chairCount, setChairCount] = useState(0);

  useEffect(() => {
    if (
      selectedElements.length === 1 &&
      selectedElements[0].type === ElementType.SHAPE
    ) {
      const shapeId = selectedElements[0].id;

      // Find the floor and shape
      for (const floor of floors) {
        const shape = floor.shapes.find((s) => s.id === shapeId);
        if (shape && shape.category === ShapeCategory.TABLE) {
          // Get chairs for this table
          const chairs = getChairsForTable(floor.id, shape.id);
          setChairCount(chairs.length);

          // Pre-fill form if there's an existing reservation
          if (shape.reservation) {
            setDate(shape.reservation.time);
            setTime(format(shape.reservation.time, "HH:mm"));
            setCustomerName(shape.reservation.customerName);
            setPartySize(shape.reservation.partySize.toString());
            setNotes(shape.reservation.notes || "");
            setStatus(shape.reservation.status);
          }

          break;
        }
      }
    }
  }, [selectedElements, floors, getChairsForTable]);

  const handleSave = () => {
    if (!date) return;

    // Create reservation object
    const reservation: ReservationType = {
      id: `reservation-${Date.now()}`,
      time: new Date(`${format(date, "yyyy-MM-dd")}T${time}`),
      customerName,
      partySize: Number.parseInt(partySize) || chairCount || 2,
      notes,
      status,
    };

    // Find the selected table and update it
    if (
      selectedElements.length === 1 &&
      selectedElements[0].type === ElementType.SHAPE
    ) {
      const shapeId = selectedElements[0].id;

      for (const floor of floors) {
        const shape = floor.shapes.find((s) => s.id === shapeId);
        if (shape && shape.category === ShapeCategory.TABLE) {
          updateShape(floor.id, shape.id, {
            ...shape,
            reservation,
          });
          break;
        }
      }

      addToHistory();
    }

    onClose();
  };

  return (
    <div className="space-y-4 mt-4 border-t pt-4">
      <h3 className="font-medium">Reservation Details</h3>

      <div className="space-y-2">
        <Label htmlFor="customer-name">Customer Name</Label>
        <Input
          id="customer-name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Enter customer name"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal overflow-hidden"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="time">Time</Label>
          <div className="flex">
            <Clock className="mr-2 h-4 w-4 mt-3" />
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }).map((_, i) => (
                  <SelectItem
                    key={i}
                    value={`${i.toString().padStart(2, "0")}:00`}
                  >
                    {`${i.toString().padStart(2, "0")}:00`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="party-size">
          Party Size {chairCount > 0 && `(${chairCount} chairs available)`}
        </Label>
        <Select value={partySize} onValueChange={setPartySize}>
          <SelectTrigger id="party-size">
            <SelectValue placeholder="Select party size" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: Math.max(12, chairCount) }).map((_, i) => (
              <SelectItem key={i} value={(i + 1).toString()}>
                {i + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={status}
          onValueChange={(value) => setStatus(value as ReservationStatus)}
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ReservationStatus.RESERVED}>Reserved</SelectItem>
            <SelectItem value={ReservationStatus.PENDING}>Pending</SelectItem>
            <SelectItem value={ReservationStatus.AVAILABLE}>
              Available
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any special requests or notes"
          rows={3}
        />
      </div>

      <div className="flex justify-between">
        <Button onClick={handleSave}>Save Reservation</Button>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
