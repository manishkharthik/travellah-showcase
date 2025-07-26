"use client";

import Image from "next/image";
import Auth from "./components/LandingPage/Auth";
import NavBar from "./components/LandingPage/NavBar";
import Hero from "./components/LandingPage/Hero";
import Features from "./components/LandingPage/Features";

export default function Home() {
  return (
    <>
      <NavBar />
      <Hero />
      <Features />
    </>
  );
}
