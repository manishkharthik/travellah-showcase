"use client";
import React, { useState, useEffect, Suspense } from "react";
import Nav from "@/app/components/FeaturesDash/Nav/Nav";
import Image from "next/image";
import { Josefin_Sans } from "next/font/google";
import { useSearchParams } from "next/navigation";
import LabelManager from "@/app/components/Itinerary/LabelManager";
import EventManager from "@/app/components/Itinerary/EventManager";
import TrashCan from "@/public/trashcan.svg";
import EventDetailsModal from "@/app/components/Itinerary/EventDetailsModal";

const josefin = Josefin_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
});

interface EventData {
  id: string;
  name: string;
  labelId?: string;
  day?: string | null | undefined; // e.g. "20256-6timeStart?: string | null; // e.g.14  timeEnd?: string;
  color: string;
  timeStart?: string | null | undefined;
  timeEnd?: string | null | undefined;
  originalEventId?: string | null | undefined;
}

// Separate component that uses useSearchParams
const ItineraryContent = () => {
  const searchParams = useSearchParams();
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const tripId = searchParams.get("tripId");
  const tripName = searchParams.get("tripName");
  const [placedEvents, setPlacedEvents] = useState<EventData[]>([]);
  const [allEvents, setAllEvents] = useState<EventData[]>([]);
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

  const [labels, setLabels] = useState<Label[]>([]);
  const [filter, setFilter] = useState<"all" | "placed" | "unplaced">("all");
  const [refreshKey, setRefreshKey] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEvent, setModalEvent] = useState<EventData | null>(null);

  // Filter logic for EventManager - only show template events (not copies)
  const getFilteredEvents = (allEvents: EventData[]) => {
    // Only show events that are templates (no originalEventId) in the EventManager
    const templateEvents = allEvents.filter((ev) => !ev.originalEventId);
    if (filter === "all") return templateEvents;
    if (filter === "placed")
      return templateEvents.filter((ev) => ev.day && ev.timeStart);
    if (filter === "unplaced")
      return templateEvents.filter((ev) => !ev.day || !ev.timeStart);
    return templateEvents;
  };

  // Fetch all events for the trip
  useEffect(() => {
    const fetchAllEvents = async () => {
      if (!tripId) return;

      try {
        const res = await fetch(`/api/events?tripId=${tripId}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        setAllEvents(data.data || []);

        // Update placedEvents to only include events with day and timeStart
        const placed = (data.data || []).filter(
          (ev: EventData) => ev.day && ev.timeStart
        );
        setPlacedEvents(placed);
      } catch (err) {
        console.error("Error fetching events:", err);
        setAllEvents([]);
        setPlacedEvents([]);
      }
    };

    fetchAllEvents();
  }, [tripId, refreshKey]);

  // Fetch labels
  useEffect(() => {
    const fetchLabels = async () => {
      if (!tripId) return;

      try {
        const res = await fetch(`/api/labels?tripId=${tripId}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        setLabels(data.data || []);
      } catch (err) {
        console.error("Error fetching labels", err);
        setLabels([]);
      }
    };

    fetchLabels();
  }, [tripId]);

  const [resizing, setResizing] = useState<{
    id: string;
    direction: "left" | "right";
  } | null>(null);

  // Define times array early so it can be used in useEffect
  const times = Array.from({ length: 16 }, (_, i) => `${8 + i}:00`); // 8AM–23PM

  const startResize = (
    e: React.MouseEvent,
    id: string,
    direction: "left" | "right"
  ) => {
    e.preventDefault();
    setResizing({ id, direction });
  };

  useEffect(() => {
    const handleMouseMove = async (e: MouseEvent) => {
      if (!resizing) return;

      const event = placedEvents.find((ev) => ev.id === resizing.id);
      if (!event) return;

      const gridElement = document.querySelector(".min-w-\\[1600px\\]");
      if (!gridElement) return;

      const gridRect = gridElement.getBoundingClientRect();
      const mouseX = e.clientX - gridRect.left;

      // Calculate which time slot the mouse is over
      const timeSlotWidth = 128; // w-32 = 128px
      const timeSlotIndex = Math.floor(mouseX / timeSlotWidth);
      const newTime =
        times[Math.max(0, Math.min(timeSlotIndex, times.length - 1))];

      // Get the current event's times
      const currentStartTime = event.timeStart || "8:00";
      const currentEndTime = event.timeEnd || "9:00";
      const currentStartIndex = times.indexOf(currentStartTime);
      const currentEndIndex = times.indexOf(currentEndTime);

      let newStartTime = currentStartTime;
      let newEndTime = currentEndTime;

      if (resizing.direction === "left") {
        // Only allow snapping to the left of the current end time, and never past it
        let newStartIdx = times.indexOf(newTime);
        if (newStartIdx >= currentEndIndex) {
          newStartIdx = currentEndIndex - 1;
        }
        newStartIdx = Math.max(0, newStartIdx);
        newStartTime = times[newStartIdx];
        newEndTime = currentEndTime; // Keep end time fixed
      } else {
        // Only allow snapping to the right of the current start time, and never before it
        let newEndIdx = times.indexOf(newTime);
        if (newEndIdx <= currentStartIndex) {
          newEndIdx = currentStartIndex + 1;
        }
        newEndIdx = Math.min(times.length - 1, newEndIdx);
        newEndTime = times[newEndIdx];
        newStartTime = currentStartTime; // Keep start time fixed
      }

      // Update local state immediately for responsive UI
      setPlacedEvents((prev) =>
        prev.map((ev) =>
          ev.id === resizing.id
            ? { ...ev, timeStart: newStartTime, timeEnd: newEndTime }
            : ev
        )
      );

      setAllEvents((prev) =>
        prev.map((ev) =>
          ev.id === resizing.id
            ? { ...ev, timeStart: newStartTime, timeEnd: newEndTime }
            : ev
        )
      );
    };

    const handleMouseUp = async () => {
      if (!resizing) return;

      const event = placedEvents.find((ev) => ev.id === resizing.id);
      if (!event) {
        setResizing(null);
        return;
      }

      // Update database with new times
      try {
        const res = await fetch(`/api/events/${resizing.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            timeStart: event.timeStart,
            timeEnd: event.timeEnd,
          }),
        });

        if (!res.ok) {
          console.error("Failed to update event times");
          // Revert local changes if database update failed
          setRefreshKey((k) => k + 1);
        }
      } catch (err) {
        console.error("Error updating event times:", err);
        // Revert local changes if database update failed
        setRefreshKey((k) => k + 1);
      }

      setResizing(null);
    };

    if (resizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizing, placedEvents, times, setRefreshKey]);

  // Handle dropping events onto the grid
  const handleDrop = async (
    e: React.DragEvent,
    dayIdx: number,
    time: string
  ) => {
    e.preventDefault();
    const dropped = JSON.parse(e.dataTransfer.getData("application/json"));

    // Use dayIdx to get the correct date
    if (!start || !end) return;
    const gridDay = getDateRange(start, end)[dayIdx];
    const isoDay = gridDay?.toISOString();

    console.log("Drop Debug:", {
      dayIdx,
      gridDay,
      isoDay,
      droppedSource: dropped.source,
      droppedId: dropped.id,
      time,
    });

    if (dropped.source === "eventManager") {
      // Create new event from EventManager
      try {
        const res = await fetch(`/api/events`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: dropped.name,
            labelId: dropped.labelId,
            color: dropped.color,
            tripId: tripId,
            day: isoDay,
            timeStart: time,
            timeEnd: times[Math.min(times.indexOf(time) + 1, times.length - 1)],
            originalEventId: dropped.id,
          }),
        });

        if (res.ok) {
          const newEvent = await res.json();
          console.log("New event created:", newEvent);
          setPlacedEvents((prev) => [...prev, newEvent]);
          setAllEvents((prev) => [...prev, newEvent]);

          // Handle overlap pushing for new events
          await handleOverlapPushing(
            newEvent,
            gridDay?.toLocaleDateString("en-GB", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })
          );
        }
      } catch (err) {
        console.error("Failed to create event copy:", err);
      }
    } else if (dropped.source === "placedEvents") {
      // Move existing placed event
      try {
        // Calculate the original duration of the event
        const originalStartIdx = times.indexOf(dropped.timeStart || "8:00");
        const originalEndIdx = times.indexOf(dropped.timeEnd || "9:00");
        const originalDuration = originalEndIdx - originalStartIdx;

        // Calculate new start and end times preserving the original duration
        const newStartIdx = times.indexOf(time);
        const newEndIdx = Math.min(
          newStartIdx + originalDuration,
          times.length - 1
        );
        const newStartTime = times[newStartIdx];
        const newEndTime = times[newEndIdx];

        console.log("Moving event:", {
          originalEvent: dropped,
          newDay: isoDay,
          newStartTime,
          newEndTime,
        });

        const res = await fetch(`/api/events/${dropped.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            day: isoDay,
            timeStart: newStartTime,
            timeEnd: newEndTime,
          }),
        });

        if (res.ok) {
          const updatedEvent = await res.json();
          console.log("Event updated:", updatedEvent);

          // Update local state
          setPlacedEvents((prev) =>
            prev.map((ev) => (ev.id === dropped.id ? updatedEvent : ev))
          );
          setAllEvents((prev) =>
            prev.map((ev) => (ev.id === dropped.id ? updatedEvent : ev))
          );

          // Handle overlap pushing for moved events
          await handleOverlapPushing(
            updatedEvent,
            gridDay?.toLocaleDateString("en-GB", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })
          );
          // Force a refresh to ensure UI is in sync with DB
          setRefreshKey((k) => k + 1);
        }
      } catch (err) {
        console.error("Failed to move event:", err);
      }
    }
  };

  // Helper function to handle overlap pushing
  const handleOverlapPushing = async (event: EventData, day: string) => {
    const newStartIdx = times.indexOf(event.timeStart!);
    const newEndIdx = times.indexOf(event.timeEnd!);
    const duration = getDurationSlots(event.timeStart!, event.timeEnd!);

    // Find overlapping events on the same day
    const overlapping = placedEvents.filter((ev) => {
      if (formatDay(new Date(ev.day!)) !== day || ev.id === event.id) {
        return false;
      }

      return doTimeRangesOverlap(
        event.timeStart!,
        event.timeEnd!,
        ev.timeStart!,
        ev.timeEnd!
      );
    });

    console.log("Overlapping events:", overlapping);

    // Push each overlapping event to the right
    for (const ev of overlapping) {
      const evStartIdx = times.indexOf(ev.timeStart!);
      const evEndIdx = times.indexOf(ev.timeEnd!);
      const evDuration = evEndIdx - evStartIdx;
      const newEvStartIdx = evStartIdx + duration;
      const newEvEndIdx = newEvStartIdx + evDuration;

      if (newEvEndIdx < times.length) {
        console.log(
          `Pushing event ${ev.name} from ${ev.timeStart}-${ev.timeEnd} to ${times[newEvStartIdx]}-${times[newEvEndIdx]}`
        );

        // Update in DB
        await fetch(`/api/events/${ev.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            timeStart: times[newEvStartIdx],
            timeEnd: times[newEvEndIdx],
          }),
        });

        // Update in local state
        setPlacedEvents((prev) =>
          prev.map((item) =>
            item.id === ev.id
              ? {
                  ...item,
                  timeStart: times[newEvStartIdx],
                  timeEnd: times[newEvEndIdx],
                }
              : item
          )
        );
        setAllEvents((prev) =>
          prev.map((item) =>
            item.id === ev.id
              ? {
                  ...item,
                  timeStart: times[newEvStartIdx],
                  timeEnd: times[newEvEndIdx],
                }
              : item
          )
        );
      }
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

  // Helper function to get duration in slots
  const getDurationSlots = (start: string, end: string) => {
    const startIdx = times.indexOf(start);
    const endIdx = times.indexOf(end);
    return Math.max(1, endIdx - startIdx);
  };

  // Helper function to check if two time ranges overlap
  const doTimeRangesOverlap = (
    start1: string,
    end1: string,
    start2: string,
    end2: string
  ) => {
    const start1Idx = times.indexOf(start1);
    const end1Idx = times.indexOf(end1);
    const start2Idx = times.indexOf(start2);
    const end2Idx = times.indexOf(end2);

    // Check for any overlap: if one range starts before the other ends AND ends after the other starts
    return (
      (start1Idx < end2Idx && end1Idx > start2Idx) ||
      (start2Idx < end1Idx && end2Idx > start1Idx)
    );
  };

  return (
    <div className="flex flex-col h-screen bg-[#fff9ed]">
      {/* Top Navigation */}
      <Nav
        tripId={tripId || ""}
        tripName={tripName || ""}
        startDate={startDate || ""}
        endDate={endDate || ""}
      />

      {/* Time + Day Grid */}
      <div className="flex flex-col flex-grow overflow-hidden">
        {/* Shared Scrollable Section */}
        <div className="overflow-x-auto flex-grow">
          <div className="min-w-[1600px]">
            {/* Time Header */}
            <div className="sticky flex bg-amber-50 z-20 top-0 border-1 border-gray-300">
              {/* Empty corner */}
              <div className="w-30 pl-2 sticky top-0 left-0 bg-[#fff8e6]" />
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
            {days.map((day, dayIdx) => (
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
                    onDrop={(e) => handleDrop(e, dayIdx, time)}
                    className="w-32 h-full border-l border-gray-50 bg-white hover:bg-amber-50 transition relative group cursor-pointer"
                  >
                    {/* Dropped event rendering */}
                    {placedEvents
                      .filter((ev) => {
                        // Guard against null start/end
                        if (!start || !end) return false;
                        // Strict date comparison
                        const eventDay = new Date(ev.day!);
                        const gridDay = getDateRange(start, end)[
                          days.indexOf(day)
                        ];
                        const isSameDay =
                          eventDay.toDateString() === gridDay.toDateString();
                        // Show events that start at this time slot OR span across this time slot
                        const eventStartIndex = times.indexOf(
                          ev.timeStart || "8:00"
                        );
                        const eventEndIndex = times.indexOf(
                          ev.timeEnd || "9:00"
                        );
                        const currentTimeIndex = i;
                        return (
                          isSameDay &&
                          (eventStartIndex === currentTimeIndex ||
                            (eventStartIndex <= currentTimeIndex &&
                              eventEndIndex > currentTimeIndex))
                        );
                      })
                      .map((ev) => {
                        const label = labels.find(
                          (label) => label.id === ev.labelId
                        );
                        const bgColor = label?.color || "text-orange-950";
                        const textColor = getTextColor(bgColor);

                        // Calculate width and position for resized events
                        const eventStartIndex = times.indexOf(
                          ev.timeStart || "8:00"
                        );
                        const eventEndIndex = times.indexOf(
                          ev.timeEnd || "9:00"
                        );
                        const currentTimeIndex = i;

                        // Only render the event at its starting position
                        if (eventStartIndex !== currentTimeIndex) return null;

                        const width = (eventEndIndex - eventStartIndex) * 128; // 128px per time slot
                        const left = "4px"; // inset-1 = 4px

                        return (
                          <div
                            key={ev.id}
                            className={`absolute inset-1 rounded-md px-2 py-1 text-xs flex items-center justify-center shadow-xl opacity-75 ${textColor}`}
                            style={{
                              backgroundColor: bgColor,
                              zIndex: 10,
                              width: `${width}px`,
                              left: left,
                              transition:
                                "width 0.2s cubic-bezier(0.4,0,0.2,1)",
                            }}
                            draggable={true}
                            onDragStart={(e) =>
                              e.dataTransfer.setData(
                                "application/json",
                                JSON.stringify({
                                  ...ev,
                                  source: "placedEvents",
                                })
                              )
                            }
                            onDoubleClick={() => {
                              const latest = allEvents.find(
                                (e) => e.id === ev.id
                              );
                              setModalEvent(latest || ev);
                              setModalOpen(true);
                            }}
                          >
                            {/* Left resize handle */}
                            <div
                              className="w-2 cursor-ew-resize bg-white opacity-60 h-full"
                              onMouseDown={(e) => startResize(e, ev.id, "left")}
                            />

                            {/* Event name */}
                            <span
                              className={`flex-1 text-center ${
                                ev.name.length > 12
                                  ? "text-sm"
                                  : ev.name.length > 8
                                  ? "text-base"
                                  : "text-lg"
                              }`}
                            >
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
        <div className="shadow-2xl border-r-4 bg-orange-950 h-1/3 text-center flex justify-center items-center opacity-75 text-white font-medium relative">
          {/* Trash Bin */}
          <TrashBin
            onDropEvent={async (eventData) => {
              if (eventData.source === "eventManager") {
                // Delete original event and all its copies from database
                try {
                  const res = await fetch(`/api/events/${eventData.id}`, {
                    method: "DELETE",
                  });
                  if (res.ok) {
                    // Remove all instances of this event (original + copies)
                    setPlacedEvents((prev) =>
                      prev.filter(
                        (ev) =>
                          ev.originalEventId !== eventData.id &&
                          ev.id !== eventData.id
                      )
                    );
                    setAllEvents((prev) =>
                      prev.filter(
                        (ev) =>
                          ev.originalEventId !== eventData.id &&
                          ev.id !== eventData.id
                      )
                    );
                    setRefreshKey((k) => k + 1);
                  }
                } catch {
                  alert("Failed to delete event (network error).");
                }
              } else if (eventData.source === "placedEvents") {
                // Remove just this specific instance
                try {
                  const res = await fetch(`/api/events/${eventData.id}`, {
                    method: "DELETE",
                  });
                  if (res.ok) {
                    // Remove only this specific instance
                    setPlacedEvents((prev) =>
                      prev.filter((ev) => ev.id !== eventData.id)
                    );
                    setAllEvents((prev) =>
                      prev.filter((ev) => ev.id !== eventData.id)
                    );
                  }
                } catch (err) {
                  console.error("Failed to remove event instance:", err);
                  alert("Failed to remove event from grid.");
                }
              }
            }}
          />
          <div
            className={`${josefin.className} rounded-lg flex flex-col justify-center bg-amber-50 text-orange-950 font-bold h-5/6 w-11/12 ml-8`}
          >
            {/* Filter Buttons */}
            <div className="flex flex-row justify-left gap-2 ml-4 p-4 -mt-2 border-b-4 w-1/5 border-dotted border-amber-950 ">
              {["all", "placed", "unplaced"].map((type) => (
                <button
                  key={type}
                  onClick={() =>
                    setFilter(type as "all" | "placed" | "unplaced")
                  }
                  className={`px-4 py-1 rounded-full border-2 font-semibold transition-colors duration-150 focus:outline-none
                    ${
                      filter === type
                        ? "bg-orange-950 text-white border-orange-950"
                        : "bg-white text-orange-950 border-orange-300 hover:bg-orange-100"
                    }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
            {/* EventManager and LabelManager */}
            <div className="flex flex-row w-full items-start justify-center gap-4">
              <EventManager
                tripId={tripId}
                labels={labels}
                refreshKey={refreshKey}
                onEventCreated={() => setRefreshKey((k) => k + 1)}
                filteredEvents={getFilteredEvents(allEvents).map((ev) => ({
                  ...ev,
                  color:
                    ev.color ||
                    labels.find((l) => l.id === ev.labelId)?.color ||
                    "#f97316",
                }))}
                onEventDoubleClick={(ev) => {
                  const latest = allEvents.find((e) => e.id === ev.id);
                  setModalEvent(latest || ev);
                  setModalOpen(true);
                }}
              />
              <LabelManager
                tripId={tripId}
                labels={labels}
                setLabels={setLabels}
              />
            </div>
          </div>
        </div>
      </div>
      <EventDetailsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        event={modalEvent || { id: "", name: "" }}
        labels={labels}
        eventsForDay={(() => {
          if (!modalEvent || !modalEvent.day) return [];
          const modalDay = new Date(modalEvent.day);
          return allEvents.filter((ev) => {
            if (!ev.day) return false;
            const evDay = new Date(ev.day);
            return (
              evDay.getUTCFullYear() === modalDay.getUTCFullYear() &&
              evDay.getUTCMonth() === modalDay.getUTCMonth() &&
              evDay.getUTCDate() === modalDay.getUTCDate()
            );
          });
        })()}
        onSave={async (notes, location, name, labelId) => {
          if (!modalEvent) return;
          await fetch(`/api/events/${modalEvent.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ notes, location, name, labelId }),
          });
          setModalOpen(false);
          setRefreshKey((k) => k + 1);
        }}
      />
    </div>
  );
};

// Main page component with Suspense wrapper
const Page = () => {
  return (
    <Suspense fallback={<div>Loading itinerary...</div>}>
      <ItineraryContent />
    </Suspense>
  );
};

export default Page;

// TrashBin component
const TrashBin: React.FC<{ onDropEvent: (event: any) => void }> = ({
  onDropEvent,
}) => {
  const [isOver, setIsOver] = useState(false);
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        setIsOver(false);
        const data = e.dataTransfer.getData("application/json");
        try {
          const event = JSON.parse(data);
          if (event.id) onDropEvent(event);
        } catch {}
      }}
      className={`absolute left-3 top-1/2 -translate-y-1/2 border-amber-100 flex flex-col items-center justify-center w-14 h-60 rounded-3xl transition-colors duration-200 z-10 cursor-pointer ${
        isOver ? "bg-amber-50" : "bg-orange-950"
      }`}
      style={{ boxShadow: "0 2px 4px 0px" }}
      title="Drag here to delete event"
    >
      <img src="/trashcan.svg" alt="Trash Bin" width={24} height={24} />
    </div>
  );
};
