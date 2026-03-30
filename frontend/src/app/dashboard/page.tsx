"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Loader2, AlertCircle, TrendingUp, MessageSquare, Lightbulb, BarChart3, Command as CommandIcon } from "lucide-react";
import { usePrediction } from "@/hooks/usePrediction";
import { useIsMounted } from "@/hooks/useIsMounted";
import { extractKeywords } from "@/lib/analyzer";
import { CommandMenu } from "@/components/CommandMenu";
import { FrostedCore } from "@/components/3D/FrostedCore";

// ---------------------------------------------------------------------------
// Helpers & Animation Variants
// ---------------------------------------------------------------------------

function sentimentLabel(score: number): { label: string; color: string } {
  if (score > 0.1) return { label: "Positive", color: "text-emerald-400" };
  if (score < -0.1) return { label: "Negative", color: "text-red-400" };
  return { label: "Neutral", color: "text-amber-400" };
}

const WEIGHT_COLOR: Record<string, string> = {
  high: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  medium: "bg-zinc-700/50 text-zinc-300 border-zinc-600/40",
  low: "bg-zinc-800/50 text-zinc-500 border-zinc-700/30",
};

// Orchestrates the "cascade" effect for the list items
const listContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, 
      delayChildren: 0.4,    
    },
  },
};

// The spring animation for the progress bars
const barVariants: Variants = {
  hidden: { width: 0, opacity: 0 },
  show: (targetWidth: number) => ({
    width: `${targetWidth}%`,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 60,
      damping: 15,
      mass: 1,
    },
  }),
};

const textFadeVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function Dashboard() {
  const [postText, setPostText] = useState("");
  const { status, data, error, predict, reset } = usePrediction();
  const isMounted = useIsMounted();

  const handlePredict = useCallback(() => {
    predict(postText);
  }, [predict, postText]);

  const handleClear = useCallback(() => {
    setPostText("");
    reset();
  }, [reset]);

  const keywords = data ? extractKeywords(data.top_features) : [];
  const sentiment = data ? sentimentLabel(data.sentiment_score) : null;

  return (
    <>
      <CommandMenu onPredict={handlePredict} onClear={handleClear} />

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 pt-10">
        
        {/* LEFT COLUMN: Input */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white tracking-tight leading-tight">
              Intelligence Engine.
            </h1>
            <p className="text-sm text-zinc-500 max-w-xs leading-relaxed">
              Draft your content. The neural oracle simulates market resonance
              in real time.
            </p>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 rounded-xl border border-white/[0.06] group-focus-within:border-cyan-500/30 transition-colors duration-300 pointer-events-none" />
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="Type your content here…"
              maxLength={500}
              disabled={status === "loading"}
              className="w-full h-56 px-4 pt-4 pb-10 bg-[#09090B] rounded-xl text-sm text-zinc-200 placeholder:text-zinc-700 font-mono resize-none outline-none disabled:opacity-50 transition-opacity"
            />
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between pointer-events-none">
              <span className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest">
                {postText.length}/500 chars
              </span>
              <span className="text-[10px] font-mono text-zinc-700 flex items-center gap-1">
                <CommandIcon className="w-2.5 h-2.5" />K to predict
              </span>
            </div>
          </div>

          {isMounted && (
            <button
              onClick={handlePredict}
              disabled={status === "loading" || !postText.trim()}
              className="relative h-10 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-[13px] font-mono text-zinc-300 uppercase tracking-widest hover:bg-white/10 hover:border-white/20 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 flex items-center justify-center gap-2 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Analyzing…
                </>
              ) : (
                "Run Prediction"
              )}
            </button>
          )}

          <AnimatePresence>
            {status === "error" && error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-3 p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-red-400"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="text-xs font-mono leading-relaxed">{error.message}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* RIGHT COLUMN: Results */}
        <section className="lg:col-span-7">
          <AnimatePresence mode="wait">
            
            {/* IDLE STATE */}
            {status === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-xl border border-white/5 bg-[#09090B] min-h-[400px] flex flex-col items-center justify-center gap-3"
              >
                <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-zinc-700" />
                </div>
                <p className="text-[11px] font-mono text-zinc-700 uppercase tracking-[0.2em]">
                  Awaiting Neural Flux…
                </p>
              </motion.div>
            )}

            {/* LOADING STATE */}
            {status === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="rounded-xl border border-white/5 bg-[#09090B] min-h-[200px] flex flex-col items-center justify-center gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full border border-cyan-500/30 animate-ping absolute inset-0" />
                    <div className="w-10 h-10 rounded-full border border-cyan-500/60 flex items-center justify-center relative">
                      <Loader2 className="w-4 h-4 text-cyan-500 animate-spin" />
                    </div>
                  </div>
                  <p className="text-[11px] font-mono text-zinc-600 uppercase tracking-widest">
                    Running inference…
                  </p>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-[#09090B] p-6">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-3">
                    <Lightbulb className="w-3 h-3" />
                    Oracle Advice
                  </div>
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="flex items-center gap-2 text-sm text-zinc-600 font-mono"
                  >
                    Consulting archives…
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* SUCCESS STATE */}
            {status === "success" && data && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {/* 3D Frosted Glass Core */}
                {isMounted && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="rounded-xl border border-white/[0.06] bg-[#09090B] overflow-hidden relative"
                  >
                    <div className="absolute top-4 left-4 z-10">
                      <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                        Neural Core — Virality Modulation
                      </p>
                    </div>
                    <FrostedCore viralityIndex={data.virality_index} className="w-full h-[280px]" />
                  </motion.div>
                )}

                {/* Metrics Card */}
                <div className="rounded-xl border border-white/[0.06] bg-[#09090B] overflow-hidden">
                  
                  {/* Top metrics bar */}
                  <div className="grid grid-cols-2 divide-x divide-white/[0.06] border-b border-white/[0.06]">
                    
                    {/* Virality Score */}
                    <div className="p-6 flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
                        <TrendingUp className="w-3 h-3" />
                        Virality Index
                      </div>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-4xl font-bold text-white tabular-nums">
                          {Math.round(data.virality_index)}
                        </span>
                        <span className="text-sm text-zinc-600 font-mono">/100</span>
                      </div>
                      <div className="mt-2 h-[2px] w-full rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${data.virality_index}%` }}
                          transition={{ type: "spring", stiffness: 50, damping: 20, delay: 0.2 }}
                          className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300"
                        />
                      </div>
                    </div>

                    {/* Sentiment */}
                    <div className="p-6 flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
                        <MessageSquare className="w-3 h-3" />
                        Sentiment
                      </div>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className={`text-3xl font-bold tabular-nums ${sentiment?.color}`}>
                          {data.sentiment_score > 0 ? "+" : ""}
                          {data.sentiment_score.toFixed(2)}
                        </span>
                      </div>
                      <span className={`text-xs font-mono mt-1 ${sentiment?.color}`}>
                        {sentiment?.label}
                      </span>
                    </div>
                  </div>

                  {/* Signal Features — Animated cascade */}
                  {keywords.length > 0 && (
                    <div className="p-6 border-b border-white/[0.06]">
                      <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-4">
                        Signal Features
                      </p>
                      
                      <motion.div 
                        variants={listContainerVariants}
                        initial="hidden"
                        animate="show"
                        className="space-y-4"
                      >
                        {keywords.map((kw, idx) => {
                          const maxScore = Math.max(...keywords.map((k) => k.score));
                          const percentage = (kw.score / maxScore) * 100;

                          return (
                            <div key={kw.keyword} className="space-y-2">
                              <motion.div variants={textFadeVariants} className="flex items-center justify-between">
                                <span className={`text-[11px] font-mono ${WEIGHT_COLOR[kw.weight].split(' ')[1]}`}>
                                  {kw.keyword.replace(/_/g, " ")}
                                </span>
                                <span className="text-[10px] font-mono text-zinc-600 tabular-nums">
                                  {kw.score.toFixed(2)}
                                </span>
                              </motion.div>
                              
                              <div className="h-[2px] w-full bg-white/5 overflow-hidden">
                                <motion.div
                                  custom={percentage}
                                  variants={barVariants}
                                  className={`h-full ${
                                    kw.weight === "high" ? "bg-cyan-500" :
                                    kw.weight === "medium" ? "bg-zinc-500" :
                                    "bg-zinc-700"
                                  }`}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </motion.div>
                    </div>
                  )}

                  {/* Oracle Advice */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-3">
                      <Lightbulb className="w-3 h-3" />
                      Oracle Advice
                    </div>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.8 }}
                      className="text-sm text-zinc-300 leading-relaxed font-mono"
                    >
                      {data.ai_suggestion || "AI Oracle is currently saving compute credits."}
                    </motion.p>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </>
  );
}