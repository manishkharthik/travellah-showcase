import React, { useState, useEffect } from "react";
import { Raleway } from "next/font/google";
import { TripButtonPopupProp } from "@/app/types";

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
});

const TripButtonPopup: React.FC<TripButtonPopupProp> = ({
  showPopup,
  setShowPopup,
  peopleToInvite,
  setPeopleToInvite,
  error,
  setError,
  handleSubmitTrip,
  tripName,
  setTripName,
  tripStart,
  setTripStart,
  tripEnd,
  setTripEnd,
}) => {
  const [inviteQuery, setInviteQuery] = useState("");
  const [suggestions, setSuggestions] = useState<
    { name: string; username: string }[]
  >([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (inviteQuery.trim().length === 0) {
        setSuggestions([]);
        return;
      }

      const res = await fetch(`/api/searchUsers?q=${inviteQuery}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
      }
    };

    const timeout = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeout);
  }, [inviteQuery]);

  return (
    <div className="relatives">
      <button
        type="submit"
        onClick={() => {
          setShowPopup(!showPopup);
        }}
        aria-label="Add Trip"
        title="Add Trip"
        className={`${raleway.className} from-orange-400/80 to-orange-300/90 hover:bg-orange-500 bg-gradient-to-r text-5xl px-6 hover: cursor-pointer text-white font-semibold rounded-2xl`}
      >
        +
      </button>
      <div className="absolute top-0 -mt-3 left-full ml-[7px] z-50">
        <form className="flex" onSubmit={handleSubmitTrip}>
          <div
            className={`relative transform w-[24rem] bg-white rounded-xl shadow-lg p-6 flex flex-col gap-4 border border-gray-200 z-50 transition-all duration-600 ease-in-out
                      ${
                        showPopup
                          ? "opacity-100"
                          : "opacity-0 pointer-events-none"
                      }
                      `}
          >
            <h2 className="text-center text-2xl font-bold text-gray-800 mb-2">
              Add Trip
            </h2>

            <label className="text-sm text-gray-600 ">Trip Name:</label>
            <input
              type="text"
              className="border border-gray-300 text-black ounded px-3 py-2 focus:ring focus:outline-none focus:ring-orange-300"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              placeholder="Enter trip name"
            />

            <label className="text-sm text-gray-600">
              People to Invite: (usernames, comma-separated)
            </label>
            <input
              type="text"
              className="border border-gray-300 text-black rounded px-3 py-2 focus:ring focus:outline-none focus:ring-orange-300"
              value={inviteQuery}
              onChange={(e) => {
                setInviteQuery(e.target.value);
              }}
              placeholder="Search usernames..."
            />

            {/* Username suggestions */}
            {inviteQuery.trim() !== "" && (
              <div className="bg-white border rounded mt-1 max-h-48 overflow-y-auto shadow-md z-50">
                {suggestions.length > 0 ? (
                  suggestions.map((user) => (
                    <div
                      key={user.username}
                      className="px-4 py-2 hover:bg-orange-100 cursor-pointer"
                      onClick={() => {
                        if (!peopleToInvite.includes(user.username)) {
                          setPeopleToInvite([...peopleToInvite, user.username]);
                        }
                        setInviteQuery("");
                        setSuggestions([]);
                      }}
                    >
                      {user.name} (@{user.username})
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500 italic">
                    No users found
                  </div>
                )}
              </div>
            )}

            {/* Removable Tags */}
            <div className="flex flex-wrap gap-2 mt-2">
              {peopleToInvite.map((username) => (
                <div
                  key={username}
                  className="flex items-center bg-orange-100 text-orange-800 font-medium px-3 py-1 rounded-full shadow-sm"
                >
                  <span>@{username}</span>
                  <button
                    className="ml-2 text-orange-500 hover:text-red-600"
                    onClick={() =>
                      setPeopleToInvite(
                        peopleToInvite.filter((u) => u !== username)
                      )
                    }
                  >
                    x
                  </button>
                </div>
              ))}
            </div>

            <label className="text-sm text-gray-600">Trip Start:</label>
            <input
              type="date"
              className="border border-gray-300 text-gray-500 rounded focus:ring focus:outline-none focus:ring-orange-300 px-3 py-2"
              value={tripStart}
              onChange={(e) => setTripStart(e.target.value)}
            />

            <label className="text-sm text-gray-600">Trip End:</label>
            <input
              type="date"
              value={tripEnd}
              onChange={(e) => setTripEnd(e.target.value)}
              className="border border-gray-300 text-gray-500 focus:ring focus:outline-none focus:ring-orange-300 rounded px-3 py-2"
            />
            {error && (
              <p className="text-sm text-red-600 font-bold text-center">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowPopup(!showPopup)}
                className="px-4 py-2 bg-red-500 hover:bg-red-700 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-300 text-white hover:bg-orange-400 rounded-md"
              >
                Save Trip
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TripButtonPopup;
