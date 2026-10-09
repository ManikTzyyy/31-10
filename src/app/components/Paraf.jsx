"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Paraf() {
  const containerRef = useRef(null);

  const dayRef = useRef(null);
  const yearRef = useRef(null);

  const typingSectionRef = useRef(null);
  const textRef = useRef(null);

 
  useEffect(() => {
    const ctx = gsap.context(() => {
      const texts = gsap.utils.toArray(".paraf-text");

      texts.forEach((text) => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: text,
            start: "top 80%",
            end: "bottom 20%",
            scrub: true,
          },
        });

        tl.fromTo(
          text,
          {
            opacity: 0,
            y: 80,
            scale: 0.95,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            ease: "none",
          },
        ).to(text, {
          opacity: 0,
          y: -80,
          scale: 1,
          ease: "none",
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);


  useEffect(() => {
    const day = {
      value: 1,
    };

    const animation = gsap.to(day, {
      value: 31,
      snap: "value",

      scrollTrigger: {
        trigger: dayRef.current,
        start: "top 80%",
        end: "bottom 60%",
        scrub: true,
      },

      onUpdate: () => {
        if (!dayRef.current) return;

        dayRef.current.textContent = String(Math.round(day.value)).padStart(
          2,
          "0",
        );
      },
    });

    return () => {
      animation.kill();
    };
  }, []);


  useEffect(() => {
    const year = {
      value: 1999,
    };

    const animation = gsap.to(year, {
      value: 2026,
      snap: "value",

      scrollTrigger: {
        trigger: yearRef.current,
        start: "top 90%",
        end: "bottom 60%",
        scrub: true,
      },

      onUpdate: () => {
        if (!yearRef.current) return;

        yearRef.current.textContent = Math.round(year.value);
      },
    });

    return () => {
      animation.kill();
    };
  }, []);

  useEffect(() => {
    const text = "That feels a little different.";

    const obj = {
      value: 0,
    };

    const animation = gsap.to(obj, {
      value: text.length,
      duration: 2,
      ease: "none",

      scrollTrigger: {
        trigger: typingSectionRef.current,
        start: "top 90%",
        toggleActions: "play none none reverse",
      },

      onUpdate: () => {
        if (!textRef.current) return;

        textRef.current.textContent = text.slice(0, Math.floor(obj.value));
      },
    });

    return () => {
      animation.kill();
    };
  }, []);

  return (
    <div ref={containerRef}>
      <section className="paraf-text h-screen flex items-center justify-center text-3xl">
        October, 31
      </section>

      <section className="paraf-text h-screen flex flex-col items-center justify-center">
        <p className="text-3xl">A day worth remembering</p>

        <div ref={dayRef} className="text-[120px] font-light">
          01
        </div>
      </section>

      <section className="paraf-text h-screen flex flex-col items-center justify-center text-3xl">
        <p>Every year</p>

        <div ref={yearRef} className="text-[120px] font-light">
          1999
        </div>
      </section>

      <section
        ref={typingSectionRef}
        className="paraf-text h-screen flex flex-col items-center justify-center text-3xl"
      >
        <p>there's one day</p>

        <p className="italic text-stone-700" ref={textRef}></p>
      </section>
    </div>
  );
}
