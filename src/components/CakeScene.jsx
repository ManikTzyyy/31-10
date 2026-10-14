"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";
import { Fireworks } from "fireworks-js";
import { createFlame } from "./Flame";
import GallerySphere from "./GallerySphere";

gsap.registerPlugin(ScrollTrigger);

export default function CakeScene() {
  const containerRef = useRef(null);
  const sectionRef = useRef(null);
  const fireworksContainerRef = useRef(null);
  const fireworksInstanceRef = useRef(null);
  const audioRef = useRef(null); // <-- Ref untuk elemen audio HTML
  const wishTimeoutRef = useRef(null);
  const [isLit, setIsLit] = useState(false);
  const [showWishStep, setShowWishStep] = useState(false);
  const [hasBlown, setHasBlown] = useState(false);

  const isLitRef = useRef(false);
  const hasBlownRef = useRef(false);
  const resetSceneRef = useRef(() => {});

  const lightsRef = useRef({
    ambient: null,
    directional: null,
    candle: null,
    flameMesh: null,
    controls: null,
    camera: null,
    cakeGroup: null,
    rotationTween: null,
    lightTimeline: null,
  });

  const handleLightUp = () => {
    if (isLitRef.current) return;

    isLitRef.current = true;
    hasBlownRef.current = false;
    setIsLit(true);
    setHasBlown(false);
    setShowWishStep(false);

    if (wishTimeoutRef.current) {
      clearTimeout(wishTimeoutRef.current);
      wishTimeoutRef.current = null;
    }

    wishTimeoutRef.current = setTimeout(() => {
      setShowWishStep(true);
    }, 5000);

    // Putar musik dari awal menggunakan elemen audio HTML
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => {
        console.log("Gagal memutar audio:", err);
      });
    }

    const {
      ambient,
      directional,
      candle,
      flameMesh,
      cakeGroup,
      rotationTween,
      lightTimeline,
    } = lightsRef.current;

    lightTimeline?.kill();
    rotationTween?.kill();

    const tl = gsap.timeline();
    lightsRef.current.lightTimeline = tl;

    if (flameMesh) {
      tl.to(
        flameMesh.scale,
        {
          x: 0.2,
          y: 0.2,
          z: 0.2,
          duration: 1.5,
          ease: "power2.out",
        },
        0,
      );
    }

    if (ambient) {
      tl.to(ambient, { intensity: 0.5, duration: 1.5 }, 0);
    }

    if (directional) {
      tl.to(directional, { intensity: 0.2, duration: 1.5 }, 0);
    }

    if (candle) {
      tl.to(candle, { intensity: 3, duration: 1.5 }, 0);
    }

    if (cakeGroup) {
      const rotation = gsap.to(cakeGroup.rotation, {
        y: cakeGroup.rotation.y + Math.PI * 2,
        duration: 100,
        ease: "none",
        repeat: -1,
        onRepeat: () => {
          cakeGroup.rotation.y -= Math.PI * 2;
        },
      });

      lightsRef.current.rotationTween = rotation;
    }
  };

  const handleBlow = () => {
    if (!isLitRef.current || hasBlownRef.current) return;

    hasBlownRef.current = true;
    setHasBlown(true);
    setShowWishStep(false);
    if (lightsRef.current.controls) {
      lightsRef.current.controls.enabled = true;
    }

    lightsRef.current.rotationTween?.kill();
    lightsRef.current.rotationTween = null;

    if (fireworksInstanceRef.current) {
      fireworksInstanceRef.current.stop();
      fireworksInstanceRef.current = null;
    }

    if (fireworksContainerRef.current) {
      fireworksContainerRef.current.innerHTML = "";
    }

    if (fireworksContainerRef.current) {
      const fireworks = new Fireworks(fireworksContainerRef.current, {
        autoresize: true,
        opacity: 0.5,
        acceleration: 1.02,
        friction: 0.94,
        gravity: 1.0,
        particles: 50,
        trace: 3,
        explosion: 10,
        intensity: 5,
        flickering: 50,
        lineStyle: "round",
        sound: {
          enabled: true,
          files: [
            "https://fireworks.js.org/sounds/explosion0.mp3",
            "https://fireworks.js.org/sounds/explosion1.mp3",
            "https://fireworks.js.org/sounds/explosion2.mp3",
          ],
        },
      });

      fireworks.start();
      fireworksInstanceRef.current = fireworks;
    }

    const { ambient, directional, candle, flameMesh } = lightsRef.current;

    const tl = gsap.timeline();

    if (ambient) {
      tl.to(ambient, { intensity: 0.9, duration: 1 }, 0);
    }

    if (directional) {
      tl.to(directional, { intensity: 0.7, duration: 1 }, 0);
    }

    if (candle) {
      tl.to(candle, { intensity: 0, duration: 1 }, 0);
    }

    if (flameMesh) {
      tl.to(
        flameMesh.scale,
        {
          x: 0,
          y: 0,
          z: 0,
          duration: 1,
          ease: "power2.out",
        },
        0,
      );
    }
  };

  const handleReset = () => {
    isLitRef.current = false;
    hasBlownRef.current = false;
    setIsLit(false);
    setHasBlown(false);
    setShowWishStep(false);

    if (wishTimeoutRef.current) {
      clearTimeout(wishTimeoutRef.current);
      wishTimeoutRef.current = null;
    }

    // Matikan musik dan kembalikan ke awal saat reset
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (fireworksInstanceRef.current) {
      fireworksInstanceRef.current.stop();
      fireworksInstanceRef.current = null;
    }
    if (fireworksContainerRef.current) {
      fireworksContainerRef.current.innerHTML = "";
    }

    resetSceneRef.current();
  };

  useEffect(() => {
    const container = containerRef.current;
    const section = sectionRef.current;

    if (!container || !section) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      35,
      container.clientWidth / container.clientHeight,
      0.1,
      100,
    );

    camera.position.set(0, 3, 15);
    camera.lookAt(0, 0, 0);
    lightsRef.current.camera = camera;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: window.devicePixelRatio < 2,
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);

    controls.enabled = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.minDistance = 8;
    controls.maxDistance = 20;
    controls.minPolarAngle = Math.PI * 0.25;
    controls.maxPolarAngle = Math.PI * 0.65;

    lightsRef.current.controls = controls;

    const ambientLight = new THREE.AmbientLight(0xf6e7d2, 0.02);
    scene.add(ambientLight);
    lightsRef.current.ambient = ambientLight;

    const directionalLight = new THREE.DirectionalLight(0xf6e7d2, 0);
    directionalLight.position.set(0, 5, 3);
    scene.add(directionalLight);
    lightsRef.current.directional = directionalLight;

    const candleLight = new THREE.PointLight(0xffa040, 0, 10, 2);
    scene.add(candleLight);
    lightsRef.current.candle = candleLight;

    const cakeGroup = new THREE.Group();
    scene.add(cakeGroup);
    lightsRef.current.cakeGroup = cakeGroup;

    const flame = createFlame();

    flame.mesh.scale.setScalar(0);
    flame.mesh.position.set(0, 1.3, 0);
    cakeGroup.add(flame.mesh);

    lightsRef.current.flameMesh = flame.mesh;

    const loader = new GLTFLoader();

    let disposed = false;
    let cakeTween = null;

    loader.load(
      "/birthday_cake.glb",
      (gltf) => {
        if (disposed) {
          gltf.scene.traverse((object) => {
            if (!object.isMesh) return;

            object.geometry.dispose();

            const materials = Array.isArray(object.material)
              ? object.material
              : [object.material];

            materials.forEach((material) => material?.dispose());
          });

          return;
        }

        const model = gltf.scene;

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        model.position.sub(center);

        const maxSize = Math.max(size.x, size.y, size.z);

        if (maxSize > 0) {
          model.scale.setScalar(3 / maxSize);
        }

        cakeGroup.add(model);
        flame.mesh.position.set(0, 2.3, 0);

        gsap.set(cakeGroup.position, { y: -30 });

        cakeTween = gsap.to(cakeGroup.position, {
          y: -3,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "center center",
            scrub: 1,
            onUpdate: (self) => {
              if (
                self.progress >= 0.99 &&
                isLitRef.current &&
                !hasBlownRef.current
              ) {
                controls.enabled = true;
              }
            },
            onLeaveBack: () => {
              if (!hasBlownRef.current) {
                controls.enabled = false;
              }
            },
          },
        });
      },
      undefined,
      (error) => {
        console.error("Gagal load birthday_cake.glb:", error);
      },
    );

    const clock = new THREE.Clock();
    const flameWorldPosition = new THREE.Vector3();

    let animationId;
    let isVisible = false;

    function animate() {
      if (!isVisible) return;

      animationId = requestAnimationFrame(animate);

      const time = clock.getElapsedTime();

      flame.update(time);

      if (
        isLitRef.current &&
        !hasBlownRef.current &&
        candleLight.intensity > 0
      ) {
        const baseIntensity = 3;
        const flickerAmount = 0.3;

        candleLight.intensity =
          baseIntensity + Math.sin(time * 9) * flickerAmount;
      }

      flame.mesh.getWorldPosition(flameWorldPosition);
      candleLight.position.copy(flameWorldPosition);

      controls.update();
      renderer.render(scene, camera);
    }

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;

        if (isVisible) {
          clock.start();
          animate();
        } else {
          cancelAnimationFrame(animationId);
        }
      },
      { threshold: 0 },
    );

    visibilityObserver.observe(section);

    resetSceneRef.current = () => {
      const { rotationTween, lightTimeline } = lightsRef.current;

      lightTimeline?.kill();
      rotationTween?.kill();

      gsap.killTweensOf(ambientLight);
      gsap.killTweensOf(directionalLight);
      gsap.killTweensOf(candleLight);
      gsap.killTweensOf(flame.mesh.scale);

      lightsRef.current.lightTimeline = null;
      lightsRef.current.rotationTween = null;

      ambientLight.intensity = 0.02;
      directionalLight.intensity = 0;
      candleLight.intensity = 0;

      flame.mesh.scale.setScalar(0);

      cakeGroup.rotation.set(0, 0, 0);

      controls.enabled = false;
      camera.position.set(0, 3, 15);
      controls.target.set(0, 0, 0);
      camera.lookAt(0, 0, 0);
      controls.update();
    };

    const resizeObserver = new ResizeObserver(() => {
      const width = container.clientWidth;
      const height = container.clientHeight;

      if (!width || !height) return;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });

    resizeObserver.observe(container);

    return () => {
      disposed = true;

      cancelAnimationFrame(animationId);
      visibilityObserver.disconnect();
      resizeObserver.disconnect();

      if (audioRef.current) {
        audioRef.current.pause();
      }

      if (wishTimeoutRef.current) {
        clearTimeout(wishTimeoutRef.current);
        wishTimeoutRef.current = null;
      }

      if (fireworksInstanceRef.current) {
        fireworksInstanceRef.current.stop();
      }
      if (fireworksContainerRef.current) {
        fireworksContainerRef.current.innerHTML = "";
      }

      resetSceneRef.current = () => {};

      lightsRef.current.lightTimeline?.kill();
      lightsRef.current.rotationTween?.kill();

      if (cakeTween) {
        cakeTween.scrollTrigger?.kill();
        cakeTween.kill();
      }

      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === section) trigger.kill();
      });

      controls.dispose();
      flame.dispose();
      candleLight.dispose();

      scene.traverse((object) => {
        if (!object.isMesh) return;

        object.geometry.dispose();

        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];

        materials.forEach((material) => material?.dispose());
      });

      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`relative flex h-screen w-full items-center justify-center overflow-hidden transition-colors duration-1000 ${
        hasBlown ? "bg-white" : "bg-black"
      }`}
    >
      {/* Elemen audio HTML bawaan untuk menghindari error cache browser */}
      <audio ref={audioRef} src="/hbd.mp3" preload="auto" loop />

      <div
        ref={fireworksContainerRef}
        className="absolute inset-0 pointer-events-none z-0"
      />

      <div
        ref={containerRef}
        className={`absolute inset-0 z-10 ${!isLit ? "pointer-events-none" : ""}`}
      />

      {isLit && showWishStep && !hasBlown && (
        <div className="wish-message absolute left-1/2 top-40 z-20  whitespace-nowrap text-2xl text-center text-white">
          Make a wish
        </div>
      )}

      {hasBlown && (
        <div className="floating-gallery-reveal absolute  top-60 left-1/2 z-0">
          <GallerySphere/>
        </div>
      )}

      <div className="absolute bottom-10 z-20 flex items-center gap-3">
        {!isLit && (
          <button
            onClick={handleLightUp}
            className="cursor-pointer rounded-full bg-white px-8 py-2 text-xl text-yellow-900 transition-transform hover:scale-105 active:scale-95"
          >
            Light Up!
          </button>
        )}

        {isLit && showWishStep && !hasBlown && (
          <>
            <button
              onClick={handleBlow}
              className="cursor-pointer rounded-full bg-yellow-300 px-8 py-2 text-xl text-yellow-950 transition-transform hover:scale-105 active:scale-95"
            >
              Blow
            </button>
          </>
        )}

        {isLit && hasBlown && (
          <button
            onClick={handleReset}
            className="cursor-pointer rounded-full border border-black/30 bg-black/5 px-8 py-2 text-xl text-black backdrop-blur-md transition-transform hover:scale-105 active:scale-95"
          >
            Reset
          </button>
        )}
      </div>
    </section>
  );
}
