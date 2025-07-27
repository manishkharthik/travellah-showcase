"use client";

import React from "react";
import { Josefin_Sans } from "next/font/google";
import AvatarNav from "./AvatarNav";
import Link from "next/link";
import { useState } from "react";
import Dropdown from "./Dropdown";

const josefin = Josefin_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
});

type NavProps = {
  tripId: string;
  tripName: string;
  startDate: string;
  endDate: string;
};

const Nav: React.FC<NavProps> = ({ tripId, tripName, startDate, endDate }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <div className="navbar bg-orange-950 text-amber-50 shadow-sm">
      <Dropdown
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        tripName={tripName}
        tripId={tripId}
        startDate={startDate}
        endDate={endDate}
      />
      <div className="-navbar-center flex-1 flex justify-center items-center">
        <Link href="/" className="btn btn-ghost normal-case text-2xl">
          <p>TravelLah!</p>
        </Link>
      </div>
      <div className="navbar-end">
        <AvatarNav />
      </div>
    </div>
  );
};

export default Nav;
