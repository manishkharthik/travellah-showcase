"use client";

import React, { Suspense } from "react";
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

  return (
    <div
      className={`${josefin.className} h-screen w-screen overflow-hidden bg-amber-50 text-black`}
    >
      <div className="h-16">
        <Nav 
          tripId={tripId ?? ""} 
          tripName={tripName ?? ""} 
          startDate={startDate ?? ""} 
          endDate={endDate ?? ""}/>
      </div>

      <div className="mt-2 flex flex-col h-[calc(100vh-4rem)]">
        {/* Top Half */}
        <div className="relative flex flex-col items-center justify-center basis-1/2">
          <Link
            href={`/itinerary?startDate=${encodeURIComponent(
              startDateParam ? startDateParam.toISOString() : ""
            )}&endDate=${encodeURIComponent(
              endDateParam ? endDateParam.toISOString() : ""
            )}&tripId=${tripId}`}
          >
            <h1 className="absolute left-48 top-5 text-left mb-4 text-2xl font-semibold">
              Upcoming Itinerary: {tripName || "Unnamed Trip"}
            </h1>
          </Link>
          <div className="w-4/5 h-full mt-15 border-2 border-dashed border-gray-400 rounded-lg p-6" />
        </div>

        {/* Bottom Half */}
        <div className="w-4/5 mx-auto mt-10 flex gap-6">
          {/* Expense Tracker */}
          <div className="flex-1">
            <Link href={`/expenseTracker?tripId=${tripId}&tripName=${encodeURIComponent(tripName!)}`}>
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
              <h2 className="mb-2 font-semibold text-2xl">Group Communication</h2>
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
    <Suspense fallback={<div className="p-8 text-xl">Loading trip info...</div>}>
      <FeaturesDashInner />
    </Suspense>
  );
}

export default Page;
