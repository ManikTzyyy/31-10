"use client";

import GallerySphere from "./components/GallerySphere";
import Navbar from "./components/Navbar";
import Paraf from "./components/Paraf";
import ParticlesBackground from "./components/ParticleBackground";
import { useCallback, useRef } from "react";
import gsap from "gsap";

import useScrollPin from "./hooks/useScrollpint";
import useScrollFadeIn from "./hooks/useScrollFade";
import useFadeinTransition from "./hooks/useFadeinTransition";

export default function Home() {
  const flashRef = useRef(null);
  // Section yang di-pin
  const sphereSectionRef = useRef(null);

  // Kontrol GallerySphere
  const sphereRef = useRef(null);

  // Kontrol text
  const textRef = useRef(null);
  const currentTextIndex = useRef(0);

  const texts = [
    "A day that quietly marks another chapter.",
    "A little warmer.",
    "A little brighter.",
    "A little softer.",
    "A little sweeter.",
    "A little more beautiful.",
    "A little more meaningful.",
    "A little more magical.",
    "A little more special.",
    "Because today is about you.",
  ];

  // =========================
  // ROTASI SPHERE
  // =========================

  const handleSphereScroll = useCallback((delta) => {
    sphereRef.current?.rotateByScroll(delta);
  }, []);

  // =========================
  // TEXT SCROLL
  // =========================

  const handleTextScroll = useCallback((self) => {
    const progress = self.progress;

    const textProgress = Math.min(progress / 0.9, 1);

    const index = Math.min(
      texts.length - 1,
      Math.floor(textProgress * texts.length),
    );

    if (index === currentTextIndex.current) {
      return;
    }

    currentTextIndex.current = index;

    const text = textRef.current;

    if (!text) return;

    // Ganti text
    text.textContent = texts[index];

    // Animasi fade up
    gsap.killTweensOf(text);

    gsap.fromTo(
      text,
      {
        opacity: 0,
        y: 40,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power3.out",
      },
    );
  }, []);

  const handleTransition = useCallback((self) => {
    const progress = self.progress;

    const flash = flashRef.current;

    if (!flash) return;

    // Sebelum 90% → tidak ada flash
    if (progress < 0.9) {
      gsap.set(flash, {
        opacity: 0,
      });

      return;
    }

    // 90% → 100%
    const flashProgress = (progress - 0.9) / 0.1;

    gsap.set(flash, {
      opacity: flashProgress,
    });
  }, []);

  useScrollPin(
    sphereSectionRef,
    "+=1000",
    handleSphereScroll,
    handleTextScroll,
    handleTransition,
  );

  useScrollFadeIn(sphereSectionRef, "50");

  return (
    <div className="text-yellow-900">
      <Navbar />

      <Paraf />

      {/* SPHERE SECTION */}
      <div
        ref={sphereSectionRef}
        className="h-screen flex justify-center items-center relative overflow-x-hidden px-2"
      >
        <GallerySphere ref={sphereRef} />

        {/* TEXT */}

        <p ref={textRef} className="w-60 ">
          A day that quietly marks another chapter.
        </p>
      </div>

      <div
        ref={flashRef}
        className="fixed inset-0 z-50 bg-white pointer-events-none opacity-0"
      />

      <section className="h-screen bg-white flex items-center justify-center">
        <h1 className="text-4xl text-yellow-900">Hello lol</h1>
      </section>

      <ParticlesBackground />
    </div>
  );
}
