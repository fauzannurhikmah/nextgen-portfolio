"use client";
import { useEffect, useRef } from "react";

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cx = window.innerWidth / 2;
    let cy = window.innerHeight / 2;
    let rx = cx, ry = cy;

    const onMove = (e: MouseEvent) => { cx = e.clientX; cy = e.clientY; };
    document.addEventListener("mousemove", onMove);

    let raf: number;
    const tick = () => {
      rx += (cx - rx) * 0.15;
      ry += (cy - ry) * 0.15;
      if (dotRef.current) {
        dotRef.current.style.left = cx + "px";
        dotRef.current.style.top = cy + "px";
      }
      if (ringRef.current) {
        ringRef.current.style.left = rx + "px";
        ringRef.current.style.top = ry + "px";
      }
      raf = requestAnimationFrame(tick);
    };
    tick();

    const addHover = () => document.body.classList.add("cursor-hover");
    const removeHover = () => document.body.classList.remove("cursor-hover");
    const targets = document.querySelectorAll("a, button, [data-hover]");
    targets.forEach(el => {
      el.addEventListener("mouseenter", addHover);
      el.addEventListener("mouseleave", removeHover);
    });

    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div id="cursor-wrap" className="pointer-events-none fixed top-0 left-0 z-[9999]" style={{ mixBlendMode: "difference" }}>
      {/* Dot */}
      <div
        ref={dotRef}
        className="fixed w-2 h-2 rounded-full bg-cream -translate-x-1/2 -translate-y-1/2 transition-[width,height] duration-200"
      />
      {/* Ring */}
      <div
        ref={ringRef}
        className="fixed w-10 h-10 rounded-full border border-cream/50 -translate-x-1/2 -translate-y-1/2 transition-[width,height] duration-300"
      />
    </div>
  );
}
