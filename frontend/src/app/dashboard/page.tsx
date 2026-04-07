"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePrediction } from "@/hooks/usePrediction"; // Using the hook you provided
import { extractKeywords } from "@/lib/analyzer"; // Using the analyzer you provided
import Link from "next/link";
import { 
  ArrowLeft, Activity, Sparkles, BrainCircuit, 
  BarChart3, Loader2, Send 
} from "lucide-react";

export default function DashboardPage() {
  const [postText, setPostText] = useState("");
  const { status, data, error, predict } = usePrediction();

  const handlePredict = () => {
    if (!postText.trim()) return;
    predict(postText);
  };

  const keywords = data?.top_features ? extractKeywords(data.top_features) : [];

  return (
    <main className="min-h-screen bg-green-bean text-mashed-potatoes selection:bg-cranberry font-body flex flex-col">
      
      {/* Dashboard Top Nav */}
      <nav className="w-full flex items-center justify-between px-6 py-4 border-b border-artichoke/20 bg-green-bean/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-artichoke hover:text-mashed-potatoes transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-heading text-xl tracking-wide">TrendSense<span className="text-cranberry">.</span></span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-cranberry animate-pulse" />
          <span className="text-xs uppercase tracking-widest text-artichoke">Engine Online</span>
        </div>
      </nav>

      <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        
        {/* LEFT COLUMN: Input Terminal */}
        <section className="flex flex-col h-full mt-4">
          <h1 className="font-heading text-4xl mb-2">Input <span className="italic text-artichoke">Signal</span></h1>
          <p className="text-artichoke mb-8 text-sm uppercase tracking-widest">Feed the neural net your draft.</p>
          
          <div className="relative flex-1 min-h-[400px] flex flex-col rounded-2xl bg-black/20 border border-artichoke/20 overflow-hidden group focus-within:border-cranberry/50 transition-colors duration-500">
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="Type your social copy here..."
              className="flex-1 w-full bg-transparent resize-none p-6 text-lg outline-none placeholder:text-artichoke/50"
            />
            
            <div className="p-4 bg-black/40 border-t border-artichoke/20 flex items-center justify-between">
              <span className="text-xs text-artichoke font-mono">
                {postText.length} chars
              </span>
              <button
                onClick={handlePredict}
                disabled={status === "loading" || !postText.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-mashed-potatoes text-green-bean rounded-md font-semibold uppercase tracking-wider text-sm hover:bg-cranberry hover:text-mashed-potatoes transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-mashed-potatoes disabled:hover:text-green-bean"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Run Engine
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-lg bg-cabernet/50 border border-cabernet text-mashed-potatoes flex items-start gap-3"
            >
              <Activity className="w-5 h-5 text-cranberry shrink-0" />
              <div>
                <p className="font-semibold text-sm">Prediction Failed</p>
                <p className="text-xs opacity-80">{error.message}</p>
              </div>
            </motion.div>
          )}
        </section>

        {/* RIGHT COLUMN: Output Telemetry */}
        <section className="flex flex-col h-full mt-4">
           <h2 className="font-heading text-4xl mb-2 text-artichoke opacity-50">Telemetry <span className="italic">Output</span></h2>
           <p className="text-artichoke mb-8 text-sm uppercase tracking-widest opacity-50">Awaiting processing...</p>

           <AnimatePresence mode="wait">
             {status === "idle" && (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex-1 rounded-2xl border border-dashed border-artichoke/30 flex items-center justify-center text-artichoke/50 flex-col gap-4"
                >
                  <Activity className="w-12 h-12 mb-2 opacity-20" />
                  <p className="font-mono text-sm uppercase">Standing by for raw data.</p>
                </motion.div>
             )}

             {status === "loading" && (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex-1 rounded-2xl border border-artichoke/20 bg-black/10 flex items-center justify-center flex-col gap-6"
                >
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-artichoke/20 rounded-full" />
                    <div className="w-16 h-16 border-4 border-cranberry rounded-full border-t-transparent animate-spin absolute top-0 left-0" />
                  </div>
                  <p className="font-mono text-sm uppercase text-artichoke tracking-widest animate-pulse">Running Neural Net...</p>
                </motion.div>
             )}

             {status === "success" && data && (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ staggerChildren: 0.1 }}
                  className="flex flex-col gap-6"
                >
                  {/* Score Grid */}
                  <div className="grid grid-cols-2 gap-6">
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-black/30 rounded-2xl p-6 border border-artichoke/20 relative overflow-hidden">
                      <div className="text-artichoke text-xs uppercase tracking-widest mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4"/> Virality Index</div>
                      <div className="flex items-baseline gap-1">
                        <span className="font-heading text-7xl text-mashed-potatoes">{data.virality_index}</span>
                        <span className="text-cranberry text-xl font-bold">/100</span>
                      </div>
                      <div className="w-full h-1.5 bg-black/50 rounded-full mt-6 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }} animate={{ width: `${data.virality_index}%` }} transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                          className="h-full bg-cranberry"
                        />
                      </div>
                    </motion.div>

                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-black/30 rounded-2xl p-6 border border-artichoke/20">
                      <div className="text-artichoke text-xs uppercase tracking-widest mb-4">Sentiment Score</div>
                      <div className="flex flex-col justify-center h-full pb-4">
                        <span className="font-heading text-4xl capitalize text-mashed-potatoes">
                          {data.sentiment_score > 0.2 ? "Positive" : data.sentiment_score < -0.2 ? "Negative" : "Neutral"}
                        </span>
                        <span className="text-artichoke font-mono mt-2">Valence: {data.sentiment_score.toFixed(2)}</span>
                      </div>
                    </motion.div>
                  </div>

                  {/* Keywords */}
                  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-black/30 rounded-2xl p-6 border border-artichoke/20">
                    <div className="text-artichoke text-xs uppercase tracking-widest mb-4">Influence Vectors</div>
                    <div className="flex flex-wrap gap-2">
                      {keywords.map((kw, idx) => (
                        <span 
                          key={idx} 
                          className={`px-4 py-2 rounded-full text-sm flex items-center gap-2 border ${
                            kw.weight === 'high' ? 'bg-cranberry/20 border-cranberry text-cranberry' : 
                            kw.weight === 'medium' ? 'bg-artichoke/20 border-artichoke text-mashed-potatoes' : 
                            'bg-transparent border-artichoke/30 text-artichoke'
                          }`}
                        >
                          {kw.keyword}
                          <span className="text-xs opacity-60 font-mono">{kw.score.toFixed(2)}</span>
                        </span>
                      ))}
                    </div>
                  </motion.div>

                  {/* AI Oracle Suggestion */}
                  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-cabernet/40 rounded-2xl p-6 border border-cranberry/40">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-cranberry/20 text-cranberry"><BrainCircuit className="w-5 h-5" /></div>
                      <span className="font-heading text-2xl text-mashed-potatoes flex items-center gap-2">The Oracle Says <Sparkles className="w-4 h-4 text-cranberry"/></span>
                    </div>
                    <p className="text-mashed-potatoes/90 leading-relaxed text-lg">
                      {data.ai_suggestion}
                    </p>
                  </motion.div>
                </motion.div>
             )}
           </AnimatePresence>
        </section>
      </div>
    </main>
  );
}