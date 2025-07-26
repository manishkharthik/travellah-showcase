"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Raleway, Inter } from "next/font/google";
import LogoRedirect from "../components/SignIn/LogoRedirect";

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
});

const SignupPage = () => {
  const router = useRouter();

  // Controlled form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, username, }),
    });

    const data = await res.json();

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: "Unknown error" }));
      setError(data.error || "Signup failed");
    } else {
      router.push("/signin"); // Redirect after success
    }
  };

  return (
    <div className="flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 overflow-hidden">
      <LogoRedirect />
      <div className="relative w-screen h-screen"></div>
      <img
        src="/createaccount.jpg"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div
        className={`${raleway.className} absolute z-10 py-10 px-15 bg-amber-50 rounded-4xl shadow-2xl shadow-orange-100`}
      >
        <form onSubmit={handleSignup} className="flex flex-col gap-5">
          <div className="flex mb-0.5 items-center gap-3 justify-center">
            <h1
              className={`${inter.className} text-4xl font-bold text-gray-700 ml-4 mb-0 mr-2 mt-0.5`}
            >
              Create an account
            </h1>
          </div>

          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-4 py-2 border text-indigo-950 font-bold border-gray-400 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
          />

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="px-4 py-2 border text-indigo-950 font-bold border-gray-400 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
          />

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-2 border text-indigo-950 font-bold border-gray-400 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-2 border text-indigo-950 font-bold border-gray-400 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="px-4 py-2 border text-indigo-950 font-bold border-gray-400 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
          />

          <button className="bg-gradient-to-r from-orange-200 to-orange-400 text-white py-2 px-6 font-semibold rounded-full hover:scale-105 transition-transform">
            Sign Up
          </button>

          {error && (
            <p className="text-sm text-red-600 font-bold text-center">
              {error}
            </p>
          )}

          <p className="text-sm text-black font-bold text-center">
            Already have an account?{" "}
            <a
              href="/signin"
              className={`${raleway.className} font-bold text-orange-500 hover:underline`}
            >
              Sign in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
