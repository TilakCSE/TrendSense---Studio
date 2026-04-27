"use client";

import { useState, useRef, useEffect, DragEvent, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  ArrowLeft, Activity, Sparkles, BrainCircuit, 
  BarChart3, Loader2, Send, Cpu, ImagePlus, X, Radio, Flame, ArrowUpRight
} from "lucide-react";

interface PredictResponse {
  title: string;
  virality_score: number;
  ai_suggestion: string;
  model_version: string;
  status: string;
}

interface Trend {
  topic_id: number;
  name: string;
  post_count: number;
  velocity_score: number;
  sample_post: string;
  sample_score: number;
}

// --- LIVE PULSE TELEMETRY ---
function LivePulse() {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPulse = async () => {
      try {
        const response = await fetch("https://tilakcse-trendsense-api.hf.space/api/live-pulse");
        if (response.ok) {
          const data = await response.json();
          if (data.status === "success" && data.active_trends) {
            setTrends(data.active_trends);
          }
        }
      } catch (err) {
        console.error("Failed to fetch live pulse telemetry:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPulse();
  }, []);

  return (
    <section className="w-full mt-8 p-6 bg-black/5 border border-artichoke/20 rounded-2xl relative overflow-visible z-50">
      
      {/* Background glow */}
      <div className="absolute -left-32 -bottom-32 w-64 h-64 bg-cranberry/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
        
        {/* Pulse Header */}
        <div className="flex items-center gap-4 shrink-0 border-r border-artichoke/20 pr-6">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-4 h-4 bg-cranberry/40 rounded-full animate-ping" />
            <div className="w-2 h-2 bg-cranberry rounded-full relative z-10" />
          </div>
          <div>
            <h3 className="font-heading text-xl text-mulled-wine flex items-center gap-2">
              Live Pulse <Radio className="w-4 h-4 text-cranberry" />
            </h3>
            <p className="text-xs font-mono uppercase tracking-widest text-artichoke mt-1">
              Autonomous Cluster Discovery
            </p>
          </div>
        </div>

        {/* Streaming Data Badges (No Hover Tooltips) */}
        <div className="flex-1 flex flex-wrap gap-3">
          {loading ? (
            <div className="flex items-center gap-2 text-artichoke font-mono text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Scanning data streams...
            </div>
          ) : trends.length > 0 ? (
            trends.map((trend, idx) => {
              const isHyperViral = trend.velocity_score > 10000;

              return (
                <motion.div 
                  key={trend.topic_id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`px-4 py-2 rounded-lg border bg-black/5 flex items-center gap-3 ${
                    isHyperViral 
                      ? "border-cranberry/60 bg-cranberry/10 shadow-[0_0_15px_rgba(115,65,65,0.1)]" 
                      : "border-artichoke/30 bg-black/10"
                  }`}
                >
                  {isHyperViral && (
                    <Flame className="w-4 h-4 text-cranberry animate-pulse" />
                  )}
                  <span className="text-sm font-medium text-mulled-wine">
                    {trend.name}
                  </span>
                  <span className="text-xs font-mono text-artichoke bg-white/40 px-2 py-0.5 rounded border border-artichoke/10">
                    {trend.post_count} posts
                  </span>
                </motion.div>
              );
            })
          ) : (
             <span className="text-sm font-mono text-artichoke">No active clusters detected.</span>
          )}
        </div>

      </div>
    </section>
  );
}

export default function DashboardPage() {
  const [postText, setPostText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFile = (file: File) => {
    if (file.type.startsWith("image/")) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    } else {
      setError("Please upload a valid image file (.jpg, .png)");
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePredict = async () => {
    if (!postText.trim() && !selectedFile) {
      setError("Please provide at least a title or an image signal.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("title", postText);
      formData.append("view_count", "0");
      formData.append("like_count", "0");
      formData.append("comment_count", "0");
      
      if (selectedFile) {
        formData.append("thumbnail", selectedFile);
      }

      const response = await fetch("https://tilakcse-trendsense-api.hf.space/api/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Engine Error: HTTP ${response.status}`);
      }

      const data: PredictResponse = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(
        err.message || "Failed to connect to the Neural Core. Ensure the PyTorch API is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-green-bean text-mashed-potatoes selection:bg-cranberry font-body flex flex-col pb-12 overflow-x-hidden">
      
      <nav className="w-full flex items-center justify-between px-6 py-4 border-b border-artichoke/20 bg-green-bean sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-artichoke hover:text-mashed-potatoes transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-heading text-xl tracking-wide">TrendSense<span className="text-cranberry">.</span></span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-cranberry animate-pulse" />
          <span className="text-xs uppercase tracking-widest text-artichoke">Multi-Modal Engine Online</span>
        </div>
      </nav>

      <div className="flex-1 max-w-7xl w-full mx-auto px-6 pt-6 flex flex-col h-full relative">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-0">
          
          <section className="flex flex-col h-full">
            <h1 className="font-heading text-4xl mb-2">Input <span className="italic text-artichoke">Signal</span></h1>
            <p className="text-artichoke mb-8 text-sm uppercase tracking-widest">Feed the neural net your title and thumbnail.</p>
            
            <div className="relative flex-1 min-h-[500px] flex flex-col rounded-2xl bg-black/40 border border-artichoke/20 overflow-hidden group focus-within:border-cranberry/50 transition-colors duration-500">
              
              <textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder="Enter your video title here..."
                className="flex-1 w-full bg-transparent resize-none p-6 text-xl outline-none placeholder:text-artichoke/50 font-medium min-h-[150px]"
              />
              
              <div className="px-6 pb-6 pt-2">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileInput} 
                  accept="image/png, image/jpeg" 
                  className="hidden" 
                />
                
                {!previewUrl ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                      isDragging 
                        ? "border-cranberry bg-cranberry/10" 
                        : "border-artichoke/30 hover:border-cranberry/50 hover:bg-black/20"
                    }`}
                  >
                    <ImagePlus className={`w-8 h-8 mb-3 transition-colors ${isDragging ? "text-cranberry" : "text-artichoke"}`} />
                    <span className="text-sm font-mono text-artichoke uppercase tracking-widest text-center">
                      {isDragging ? "Drop to engage" : "Drop thumbnail or click to upload"}
                    </span>
                  </div>
                ) : (
                  <div className="relative inline-block w-full">
                    <div className="w-full h-48 rounded-xl border border-artichoke/30 overflow-hidden relative group/preview">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={previewUrl} 
                        alt="Thumbnail Preview" 
                        className="w-full h-full object-cover opacity-90 transition-opacity group-hover/preview:opacity-100" 
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="font-mono text-xs uppercase tracking-widest text-mashed-potatoes">Image Loaded</span>
                      </div>
                    </div>
                    <button 
                      onClick={clearFile}
                      className="absolute -top-3 -right-3 w-8 h-8 bg-cabernet hover:bg-cranberry text-mashed-potatoes rounded-full flex items-center justify-center shadow-lg transition-colors border border-cranberry/50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-black/60 border-t border-artichoke/20 flex items-center justify-between mt-auto shrink-0 relative z-0">
                <span className="text-xs text-artichoke font-mono">
                  {postText.length} chars {selectedFile && "• +1 Image"}
                </span>
                <button
                  onClick={handlePredict}
                  disabled={loading || (!postText.trim() && !selectedFile)}
                  className="flex items-center gap-2 px-6 py-3 bg-mashed-potatoes text-green-bean rounded-md font-semibold uppercase tracking-wider text-sm hover:bg-cranberry hover:text-mashed-potatoes transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-mashed-potatoes disabled:hover:text-green-bean"
                >
                  {loading ? (
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
                className="mt-4 p-4 rounded-lg bg-cabernet/80 border border-cabernet text-mashed-potatoes flex items-start gap-3"
              >
                <Activity className="w-5 h-5 text-cranberry shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Prediction Failed</p>
                  <p className="text-xs opacity-80">{error}</p>
                </div>
              </motion.div>
            )}
          </section>

          <section className="flex flex-col h-full relative z-0">
            <h2 className="font-heading text-4xl mb-2 text-artichoke">Telemetry <span className="italic">Output</span></h2>
            <p className="text-artichoke mb-8 text-sm uppercase tracking-widest">Awaiting multi-modal processing...</p>

            <AnimatePresence mode="wait">
              {!loading && !result && (
                  <motion.div 
                    key="idle"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex-1 rounded-2xl border border-dashed border-artichoke/30 flex items-center justify-center text-artichoke/50 flex-col gap-4 min-h-[500px]"
                  >
                    <Activity className="w-12 h-12 mb-2 opacity-20" />
                    <p className="font-mono text-sm uppercase tracking-widest">Standing by for raw data.</p>
                  </motion.div>
              )}

              {loading && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex-1 rounded-2xl border border-artichoke/20 bg-black/30 flex items-center justify-center flex-col gap-6 min-h-[500px]"
                  >
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-artichoke/20 rounded-full" />
                      <div className="w-16 h-16 border-4 border-cranberry rounded-full border-t-transparent animate-spin absolute top-0 left-0" />
                    </div>
                    <p className="font-mono text-sm uppercase text-artichoke tracking-widest animate-pulse">Running PyTorch Model...</p>
                  </motion.div>
              )}

              {result && !loading && (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ staggerChildren: 0.1 }}
                    className="flex flex-col gap-6 h-full min-h-[500px]"
                  >
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-black/50 rounded-2xl p-8 border border-artichoke/30 relative overflow-hidden shrink-0">
                      <div className="absolute -right-20 -top-20 w-64 h-64 bg-cranberry/10 rounded-full blur-3xl pointer-events-none" />
                      <div className="text-artichoke text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5"/> Virality Index
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-heading text-[6rem] leading-none text-mashed-potatoes">
                          {result.virality_score.toFixed(1)}
                        </span>
                        <span className="text-cranberry text-2xl font-bold uppercase tracking-widest">/ 100</span>
                      </div>
                      <div className="w-full h-2 bg-black/70 rounded-full mt-8 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }} animate={{ width: `${result.virality_score}%` }} transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                          className="h-full bg-cranberry"
                        />
                      </div>
                    </motion.div>

                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-cabernet/70 rounded-2xl p-8 border border-cranberry/50 flex-1 flex flex-col relative z-10">
                      <div className="flex items-center gap-3 mb-6 shrink-0">
                        <div className="p-3 rounded-xl bg-cranberry/20 text-cranberry border border-cranberry/30">
                          <BrainCircuit className="w-6 h-6" />
                        </div>
                        <span className="font-heading text-3xl text-mashed-potatoes flex items-center gap-3">
                          AI Coach <Sparkles className="w-5 h-5 text-cranberry"/>
                        </span>
                      </div>
                      <div className="flex-1 bg-black/40 p-6 rounded-xl border border-white/10 overflow-y-auto">
                        <p className="text-mashed-potatoes/90 leading-relaxed text-lg">
                          {result.ai_suggestion}
                        </p>
                      </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex items-center gap-2 mt-auto pt-2 text-artichoke/60 shrink-0 relative z-10">
                      <Cpu className="w-4 h-4" />
                      <span className="font-mono text-xs uppercase tracking-widest">
                        Processing Node: {result.model_version}
                      </span>
                    </motion.div>
                  </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>

        <div className="relative z-10">
          <LivePulse />
        </div>

      </div>
    </main>
  );
}