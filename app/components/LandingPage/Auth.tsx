import React from "react";
import Link from "next/link";

const Auth = () => {
  return (
    <Link href="/signin">
      <button
        className="btn bg-orange-300 text-white rounded-2xl
  "
      >
        Start Your Adventure!
      </button>
    </Link>
  );
};

export default Auth;
