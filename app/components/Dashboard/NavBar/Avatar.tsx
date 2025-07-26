import React from "react";
import { Josefin_Sans } from "next/font/google";

const josefin = Josefin_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
});

type AvatarProps = {
  image?: string;
};

const Avatar: React.FC<AvatarProps> = ({ image }) => {
  return (
    <>
      <div className="dropdown dropdown-end">
        <div
          tabIndex={0}
          role="button"
          className="btn m-1 w-9 h-9 rounded-full"
        >
          <div className="avatar">
            <div className="w-10 h-10 rounded-full">
              <img src={image || "/defaultavatar.webp"} />
            </div>
          </div>
        </div>
        <ul
          tabIndex={0}
          className={`dropdown-content menu bg-base-100 font-semibold text-gray-700 ${josefin.className} rounded-box z-1 w-52 p-2 shadow-sm`}
        >
          <div
            className={`flex align-middle justify-center gap-2 text-gray-700 ${josefin.className} hover:bg-gray-100 px-4 py-2 rounded-md`}
          >
            <button className="font-bold text-md ">Profile </button>
            <img src="profile.svg" alt="Logout" className="h-5 w-5" />
          </div>
          <div
            className={`flex align-middle justify-center gap-2 text-gray-700 ${josefin.className} hover:bg-gray-100 px-4 py-2 rounded-md`}
          >
            <button className="font-bold text-md ">Settings</button>
            <img src="settings.svg" alt="Logout" className="h-5 w-5" />
          </div>
          <div
            className={`flex align-middle justify-center gap-2 text-orange-400 ${josefin.className} hover:bg-orange-100 px-4 py-2 rounded-md`}
          >
            <button className="font-bold text-md ">Log out</button>
            <img src="log-out.svg" alt="Logout" className="h-5 w-5" />
          </div>
        </ul>
      </div>
    </>
  );
};

export default Avatar;
