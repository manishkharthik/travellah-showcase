"use client";

import React, { useState, useEffect } from "react";
import LogoRedirectDash from "../components/Dashboard/NavBar/LogoRedirectDash";
import Avatar from "../components/Dashboard/NavBar/Avatar";
import WelcomeMsg from "../components/Dashboard/WelcomeMsg";
import MainCard from "../components/Dashboard/MainCard";

import { Trip } from "../types";

const Page = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [tripName, setTripName] = useState("");
  const [peopleToInvite, setPeopleToInvite] = useState<string[]>([]);
  const [tripStart, setTripStart] = useState("");
  const [tripEnd, setTripEnd] = useState("");
  const [userImage, setUserImage] = useState("");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch("/api/me", {
          method: "GET",
          credentials: "include", // VERY IMPORTANT for sending cookie
        });

        if (!res.ok) {
          return;
        }

        const data = await res.json();
        setUserName(data.name);
        setUserId(data.id);
        setUserImage(data.image);

        const tripRes = await fetch("/api/usertrips", {
          method: "GET",
          credentials: "include", // VERY IMPORTANT for sending cookie
        });
        if (!tripRes.ok) {
          console.error("Failed to fetch trips, status:", tripRes.status);
          return;
        }
        const tripData = await tripRes.json();
        setTrips(tripData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    getUser();
  }, []);

  const handleSubmitTrip = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      setError("User not loaded yet.");
      return;
    }

    if (!tripName || !tripStart || !tripEnd) {
      setError("Not all required fields are filled");
      return;
    }

    if (new Date(tripStart) > new Date(tripEnd)) {
      setError("Trip start date cannot be after trip end date");
      return;
    }

    const peopleArray = peopleToInvite.filter(Boolean);

    try {
      const res = await fetch("/api/createTrip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: tripName,
          peopleToInvite: peopleArray,
          tripStart,
          tripEnd,
          userId: userId,
        }),
      });

      const data = await res.json();
      console.log("Trip creation response:", data);
      if (!res.ok) {
        setError(data.error || "Trip creation failed");
        return;
      }

      localStorage.setItem(
        "latestTrip",
        JSON.stringify({
          name: tripName,
          peopleToInvite: peopleArray,
        })
      );

      setTripName("");
      setPeopleToInvite([]);
      setTripStart("");
      setTripEnd("");
      setShowPopup(false);
      setTrips((prevTrips) => [...prevTrips, data.trip]);
    } catch (err) {
      console.error("Error creating trip:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="relative w-screen h-screen bg-amber-50">
      <div>
        <img
          src="dashboardbg.png"
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
      </div>
      <div className="absolute top-2 right-2 p-4">
        <Avatar image={userImage} />
      </div>
      <div className="flex items-center justify-center text-4xl text-black font-bold">
        <LogoRedirectDash />
      </div>

      {/* // Welcome message */}
      <WelcomeMsg userName={userName} />
      {/* Main Card */}
      <MainCard
        tripName={tripName}
        setTripName={setTripName}
        peopleToInvite={peopleToInvite}
        setPeopleToInvite={setPeopleToInvite}
        tripStart={tripStart}
        setTripStart={setTripStart}
        tripEnd={tripEnd}
        setTripEnd={setTripEnd}
        showPopup={showPopup}
        setShowPopup={setShowPopup}
        error={error}
        setError={setError}
        handleSubmitTrip={handleSubmitTrip}
        trips={trips}
        setTrips={setTrips}
      />
    </div>
  );
};

export default Page;
