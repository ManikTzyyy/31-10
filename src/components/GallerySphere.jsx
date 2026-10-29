"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import gsap from "gsap";

export const galleryPhotos = [
  {
    src: "/a.JPG",
    alt: "Gallery photo A",
  },
  {
    src: "/b.PNG",
    alt: "Gallery photo B",
  },
  {
    src: "/c.JPG",
    alt: "Gallery photo C",
  },
  {
    src: "/d.JPG",
    alt: "Gallery photo D",
  },
  {
    src: "/e.JPG",
    alt: "Gallery photo E",
  },
  {
    src: "/f.JPG",
    alt: "Gallery photo F",
  },
  {
    src: "/g.JPG",
    alt: "Gallery photo G",
  },
  {
    src: "/h.JPG",
    alt: "Gallery photo H",
  },
  {
    src: "/i.JPG",
    alt: "Gallery photo I",
  },
  {
    src: "/j.JPG",
    alt: "Gallery photo J",
  },
  {
    src: "/k.JPG",
    alt: "Gallery photo K",
  },
  {
    src: "/l.JPG",
    alt: "Gallery photo L",
  },
  {
    src: "/m.JPG",
    alt: "Gallery photo M",
  },
];

const GallerySphere = forwardRef(function GallerySphere(props, ref) {
  const stageRef = useRef(null);
  const sphereRef = useRef(null);
  const hintRef = useRef(null);
  const hasInteracted = useRef(false);

  // Untuk menyimpan object motion yang dibuat di dalam useEffect
  const motionRef = useRef(null);

  // Method yang bisa dipanggil dari Home
  useImperativeHandle(ref, () => ({
    rotateByScroll(delta) {
      if (!motionRef.current) return;

      motionRef.current.targetY += delta * 180;
    },
  }));

  useEffect(() => {
    const stage = stageRef.current;
    const sphere = sphereRef.current;

    const items = [...sphere.querySelectorAll(".photo")];

    const motion = {
      x: -8,
      y: -18,
      targetX: -8,
      targetY: -18,
      velocityX: 0,
      velocityY: 0,
    };

    // Simpan motion supaya bisa diakses rotateByScroll()
    motionRef.current = motion;

    let radius = 320;
    let dragging = false;
    let pointerId = null;
    let lastX = 0;
    let lastY = 0;

    const setPhotoPositions = () => {
      radius = Math.min(
        window.innerWidth < 700 ? 160 : 330,
        window.innerWidth * (window.innerWidth < 700 ? 0.43 : 0.29),
      );

      items.forEach((item, index) => {
        const phi = Math.acos(
          1 - (2 * (index + 0.5)) / items.length
        );

        const theta =
          Math.PI * (1 + Math.sqrt(5)) * index;

        const x =
          radius *
          Math.sin(phi) *
          Math.cos(theta);

        const y =
          radius *
          Math.cos(phi);

        const z =
          radius *
          Math.sin(phi) *
          Math.sin(theta);

        item.dataset.x = x;
        item.dataset.y = y;
        item.dataset.z = z;
        item.dataset.size = 0.88 + (index % 4) * 0.06;
      });
    };

    const render = () => {
      // Smooth rotation
      motion.x +=
        (motion.targetX - motion.x) * 0.075;

      motion.y +=
        (motion.targetY - motion.y) * 0.075;

      // Momentum dari drag
      motion.targetX += motion.velocityX;
      motion.targetY += motion.velocityY;

      motion.velocityX *= 0.91;
      motion.velocityY *= 0.91;

      // AUTO ROTATE
      if (!dragging) {
        motion.targetY += 0.035;
      }

      sphere.style.transform = `
        rotateX(${motion.x}deg)
        rotateY(${motion.y}deg)
      `;

      items.forEach((item) => {
        const z = Number(item.dataset.z);

        const depth =
          (z + radius) / (radius * 2);

        const scale =
          (0.6 + depth * 0.2) *
          Number(item.dataset.size);

        item.style.zIndex =
          String(Math.round(depth * 100));

        item.style.filter =
          `blur(${(1 - depth) * 0.8}px)`;

        item.style.transform = `
          translate3d(
            ${item.dataset.x}px,
            ${item.dataset.y}px,
            ${z}px
          )
          rotateY(${-motion.y}deg)
          rotateX(${-motion.x}deg)
          scale(${scale})
        `;
      });
    };

    // =========================
    // DRAG
    // =========================

    const onPointerDown = (event) => {
      event.preventDefault();

      dragging = true;

      pointerId = event.pointerId;

      lastX = event.clientX;
      lastY = event.clientY;

      motion.velocityX = 0;
      motion.velocityY = 0;

      stage.setPointerCapture(pointerId);

      stage.classList.add("is-dragging");

      if (!hasInteracted.current) {
        hasInteracted.current = true;

        gsap.to(hintRef.current, {
          autoAlpha: 0,
          y: 8,
          duration: 0.35,
          ease: "power2.out",
        });
      }
    };

    const onPointerMove = (event) => {
      if (
        !dragging ||
        event.pointerId !== pointerId
      ) {
        return;
      }

      const deltaX =
        event.clientX - lastX;

      const deltaY =
        event.clientY - lastY;

      lastX = event.clientX;
      lastY = event.clientY;

      motion.targetY += deltaX * 0.22;
      motion.targetX -= deltaY * 0.18;

      motion.velocityY =
        deltaX * 0.055;

      motion.velocityX =
        -deltaY * 0.045;
    };

    const onPointerUp = (event) => {
      if (event.pointerId !== pointerId) {
        return;
      }

      dragging = false;

      stage.releasePointerCapture(pointerId);

      stage.classList.remove("is-dragging");
    };

    setPhotoPositions();

    // Initial animation
    gsap.fromTo(
      items,
      {
        autoAlpha: 0,
      },
      {
        autoAlpha: 1,
        duration: 1.5,
        stagger: 0.045,
        ease: "power3.out",
        delay: 0.35,
      },
    );

    gsap.ticker.add(render);

    stage.addEventListener(
      "pointerdown",
      onPointerDown
    );

    stage.addEventListener(
      "pointermove",
      onPointerMove
    );

    stage.addEventListener(
      "pointerup",
      onPointerUp
    );

    stage.addEventListener(
      "pointercancel",
      onPointerUp
    );

    window.addEventListener(
      "resize",
      setPhotoPositions
    );

    return () => {
      gsap.ticker.remove(render);

      gsap.killTweensOf(items);
      gsap.killTweensOf(hintRef.current);

      stage.removeEventListener(
        "pointerdown",
        onPointerDown
      );

      stage.removeEventListener(
        "pointermove",
        onPointerMove
      );

      stage.removeEventListener(
        "pointerup",
        onPointerUp
      );

      stage.removeEventListener(
        "pointercancel",
        onPointerUp
      );

      window.removeEventListener(
        "resize",
        setPhotoPositions
      );

      motionRef.current = null;
    };
  }, []);

  return (
    <div
      ref={stageRef}
      className="sphere-container"
      aria-label="Interactive birthday photo sphere"
    >
      <div
        ref={sphereRef}
        className="sphere"
      >
        {galleryPhotos.map((photo, index) => (
          <figure
            className="photo"
            key={`${photo.src}-${index}`}
          >
            <img
              src={photo.src}
              alt={photo.alt}
              draggable="false"
              loading="lazy"
              decoding="async"
            />
          </figure>
        ))}
      </div>
    </div>
  );
});

export default GallerySphere;