"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Database, Fingerprint, BrainCircuit, Rocket } from "lucide-react";

const steps = [
  {
    id: "01",
    title: "Data Ingestion",
    description:
      "Paste your raw social copy, hashtags, and concepts into the Neural Core. The engine instantly strips and formats your input.",
    icon: Database,
  },
  {
    id: "02",
    title: "Vector Analysis",
    description:
      "Our proprietary ML models map your text against millions of historical virality vectors, scoring sentiment and aesthetic resonance.",
    icon: Fingerprint,
  },
  {
    id: "03",
    title: "Oracle Prediction",
    description:
      "Receive a deterministic Virality Index (0–100) alongside granular AI suggestions to optimise your hook and delivery timing.",
    icon: BrainCircuit,
  },
  {
    id: "04",
    title: "Confident Deployment",
    description:
      "Stop guessing. Hit publish knowing your content has been engineered for maximum algorithmic velocity.",
    icon: Rocket,
  },
];

export default function HowItWorks() {
  const lineRef = useRef<HTMLDivElement>(null);

  /* GSAP: draw the center line as user scrolls through section */
  useEffect(() => {
    async function init() {
      const [gsapMod, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      const gsap = gsapMod.gsap ?? gsapMod.default;
      gsap.registerPlugin(ScrollTrigger);

      if (!lineRef.current) return;

      gsap.fromTo(
        lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: lineRef.current,
            start: "top 60%",
            end: "bottom 40%",
            scrub: 1,
          },
        }
      );
    }
    init();
  }, []);

  return (
    <section className="relative w-full py-32 px-6 bg-charcoal overflow-hidden">
      {/* Section rule */}
      <div className="absolute top-0 left-6 right-6 h-px bg-cream/10" />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-24"
        >
          <span className="text-gold text-xs uppercase tracking-[0.25em] font-mono mb-4 block">
            Under the Hood
          </span>
          <h2 className="font-heading text-4xl md:text-5xl text-cream leading-tight">
            The Architecture of{" "}
            <em className="text-burgundy not-italic italic">Virality.</em>
          </h2>
          <p className="text-cream/45 text-lg mt-4 leading-relaxed max-w-xl">
            A transparent look at how we transform raw copy into predictable
            outcomes.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line — GSAP controlled */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-cream/8 -translate-x-1/2 hidden md:block">
            <div
              ref={lineRef}
              className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-gold via-burgundy to-gold origin-top"
            />
          </div>

          <div className="flex flex-col gap-20 relative z-10">
            {steps.map((step, index) => {
              const isEven = index % 2 === 0;
              const Icon = step.icon;

              return (
                <div
                  key={step.id}
                  className="relative flex flex-col md:flex-row items-start md:items-center w-full group"
                >
                  {/* Desktop text — alternates sides */}
                  <div
                    className={`hidden md:flex w-1/2 ${
                      isEven
                        ? "justify-end pr-16 text-right"
                        : "order-last pl-16 text-left"
                    }`}
                  >
                    <motion.div
                      initial={{ opacity: 0, x: isEven ? -24 : 24 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="text-gold font-mono text-sm mb-2 tracking-widest">
                        {step.id} /
                      </div>
                      <h3 className="font-heading text-3xl text-cream mb-3 group-hover:text-gold transition-colors duration-400">
                        {step.title}
                      </h3>
                      <p className="text-cream/40 leading-relaxed max-w-sm text-sm">
                        {step.description}
                      </p>
                    </motion.div>
                  </div>

                  {/* Mobile text */}
                  <div className="md:hidden pl-14 pr-4 pb-8 w-full">
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="text-gold font-mono text-xs mb-1 tracking-widest">
                        {step.id} /
                      </div>
                      <h3 className="font-heading text-2xl text-cream mb-2">
                        {step.title}
                      </h3>
                      <p className="text-cream/40 text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </motion.div>
                  </div>

                  {/* Center node */}
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ type: "spring", stiffness: 120, delay: 0.1 }}
                    className="absolute left-6 md:left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-charcoal border border-cream/15 group-hover:border-gold group-hover:bg-gold/10 flex items-center justify-center transition-all duration-400 z-10"
                  >
                    <Icon
                      className="w-4 h-4 text-cream/40 group-hover:text-gold transition-colors duration-400"
                      strokeWidth={1.5}
                    />
                    {/* Ping ring on hover */}
                    <span className="absolute inset-0 rounded-full border border-gold opacity-0 scale-100 group-hover:scale-150 group-hover:opacity-0 transition-all duration-700" />
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}