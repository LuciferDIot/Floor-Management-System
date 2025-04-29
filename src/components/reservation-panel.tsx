"use client";

import { format } from "date-fns";
import { CalendarIcon, Clock, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Calendar } from "../components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { useFloorContext } from "../context/floor-context";
import { ReservationStatus, type Reservation } from "../types";

export default function ReservationPanel() {
  const {
    isReservationMode,
    exitReservationMode,
    selectedShapes,
    floors,
    activeFloor,
    addReservation,
    getReservations,
    deleteReservation,
  } = useFloorContext();
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [isAddingReservation, setIsAddingReservation] = useState(false);
  const [tableReservations, setTableReservations] = useState<Reservation[]>([]);
  const [newReservation, setNewReservation] = useState<Partial<Reservation>>({
    name: "",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "18:00",
    duration: 2,
    partySize: 2,
    notes: "",
    status: ReservationStatus.Confirmed,
  });
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Find the selected table
  useEffect(() => {
    if (selectedShapes.length === 1 && activeFloor) {
      const floor = floors.find((f) => f.id === activeFloor);
      if (floor) {
        const shape = floor.items.find((item) => item.id === selectedShapes[0]);
        if (shape && shape.type === "table") {
          setSelectedTable(shape.id);

          const reservations = getReservations(shape.id) as Reservation[];
          setTableReservations(reservations);
        } else {
          setSelectedTable(null);
        }
      }
    } else {
      setSelectedTable(null);
    }
  }, [selectedShapes, activeFloor, floors, getReservations]);

  const handleAddReservation = () => {
    if (!selectedTable) return;

    const reservation: Reservation = {
      id: `reservation-${Date.now()}`,
      name: newReservation.name || "Guest",
      date: newReservation.date || format(new Date(), "yyyy-MM-dd"),
      time: newReservation.time || "18:00",
      duration: newReservation.duration || 2,
      partySize: newReservation.partySize || 2,
      notes: newReservation.notes,
      status:
        (newReservation.status as ReservationStatus) ||
        ReservationStatus.Confirmed,
    };

    addReservation(selectedTable, reservation);
    setTableReservations([...tableReservations, reservation]);
    setIsAddingReservation(false);

    // Reset form
    setNewReservation({
      name: "",
      date: format(new Date(), "yyyy-MM-dd"),
      time: "18:00",
      duration: 2,
      partySize: 2,
      notes: "",
      status: ReservationStatus.Confirmed,
    });
  };

  const handleDeleteReservation = (reservationId: string) => {
    if (!selectedTable) return;
    deleteReservation(selectedTable, reservationId);
    setTableReservations(
      tableReservations.filter((r) => r.id !== reservationId)
    );
  };

  if (!isReservationMode) return null;

  return (
    <div className="absolute inset-0 bg-white bg-opacity-90 z-50 flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold">Table Reservation System</h2>
        <Button variant="ghost" size="sm" onClick={exitReservationMode}>
          <X className="h-4 w-4 mr-2" />
          Exit Reservation Mode
        </Button>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        {!selectedTable ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-lg text-gray-500 mb-4">
              Select a table to manage reservations
            </p>
            <p className="text-sm text-gray-400">
              Click on any table on the floor plan
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-medium">
                Reservations for Table{" "}
                {
                  floors
                    .find((f) => f.id === activeFloor)
                    ?.items.find((item) => item.id === selectedTable)?.label
                }
              </h3>
              <Button onClick={() => setIsAddingReservation(true)}>
                Add Reservation
              </Button>
            </div>

            {tableReservations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No reservations for this table
              </div>
            ) : (
              <div className="grid gap-4">
                {tableReservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="border rounded-md p-4 bg-white"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{reservation.name}</h4>
                        <div className="text-sm text-gray-500 mt-1">
                          <div className="flex items-center">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            {reservation.date}
                          </div>
                          <div className="flex items-center mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            {reservation.time} ({reservation.duration} hours)
                          </div>
                          <div className="flex items-center mt-1">
                            <Users className="h-3 w-3 mr-1" />
                            Party of {reservation.partySize}
                          </div>
                        </div>
                        {reservation.notes && (
                          <p className="text-sm mt-2 bg-gray-50 p-2 rounded">
                            {reservation.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            reservation.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : reservation.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {reservation.status}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2 text-red-500 hover:text-red-700"
                          onClick={() =>
                            handleDeleteReservation(reservation.id)
                          }
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={isAddingReservation} onOpenChange={setIsAddingReservation}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Reservation</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newReservation.name || ""}
                onChange={(e) =>
                  setNewReservation({ ...newReservation, name: e.target.value })
                }
                placeholder="Guest name"
              />
            </div>

            <div className="grid gap-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => {
                      setDate(date);
                      if (date) {
                        setNewReservation({
                          ...newReservation,
                          date: format(date, "yyyy-MM-dd"),
                        });
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="time">Time</Label>
              <Select
                value={newReservation.time || "18:00"}
                onValueChange={(value) =>
                  setNewReservation({ ...newReservation, time: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 16 }, (_, i) => {
                    const hour = i + 8; // Start from 8 AM
                    return `${hour.toString().padStart(2, "0")}:00`;
                  }).map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="duration">Duration (hours)</Label>
              <Select
                value={String(newReservation.duration || 2)}
                onValueChange={(value) =>
                  setNewReservation({
                    ...newReservation,
                    duration: Number.parseInt(value),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 1.5, 2, 2.5, 3, 4].map((duration) => (
                    <SelectItem key={duration} value={String(duration)}>
                      {duration} hours
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="partySize">Party Size</Label>
              <Input
                id="partySize"
                type="number"
                min="1"
                value={newReservation.partySize || 2}
                onChange={(e) =>
                  setNewReservation({
                    ...newReservation,
                    partySize: Number.parseInt(e.target.value),
                  })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={newReservation.status || "confirmed"}
                onValueChange={(value) =>
                  setNewReservation({
                    ...newReservation,
                    status: value as ReservationStatus,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newReservation.notes || ""}
                onChange={(e) =>
                  setNewReservation({
                    ...newReservation,
                    notes: e.target.value,
                  })
                }
                placeholder="Special requests or notes"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsAddingReservation(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddReservation}>Add Reservation</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
