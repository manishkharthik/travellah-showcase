import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type DropdownProps = {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  tripId: string;
  tripName: string;
  startDate: string;
  endDate: string;
};

const Dropdown: React.FC<DropdownProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  const [tripId, setTripId] = useState<string | null>(null);
  const [tripName, setTripName] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("activeTrip");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setTripId(parsed.tripId || null);
        setTripName(parsed.tripName || null);
        setStartDate(parsed.startDate || null);
        setEndDate(parsed.endDate || null);
      } catch (e) {
        console.error("Failed to parse activeTrip from localStorage:", e);
      }
    }
  }, []);

  return (
    <div className="navbar-start">
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="btn btn-ghost hover:bg-amber-950"
      >
        <Image src="align-justify.svg" alt="Logo" width={30} height={30} />
      </button>
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-amber-50 shadow-lg z-40 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex p-4 pt-6 pb-3 bg-orange-950 border-b font-bold text-lg">
          <p className="-mt-0.5 mr-20">TravelLah!</p>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="btn btn-ghost -mt-3 hover:bg-amber-950"
          >
            <Image src="align-justify.svg" alt="Logo" width={25} height={25} />
          </button>
        </div>
        <ul className="p-4 space-y-4 text-gray-800">
          <li className="items-center gap-3 text-lg">
            <Link
              href={`/itinerary?startDate=${encodeURIComponent(
                startDate ? new Date(startDate).toISOString() : ""
              )}&endDate=${encodeURIComponent(
                endDate ? new Date(endDate).toISOString() : ""
              )}&tripId=${tripId ?? ""}`}
            >
              <div className="flex items-center gap-3">
                <Image
                  src="plane-takeoff.svg"
                  alt="Logo"
                  width={30}
                  height={30}
                />
                <p className="pt-1.5">Itinerary </p>
              </div>
            </Link>
          </li>
          <li className="items-center gap-3 text-lg">
            <Link href={`/expenseTracker?tripId=${tripId}&tripName=${encodeURIComponent(tripName!)}`}>
              <div className="flex items-center gap-3">
                <Image
                  src="circle-dollar-sign.svg"
                  alt="Logo"
                  width={30}
                  height={30}
                />
                <p className="pt-1.5">Expense Tracker</p>
              </div>
            </Link>
          </li>
          <li className="items-center gap-3 text-lg">
            <Link href={`/chat?tripId=${tripId}&tripName=${encodeURIComponent(tripName!)}`}>
              <div className="flex items-center gap-3">
                <Image
                  src="message-circle.svg"
                  alt="Logo"
                  width={30}
                  height={30}
                />
                <p className="pt-1.5">Group Communication</p>
              </div>
            </Link>
          </li>
        </ul>
      </div>

      {/* Optional overlay to darken background when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Dropdown;
