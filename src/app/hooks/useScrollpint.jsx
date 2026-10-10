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
  onTransition = null,
  onAfterPinUpdate = null,
  onAfterPinLeave = null
) {
  useEffect(() => {
    if (!ref.current) return;

    let lastProgress = 0;
    let afterPinTrigger;

    const ctx = gsap.context(() => {
      const pinTrigger = ScrollTrigger.create({
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

      afterPinTrigger = ScrollTrigger.create({
        trigger: ref.current,
        start: () => pinTrigger.end + window.innerHeight,
        end: () => pinTrigger.end + window.innerHeight * 2,
        onUpdate: (self) => onAfterPinUpdate?.(self),
        onLeave: (self) => onAfterPinLeave?.(self),
      });
    }, ref);

    return () => {
      afterPinTrigger?.kill();
      ctx.revert();
    };
  }, [ref, end, onScroll, onUpdate, onTransition, onAfterPinUpdate, onAfterPinLeave]);
}