"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { Database, HardDrive, Zap, Layers, Beaker, BrainCircuit, ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";

const lineVariants: Variants = {
  hidden:  { scaleY: 0, opacity: 0 },
  visible: { scaleY: 1, opacity: 1, transition: { duration: 0.8, ease: "easeInOut" } },
};
const nodeVariants: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 15 } },
};

export default function ArchitecturePage() {
  return (
    <main className="min-h-screen bg-cream text-emerald font-body flex flex-col selection:bg-burgundy selection:text-cream">

      {/* Nav */}
      <nav className="w-full flex items-center justify-between px-6 py-5 sticky top-0 z-50 bg-cream/90 backdrop-blur-md border-b border-emerald/10">
        <Link href="/" className="text-emerald/50 hover:text-burgundy transition-colors flex items-center gap-2 text-xs uppercase tracking-widest font-semibold">
          <ArrowLeft className="w-4 h-4" /> Return Home
        </Link>
        <div className="font-heading text-xl tracking-wide text-emerald">
          TrendSense<span className="text-burgundy">.</span>
        </div>
      </nav>

      <div className="w-full max-w-5xl mx-auto pt-20 pb-16 px-4 md:px-8 flex-1">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          className="mb-20 text-center"
        >
          <span className="text-gold text-xs uppercase tracking-[0.25em] font-mono mb-4 block">System Design</span>
          <h1 className="font-heading text-5xl md:text-6xl text-emerald mb-4">
            Architecture <em className="italic text-burgundy not-italic">Topology</em>
          </h1>
          <p className="text-emerald/45 uppercase tracking-widest text-xs font-mono">
            Real-time Data Funnel &amp; Processing Matrix
          </p>
        </motion.div>

        <div className="relative flex flex-col items-center w-full mb-24">

          {/* Level 1 & 2: Two-column funnel */}
          <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-8 md:gap-16 relative z-10">

            {/* Left: Archive path */}
            <div className="flex flex-col items-center w-full relative">
              <motion.div
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={nodeVariants}
                className="w-full max-w-sm bg-white border border-emerald/15 rounded-xl p-6 relative z-20 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-emerald/8 rounded-lg border border-emerald/15">
                    <Database className="w-5 h-5 text-emerald" />
                  </div>
                  <h3 className="font-heading text-xl text-emerald">Data Lake Ingestion</h3>
                </div>
                <p className="font-mono text-sm text-emerald/70 bg-emerald/5 px-3 py-2 rounded border border-emerald/10">
                  6.01 GB Raw Archive (4.7M Rows)
                </p>
              </motion.div>

              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={lineVariants}
                className="w-px h-12 bg-emerald/20 origin-top" />

              <motion.div
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={nodeVariants}
                transition={{ delay: 0.2 }}
                className="w-full max-w-sm bg-white border border-emerald/15 rounded-xl p-6 relative z-20 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-emerald/8 rounded-lg border border-emerald/15">
                    <HardDrive className="w-5 h-5 text-emerald" />
                  </div>
                  <h3 className="font-heading text-xl text-emerald">Out-of-Core ETL</h3>
                </div>
                <p className="font-mono text-xs text-emerald/55 leading-relaxed border-l-2 border-emerald/20 pl-3">
                  Chunked Processing (96 Batches)<br />
                  Regex Scrub<br />
                  IQR Outlier Rejection
                </p>
              </motion.div>
            </div>

            {/* Right: Live stream */}
            <div className="flex flex-col items-center w-full justify-end relative mt-8 md:mt-0">
              <motion.div
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={nodeVariants}
                transition={{ delay: 0.3 }}
                className="w-full max-w-sm bg-white border border-burgundy/25 rounded-xl p-6 relative z-20 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-burgundy/8 rounded-lg border border-burgundy/20">
                    <Zap className="w-5 h-5 text-burgundy" />
                  </div>
                  <h3 className="font-heading text-xl text-emerald">Velocity Stream</h3>
                </div>
                <p className="font-mono text-sm text-emerald/70 bg-burgundy/5 px-3 py-2 rounded border border-burgundy/15">
                  Live MongoDB Reddit Ingestion<br />
                  <span className="text-burgundy font-bold text-xs">(~1,200 records/day)</span>
                </p>
              </motion.div>
            </div>
          </div>

          {/* Merge circuit — desktop */}
          <div className="hidden md:block relative w-full h-24 z-0">
            <motion.div initial={{ scaleY: 0, opacity: 0 }} whileInView={{ scaleY: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.4 }}
              className="absolute left-[25%] top-0 w-px h-12 bg-emerald/25 origin-top" />
            <motion.div initial={{ scaleY: 0, opacity: 0 }} whileInView={{ scaleY: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.4 }}
              className="absolute right-[25%] top-0 w-px h-12 bg-burgundy/40 origin-top" />
            <motion.div initial={{ scaleX: 0, opacity: 0 }} whileInView={{ scaleX: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.4 }}
              className="absolute left-[25%] right-[25%] top-12 h-px bg-gradient-to-r from-emerald/25 to-burgundy/40 origin-left" />
            <motion.div initial={{ scaleY: 0, opacity: 0 }} whileInView={{ scaleY: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 1.0 }}
              className="absolute left-1/2 top-12 w-px h-12 bg-emerald/25 origin-top -translate-x-1/2" />
          </div>

          {/* Merge — mobile */}
          <div className="md:hidden flex flex-col items-center w-full">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={lineVariants}
              className="w-px h-12 bg-emerald/20 origin-top" />
            <div className="text-xs font-mono text-burgundy uppercase tracking-widest my-2 opacity-60">Streams Merging</div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={lineVariants}
              className="w-px h-12 bg-emerald/20 origin-top" />
          </div>

          {/* Level 3: Distillation */}
          <div className="w-full flex justify-center relative z-20">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={nodeVariants}
              transition={{ delay: 0.6 }}
              className="w-full max-w-lg bg-charcoal text-cream p-6 rounded-xl border border-cream/8 shadow-xl relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-gold group-hover:w-1.5 transition-all" />
              <div className="flex flex-col items-center text-center pl-4">
                <div className="p-3 bg-cream/8 border border-cream/10 rounded-full mb-4">
                  <Layers className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-heading text-2xl text-cream mb-2">Data Distillation</h3>
                <p className="font-mono text-sm text-gold bg-gold/10 px-4 py-2 rounded-full border border-gold/25">
                  Global Deduplication → 219,012 High-Signal Parquet Rows
                </p>
              </div>
            </motion.div>
          </div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={lineVariants}
            className="w-px h-16 bg-emerald/20 origin-top relative z-0" />

          {/* Level 4: Feature Engineering */}
          <div className="w-full flex justify-center relative z-20">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={nodeVariants}
              transition={{ delay: 0.7 }}
              className="w-full max-w-md bg-white border border-emerald/15 p-6 rounded-xl shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald/8 rounded-xl border border-emerald/15">
                  <Beaker className="w-6 h-6 text-emerald" />
                </div>
                <div>
                  <h3 className="font-heading text-xl text-emerald mb-1">Feature Engineering</h3>
                  <p className="font-mono text-xs text-emerald/50">22 Total Features<br />(15 Hashed Text Topics, 7 Engineered)</p>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={lineVariants}
            className="w-px h-16 bg-emerald/20 origin-top relative z-0" />

          {/* Level 5: Training */}
          <div className="w-full flex justify-center relative z-20">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={nodeVariants}
              transition={{ delay: 0.8 }}
              className="w-full max-w-lg bg-charcoal text-cream p-8 rounded-2xl shadow-xl relative overflow-hidden border border-burgundy/30"
            >
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="p-4 bg-burgundy/20 rounded-2xl mb-5 border border-burgundy/30">
                  <BrainCircuit className="w-8 h-8 text-burgundy" />
                </div>
                <h3 className="font-heading text-3xl text-cream mb-3">Weighted Training</h3>
                <p className="font-mono text-sm text-gold bg-gold/10 px-5 py-3 rounded-lg border border-gold/25">
                  RandomForest Model with Anti-Temporal Bias Sample Weighting
                </p>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}