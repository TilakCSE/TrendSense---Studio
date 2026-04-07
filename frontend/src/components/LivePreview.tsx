"use client";

import { motion } from "framer-motion";
import { Zap, BrainCircuit, BarChart3, Fingerprint, Sparkles } from "lucide-react";

export default function LivePreview() {
  // Mock data reflecting your BackendPredictResponse contract
  const mockPrediction = {
    virality_index: 88,
    sentiment_score: 0.65, // Positive
    top_features: [
      { keyword: "aesthetic", score: 0.45 },
      { keyword: "routine", score: 0.38 },
      { keyword: "coffee", score: 0.22 },
      { keyword: "morning", score: 0.15 },
    ],
    ai_suggestion:
      "High virality potential detected. The intersection of 'aesthetic' and 'routine' signals strong algorithmic resonance. We recommend pushing this live between 08:00 AM and 09:30 AM EST to maximize initial engagement velocity.",
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80 } },
  };

  return (
    <section className="relative w-full py-32 px-6 bg-mashed-potatoes overflow-hidden">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-4xl md:text-5xl text-green-bean mb-4">
            Peek Inside the <span className="text-cranberry italic">Engine.</span>
          </h2>
          <p className="text-artichoke text-lg max-w-2xl mx-auto">
            A live look at the telemetry our AI extracts from your raw copy.
          </p>
        </motion.div>

        {/* Dashboard Preview Window */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="relative rounded-3xl bg-green-bean text-mashed-potatoes shadow-2xl shadow-green-bean/20 overflow-hidden border border-artichoke/20"
        >
          {/* Mac-style Window Controls */}
          <div className="flex items-center gap-2 px-6 py-4 border-b border-white/10 bg-black/10">
            <div className="w-3 h-3 rounded-full bg-cranberry/80" />
            <div className="w-3 h-3 rounded-full bg-mashed-potatoes/30" />
            <div className="w-3 h-3 rounded-full bg-mashed-potatoes/30" />
            <div className="ml-4 text-xs font-mono tracking-widest text-artichoke uppercase">
              TrendSense // Prediction Node_01
            </div>
          </div>

          <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-5 gap-12">
            
            {/* Left Column: Input Panel */}
            <motion.div variants={itemVariants} className="lg:col-span-2 flex flex-col gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm uppercase tracking-widest text-artichoke mb-3">
                  <Fingerprint className="w-4 h-4" />
                  Raw Input Signal
                </label>
                <div className="bg-black/20 rounded-xl p-5 border border-white/5">
                  <p className="text-mashed-potatoes/90 leading-relaxed font-body">
                    "romanticizing my morning routine because life is too short for bad coffee and rushed mornings. ☕️✨ #aesthetic"
                  </p>
                </div>
              </div>

              {/* Simulated "Run" Button */}
              <div className="mt-auto">
                <div className="w-full py-4 rounded-lg bg-cranberry/20 border border-cranberry/50 flex items-center justify-center gap-2 text-cranberry relative overflow-hidden">
                  <div className="absolute inset-0 bg-cranberry/10 animate-pulse" />
                  <Zap className="w-5 h-5 relative z-10" />
                  <span className="font-semibold tracking-widest uppercase relative z-10 text-sm">
                    Signal Processed
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Output Telemetry */}
            <motion.div variants={itemVariants} className="lg:col-span-3 flex flex-col gap-8">
              
              <div className="grid grid-cols-2 gap-6">
                {/* Virality Score */}
                <div className="bg-black/20 rounded-xl p-6 border border-white/5 relative overflow-hidden">
                  <div className="absolute -right-10 -top-10 w-32 h-32 bg-cranberry/20 rounded-full blur-3xl" />
                  <div className="flex items-center gap-2 text-artichoke text-sm uppercase tracking-wider mb-2">
                    <BarChart3 className="w-4 h-4" /> Virality Index
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-heading text-6xl text-mashed-potatoes">
                      {mockPrediction.virality_index}
                    </span>
                    <span className="text-cranberry font-bold">/100</span>
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full mt-4 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: "88%" }}
                      transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                      className="h-full bg-cranberry"
                    />
                  </div>
                </div>

                {/* Sentiment & Features */}
                <div className="flex flex-col gap-4">
                  <div className="bg-black/20 rounded-xl p-5 border border-white/5 flex-1">
                    <div className="text-artichoke text-sm uppercase tracking-wider mb-2">
                      Sentiment
                    </div>
                    <div className="text-2xl text-mashed-potatoes">
                      Positive <span className="text-artichoke text-lg">({mockPrediction.sentiment_score})</span>
                    </div>
                  </div>
                  <div className="bg-black/20 rounded-xl p-5 border border-white/5 flex-1">
                     <div className="text-artichoke text-xs uppercase tracking-wider mb-3">
                      Influence Vectors
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {mockPrediction.top_features.map((feat) => (
                        <span key={feat.keyword} className="px-3 py-1 rounded-full text-xs border border-artichoke/30 bg-white/5 text-mashed-potatoes">
                          {feat.keyword} <span className="text-artichoke ml-1">{feat.score}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Oracle Suggestion */}
              <div className="bg-cabernet/40 rounded-xl p-6 border border-cranberry/30 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-1 h-full bg-cranberry" />
                 <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-cranberry/20">
                      <BrainCircuit className="w-6 h-6 text-cranberry" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-heading text-xl text-mashed-potatoes">The Oracle Says</span>
                        <Sparkles className="w-4 h-4 text-cranberry" />
                      </div>
                      <p className="text-mashed-potatoes/80 leading-relaxed text-sm">
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