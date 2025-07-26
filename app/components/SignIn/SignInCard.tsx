"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Raleway } from "next/font/google";

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
});

const SignInCard = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Sign in failed");
    } else {
      router.push("/dashboard"); // Redirect to home page after successful sign-in
    }
  };

  return (
    <div className="w-1/2 flex items-center justify-center">
      <div
        className="bg-white rounded-2xl shadow-xl px-10 py-10
      flex flex-col items-center justify-center gap-5
     w-full max-w-md"
      >
        <form onSubmit={handleSignIn} className="flex flex-col gap-5">
          <div className="flex mb-0.5 items-center gap-3 justify-center">
            <h1
              className={`${raleway.className} text-4xl font-bold text-gray-800 ml-10 mb-0 mr-2 mt-0.5`}
            >
              Sign in to your account
            </h1>
            <img src="/signinglobe.png" alt="globe" className="w-50 h-50" />
          </div>

          <input
            type="email"
            placeholder="Email address"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            className="px-4 py-2 border text-indigo-950 border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
          />

          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            className="px-4 py-2 border text-indigo-950 border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
          />

          <button
            type="submit"
            className={`bg-orange-400 hover:bg-orange-500 text-white font-semibold py-2 rounded-md`}
          >
            Sign In
          </button>

          {error && <p className="text-red-500 text-center">{error}</p>}

          <p className="text-sm text-gray-500 text-center">
            Don’t have an account?{" "}
            <a
              href="/signup"
              className={`${raleway.className} font-bold text-orange-500 hover:underline`}
            >
              Sign Up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignInCard;
