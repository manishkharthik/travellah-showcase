import React from "react";
import { Josefin_Sans } from "next/font/google";

const josefin = Josefin_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const List = () => {
  return (
    <ul
      tabIndex={0}
      className={`menu menu-sm ${josefin.className} dropdown-content bg-base-100 rounded-box z-1 text-3xl text-gray-800 mt-4 w-64 p-2 shadow-md shadow-stone-300`}
    >
      <li>
        <a className="flex items-center gap-3 text-lg">
          <img
            src="plane-takeoff.svg"
            alt="Logo"
            width={40}
            height={45}
            className="h-6 w-5"
          />
          <p className="pt-1.5">Itinerary</p>
        </a>
      </li>
      <li>
        <a className="flex items-center gap-3 text-lg">
          <img
            src="circle-dollar-sign.svg"
            alt="Logo"
            width={40}
            height={45}
            className="h-5 w-5"
          />
          <p className="pt-1.5">Expenses</p>
        </a>
      </li>
      <li>
        <a className="flex items-center gap-3 text-lg">
          <img
            src="message-circle.svg"
            alt="Logo"
            width={40}
            height={45}
            className="h-6 w-5"
          />
          <p className="pt-1.5">Group Communication</p>
        </a>
      </li>
    </ul>
  );
};

export default List;
