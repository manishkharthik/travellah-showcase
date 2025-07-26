import React from "react";
import Auth from "./Auth";
import Image from "next/image";

const NavBar = () => {
  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {" "}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />{" "}
            </svg>
          </div>
        </div>
        <a className="btn btn-ghost text-xl">
          <Image
            src="/travellah.png"
            alt="TravelLah logo"
            width={70}
            height={70}
          />
        </a>
      </div>

      <div className="navbar-end">
        <Auth />
      </div>
    </div>
  );
};

export default NavBar;
