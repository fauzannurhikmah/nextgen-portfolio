"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Projects from "@/components/Projects";
import Experience from "@/components/Experience";
import Contact from "@/components/Contact";
import Cursor from "@/components/Cursor";

// SSR-disabled for all Three.js / heavy components
const LoadingScreen = dynamic(() => import("@/components/LoadingScreen"), { ssr: false });
const HelixSection  = dynamic(() => import("@/components/HelixSection"),  { ssr: false });
const ScrollObject3D = dynamic(() => import("@/components/ScrollObject3D"), { ssr: false });

export default function Home() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {/* Loading screen — unmounts after cinematic exit */}
      {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}

      {/* Main site — rendered underneath loader, becomes visible after curtains open */}
      <div style={{ visibility: loaded ? "visible" : "hidden" }}>
        <Cursor />
        <ScrollObject3D />
        <Navbar />
        <main>
          <Hero />
          <Marquee />
          <About />
          <Skills />
          <Projects />
          <HelixSection />
          <Experience />
          <Contact />
        </main>
      </div>
    </>
  );
}
