"use client";

import { motion, Variants } from "framer-motion";
import { Zap, BrainCircuit, BarChart3, Fingerprint, Sparkles } from "lucide-react";

const mockPrediction = {
  virality_index: 88,
  sentiment_score: 0.65,
  top_features: [
    { keyword: "aesthetic", score: 0.45 },
    { keyword: "routine",   score: 0.38 },
    { keyword: "coffee",    score: 0.22 },
    { keyword: "morning",   score: 0.15 },
  ],
  ai_suggestion:
    "High virality potential detected. The intersection of 'aesthetic' and 'routine' signals strong algorithmic resonance. We recommend pushing this live between 08:00 AM and 09:30 AM EST to maximise initial engagement velocity.",
};

export default function LivePreview() {
  const containerVariants: Variants = {
    hidden:  { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, staggerChildren: 0.18 },
    },
  };

  const itemVariants: Variants = {
    hidden:  { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80 } },
  };

  return (
    <section className="relative w-full py-32 px-6 bg-cream overflow-hidden">
      <div className="absolute top-0 left-6 right-6 h-px bg-emerald/10" />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16"
        >
          <span className="text-gold text-xs uppercase tracking-[0.25em] font-mono mb-4 block">
            Demo
          </span>
          <h2 className="font-heading text-4xl md:text-5xl text-emerald leading-tight">
            Peek Inside the{" "}
            <em className="text-burgundy not-italic italic">Engine.</em>
          </h2>
          <p className="text-emerald/55 text-lg mt-4 leading-relaxed max-w-xl">
            A live look at the telemetry our AI extracts from your raw copy.
          </p>
        </motion.div>

        {/* Dashboard window */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="relative rounded-2xl bg-charcoal text-cream overflow-hidden border border-cream/8 shadow-[0_40px_80px_-20px_rgba(16,17,17,0.5)]"
        >
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-6 py-4 border-b border-cream/8 bg-black/20">
            <div className="w-3 h-3 rounded-full bg-burgundy/80" />
            <div className="w-3 h-3 rounded-full bg-cream/20" />
            <div className="w-3 h-3 rounded-full bg-cream/20" />
            <div className="ml-4 text-xs font-mono tracking-widest text-cream/25 uppercase">
              TrendSense // Prediction Node_01
            </div>
          </div>

          <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* ── Input panel ── */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-2 flex flex-col gap-6"
            >
              <div>
                <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-cream/30 font-mono mb-3">
                  <Fingerprint className="w-3.5 h-3.5" />
                  Raw Input Signal
                </label>
                <div className="bg-black/30 rounded-xl p-5 border border-cream/10">
                  <p className="text-cream/80 leading-relaxed text-sm">
                    &ldquo;romanticizing my morning routine because life is too
                    short for bad coffee and rushed mornings. ☕️✨ #aesthetic&rdquo;
                  </p>
                </div>
              </div>

              {/* Signal processed indicator */}
              <div className="mt-auto w-full py-4 rounded-lg bg-burgundy/20 border border-burgundy/30 flex items-center justify-center gap-2 relative overflow-hidden">
                <div className="absolute inset-0 bg-burgundy/5 animate-pulse" />
                <Zap className="w-4 h-4 text-burgundy relative z-10" />
                <span className="font-mono text-xs tracking-widest uppercase text-burgundy relative z-10">
                  Signal Processed
                </span>
              </div>
            </motion.div>

            {/* ── Output telemetry ── */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-3 flex flex-col gap-6"
            >
              <div className="grid grid-cols-2 gap-5">
                {/* Virality score */}
                <div className="bg-black/35 rounded-xl p-6 border border-cream/10 relative overflow-hidden">
                  <div className="absolute -right-10 -top-10 w-32 h-32 bg-burgundy/15 rounded-full blur-3xl" />
                  <div className="flex items-center gap-2 text-cream/30 text-xs uppercase tracking-widest font-mono mb-3">
                    <BarChart3 className="w-3.5 h-3.5" /> Virality Index
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-heading text-6xl text-cream">
                      {mockPrediction.virality_index}
                    </span>
                    <span className="text-gold font-semibold text-sm">/100</span>
                  </div>
                  <div className="w-full h-0.5 bg-cream/8 rounded-full mt-4 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "88%" }}
                      transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                      viewport={{ once: true }}
                      className="h-full bg-gold"
                    />
                  </div>
                </div>

                {/* Sentiment + vectors */}
                <div className="flex flex-col gap-4">
                  <div className="bg-black/35 rounded-xl p-5 border border-cream/10 flex-1">
                    <div className="text-cream/30 text-xs uppercase tracking-widest font-mono mb-2">
                      Sentiment
                    </div>
                    <div className="text-xl text-cream font-heading">
                      Positive{" "}
                      <span className="text-cream/35 text-base">
                        ({mockPrediction.sentiment_score})
                      </span>
                    </div>
                  </div>
                  <div className="bg-black/35 rounded-xl p-5 border border-cream/10 flex-1">
                    <div className="text-cream/30 text-xs uppercase tracking-widest font-mono mb-3">
                      Influence Vectors
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {mockPrediction.top_features.map((feat) => (
                        <span
                          key={feat.keyword}
                          className="px-3 py-1 rounded-full text-xs border border-cream/15 bg-cream/5 text-cream/70"
                        >
                          {feat.keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Oracle suggestion */}
              <div className="bg-burgundy/15 rounded-xl p-6 border border-burgundy/25 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-burgundy" />
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-burgundy/25">
                    <BrainCircuit className="w-5 h-5 text-burgundy" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-heading text-xl text-cream">
                        The Oracle Says
                      </span>
                      <Sparkles className="w-3.5 h-3.5 text-gold" />
                    </div>
                    <p className="text-cream/60 leading-relaxed text-sm">
                      {mockPrediction.ai_suggestion}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}