"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "TrendSense caught the 'quiet luxury' shift three weeks before it trended on TikTok. It fundamentally changed our content strategy.",
    author: "Julian Reed",
    role: "Creative Director, Studio Blanc",
  },
  {
    quote:
      "The Virality Index isn't just a gimmick. We run every draft through the Neural Core. Our engagement velocity is up 400% this quarter.",
    author: "Maya Patel",
    role: "Head of Growth, Vanguard Media",
  },
  {
    quote:
      "It feels like cheating. The AI Oracle suggested moving our post window by two hours and swapping one keyword. The video hit 2.4M views.",
    author: "David Chen",
    role: "Independent Creator",
  },
  {
    quote:
      "We used to guess what would resonate based on gut feeling. Now we use deterministic data. TrendSense is the ultimate unfair advantage.",
    author: "Elena Vasquez",
    role: "Brand Strategist",
  },
  {
    quote:
      "The interface is gorgeous, but the telemetry is what keeps us here. Being able to isolate specific influence vectors is invaluable.",
    author: "Samir Vance",
    role: "Founder, Apex Social",
  },
];

export default function Testimonials() {
  const doubled = [...testimonials, ...testimonials];

  return (
    <section className="relative w-full py-28 bg-cream overflow-hidden border-b border-emerald/10">
      {/* Section label + heading */}
      <div className="max-w-7xl mx-auto px-6 mb-14 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-gold text-xs uppercase tracking-[0.25em] font-mono mb-3 block">
            The Vanguard
          </span>
          <h2 className="font-heading text-3xl md:text-4xl text-emerald">
            Trusted by the{" "}
            <em className="text-burgundy not-italic italic">Elite.</em>
          </h2>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-emerald/35 text-xs uppercase tracking-widest font-mono hidden md:block"
        >
          Live Telemetry / Active Users
        </motion.p>
      </div>

      {/* Infinite marquee */}
      <div className="relative w-full flex items-center overflow-hidden">
        {/* Fade masks */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-cream to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-cream to-transparent z-10 pointer-events-none" />

        {/* Track */}
        <div
          className="flex gap-5 pl-5"
          style={{
            animation: "marquee 50s linear infinite",
            width: "max-content",
          }}
        >
          {doubled.map((t, idx) => (
            <div
              key={idx}
              className="w-[340px] md:w-[420px] shrink-0 bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-emerald/10 hover:border-burgundy/25 hover:bg-white/90 transition-all duration-400 group"
            >
              <Quote
                className="w-7 h-7 text-gold/40 mb-5 group-hover:text-gold/70 transition-colors"
                strokeWidth={1.5}
              />
              <p className="text-emerald text-base md:text-lg leading-relaxed font-heading mb-7">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex flex-col">
                <span className="text-charcoal font-semibold text-xs uppercase tracking-wider">
                  {t.author}
                </span>
                <span className="text-emerald/40 text-xs font-mono mt-1">
                  {t.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}