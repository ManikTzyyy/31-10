"use client";

import { useEffect, useState } from "react";
import { COUNTDOWN_TARGET } from "@/lib/countdown";

function getTimeLeft(milliseconds) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));

  return {
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3_600),
    minutes: Math.floor((totalSeconds % 3_600) / 60),
    seconds: totalSeconds % 60,
  };
}

const units = [
  ["days", "Day"],
  ["hours", "Hour"],
  ["minutes", "Minute"],
  ["seconds", "Second"],
];

export default function CountdownPage() {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    let redirected = false;

    const updateCountdown = () => {
      const remaining = COUNTDOWN_TARGET - Date.now();

      if (remaining <= 0) {
        setTimeLeft(getTimeLeft(0));
        if (!redirected) {
          redirected = true;
          window.location.replace("/");
        }
        return;
      }

      setTimeLeft(getTimeLeft(remaining));
    };

    updateCountdown();
    const intervalId = window.setInterval(updateCountdown, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fff6de] px-5 py-12 text-amber-950">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-28 h-80 w-80 rounded-full bg-amber-200/50 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-36 -right-20 h-96 w-96 rounded-full bg-orange-200/50 blur-3xl"
      />

      <section className="relative w-full max-w-2xl text-center">
        <p className="mb-5 text-xs font-medium uppercase tracking-[0.35em] text-amber-800/70 sm:text-sm">
          A little moment is on its way
        </p>
        <h1 className="font-serif text-5xl font-light tracking-tight sm:text-7xl">
          Almost time
        </h1>

        <div
          aria-live="polite"
          aria-label="Waktu tersisa"
          className="mt-10 grid grid-cols-4 gap-2 sm:mt-14 sm:gap-4"
        >
          {units.map(([unit, label]) => (
            <div
              key={unit}
              className="rounded-2xl border border-amber-900/10 bg-white/60 px-2 py-5 shadow-sm backdrop-blur-sm sm:rounded-3xl sm:px-4 sm:py-7"
            >
              <p className="font-serif text-4xl font-light tabular-nums sm:text-6xl">
                {timeLeft ? String(timeLeft[unit]).padStart(2, "0") : "--"}
              </p>
              <p className="mt-2 text-[0.65rem] uppercase tracking-[0.2em] text-amber-900/60 sm:text-xs">
                {label}
              </p>
            </div>
          ))}
        </div>

      </section>
    </main>
  );
}
