"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function useFadeinTransition(
  flashRef,
  triggerRef,
  startProgress = 0.8
) {
  useEffect(() => {
    if (!flashRef.current || !triggerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.set(flashRef.current, {
        opacity: 0,
      });

      ScrollTrigger.create({
        trigger: triggerRef.current,

        start: "top top",
        end: "+=1000",

        onUpdate: (self) => {
          const progress = self.progress;

          if (progress < startProgress) {
            gsap.set(flashRef.current, {
              opacity: 0,
            });

            return;
          }

          // Ubah progress 0.8 - 1 menjadi 0 - 1
          const flashProgress =
            (progress - startProgress) / (1 - startProgress);

          gsap.set(flashRef.current, {
            opacity: flashProgress,
          });
        },
      });
    }, triggerRef);

    return () => ctx.revert();
  }, [flashRef, triggerRef, startProgress]);
}