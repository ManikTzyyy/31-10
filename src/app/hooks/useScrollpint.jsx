"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function useScrollPin(
  ref,
  end = "+=1000",
  onScroll = null,
  onUpdate = null,
  onTransition = null
) {
  useEffect(() => {
    if (!ref.current) return;

    let lastProgress = 0;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: ref.current,

        start: "top top",
        end,

        pin: true,
        pinSpacing: true,

        onEnter: (self) => {
          lastProgress = self.progress;
        },

        onEnterBack: (self) => {
          lastProgress = self.progress;
        },

        onUpdate: (self) => {
          // =========================
          // ROTASI SPHERE
          // =========================

          const delta = self.progress - lastProgress;

          onScroll?.(delta);

          lastProgress = self.progress;

          // =========================
          // TEXT
          // =========================

          onUpdate?.(self);

          // =========================
          // TRANSITION
          // =========================

          onTransition?.(self);
        },
      });
    }, ref);

    return () => ctx.revert();
  }, [ref, end, onScroll, onUpdate, onTransition]);
}