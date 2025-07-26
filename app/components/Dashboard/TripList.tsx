"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Josefin_Sans } from "next/font/google";
import { Trip, TripListProps } from "@/app/types";
import DeleteTripPopup from "./DeleteTripPopup";

const josefin = Josefin_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const TripList: React.FC<TripListProps> = ({
  trips,
  showPopup,
  setShowPopup,
  setTrips,
}) => {
  const [showUpload, setShowUpload] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteTrip, setDeleteTrip] = useState("");
  const sortedTrips = [...trips].sort((a, b) => {
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });
  const router = useRouter();

  const handleClick = (
    tripName: string,
    startDate: Date,
    endDate: Date,
    tripId: string,
  ) => {
    localStorage.setItem("activeTrip", JSON.stringify({
      tripName,
      startDate,
      endDate,
      tripId,
    }));
    const query = new URLSearchParams({
      tripName,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      tripId,
    });
    router.push(`/featuresDash?${query.toString()}`);
  };

  const handleDelete = async (tripId: string) => {
    console.log("Delete clicked!");
    const res = await fetch(`/api/deleteTrip`, {
      method: "DELETE",
      credentials: "include",
      body: JSON.stringify({ tripId }),
    });

    if (!res.ok) {
      setShowConfirm(false);
      console.log("Delete failed");
      return;
    } else {
      setTrips((prev: Trip[]) => prev.filter((trip) => trip.id !== tripId));
      setDeleteTrip("");
      setShowConfirm(false);
      console.log("Delete succes");
    }
  };

  return (
    <div className="overflow-y-auto h-4/5">
      {showConfirm && (
        <DeleteTripPopup
          setDeleteTrip={setDeleteTrip}
          setShowConfirm={setShowConfirm}
          deleteTrip={deleteTrip}
          handleDelete={handleDelete}
          showConfirm={showConfirm}
        />
      )}
      {trips.length > 0 ? (
        sortedTrips.map((trip) => {
          return trip && trip.name ? (
            <div
              key={trip.id}
              className="flex bg-gray-50 text-gray-700 rounded-4xl p-4 mb-4 shadow-md hover:bg-gray-100 transition duration-300 ease-in-out cursor-pointer"
            >
              {/* Left Icon Section */}
              <div className="flex items-center">
                <button
                  onClick={() => setShowUpload(true)}
                  className="cursor-pointer ml-2 bg-orange-200 rounded-xl p-4 w-16 h-16 flex items-center justify-center mr-4 overflow-hidden"
                >
                  {selectedImage ? (
                    <img
                      src="/addimage.svg"
                      alt="Trip"
                      className="object-cover w-full h-full rounded-xl"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-orange-500">
                      <img
                        src="/addimage.svg"
                        alt="Trip"
                        className="object-cover w-full h-full rounded-xl"
                      />
                    </div>
                  )}
                </button>
              </div>

              {/* Trip Details Section */}
              <div
                className="ml-10"
                onClick={() =>
                  handleClick(
                    trip.name,
                    new Date(trip.startDate),
                    new Date(trip.endDate),
                    trip.id
                  )
                }
              >
                <div className="flex">
                  <img src="map.svg" alt="Map Pin" className="w-5 h-5" />
                  <h2
                    className={`${josefin.className} text-lg font-bold ml-2 `}
                  >
                    {trip.name}
                  </h2>
                </div>

                <h2
                  className={`flex ${josefin.className} text-md text-gray-500`}
                >
                  <img
                    src="calendar-fold.svg"
                    alt="Calendar"
                    className="w-5 h-5 mr-2"
                  />
                  {new Date(trip.startDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  -{" "}
                  {new Date(trip.endDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h2>
                {trip.tripMemberships && trip.tripMemberships.length > 0 && (
                  <h2 className="mt-1 flex">
                    <img src="users-round.svg" alt="Users" className="w-5 h-5 mr-2" />
                    <span className={`${josefin.className} text-md text-gray-500`}>
                      People in Trip:{" "}
                      {trip.tripMemberships
                        .map((m) => `${m.user.name} @${m.user.username}`)
                        .join(", ")}
                    </span>
                  </h2>
                )}
              </div>
              {/* Delete Button */}
              <div className="ml-auto -mr-2 flex pl-0">
                <button
                  className="relative z-50 p-2 hover:bg-orange-200 rounded-full transition cursor-pointer"
                  onClick={() => {
                    setShowConfirm(!showConfirm);
                    setDeleteTrip(trip.id);
                  }}
                >
                  <img src="/trash-2.svg" alt="Arrow" className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : null;
        })
      ) : (
        <>
          <p className="text-sm text-gray-500 text-center mt-4">
            No trips added yet.
          </p>
          <p className="text-sm text-gray-500 text-center mt-auto">
            This list looks empty.{" "}
            <button
              onClick={() => setShowPopup(!showPopup)}
              className="font-bold text-orange-500 hover:underline cursor-pointer bg-transparent border-none p-0"
            >
              Plan a trip!
            </button>
          </p>
        </>
      )}
    </div>
  );
};

export default TripList;
