import React from "react";
import { Raleway } from "next/font/google";
import TripButtonPopup from "./TripButtonPopup";
import TripList from "./TripList";
import { MainCardProps } from "@/app/types";

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
});

const MainCard: React.FC<MainCardProps> = ({
  tripName,
  setTripName,
  peopleToInvite,
  setPeopleToInvite,
  tripStart,
  setTripStart,
  tripEnd,
  setTripEnd,
  showPopup,
  setShowPopup,
  error,
  setError,
  handleSubmitTrip,
  trips,
  setTrips,
}) => {
  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/3 h-[32rem] mt-30 bg-amber-900 rounded-3xl p-4">
      <div className="bg-white rounded-2xl shadow-xl px-10 py-10 flex flex-col gap-5 w-full h-full justify-between">
        {/* Header + Trip Button */}
        <div className="flex justify-between items-center">
          <h1
            className={`${raleway.className} ml-5 text-4xl font-bold text-gray-800`}
          >
            Your Trips
          </h1>

          {/* Add Trip Button + Popup */}
          <TripButtonPopup
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
          />
        </div>

        {/* Trip List */}
        <TripList
          trips={trips}
          showPopup={showPopup}
          setShowPopup={setShowPopup}
          setTrips={setTrips}
        />
      </div>
    </div>
  );
};

export default MainCard;
