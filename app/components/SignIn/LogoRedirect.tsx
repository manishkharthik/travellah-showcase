import React from "react";
import Link from "next/link";
import Image from "next/image";

const LogoRedirect = () => {
  return (
    <Link href="/">
      <Image
        src="/travellah.png"
        alt="TravelLah Logo"
        className="absolute top-0 z-10 right-5"
        width={100}
        height={100}
      />
    </Link>
  );
};

export default LogoRedirect;
