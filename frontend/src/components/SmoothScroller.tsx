"use client";

/**
 * SmoothScroller
 * – Initialises Lenis smooth scroll
 * – Feeds RAF ticks into GSAP so ScrollTrigger stays in sync
 * – Must wrap the entire <body> children
 *
 * Install deps (already in package.json after you run):
 *   npm install lenis gsap
 */

import { useEffect, useRef } from "react";

export default function SmoothScroller({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<unknown>(null);

  useEffect(() => {
    let lenis: {
      raf: (t: number) => void;
      destroy: () => void;
    } | null = null;
    let gsap: any = null;
    let ScrollTrigger: any = null;
    let rafId: number;

    async function init() {
      // Dynamic imports so SSR never touches these
      const [{ default: Lenis }, gsapModule, { ScrollTrigger: ST }] =
        await Promise.all([
          import("lenis"),
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);

      gsap = gsapModule.gsap ?? gsapModule.default;
      ScrollTrigger = ST;

      // Register plugin
      if (gsap && ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
      }

      lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
      });

      lenisRef.current = lenis;

      function raf(time: number) {
        lenis!.raf(time);
        if (ScrollTrigger) ScrollTrigger.update();
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);
    }

    init();

    return () => {
      cancelAnimationFrame(rafId);
      lenis?.destroy();
    };
  }, []);

  return <>{children}</>;
}