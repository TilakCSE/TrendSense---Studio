"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Activity, BrainCircuit, Globe } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative w-full flex flex-col items-center overflow-hidden">
      
      {/* ---------------- BACKGROUND EFFECTS ---------------- */}
      {/* Vercel-style subtle grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      
      {/* Top ambient glow */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* ---------------- NAVIGATION ---------------- */}
      <nav className="w-full max-w-7xl mx-auto h-20 flex items-center justify-between px-6 lg:px-12 relative z-50">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-sm shadow-[0_0_15px_rgba(6,182,212,0.4)]" />
          <span className="font-mono text-sm font-bold text-white tracking-tighter">TRENDSENSE.IO</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <Link href="/#features" className="hover:text-white transition-colors">Platform</Link>
          <Link href="/team" className="hover:text-white transition-colors">Team</Link>
        </div>

        <Link 
          href="/dashboard"
          className="h-9 px-5 rounded-full bg-white text-black text-sm font-semibold flex items-center gap-2 hover:bg-zinc-200 transition-all hover:scale-105"
        >
          Launch App <ArrowRight className="w-4 h-4" />
        </Link>
      </nav>

      {/* ---------------- HERO SECTION ---------------- */}
      <main className="w-full max-w-7xl mx-auto flex flex-col items-center text-center pt-32 pb-24 px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center max-w-4xl"
        >
          <a href="/dashboard" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors mb-8 cursor-pointer">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-xs font-mono text-zinc-300 uppercase tracking-widest">TrendSense Engine v2.0 Live</span>
            <ArrowRight className="w-3 h-3 text-zinc-500 ml-1" />
          </a>
          
          <h1 className="text-5xl md:text-8xl font-bold text-white tracking-tighter leading-[1.05] mb-8">
            Predict virality <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-cyan-200 to-cyan-500">
              before you publish.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-12 leading-relaxed font-light">
            Stop guessing the algorithm. TrendSense uses localized NLP and temporal modeling to grade your content's resonance in real-time.
          </p>

          <Link 
            href="/dashboard"
            className="group relative h-14 inline-flex items-center justify-center gap-3 px-8 bg-cyan-500 text-black rounded-full font-semibold text-lg hover:bg-cyan-400 transition-all shadow-[0_0_40px_rgba(6,182,212,0.3)] hover:shadow-[0_0_60px_rgba(6,182,212,0.5)]"
          >
            Access Neural Core
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </main>

      {/* ---------------- FEATURE GRID ---------------- */}
      <section id="features" className="w-full max-w-7xl mx-auto py-24 px-6 lg:px-12 border-t border-white/[0.05]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<BrainCircuit className="w-5 h-5 text-cyan-400" />}
            title="Semantic Weighting"
            desc="Deep learning assigns precise influence scores to trending terminology against real-time API lexicons."
          />
          <FeatureCard 
            icon={<Activity className="w-5 h-5 text-zinc-100" />}
            title="Temporal Decay"
            desc="Algorithms calculate content decay rates based on exact publication hours and regional timezones."
          />
          <FeatureCard 
            icon={<Globe className="w-5 h-5 text-zinc-400" />}
            title="VADER Sentiment"
            desc="Maps emotional polarity to predict audience engagement velocity with 85% verified accuracy."
          />
        </div>
      </section>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="w-full border-t border-white/[0.05] py-12 px-6 lg:px-12 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs font-mono text-zinc-600">
          <p>© 2026 TrendSense Studio. Engineered for scale.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="/docs" className="hover:text-zinc-300 transition-colors">Documentation</Link>
            <Link href="/legal" className="hover:text-zinc-300 transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 rounded-2xl border border-white/5 bg-[#09090B] hover:bg-white/[0.02] transition-colors group">
      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg text-white font-medium mb-3 tracking-tight">{title}</h3>
      <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
    </div>
  );
}