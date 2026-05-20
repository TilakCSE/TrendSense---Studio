"use client";

import { useEffect, useRef } from "react";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import Features from "@/components/Features";
import LivePreview from "@/components/LivePreview";
import Pricing from "@/components/Pricing";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";
import Testimonials from "@/components/Testimonials";

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const orbARef = useRef<HTMLDivElement>(null);
  const orbBRef = useRef<HTMLDivElement>(null);

  /* ── GSAP parallax ONLY on the background orbs, NOT the headline ── */
  useEffect(() => {
    async function initGsap() {
      const [gsapModule, { ScrollTrigger: ST }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const gsap = (gsapModule as any).gsap ?? gsapModule.default;
      gsap.registerPlugin(ST);

      if (!gsap || !heroRef.current) return;

      if (orbARef.current) {
        gsap.to(orbARef.current, {
          y: -120,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 2,
          },
        });
      }

      if (orbBRef.current) {
        gsap.to(orbBRef.current, {
          y: -60,
          x: 30,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 3,
          },
        });
      }
    }

    initGsap();
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.18, delayChildren: 0.25 },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 28, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 90, damping: 14 },
    },
  };

  return (
    <main className="relative w-full overflow-x-hidden bg-cream">

      {/* ═══════════════ HERO ═══════════════ */}
      <div
        ref={heroRef}
        className="relative w-full h-screen overflow-hidden bg-cream"
      >
        {/* Background orbs — parallax only here, NO framer-motion */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div
            ref={orbARef}
            className="absolute top-[15%] right-[10%] w-[600px] h-[600px] rounded-full opacity-[0.12]"
            style={{
              background: "radial-gradient(circle, #154230 0%, transparent 65%)",
              filter: "blur(60px)",
            }}
          />
          <div
            ref={orbBRef}
            className="absolute bottom-[10%] left-[5%] w-[500px] h-[500px] rounded-full opacity-[0.10]"
            style={{
              background: "radial-gradient(circle, #5D1E21 0%, transparent 65%)",
              filter: "blur(80px)",
            }}
          />
          {/* Subtle dot grid */}
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage: "radial-gradient(#154230 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Nav */}
        <nav className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center py-6 px-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="font-heading text-3xl font-bold tracking-tighter text-emerald"
          >
            TrendSense.
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Link
              href="/dashboard"
              className="text-sm uppercase tracking-widest font-semibold text-emerald hover:text-burgundy transition-colors duration-300"
            >
              Enter App
            </Link>
          </motion.div>
        </nav>

        {/* Hero content — plain div, no GSAP attached, no disappearing */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 max-w-7xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center max-w-4xl mx-auto flex flex-col items-center"
          >
            {/* Oracle pill */}
            <motion.span
              variants={itemVariants}
              className="inline-block py-1.5 px-4 rounded-full border border-emerald/25 text-emerald/60 text-xs uppercase tracking-[0.2em] mb-8"
            >
              The Oracle is Online
            </motion.span>

            {/* H1 */}
            <motion.h1
              variants={itemVariants}
              className="font-heading text-6xl md:text-8xl lg:text-[7rem] leading-[0.88] tracking-tight text-emerald mb-8"
            >
              Predict the
              <br />
              <em className="text-burgundy not-italic italic">Unpredictable.</em>
            </motion.h1>

            {/* Sub */}
            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-emerald/55 max-w-2xl mb-12 leading-relaxed"
            >
              We don&apos;t chase trends, we engineer them. Feed the engine your
              content and let our AI isolate the signals of virality before you
              hit post.
            </motion.p>

            {/* CTA */}
            <motion.div variants={itemVariants}>
              <Link
                href="/dashboard"
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-charcoal text-cream overflow-hidden rounded-sm transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-charcoal/20"
              >
                <div className="absolute inset-0 w-0 bg-burgundy transition-all duration-300 ease-out group-hover:w-full" />
                <span className="relative text-sm font-semibold uppercase tracking-widest flex items-center gap-2">
                  Launch Engine
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="square" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-emerald/30"
        >
          <div className="w-px h-12 bg-gradient-to-b from-transparent to-emerald/30" />
          <span className="text-[10px] uppercase tracking-[0.3em] font-mono">Scroll</span>
        </motion.div>
      </div>

      {/* ══ Sections ══ */}
      <Testimonials />
      <Features />
      <HowItWorks />
      <LivePreview />
      <Pricing />
      <Footer />
    </main>
  );
}