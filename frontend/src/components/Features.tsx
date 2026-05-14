"use client";

import { useEffect, useRef } from "react";
import { motion, Variants } from "framer-motion";
import { Activity, Sparkles, Radar } from "lucide-react";

const featuresData = [
  {
    id: 1,
    title: "Real-time Analysis",
    description:
      "Process live social signals and engagement velocity in milliseconds before you ever hit publish.",
    icon: Activity,
    tag: "01",
  },
  {
    id: 2,
    title: "The AI Oracle",
    description:
      "Consult our proprietary neural net for data-driven copy adjustments and precise optimal posting windows.",
    icon: Sparkles,
    tag: "02",
  },
  {
    id: 3,
    title: "Signal Detection",
    description:
      "Identify granular micro-trends and aesthetic shifts before they hit the mainstream trajectory.",
    icon: Radar,
    tag: "03",
  },
];

export default function Features() {
  const sectionRef = useRef<HTMLElement>(null);

  /* GSAP: section bg color shifts as it enters viewport */
  useEffect(() => {
    async function init() {
      const [gsapMod, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      const gsap = gsapMod.gsap ?? gsapMod.default;
      gsap.registerPlugin(ScrollTrigger);
    }
    init();
  }, []);

  const containerVariants: Variants = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const cardVariants: Variants = {
    hidden:  { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 70, damping: 16 },
    },
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-32 px-6 bg-cream overflow-hidden z-10"
    >
      {/* Subtle section rule */}
      <div className="absolute top-0 left-6 right-6 h-px bg-emerald/10" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-20 max-w-xl"
        >
          {/* Label */}
          <span className="text-gold text-xs uppercase tracking-[0.25em] font-mono mb-4 block">
            Core Architecture
          </span>
          <h2 className="font-heading text-4xl md:text-5xl text-emerald leading-tight">
            Engineered for{" "}
            <em className="text-burgundy not-italic italic">Precision.</em>
          </h2>
          <p className="text-emerald/55 text-lg mt-4 leading-relaxed">
            Stop guessing what works. Our architecture translates chaotic social
            data into deterministic outcomes.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-px bg-emerald/10 rounded-2xl overflow-hidden border border-emerald/10"
        >
          {featuresData.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                variants={cardVariants}
                className="group relative bg-cream p-10 transition-colors duration-500 hover:bg-emerald"
              >
                {/* Step tag */}
                <div className="font-mono text-xs text-emerald/25 group-hover:text-cream/30 uppercase tracking-widest mb-8 transition-colors duration-500">
                  {feature.tag} /
                </div>

                {/* Icon */}
                <div className="mb-8">
                  <div className="w-12 h-12 rounded-full border border-emerald/20 group-hover:border-cream/20 flex items-center justify-center transition-colors duration-500">
                    <Icon
                      className="w-5 h-5 text-burgundy group-hover:text-gold transition-colors duration-500"
                      strokeWidth={1.5}
                    />
                  </div>
                </div>

                <h3 className="font-heading text-2xl text-charcoal group-hover:text-cream mb-3 transition-colors duration-500">
                  {feature.title}
                </h3>
                <p className="text-emerald/55 group-hover:text-cream/55 leading-relaxed transition-colors duration-500 text-sm">
                  {feature.description}
                </p>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-10 w-0 h-px bg-gold group-hover:w-12 transition-all duration-500" />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}