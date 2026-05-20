"use client";

import {
  useState, useRef, useEffect, DragEvent, ChangeEvent, useCallback,
} from "react";
import Link from "next/link";
import {
  ArrowLeft, Activity, Sparkles, BrainCircuit,
  BarChart3, Loader2, Send, Cpu, ImagePlus, X,
  Radio, Flame, Zap, TrendingUp, Eye, Users,
  AlertTriangle, CheckCircle2,
} from "lucide-react";

/* ── Types ── */
interface AnalyzeResponse {
  title: string;
  base_structural_score: number;
  entity_tier: "S" | "A" | "B" | "None";
  entity_multiplier: number;
  final_virality_score: number;
  cohesion_score: number;
  thumbnail_analysis: string;
  ai_strategy_report: string;
}

const MOCK_TRENDS = [
  { id: 1, name: "MrBeast",       post_count: 142800, isHyperViral: true  },
  { id: 2, name: "Squid Game S3", post_count: 89400,  isHyperViral: true  },
  { id: 3, name: "IShowSpeed",    post_count: 67200,  isHyperViral: true  },
  { id: 4, name: "Samay Raina",   post_count: 43100,  isHyperViral: false },
  { id: 5, name: "Minecraft S2",  post_count: 28700,  isHyperViral: false },
];

/* ─────────────────────────────────────────────────────
   MARKDOWN RENDERER
   Handles **bold**, *italic*, bullet lists,
   numbered lists, ### headings — the exact format
   Llama 3 sends in ai_strategy_report.
   No external lib needed.
───────────────────────────────────────────────────── */
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} className="text-cream font-semibold">{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={i} className="text-cream/70 italic">{part.slice(1, -1)}</em>;
    return part;
  });
}

function MarkdownBlock({ text }: { text: string }) {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    const t = line.trim();
    if (!t) { nodes.push(<div key={i} className="h-2" />); return; }

    // Section heading: ### or **Heading** alone on a line
    const isHeading = t.startsWith("###") ||
      (t.startsWith("**") && t.endsWith("**") && !t.slice(2, -2).includes("**") && t.length < 80);
    if (isHeading) {
      const heading = t.replace(/^#+\s*/, "").replace(/\*\*/g, "");
      nodes.push(
        <p key={i} className="text-gold text-[10px] font-mono uppercase tracking-widest mt-6 mb-2 first:mt-0">
          {heading}
        </p>
      );
      return;
    }

    // Bullet
    if (t.startsWith("* ") || t.startsWith("- ")) {
      nodes.push(
        <div key={i} className="flex gap-2 items-start pl-3">
          <span className="text-burgundy mt-[3px] shrink-0 text-base leading-none">·</span>
          <span className="text-cream/75 text-sm leading-relaxed">{renderInline(t.slice(2))}</span>
        </div>
      );
      return;
    }

    // Numbered list
    const numMatch = t.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      nodes.push(
        <div key={i} className="flex gap-3 items-start pl-3">
          <span className="text-gold font-mono text-xs mt-0.5 shrink-0 w-4">{numMatch[1]}.</span>
          <span className="text-cream/75 text-sm leading-relaxed">{renderInline(numMatch[2])}</span>
        </div>
      );
      return;
    }

    // Normal paragraph
    nodes.push(
      <p key={i} className="text-cream/75 text-sm leading-relaxed">
        {renderInline(t)}
      </p>
    );
  });

  return <div className="space-y-2">{nodes}</div>;
}

/* ── Entity Tier Badge ── */
function TierBadge({ tier }: { tier: "S" | "A" | "B" | "None" }) {
  const cfg = {
    S:    { label: "S-TIER ENTITY",   cls: "bg-burgundy/20 border-burgundy/50 text-burgundy" },
    A:    { label: "A-TIER ENTITY",   cls: "bg-gold/15 border-gold/50 text-gold"             },
    B:    { label: "B-TIER ENTITY",   cls: "bg-emerald/15 border-emerald/40 text-emerald"    },
    None: { label: "NO ENTITY BOOST", cls: "bg-white/5 border-cream/15 text-cream/35"        },
  }[tier];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono uppercase tracking-widest ${cfg.cls}`}>
      <Zap className="w-3 h-3" />{cfg.label}
    </span>
  );
}

function cohesionLabel(score: number) {
  if (score >= 0.35) return { label: "Excellent alignment",       color: "text-emerald",  icon: <CheckCircle2 className="w-3.5 h-3.5" /> };
  if (score >= 0.28) return { label: "Good alignment",            color: "text-gold",      icon: <CheckCircle2 className="w-3.5 h-3.5" /> };
  if (score >= 0.23) return { label: "Average — some disconnect", color: "text-gold",      icon: <AlertTriangle className="w-3.5 h-3.5" /> };
  if (score >= 0.21) return { label: "Weak — image mismatch",     color: "text-burgundy", icon: <AlertTriangle className="w-3.5 h-3.5" /> };
  return                    { label: "Strong clickbait signal",   color: "text-red-600",  icon: <AlertTriangle className="w-3.5 h-3.5" /> };
}

function ProgressBar({ value, color = "bg-burgundy", delay = 0 }: { value: number; color?: string; delay?: number }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setWidth(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return (
    <div className="w-full h-1 bg-emerald/10 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${width}%` }} />
    </div>
  );
}

const inputCls =
  "w-full bg-white border border-emerald/25 rounded-xl px-5 py-4 text-emerald placeholder:text-emerald/30 outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/10 transition-all duration-300 text-sm font-medium shadow-sm";

/* ── Main ── */
export default function DashboardPage() {
  const [title, setTitle]               = useState("");
  const [hook, setHook]                 = useState("");
  const [entities, setEntities]         = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl]     = useState<string | null>(null);
  const [isDragging, setIsDragging]     = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [result, setResult]             = useState<AnalyzeResponse | null>(null);
  const [phase, setPhase]               = useState("");
  const phaseRef     = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const PHASES = [
    "Letterboxing thumbnail...",
    "Running PyTorch math engine...",
    "LLaVA vision analysis...",
    "Culture entity scan...",
    "Generating strategy report...",
  ];

  useEffect(() => { return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }; }, [previewUrl]);

  useEffect(() => {
    if (!loading) { phaseRef.current = 0; setPhase(""); return; }
    setPhase(PHASES[0]);
    const iv = setInterval(() => {
      phaseRef.current = (phaseRef.current + 1) % PHASES.length;
      setPhase(PHASES[phaseRef.current]);
    }, 4000);
    return () => clearInterval(iv);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) { setError("Upload a valid image (.jpg, .png, .webp)"); return; }
    setSelectedFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
  }, [previewUrl]);

  const handleDragOver  = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };
  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); };
  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation(); setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const hookWords = hook.trim() === "" ? 0 : hook.trim().split(/\s+/).length;
  const handleHookChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const words = e.target.value.trim().split(/\s+/);
    if (e.target.value === "" || words.length <= 150) setHook(e.target.value);
  };

  const canSubmit = !!(title.trim() && hook.trim() && selectedFile && !loading);

  const handleAnalyze = async () => {
    if (!canSubmit) { setError("Title, hook, and thumbnail are all required."); return; }
    setLoading(true); setError(null); setResult(null);
    const fd = new FormData();
    fd.append("title", title); fd.append("hook", hook); fd.append("thumbnail", selectedFile!);
    if (entities.trim()) fd.append("user_entities", entities.trim());
    try {
      const res = await fetch("http://localhost:8000/analyze", { method: "POST", body: fd });
      if (!res.ok) throw new Error(`Engine error: HTTP ${res.status}`);
      setResult(await res.json());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg.includes("fetch") ? "Cannot reach Neural Core — is api.py running on port 8000?" : msg);
    } finally { setLoading(false); }
  };

  const coh = result ? cohesionLabel(result.cohesion_score) : null;

  return (
    <main className="w-full min-h-screen bg-cream text-emerald font-body flex flex-col pb-20">

      {/* Nav */}
      <nav className="w-full flex items-center justify-between px-6 py-4 border-b border-emerald/15 bg-cream sticky top-0 z-[100] shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-emerald/50 hover:text-burgundy transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-heading text-xl text-emerald">
            TrendSense<span className="text-burgundy">.</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-burgundy animate-pulse" />
          <span className="text-[10px] uppercase tracking-widest text-emerald/50 font-mono hidden sm:block">
            Multi-Modal Engine Online
          </span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-10 pb-24 space-y-10 w-full">

        {/* Header */}
        <div>
          <h1 className="font-heading text-5xl md:text-6xl leading-tight text-emerald">
            Virality <em className="not-italic italic text-emerald/20">Engine</em>
          </h1>
          <p className="text-emerald/40 text-xs uppercase tracking-[0.2em] font-mono mt-1">
            PyTorch · SBERT · CLIP · LLaVA · Llama 3
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 items-start">

          {/* ─── LEFT: Input ─── */}
          <div className="space-y-6">
            <p className="text-[10px] uppercase tracking-widest text-emerald/40 font-mono border-b border-emerald/10 pb-3">
              01 — Input Signal
            </p>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-emerald/60 mb-2">Video Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                placeholder="50 Hours Surviving In Solitary Confinement..." className={inputCls} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-emerald/60">Script Hook</label>
                <span className={`text-xs font-mono font-semibold ${hookWords >= 140 ? "text-burgundy" : "text-emerald/40"}`}>
                  {hookWords}/150 words
                </span>
              </div>
              <textarea value={hook} onChange={handleHookChange}
                placeholder="The first 150 words of your script — what makes the viewer stay..."
                rows={5} className={`${inputCls} resize-none leading-relaxed`} />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-emerald/60 mb-2">
                Featured Entities <span className="text-emerald/30 normal-case font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald/30" />
                <input type="text" value={entities} onChange={e => setEntities(e.target.value)}
                  placeholder="Influencers, meme icons, or cultural figures in your video..."
                  className={`${inputCls} pl-11`} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-emerald/60 mb-2">Thumbnail</label>
              <input type="file" ref={fileInputRef} onChange={handleFileInput}
                accept="image/png,image/jpeg,image/webp" className="hidden" />
              {!previewUrl ? (
                <div onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                  className={`w-full border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                    isDragging ? "border-burgundy bg-burgundy/5" : "border-emerald/20 bg-white hover:border-emerald/40"
                  }`}
                >
                  <ImagePlus className={`w-8 h-8 mb-3 ${isDragging ? "text-burgundy" : "text-emerald/25"}`} />
                  <span className="text-xs font-semibold text-emerald/45 uppercase tracking-widest">
                    {isDragging ? "Drop to engage" : "Drop thumbnail or click to upload"}
                  </span>
                  <span className="text-[10px] text-emerald/25 mt-1 font-mono">JPG · PNG · WEBP</span>
                </div>
              ) : (
                <div className="relative w-full rounded-xl border border-emerald/20 overflow-hidden group/thumb shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Thumbnail preview" className="w-full h-52 object-cover" />
                  <div className="absolute inset-0 bg-charcoal/50 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="font-mono text-xs uppercase tracking-widest text-cream">Click × to replace</span>
                  </div>
                  <button onClick={clearFile}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-charcoal/80 hover:bg-burgundy flex items-center justify-center transition-colors">
                    <X className="w-4 h-4 text-cream" />
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-burgundy/8 border border-burgundy/30">
                <AlertTriangle className="w-4 h-4 text-burgundy shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-burgundy uppercase tracking-wide">Engine Error</p>
                  <p className="text-sm text-emerald/70 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            <button onClick={handleAnalyze} disabled={!canSubmit}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold uppercase tracking-wider text-sm transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed bg-burgundy hover:bg-charcoal active:scale-[0.98] text-cream shadow-lg shadow-burgundy/20">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" />{phase || "Processing..."}</>
                : <><Send className="w-4 h-4" />Run Engine</>
              }
            </button>
          </div>

          {/* ─── RIGHT: Output ─── */}
          <div className="space-y-5">
            <p className="text-[10px] uppercase tracking-widest text-emerald/40 font-mono border-b border-emerald/10 pb-3">
              02 — Telemetry Output
            </p>

            {/* Idle */}
            {!loading && !result && (
              <div className="flex flex-col items-center justify-center min-h-[520px] rounded-2xl border-2 border-dashed border-emerald/15 bg-white/50 text-emerald/25 gap-4">
                <Activity className="w-10 h-10" />
                <p className="font-mono text-xs uppercase tracking-widest">Standing by for raw data.</p>
              </div>
            )}

            {/* Loading — concentric rings, no blob orb */}
            {loading && !result && (
              <div className="flex flex-col items-center justify-center min-h-[520px] rounded-2xl border border-emerald/15 bg-white/50 gap-6">
                <div className="relative flex items-center justify-center w-32 h-32">
                  <div className="absolute inset-0 rounded-full border border-emerald/10 animate-ping" style={{ animationDuration: "2s" }} />
                  <div className="absolute inset-3 rounded-full border border-burgundy/20 animate-ping" style={{ animationDuration: "2.4s", animationDelay: "0.4s" }} />
                  <div className="absolute inset-6 rounded-full border border-gold/20 animate-ping" style={{ animationDuration: "2.8s", animationDelay: "0.8s" }} />
                  <div className="w-10 h-10 rounded-full bg-burgundy/10 border border-burgundy/25 flex items-center justify-center">
                    <BrainCircuit className="w-5 h-5 text-burgundy" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="font-mono text-xs uppercase tracking-widest text-emerald/55 animate-pulse">{phase}</p>
                  <p className="text-[10px] text-emerald/30 font-mono">This may take 30–90 seconds on GPU</p>
                </div>
              </div>
            )}

            {/* Result */}
            {result && !loading && (
              <div className="space-y-4">

                {/* Score card — dark with subtle gradient bg */}
                <div className="relative rounded-2xl bg-charcoal border border-cream/8 overflow-hidden p-8">
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full opacity-25"
                      style={{ background: "radial-gradient(circle, #A6824A 0%, transparent 70%)" }} />
                    <div className="absolute -left-8 -bottom-8 w-44 h-44 rounded-full opacity-15"
                      style={{ background: "radial-gradient(circle, #5D1E21 0%, transparent 70%)" }} />
                  </div>
                  <div className="relative z-10">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-cream/30 mb-4 flex items-center gap-2">
                      <BarChart3 className="w-3.5 h-3.5" /> Virality Index
                    </p>
                    <div className="flex items-baseline gap-3 mb-4">
                      <span className="font-heading text-8xl leading-none text-cream tabular-nums">
                        {result.final_virality_score.toFixed(1)}
                      </span>
                      <span className="text-gold font-bold text-2xl">/100</span>
                    </div>
                    <ProgressBar value={result.final_virality_score} color="bg-gold" delay={100} />
                    <div className="mt-5 flex flex-wrap gap-3">
                      <TierBadge tier={result.entity_tier} />
                      {result.entity_multiplier > 1 && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream/8 border border-cream/10 text-[10px] font-mono text-cream/45 uppercase tracking-widest">
                          <TrendingUp className="w-3 h-3" />{result.entity_multiplier}× entity boost
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white border border-emerald/15 p-5 shadow-sm">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-emerald/40 mb-2">Base Score</p>
                    <p className="text-3xl font-heading text-emerald tabular-nums mb-2">
                      {result.base_structural_score.toFixed(1)}
                    </p>
                    <ProgressBar value={result.base_structural_score} color="bg-emerald/50" delay={300} />
                  </div>
                  <div className="rounded-xl bg-white border border-emerald/15 p-5 shadow-sm">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-emerald/40 mb-2">Cohesion</p>
                    <p className="text-3xl font-heading text-emerald tabular-nums mb-2">
                      {(result.cohesion_score * 100).toFixed(0)}
                      <span className="text-sm text-emerald/30">%</span>
                    </p>
                    <ProgressBar value={result.cohesion_score * 100} color="bg-emerald/50" delay={400} />
                    {coh && (
                      <p className={`text-[10px] font-mono mt-2 flex items-center gap-1 ${coh.color}`}>
                        {coh.icon} {coh.label}
                      </p>
                    )}
                  </div>
                </div>

                {/* LLaVA Vision */}
                <div className="rounded-xl bg-white border border-emerald/15 p-5 shadow-sm">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-emerald/40 mb-3 flex items-center gap-2">
                    <Eye className="w-3.5 h-3.5" /> LLaVA Vision Analysis
                  </p>
                  <p className="text-sm text-emerald/65 leading-relaxed italic">
                    &ldquo;{result.thumbnail_analysis.trim()}&rdquo;
                  </p>
                </div>

                {/* ── AI Coach — full Llama 3 report, fully rendered ── */}
                <div className="rounded-xl bg-charcoal border border-cream/8 overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center gap-3 px-6 py-5 border-b border-cream/8">
                    <div className="p-2 rounded-lg bg-burgundy/25 shrink-0">
                      <BrainCircuit className="w-4 h-4 text-burgundy" />
                    </div>
                    <span className="font-heading text-2xl text-cream">AI Coach</span>
                    <Sparkles className="w-3.5 h-3.5 text-gold" />
                  </div>

                  {/* Full report — MarkdownBlock renders every line Llama 3 returns */}
                  <div className="px-6 py-5">
                    <MarkdownBlock text={result.ai_strategy_report} />
                  </div>

                  <div className="px-6 pb-5 flex items-center gap-2 text-cream/20">
                    <Cpu className="w-3 h-3" />
                    <span className="font-mono text-[10px] uppercase tracking-widest">
                      trendsense_core_v4.pt · CUDA · Llama 3 · LLaVA
                    </span>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* Live Pulse */}
        <section className="relative rounded-2xl border border-emerald/15 bg-white p-6 overflow-hidden shadow-sm">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex items-center gap-4 shrink-0 md:border-r md:border-emerald/10 md:pr-6">
              <div className="relative flex items-center justify-center">
                <span className="absolute w-5 h-5 bg-burgundy/25 rounded-full animate-ping" />
                <span className="w-2.5 h-2.5 bg-burgundy rounded-full relative z-10" />
              </div>
              <div>
                <h3 className="font-heading text-xl text-emerald flex items-center gap-2">
                  Live Pulse <Radio className="w-4 h-4 text-burgundy" />
                </h3>
                <p className="text-[10px] font-mono uppercase tracking-widest text-emerald/35 mt-0.5">
                  Trending Entity Radar
                </p>
              </div>
            </div>
            <div className="flex-1 flex flex-wrap gap-3">
              {MOCK_TRENDS.map((trend) => (
                <div key={trend.id}
                  className={`px-4 py-2 rounded-lg border flex items-center gap-3 ${
                    trend.isHyperViral ? "border-burgundy/30 bg-burgundy/5" : "border-emerald/10 bg-cream/60"
                  }`}
                >
                  {trend.isHyperViral && <Flame className="w-3.5 h-3.5 text-burgundy animate-pulse shrink-0" />}
                  <span className="text-sm font-semibold text-emerald">{trend.name}</span>
                  <span className="text-[10px] font-mono text-emerald/40 bg-emerald/5 px-2 py-0.5 rounded border border-emerald/8">
                    {trend.post_count.toLocaleString()} posts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}