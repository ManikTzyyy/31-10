"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";
import { createFlame } from "./Flame";

gsap.registerPlugin(ScrollTrigger);

export default function CakeScene() {
  const containerRef = useRef(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const section = sectionRef.current;

    if (!container || !section) return;

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      35,
      container.clientWidth / container.clientHeight,
      0.1,
      100,
    );

    camera.position.set(0, 3, 15);
    camera.lookAt(0, 0, 0);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    renderer.setSize(container.clientWidth, container.clientHeight);

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    container.appendChild(renderer.domElement);

    // 4. Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0));

    const light = new THREE.DirectionalLight(0xf6e7d2, 3);
    const lightHelper = new THREE.DirectionalLightHelper(
      light,
      1, // ukuran helper
      0xff0000, // warna garis
    );

    scene.add(lightHelper);

    light.position.set(3, 5, 5);
    scene.add(light);

    // Cahaya tambahan dari api
    const candleLight = new THREE.PointLight(
      0xffa040, // warna oranye hangat
      100, // intensity
      10, // distance / jangkauan cahaya
      2, //decay
    );

    scene.add(candleLight);

    // 5. Group untuk kue dan api
    const cakeGroup = new THREE.Group();
    scene.add(cakeGroup);

    // 6. Buat api dan pasang ke group kue
    const flame = createFlame();

    flame.mesh.scale.setScalar(0.2);

    flame.mesh.position.set(0, 1.3, 0);
    cakeGroup.add(flame.mesh);

    // 7. Load model kue
    const loader = new GLTFLoader();

    let disposed = false;

    loader.load(
      "/birthday_cake.glb",
      (gltf) => {
        if (disposed) {
          gltf.scene.traverse((object) => {
            if (object.isMesh) {
              object.geometry.dispose();

              const materials = Array.isArray(object.material)
                ? object.material
                : [object.material];

              materials.forEach((material) => {
                material?.dispose();
              });
            }
          });

          return;
        }

        const model = gltf.scene;

        // Hitung ukuran dan titik tengah model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        model.position.sub(center);

        // Normalisasi ukuran model
        const maxSize = Math.max(size.x, size.y, size.z);

        if (maxSize > 0) {
          model.scale.setScalar(3 / maxSize);
        }

        cakeGroup.add(model);

        // Posisi api relatif terhadap group kue
        // Ubah nilai Y sesuai tinggi lilin pada model lu
        flame.mesh.position.set(0, 2.3, 0);

        // Posisi awal kue
        gsap.set(cakeGroup.position, {
          y: -30,
        });

        // Naik saat scroll
        gsap.to(cakeGroup.position, {
          y: -3,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "center center",
            scrub: 1,
          },
        });
      },
      undefined,
      (error) => {
        console.error("Gagal load birthday_cake.glb:", error);
      },
    );

    // 8. Animasi api + render scene
    const clock = new THREE.Clock();
    let animationId;

    function animate() {
      animationId = requestAnimationFrame(animate);

      const time = clock.getElapsedTime();

      // Animasi api
      flame.update(time);

      // Cahaya berkedip
      candleLight.intensity = 2.5 + Math.sin(time * 9) * 0.25;

      // Cahaya mengikuti api
      candleLight.position.set(
        flame.mesh.position.x,
        flame.mesh.position.y,
        flame.mesh.position.z,
      );

      renderer.render(scene, camera);
    }

    animate();

    // 9. Resize
    const resizeObserver = new ResizeObserver(() => {
      const width = container.clientWidth;
      const height = container.clientHeight;

      if (!width || !height) return;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    });

    resizeObserver.observe(container);

    // 10. Cleanup
    return () => {
      disposed = true;

      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();

      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === section) {
          trigger.kill();
        }
      });

      gsap.killTweensOf(cakeGroup.position);

      flame.dispose();

      scene.traverse((object) => {
        if (object.isMesh) {
          object.geometry.dispose();

          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];

          materials.forEach((material) => {
            material?.dispose();
          });
        }
      });

      candleLight.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-black"
    >
      <div ref={containerRef} className="absolute inset-0" />
    </section>
  );
}
