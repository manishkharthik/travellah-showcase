import React from "react";
import { Josefin_Sans } from "next/font/google";

const josefin = Josefin_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const WelcomeMsg = ({ userName }: { userName: string | null }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center mt-15 h-64">
      <h1 className={`${josefin.className} text-6xl font-bold text-amber-900`}>
        {greeting()}, {userName}!
      </h1>
    </div>
  );
};

export default WelcomeMsg;
