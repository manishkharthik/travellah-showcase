"use client"
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ChatLandingPage from "../components/Chat/ChatLandingPage";

const Page = () => {
  const searchParams = useSearchParams();
  const [tripId, setTripId] = useState<string | null>(null);
  const [tripName, setTripName] = useState<string | null>(null);
  const [tripPeopleInvited, setTripPeopleInvited] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    const id = searchParams.get("tripId");
    setTripId(id);
  }, [searchParams]);

  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        const res = await fetch(`/api/trip?tripId=${tripId}`);
        const json = await res.json();
        if (res.ok) {
          const { data } = json;
          setTripName(data.name);
          setTripPeopleInvited(data.tripMemberships.map((m: any) => m.user.name)); 
          setStartDate(data.startDate);
          setEndDate(data.endDate)
        } else {
          console.error("Error fetching trip:", json.error);
        }
      } catch (err) {
        console.error("Failed to fetch trip", err);
      }
    };
    if (tripId) fetchTripDetails();
  }, [tripId]);

  return (
    <div className="text-black">
      <ChatLandingPage 
        tripId={tripId} 
        tripName={tripName} 
        tripPeopleInvited={tripPeopleInvited}
        startDate={startDate}
        endDate={endDate}
      />
    </div>
  );
};

export default Page;
