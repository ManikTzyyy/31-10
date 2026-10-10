"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function useScrollFadeIn(triggerRef) {
  useEffect(() => {
    const trigger = triggerRef.current;

    if (!trigger) return;

    const ctx = gsap.context(() => {
      const targets = trigger.children.length ? trigger.children : trigger;

      gsap.fromTo(
        targets,
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      );
    }, trigger);

    return () => ctx.revert();
  }, [triggerRef]);
}
