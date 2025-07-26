"use client";
import React from "react";
import { ExtendedPoll } from "@/app/types/poll";
import { useEffect, useState } from "react";
import PollGrid from "./PollFeatures/PollGrid";
import PollCreation from "./PollFeatures/PollCreation";
import PollDetails from "./PollFeatures/PollDetails";

interface User {
  id: number;
  username: string;
  name: string;
}

export default function Polls({ tripId, tripPeopleInvited }: { tripId: string | null; tripPeopleInvited: string[] }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [polls, setPolls] = useState<ExtendedPoll[]>([]);
  const [showCreationForm, setShowCreationForm] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState<ExtendedPoll | null>(null);

  {/* Fetch user */}
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();
        if (res.ok) {
          setCurrentUser(data);
        } else {
          console.error("Failed to fetch user:", data.error);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, []);

  {/* Fetch polls for the trip */}
  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const res = await fetch("/api/polls?tripId=" + tripId);
        const data = await res.json();
        if (res.ok) {
          setPolls(data.data || []);
        } else {
          console.error("Failed to fetch polls:", data.error);
        }
      } catch (err) {
        console.error("Error fetching polls:", err);
      }
    };
    fetchPolls();
  }, [tripId]);

  return (
    <div className="p-4 overflow-y-auto h-full">
      <h1 className="text-4xl text-[#432818] mt-4 text-center font-bold">View your polls</h1>
      {/* Initial display of polls */}
      <PollGrid
        polls={polls}
        setPolls={setPolls}
        currentUser={currentUser}
        onView={(poll) => setSelectedPoll(poll)}
        tripPeopleInvited={tripPeopleInvited}
      />
      {/* Popup to create poll (when add poll is clicked) */}
      {showCreationForm && (
        <PollCreation
          tripId={tripId}
          onClose={() => setShowCreationForm(false)}
          onPollCreated={(newPoll) => setPolls([newPoll, ...polls])}
          currentUser={currentUser}
        />  
      )}
      {/* Popup to view poll details (when a poll is clicked) */}
      {selectedPoll && (
        <PollDetails
          poll={selectedPoll}
          onClose={() => setSelectedPoll(null)}
          onPollUpdated={(updated) =>
            setPolls(polls.map((p) => (p.id === updated.id ? updated : p)))
          }
          onPollDeleted={() => setPolls(polls.filter((p) => p.id !== selectedPoll.id))}
          currentUser={currentUser}
        />
      )}
      {/* Button to add a new poll */}
      <button
        className="fixed bottom-8 right-8 bg-[#8b6a5c] text-white px-6 py-3 rounded-full text-xl shadow-lg hover:bg-[#6f4e37] transition cursor-pointer"
        onClick={() => setShowCreationForm(true)}
      >
        + New Poll
      </button>
    </div>
  );
}