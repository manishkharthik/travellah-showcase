import React, { useState } from "react";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const Features = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full mt-8 mb-12 px-6 bg-white">
      <div className="flex flex-col lg:flex-row gap-8 justify-center items-stretch max-w-6xl mx-auto">
        {/* Feature 1 */}
        <div className="flex flex-col w-full lg:w-1/3">
          <div
            className={`collapse collapse-arrow rounded-box border ${
              openIndex === 1 ? "collapse-open" : ""
            }`}
            onClick={() => toggle(1)}
          >
            <div
              className={`collapse-title text-xl font-bold bg-orange-300 ${inter.className} text-white`}
            >
              Itinerary Planning
            </div>
            <div className="collapse-content bg-white text-sm text-center text-black font-semibold p-3">
              A user-friendly, interactive timetable that allows group members to collaboratively build, view, and update the trip itinerary in real time
            </div>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="flex flex-col w-full lg:w-1/3">
          <div
            className={`collapse collapse-arrow rounded-box border ${
              openIndex === 2 ? "collapse-open" : ""
            }`}
            onClick={() => toggle(2)}
          >
            <div
              className={`collapse-title text-xl font-bold bg-orange-300 ${inter.className} text-white`}
            >
              Cost Splitting
            </div>
            <div className="collapse-content bg-white text-sm text-center text-black font-semibold p-3">
              By including Automated Expense Tracking with Real-Time Sync, users can log expenses as they happen, such as meals, accommodation, transport, and indicate who paid and who participated.
            </div>
          </div>
        </div>

        {/* Feature 3 */}
        <div className="flex flex-col w-full lg:w-1/3">
          <div
            className={`collapse collapse-arrow rounded-box border ${
              openIndex === 3 ? "collapse-open" : ""
            }`}
            onClick={() => toggle(3)}
          >
            <div
              className={`collapse-title text-xl font-semibold bg-orange-300 ${inter.className} text-white`}
            >
              Group Coordination
            </div>
            <div className="collapse-content bg-white text-sm text-center text-black font-semibold p-3">
              Group Travel Coordination lets users collaboratively plan trips by managing shared itineraries, assigning tasks, voting via polls, and splitting expenses—keeping everyone organized, informed, and in sync.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;