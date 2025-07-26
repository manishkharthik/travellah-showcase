"use client";
import React, { useState, useEffect, Suspense } from "react";
import Nav from "@/app/components/FeaturesDash/Nav/Nav";
import Image from "next/image";
import { Josefin_Sans } from "next/font/google";
import { useSearchParams } from "next/navigation";
import LabelManager from "@/app/components/Itinerary/LabelManager";
import EventManager from "@/app/components/Itinerary/EventManager";

const josefin = Josefin_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
});

interface EventData {
  id: string;
  name: string;
  labelId?: string;
  date?: string; // Optional but useful for display // e.g. "14:00"
  day?: string; // e.g. "2025-06-06"
  timeStart?: string; // e.g. "14:00"
  timeEnd?: string;
}

// Separate component that uses useSearchParams
const ItineraryContent = () => {
  const searchParams = useSearchParams();
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const tripId = searchParams.get("tripId");
  const [placedEvents, setPlacedEvents] = useState<EventData[]>([]);
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  const getDateRange = (start: Date, end: Date) => {
    const dates = [];
    const current = new Date(start);
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };
  interface Label {
    name: string;
    color: string;
    id: string;
  }
  const getTextColor = (bgColor: string): string => {
    const hex = bgColor.replace("#", "");

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

    return brightness > 155 ? "text-orange-950" : "text-white"; // 186 is a good threshold
  };

  // Import the Label type at the top if not already imported:
  // import type { Label } from "@/app/components/Itinerary/LabelManager";
  const [labels, setLabels] = useState<Label[]>([]);

  useEffect(() => {
    const fetchLabels = async () => {
      try {
        const res = await fetch(`/api/labels?tripId=${tripId}`);
        const data = await res.json();
        setLabels(data.data || []);
      } catch (err) {
        console.error("Error fetching labels", err);
      }
    };
    fetchLabels();
  }, [tripId]);
  const [resizing, setResizing] = useState<{
    id: string;
    direction: "left" | "right";
  } | null>(null);

  const startResize = (
    e: React.MouseEvent,
    id: string,
    direction: "left" | "right"
  ) => {
    e.preventDefault(); // Prevent text selection
    setResizing({ id, direction });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizing) return;
      // Compute the new time based on mouse X position (you can map to time block)
      // Update placedEvents here
    };

    const handleMouseUp = () => setResizing(null);

    if (resizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizing]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`/api/events?tripId=${tripId}`);
        const data = await res.json();
        setPlacedEvents(data.data || []);
      } catch (err) {
        console.error("Error fetching events", err);
      }
    };
    if (tripId) fetchEvents();
  }, [tripId]);

  const handleDrop = async (e: React.DragEvent, day: string, time: string) => {
    e.preventDefault();
    const dropped = JSON.parse(e.dataTransfer.getData("application/json"));
    const { id, name, label } = dropped;

    let rawDate: Date | undefined = undefined;
    if (start && end) {
      rawDate = getDateRange(start, end).find((d) => formatDay(d) === day);
    }
    const isoDay = rawDate?.toISOString(); // ISO 8601 string

    const newPlacedEvent = {
      ...dropped,
      day: isoDay,
      timeStart: time,
    };

    setPlacedEvents((prev) => [
      ...prev.filter((ev) => ev.id !== newPlacedEvent.id),
      newPlacedEvent,
    ]);

    try {
      await fetch(`/api/events/${dropped.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          day: isoDay,
          timeStart: time,
        }),
      });
    } catch (err) {
      console.error("Failed to update event:", err);
    }
  };

  const formatDay = (date: Date) =>
    date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });

  const days =
    start && end ? getDateRange(start, end).map((x) => formatDay(x)) : [];
  const times = Array.from({ length: 16 }, (_, i) => `${8 + i}:00`); // 8AM–23PM

  return (
    <div className="flex flex-col h-screen bg-[#fff9ed]">
      {/* Top Navigation */}
      <Nav />

      {/* Time + Day Grid */}
      <div className="flex flex-col flex-grow overflow-hidden">
        {/* Shared Scrollable Section */}
        <div className="overflow-x-auto flex-grow">
          <div className="min-w-[1600px]">
            {/* Time Header */}
            <div className="sticky flex bg-amber-50 z-20 top-0 border-1 border-gray-300">
              {/* Empty corner */}
              <div className="w-29 pl-2 sticky top-0 left-0 bg-[#fff8e6]" />
              {times.map((time) => (
                <div
                  key={time}
                  className={`w-32 text-left p-3 font-bold text-sm border-s border-gray-200 text-[#45200c] ${josefin.className}`}
                >
                  {time}
                </div>
              ))}
            </div>

            {/* Day Rows */}
            {days.map((day) => (
              <div
                key={day}
                className={`${josefin.className} flex h-24 border-b border-gray-200 bg-white`}
              >
                <div className="w-28 p-3 flex items-center justify-center text-sm font-semibold bg-amber-50 text-[#45200c] sticky left-0 z-10 border-r border-gray-300">
                  {day}
                </div>
                {times.map((time, i) => (
                  <div
                    key={`${day}-${time}`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, day, time)}
                    className="w-32 h-full border-l border-gray-50 bg-white hover:bg-amber-50 transition relative group cursor-pointer"
                  >
                    {/* Dropped event rendering */}
                    {placedEvents
                      .filter(
                        (ev) =>
                          formatDay(new Date(ev.day!)) === day &&
                          times.indexOf(ev.timeStart!) === i
                      )
                      .map((ev) => {
                        const label = labels.find(
                          (label) => label.id === ev.labelId
                        );
                        const bgColor = label?.color || "text-orange-950";
                        const textColor = getTextColor(bgColor);
                        return (
                          <div
                            key={ev.id}
                            className={`absolute inset-1 rounded-md px-2 py-1 text-xs flex items-center justify-center shadow-xl  opacity-75 ${textColor}`}
                            style={{
                              backgroundColor: bgColor,
                              zIndex: 10,
                            }}
                            draggable={true}
                            onDragStart={(e) =>
                              e.dataTransfer.setData(
                                "application/json",
                                JSON.stringify(ev)
                              )
                            }
                          >
                            {/* Left resize handle */}
                            <div
                              className="w-2 cursor-ew-resize bg-white opacity-60 h-full"
                              onMouseDown={(e) => startResize(e, ev.id, "left")}
                            />

                            {/* Event name */}
                            <span className="flex-1 text-center text-lg">
                              {ev.name}
                            </span>

                            {/* Right resize handle */}
                            <div
                              className="w-2 cursor-ew-resize bg-white opacity-60 h-full"
                              onMouseDown={(e) =>
                                startResize(e, ev.id, "right")
                              }
                            />
                          </div>
                        );
                      })}

                    {/* "+" Icon on hover */}
                    {!placedEvents.some(
                      (ev) =>
                        formatDay(new Date(ev.day!)) === day &&
                        ev.timeStart === time
                    ) && (
                      <div className="absolute inset-0 flex justify-center text-2xl text-gray-400 opacity-0 group-hover:opacity-100">
                        <Image
                          src="/addevent.svg"
                          alt="Addevent"
                          width={30}
                          height={30}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Event Pool */}
        <div className="shadow-2xl border-r-4 bg-orange-950 h-1/3 text-center flex justify-center items-center opacity-75 text-white font-medium">
          <div
            className={`${josefin.className} rounded-lg flex items-center justify-center bg-amber-50 text-orange-950 font-bold h-5/6 w-11/12`}
          >
            <EventManager tripId={tripId} labels={labels} />
            <LabelManager
              tripId={tripId}
              labels={labels}
              setLabels={setLabels}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Loading component for Suspense fallback
const ItineraryLoading = () => (
  <div className="flex flex-col h-screen bg-[#fff9ed]">
    <Nav />
    <div className="flex flex-col flex-grow overflow-hidden items-center justify-center">
      <div className="text-lg text-[#45200c] font-semibold">
        Loading itinerary...
      </div>
    </div>
  </div>
);

// Main page component with Suspense wrapper
const Page = () => {
  return (
    <Suspense fallback={<ItineraryLoading />}>
      <ItineraryContent />
    </Suspense>
  );
};

export default Page;
