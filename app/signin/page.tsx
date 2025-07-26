import React from "react";
import SignInCard from "../components/SignIn/SignInCard";
import Image from "next/image";
import Link from "next/link";
import LogoRedirect from "../components/SignIn/LogoRedirect";
import GroupPicture from "../components/SignIn/GroupPicture";

const Page = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 overflow-hidden">
      <LogoRedirect />

      <div className="flex w-full h-full">
        <GroupPicture />
        <SignInCard />
      </div>
    </div>
  );
};

export default Page;
