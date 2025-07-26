"use client";

import React, { useState, useEffect } from "react";
import { Josefin_Sans, Raleway } from "next/font/google";

interface Label {
  id: string;
  name: string;
  color: string;
}

interface EventData {
  id: string;
  name: string;
  labelId?: string;
  date?: string; // Optional but useful for display
  startTime?: string; // e.g. "14:00"
  day?: string; // e.g. "2025-06-06"
  color: string;
}

interface EventManagerProps {
  tripId: string | null;
  labels: Label[];
}

const EventManager: React.FC<EventManagerProps> = ({ tripId, labels }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [events, setEvents] = useState<EventData[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [eventName, setEventName] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);

  const handleOpenForm = () => {
    setIsOpen(true);
    setEditingIndex(null);
    setEventName("");
    setDate("");
    setStartTime("");
    setEndTime("");
    setSelectedLabelId(null);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setIsOpen(false);
    }, 300); // match the duration of your fade-out animation
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`/api/events?tripId=${tripId}`);
        const data = await res.json();
        console.log("Fetched events:", data.data);
        setEvents(data.data || []);
      } catch (err) {
        console.error("Error fetching events", err);
      }
    };
    fetchEvents();
  }, [tripId]);

  const handleDragStart = (e: React.DragEvent, event: EventData) => {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        id: event.id,
        name: event.name,
        labelId: event.labelId,
      })
    );
  };

  const handleConfirm = async () => {
    const label = labels.find((l) => l.id === selectedLabelId);
    const newEvent = {
      name: eventName,
      labelId: selectedLabelId,
      color: label?.color ?? "#f97316",
      tripId,
    };

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error saving event:", errorData.error);
        return;
      }

      const fetchRes = await fetch(`/api/events?tripId=${tripId}`);
      const data = await fetchRes.json();
      setEvents(data.data || []);

      setIsOpen(false);
    } catch (err) {
      console.error("Failed to save event:", err);
    }
  };

  const getTextColor = (bgColor: string): string => {
    const hex = bgColor.replace("#", "");

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

    return brightness > 155 ? "text-orange-950" : "text-white"; // 186 is a good threshold
  };

  return (
    <div
      className={`flex text-lg basis-5/6 relative px-4 py-4 
        ${
          events.length === 0
            ? "justify-center items-center"
            : "flex-row items-start justify-start"
        }
    `}
    >
      {/* Empty state */}
      {!isOpen && events.length === 0 && (
        <button
          onClick={handleOpenForm}
          className="text-orange-950 text-lg text-center font-bold hover:underline"
        >
          Event pool goes here!
        </button>
      )}

      {/* Events Row */}
      <div className="flex flex-row flex-wrap items-start gap-2">
        {events.map((event) => {
          const label = labels.find((l) => l.id === event.labelId);
          const bgColor = label ? label.color : "#f97316"; // fallback to default color
          const textColor = getTextColor(bgColor);

          return (
            <button
              key={event.id}
              draggable={true}
              onDragStart={(e) => handleDragStart(e, event)}
              className={`h-15 w-37 border border-orange-950 rounded-md flex items-center justify-center text-sm shadow-md ${textColor} hover: cursor-pointer`}
              style={{ backgroundColor: bgColor }}
            >
              {event.name}
            </button>
          );
        })}

        {!isOpen && events.length > 0 && (
          <button
            onClick={handleOpenForm}
            className="w-8 h-8 bg-orange-100 text-orange-950 rounded-full border border-orange-950 text-md font-bold hover:bg-orange-200"
            title="Add new event"
          >
            +
          </button>
        )}
      </div>

      {/* Popup Form */}
      {(isOpen || isClosing) && (
        <div
          className={`absolute right-4 top-1/2 transform -translate-y-1/2 bg-white py-2.5 px-4 border border-orange-950 shadow-lg rounded-md w-80 z-10 transition-all duration-300 ${
            isClosing ? "animate-fade-out" : "animate-fade-in"
          }`}
        >
          <h2 className="text-md font-bold mb-2 text-center">
            Create New Event
          </h2>
          <input
            type="text"
            placeholder="Event name*"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="w-full mb-2 p-1 border rounded text-sm"
            required
          />
          {/* <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full mb-2 p-1 border rounded text-sm"
          />
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full mb-2 p-1 border rounded text-sm"
          />
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full mb-2 p-1 border rounded text-sm"
          /> */}

          {/* Label scroll area */}
          <div className="flex overflow-x-auto gap-2 mb-4">
            {labels.map((label) => (
              <button
                key={label.id}
                className={`px-3 py-1 rounded-full border text-xs whitespace-nowrap ${
                  selectedLabelId === label.id
                    ? "border-2 border-orange-950"
                    : "border-orange-950"
                } ${getTextColor(label.color)}`}
                style={{
                  backgroundColor: label.color,
                }}
                onClick={() => setSelectedLabelId(label.id)}
              >
                {label.name}
              </button>
            ))}
          </div>

          <div className="flex justify-between">
            <button
              onClick={handleClose}
              className="px-3 py-1 bg-amber-50 text-orange-950 border-orange-950 border text-xs rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-3 py-1 bg-orange-950 text-white text-xs rounded"
              disabled={!eventName.trim()}
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManager;
