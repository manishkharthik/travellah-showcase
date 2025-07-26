import React from "react";
import { Raleway, Inter } from "next/font/google";

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
});

const Overlay = () => {
  return (
    <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center z-10">
      <h1
        className={`${raleway.className} text-[6rem] font-extrabold drop-shadow-lg`}
      >
        TravelLah!
      </h1>
      <p className={`${raleway.className} text-2xl mt-4 drop-shadow-sm`}>
        Quicker Plans More Fun!
      </p>
    </div>
  );
};

export default Overlay;
