"use client";

import React, { Suspense, useEffect, useState } from "react";
import Nav from "../components/FeaturesDash/Nav/Nav";
import { Josefin_Sans } from "next/font/google";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const josefin = Josefin_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
});

function FeaturesDashInner() {
  const searchParams = useSearchParams();
  const tripName = searchParams.get("tripName");
  const startDate = searchParams.get("startDate");
  const tripId = searchParams.get("tripId");
  const startDateParam = startDate ? new Date(startDate) : null;
  const endDate = searchParams.get("endDate");
  const endDateParam = endDate ? new Date(endDate) : null;
  const tripPeopleInvited = searchParams.getAll("tripPeopleInvited");
  const peopleQuery = tripPeopleInvited
    .map((person) => `tripPeopleInvited=${encodeURIComponent(person)}`)
    .join("&");
  console.log(`how many? ${peopleQuery}`);
  // Fetch events for the trip
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  useEffect(() => {
    if (!tripId) return;
    const fetchEvents = async () => {
      const res = await fetch(`/api/events?tripId=${tripId}`);
      const data = await res.json();
      if (data.data) {
        // Only show events with a day and timeStart, sorted chronologically
        const now = new Date();
        const events = data.data
          .filter((ev: any) => ev.day && ev.timeStart)
          .map((ev: any) => ({
            ...ev,
            dayObj: new Date(ev.day),
          }))
          .sort((a: any, b: any) => {
            if (a.dayObj.getTime() !== b.dayObj.getTime()) {
              return a.dayObj.getTime() - b.dayObj.getTime();
            }
            // Sort by timeStart if same day
            return (a.timeStart || "").localeCompare(b.timeStart || "");
          })
          .filter((ev: any) => ev.dayObj >= now)
          .slice(0, 5);
        setUpcomingEvents(events);
      }
    };
    fetchEvents();
  }, [tripId]);

  return (
    <div
      className={`${josefin.className} h-screen w-screen overflow-hidden bg-amber-50 text-black`}
    >
      <div className="h-16">
        <Nav
          tripId={tripId ?? ""}
          tripName={tripName ?? ""}
          startDate={startDate ?? ""}
          endDate={endDate ?? ""}
        />
      </div>

      <div className="mt-2 flex flex-col h-[calc(100vh-4rem)]">
        {/* Top Half */}
        <div className="relative flex flex-col items-center justify-center basis-1/2">
          <Link
            href={`/itinerary?startDate=${encodeURIComponent(
              startDateParam ? startDateParam.toISOString() : ""
            )}&endDate=${encodeURIComponent(
              endDateParam ? endDateParam.toISOString() : ""
            )}&tripId=${tripId}&tripName=${tripName}`}
          >
            <h1 className="absolute left-48 top-5 text-left mb-4 text-2xl font-semibold">
              Upcoming Itinerary: {tripName || "Unnamed Trip"}
            </h1>
          </Link>
          <div className="w-4/5 h-full mt-15 border-2 border-dashed border-gray-400 rounded-lg p-6 bg-white/80 flex flex-col gap-4 overflow-hidden">
            <h2 className="text-xl font-bold text-orange-950 mb-2">
              Upcoming...
            </h2>
            {upcomingEvents.length === 0 ? (
              <div className="text-gray-500 italic">
                No upcoming events yet!
              </div>
            ) : (
              <ul className="space-y-3 overflow-y-auto max-h-[320px] pr-2">
                {upcomingEvents.map((ev, idx) => (
                  <li key={ev.id}>
                    <Link
                      href={`/itinerary?startDate=${encodeURIComponent(
                        startDateParam ? startDateParam.toISOString() : ""
                      )}&endDate=${encodeURIComponent(
                        endDateParam ? endDateParam.toISOString() : ""
                      )}&tripId=${tripId}&tripName=${tripName}&scrollToDay=${ev.dayObj
                        .toISOString()
                        .slice(0, 10)}`}
                      className="block"
                    >
                      <div className="flex items-center gap-4 bg-amber-100 rounded-lg shadow p-3 border-l-4 border-orange-400 hover:bg-amber-200 transition cursor-pointer">
                        <div className="flex flex-col flex-1">
                          <span className="font-semibold text-lg text-orange-950">
                            {ev.name}
                          </span>
                          <span className="text-sm text-orange-800">
                            {ev.dayObj.toLocaleDateString("en-GB", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                            })}
                            {ev.timeStart ? `, ${ev.timeStart}` : ""}
                          </span>
                        </div>
                        {ev.label && (
                          <span
                            className="px-2 py-1 rounded-full text-xs font-bold"
                            style={{
                              backgroundColor: ev.label?.color || "#f97316",
                              color: "#fff",
                            }}
                          >
                            {ev.label?.name}
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Bottom Half */}
        <div className="w-4/5 mx-auto mt-10 flex gap-6">
          {/* Expense Tracker */}
          <div className="flex-1">
            <Link
              href={`/expenseTracker?tripId=${tripId}&tripName=${encodeURIComponent(
                tripName!
              )}`}
            >
              <h2 className="mb-2 font-semibold text-2xl">Expense Tracker</h2>
            </Link>
            <div className="border-2 border-dashed border-gray-400 rounded-lg p-6 h-80" />
          </div>

          {/* Chat */}
          <div className="flex-1">
            <Link
              href={`/chat?tripId=${tripId}&tripName=${encodeURIComponent(
                tripName!
              )}&startDate=${encodeURIComponent(
                startDateParam ? startDateParam.toISOString() : ""
              )}&endDate=${encodeURIComponent(
                endDateParam ? endDateParam.toISOString() : ""
              )}&${peopleQuery}`}
            >
              <h2 className="mb-2 font-semibold text-2xl">
                Group Communication
              </h2>
            </Link>
            <div className="border-2 border-dashed border-gray-400 rounded-lg p-6 h-80" />
          </div>
        </div>
      </div>
    </div>
  );
};

const Page = () => {
  return (
    <Suspense
      fallback={<div className="p-8 text-xl">Loading trip info...</div>}
    >
      <FeaturesDashInner />
    </Suspense>
  );
};

export default Page;
