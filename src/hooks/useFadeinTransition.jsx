"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function useFadeinTransition(
  flashRef,
  triggerRef
) {
  useEffect(() => {
    if (!flashRef.current || !triggerRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerRef.current,
        start: "bottom bottom",
        end: "+=1500",
        scrub: true,
      },
    });

    tl.to(flashRef.current, {
      opacity: 1,
      duration: 0.2,
    }).to(flashRef.current, {
      opacity: 0,
      duration: 0.8,
    });

    return () => {
      tl.kill();
    };
  }, [flashRef, triggerRef]);
}