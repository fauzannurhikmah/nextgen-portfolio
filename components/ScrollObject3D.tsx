"use client";
/**
 * ScrollObject3D — a floating 3D geometric shape that travels
 * across the page as you scroll, moving from section to section.
 *
 * It lives in a fixed overlay. Its position on screen is lerped
 * toward a target that changes based on which section is in view.
 */
import { useEffect, useRef } from "react";

const SECTIONS = ["#hero", "#about", "#skills", "#projects", "#experience", "#contact"];

// Target screen positions (vw%, vh%) and rotation config per section
const WAYPOINTS = [
  { x: 75, y: 55, scale: 1.0,  rotX: 0,    rotY: 0    },   // hero
  { x: 80, y: 45, scale: 0.7,  rotX: 0.4,  rotY: 0.6  },   // about
  { x: 12, y: 38, scale: 0.6,  rotX: -0.3, rotY: 1.2  },   // skills
  { x: 82, y: 60, scale: 0.75, rotX: 0.6,  rotY: -0.8 },   // projects
  { x: 15, y: 50, scale: 0.55, rotX: 0.8,  rotY: 0.4  },   // experience
  { x: 50, y: 40, scale: 0.9,  rotX: 0.2,  rotY: 2.0  },   // contact
];

export default function ScrollObject3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let animId: number;

    (async () => {
      const THREE = (await import("three")).default ?? await import("three");
      const canvas = canvasRef.current;
      if (!canvas) return;

      const SIZE = 180;  // canvas px
      canvas.width  = SIZE;
      canvas.height = SIZE;

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
      renderer.setSize(SIZE, SIZE);

      const scene  = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      camera.position.z = 5;

      /* Icosahedron wireframe + solid layers */
      const geo = new THREE.IcosahedronGeometry(1.4, 1);

      // Solid inner
      const solidMat = new THREE.MeshStandardMaterial({
        color: 0x050810, metalness: 0.9, roughness: 0.1,
        transparent: true, opacity: 0.85,
      });
      scene.add(new THREE.Mesh(geo, solidMat));

      // Wireframe outer
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0xe8ff47, wireframe: true, transparent: true, opacity: 0.6,
      });
      scene.add(new THREE.Mesh(geo, wireMat));

      // Second larger wireframe — teal
      const geo2    = new THREE.IcosahedronGeometry(1.8, 1);
      const wireMat2 = new THREE.MeshBasicMaterial({
        color: 0x00d4c8, wireframe: true, transparent: true, opacity: 0.2,
      });
      scene.add(new THREE.Mesh(geo2, wireMat2));

      // Glow point light inside
      const pl = new THREE.PointLight(0xe8ff47, 4, 6);
      pl.position.set(0, 0, 0);
      scene.add(pl);
      scene.add(new THREE.AmbientLight(0xffffff, 0.4));
      const dl = new THREE.DirectionalLight(0x00d4c8, 2);
      dl.position.set(3, 4, 3);
      scene.add(dl);

      /* ── scroll-driven position + rotation state ── */
      let currentX   = WAYPOINTS[0].x;
      let currentY   = WAYPOINTS[0].y;
      let currentS   = WAYPOINTS[0].scale;
      let targetX    = WAYPOINTS[0].x;
      let targetY    = WAYPOINTS[0].y;
      let targetS    = WAYPOINTS[0].scale;
      let targetRotX = 0;
      let targetRotY = 0;
      let currentRotX = 0;
      let currentRotY = 0;
      let t = 0;

      const getActiveSectionIndex = () => {
        let best = 0;
        let bestVis = 0;
        SECTIONS.forEach((sel, i) => {
          const el = document.querySelector(sel) as HTMLElement;
          if (!el) return;
          const rect = el.getBoundingClientRect();
          const vis  = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
          if (vis > bestVis) { bestVis = vis; best = i; }
        });
        return best;
      };

      const onScroll = () => {
        const i = getActiveSectionIndex();
        const wp = WAYPOINTS[i];
        targetX    = wp.x;
        targetY    = wp.y;
        targetS    = wp.scale;
        targetRotX = wp.rotX;
        targetRotY = wp.rotY;
      };
      window.addEventListener("scroll", onScroll, { passive: true });

      const render = () => {
        animId = requestAnimationFrame(render);
        t += 0.012;

        // Smooth lerp toward target
        const lerpF = 0.04;
        currentX    += (targetX - currentX) * lerpF;
        currentY    += (targetY - currentY) * lerpF;
        currentS    += (targetS - currentS) * lerpF;
        currentRotX += (targetRotX - currentRotX) * lerpF;
        currentRotY += (targetRotY - currentRotY) * lerpF;

        // Position the canvas in the fixed overlay
        const half = SIZE / 2;
        canvas.style.left = `calc(${currentX}vw - ${half}px)`;
        canvas.style.top  = `calc(${currentY}vh - ${half}px)`;
        canvas.style.transform = `scale(${currentS})`;

        // Rotate the mesh
        scene.children.forEach((c) => {
          if (c instanceof THREE.Mesh) {
            c.rotation.x = currentRotX + Math.sin(t * 0.7) * 0.12;
            c.rotation.y = currentRotY + t * 0.4;
          }
        });

        // Pulse light
        pl.intensity = 3 + Math.sin(t * 2.5) * 1.5;
        wireMat.opacity = 0.5 + Math.sin(t * 1.8) * 0.15;

        renderer.render(scene, camera);
      };
      render();

      return () => {
        window.removeEventListener("scroll", onScroll);
        cancelAnimationFrame(animId);
        renderer.dispose();
      };
    })();

    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    /* Fixed overlay — pointer-events-none so it never blocks interaction */
    <div className="fixed inset-0 z-[50] pointer-events-none overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute"
        style={{
          width: 180, height: 180,
          filter: "drop-shadow(0 0 18px rgba(232,255,71,0.25)) drop-shadow(0 0 4px rgba(0,212,200,0.2))",
          transition: "opacity 0.5s",
        }}
      />
    </div>
  );
}
