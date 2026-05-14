"use client";

import {
  useState, useRef, useEffect, DragEvent, ChangeEvent, useCallback,
} from "react";
import Link from "next/link";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial, Float, Stars } from "@react-three/drei";
import * as THREE from "three";
import {
  ArrowLeft, Activity, Sparkles, BrainCircuit,
  BarChart3, Loader2, Send, Cpu, ImagePlus, X,
  Radio, Flame, Zap, TrendingUp, Eye, Users,
  ChevronRight, AlertTriangle, CheckCircle2,
} from "lucide-react";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// MOCK LIVE PULSE DATA
// ─────────────────────────────────────────────
const MOCK_TRENDS = [
  { id: 1, name: "MrBeast",       post_count: 142800, velocity_score: 98420, isHyperViral: true  },
  { id: 2, name: "Squid Game S3", post_count: 89400,  velocity_score: 74100, isHyperViral: true  },
  { id: 3, name: "IShowSpeed",    post_count: 67200,  velocity_score: 54300, isHyperViral: true  },
  { id: 4, name: "Samay Raina",   post_count: 43100,  velocity_score: 31200, isHyperViral: false },
  { id: 5, name: "Minecraft S2",  post_count: 28700,  velocity_score: 19800, isHyperViral: false },
];

// ─────────────────────────────────────────────
// 3D SCORE ORB
// ─────────────────────────────────────────────
function ScoreOrb({ score, active }: { score: number; active: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const scoreColor =
    score < 30 ? "#3a1115"
    : score < 60 ? "#5D1E21"
    : score < 80 ? "#8B4513"
    : "#A6824A";

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.1;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <Sphere ref={meshRef} args={[1.8, 64, 64]}>
        <MeshDistortMaterial
          color={scoreColor}
          distort={active ? 0.35 : 0.15}
          speed={active ? 2.5 : 0.8}
          roughness={0.1}
          metalness={0.8}
          transparent
          opacity={0.92}
        />
      </Sphere>
      <Sphere args={[1.85, 16, 16]}>
        <meshBasicMaterial color={scoreColor} wireframe transparent opacity={0.06} />
      </Sphere>
    </Float>
  );
}

function OrbScene({ score, active }: { score: number; active: boolean }) {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }} style={{ background: "transparent" }}>
      <Stars radius={30} depth={30} count={200} factor={2} saturation={0} fade />
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#5D1E21" />
      <pointLight position={[-5, -3, 2]} intensity={0.8} color="#A6824A" />
      <ScoreOrb score={score} active={active} />
    </Canvas>
  );
}

// ─────────────────────────────────────────────
// ENTITY TIER BADGE
// ─────────────────────────────────────────────
function TierBadge({ tier }: { tier: "S" | "A" | "B" | "None" }) {
  const config = {
    S:    { label: "S-TIER ENTITY",  bg: "bg-burgundy/20 border-burgundy/50", text: "text-burgundy" },
    A:    { label: "A-TIER ENTITY",  bg: "bg-gold/15 border-gold/40",         text: "text-gold"     },
    B:    { label: "B-TIER ENTITY",  bg: "bg-emerald/15 border-emerald/30",   text: "text-emerald/70" },
    None: { label: "NO ENTITY BOOST",bg: "bg-cream/5 border-cream/10",         text: "text-cream/30" },
  };
  const c = config[tier];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono uppercase tracking-widest ${c.bg} ${c.text}`}>
      <Zap className="w-3 h-3" />
      {c.label}
    </span>
  );
}

// ─────────────────────────────────────────────
// COHESION LABEL
// ─────────────────────────────────────────────
function cohesionLabel(score: number): { label: string; color: string; icon: React.ReactNode } {
  if (score >= 0.35) return { label: "Excellent alignment",      color: "text-emerald",       icon: <CheckCircle2 className="w-4 h-4" /> };
  if (score >= 0.28) return { label: "Good alignment",           color: "text-gold",           icon: <CheckCircle2 className="w-4 h-4" /> };
  if (score >= 0.23) return { label: "Average — some disconnect", color: "text-gold/70",       icon: <AlertTriangle className="w-4 h-4" /> };
  if (score >= 0.21) return { label: "Weak — image mismatch",    color: "text-burgundy",      icon: <AlertTriangle className="w-4 h-4" /> };
  return                   { label: "Strong clickbait signal",   color: "text-red-400",        icon: <AlertTriangle className="w-4 h-4" /> };
}

// ─────────────────────────────────────────────
// PROGRESS BAR
// ─────────────────────────────────────────────
function ProgressBar({ value, color = "bg-burgundy", delay = 0 }: { value: number; color?: string; delay?: number }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return (
    <div className="w-full h-1 bg-cream/8 rounded-full overflow-hidden">
      <div
        className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────
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

  const PHASES = [
    "Letterboxing thumbnail...",
    "Running PyTorch math engine...",
    "LLaVA vision analysis...",
    "Culture entity scan...",
    "Generating strategy report...",
  ];

  const fileInputRef = useRef<HTMLInputElement>(null);
  const phaseRef     = useRef(0);

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  useEffect(() => {
    if (!loading) { phaseRef.current = 0; setPhase(""); return; }
    setPhase(PHASES[0]);
    const interval = setInterval(() => {
      phaseRef.current = (phaseRef.current + 1) % PHASES.length;
      setPhase(PHASES[phaseRef.current]);
    }, 4000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // ── File handling ──────────────────────────
  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) { setError("Upload a valid image (.jpg, .png, .webp)"); return; }
    setSelectedFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
  }, [previewUrl]);

  const handleDragOver  = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop      = (e: DragEvent<HTMLDivElement>) => {
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

  const canSubmit = title.trim() && hook.trim() && selectedFile && !loading;

  const handleAnalyze = async () => {
    if (!canSubmit) { setError("Title, hook, and thumbnail are all required."); return; }
    setLoading(true); setError(null); setResult(null);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("hook", hook);
    formData.append("thumbnail", selectedFile!);
    if (entities.trim()) formData.append("user_entities", entities.trim());
    try {
      const res = await fetch("http://localhost:8000/analyze", { method: "POST", body: formData });
      if (!res.ok) throw new Error(`Engine error: HTTP ${res.status}`);
      const data: AnalyzeResponse = await res.json();
      setResult(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg.includes("fetch") ? "Cannot reach Neural Core — is api.py running on port 8000?" : msg);
    } finally {
      setLoading(false);
    }
  };

  const parsedReport = result?.ai_strategy_report
    ? result.ai_strategy_report
        .split(/\n\n+/)
        .filter(s => s.trim().length > 0)
        .map(s => s.replace(/^\*+|^\d+\.\s*/gm, "").replace(/\*\*/g, "").trim())
    : [];

  const reportIcons  = [<BarChart3 key="a" className="w-4 h-4" />, <Eye key="b" className="w-4 h-4" />, <Sparkles key="c" className="w-4 h-4" />];
  const reportLabels = ["Score Analysis", "Cohesion & Visuals", "Rewrite"];
  const coh = result ? cohesionLabel(result.cohesion_score) : null;

  // ── Shared input class ──────────────────────
  const inputCls =
    "w-full bg-charcoal/[0.06] border border-emerald/15 rounded-xl px-5 py-4 text-emerald outline-none placeholder:text-emerald/25 focus:border-burgundy/50 focus:bg-charcoal/[0.08] transition-all duration-300 text-sm";

  return (
    <main className="w-full min-h-screen bg-cream text-emerald font-body flex flex-col pb-20">

      {/* ── Nav ─────────────────────────────── */}
      <nav className="w-full flex items-center justify-between px-6 py-4 border-b border-emerald/10 bg-cream/90 backdrop-blur-md sticky top-0 z-[100]">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-emerald/40 hover:text-burgundy transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-heading text-xl tracking-wide text-emerald">
            TrendSense<span className="text-burgundy">.</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-burgundy animate-pulse" />
          <span className="text-[10px] uppercase tracking-widest text-emerald/40 font-mono">
            Multi-Modal Engine Online
          </span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-10 pb-24 space-y-10 w-full">

        {/* ── Page header ─────────────────── */}
        <div className="space-y-1">
          <h1 className="font-heading text-5xl md:text-6xl leading-tight text-emerald">
            Virality{" "}
            <em className="not-italic italic text-emerald/30">Engine</em>
          </h1>
          <p className="text-emerald/30 text-xs uppercase tracking-[0.2em] font-mono">
            PyTorch · SBERT · CLIP · LLaVA · Llama 3
          </p>
        </div>

        {/* ── Main 2-col grid ─────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 items-start">

          {/* ─ LEFT: Input panel ─────────── */}
          <div className="space-y-5">
            <p className="text-[10px] uppercase tracking-widest text-emerald/30 font-mono">
              01 — Input Signal
            </p>

            {/* Title */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-emerald/35 mb-2">
                Video Title
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="50 Hours Surviving In Solitary Confinement..."
                className={inputCls}
              />
            </div>

            {/* Hook */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-emerald/35">
                  Script Hook
                </label>
                <span className={`text-[10px] font-mono ${hookWords >= 140 ? "text-burgundy" : "text-emerald/25"}`}>
                  {hookWords}/150 words
                </span>
              </div>
              <textarea
                value={hook}
                onChange={handleHookChange}
                placeholder="The first 150 words of your script — what makes the viewer stay..."
                rows={5}
                className={`${inputCls} resize-none leading-relaxed`}
              />
            </div>

            {/* Entities */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-emerald/35 mb-2">
                Featured Entities{" "}
                <span className="text-emerald/20 normal-case">(optional — e.g. &ldquo;Mr Beast, IShowSpeed&rdquo;)</span>
              </label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald/25" />
                <input
                  type="text"
                  value={entities}
                  onChange={e => setEntities(e.target.value)}
                  placeholder="Influencers, meme icons, or cultural figures in your video..."
                  className={`${inputCls} pl-11`}
                />
              </div>
            </div>

            {/* Thumbnail */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-emerald/35 mb-2">
                Thumbnail
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInput}
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
              />

              {!previewUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`w-full border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                    isDragging
                      ? "border-burgundy bg-burgundy/5"
                      : "border-emerald/15 hover:border-emerald/30 hover:bg-emerald/[0.02]"
                  }`}
                >
                  <ImagePlus className={`w-8 h-8 mb-3 transition-colors ${isDragging ? "text-burgundy" : "text-emerald/25"}`} />
                  <span className="text-xs font-mono text-emerald/35 uppercase tracking-widest text-center">
                    {isDragging ? "Drop to engage" : "Drop thumbnail or click to upload"}
                  </span>
                  <span className="text-[10px] text-emerald/20 mt-1">JPG · PNG · WEBP</span>
                </div>
              ) : (
                <div className="relative w-full rounded-xl border border-emerald/15 overflow-hidden group/thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Thumbnail preview" className="w-full h-52 object-cover" />
                  <div className="absolute inset-0 bg-charcoal/50 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="font-mono text-xs uppercase tracking-widest text-cream/70">
                      Click × to replace
                    </span>
                  </div>
                  <button
                    onClick={clearFile}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-charcoal/80 hover:bg-burgundy flex items-center justify-center transition-colors border border-cream/10"
                  >
                    <X className="w-4 h-4 text-cream" />
                  </button>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-burgundy/10 border border-burgundy/25">
                <AlertTriangle className="w-4 h-4 text-burgundy shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-burgundy font-mono uppercase tracking-wide">Engine Error</p>
                  <p className="text-xs text-emerald/55 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleAnalyze}
              disabled={!canSubmit}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-semibold uppercase tracking-wider text-xs transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed bg-burgundy hover:bg-charcoal active:scale-[0.98] text-cream"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" />{phase || "Processing..."}</>
              ) : (
                <><Send className="w-4 h-4" />Run Engine</>
              )}
            </button>
          </div>

          {/* ─ RIGHT: Output panel ────────── */}
          <div className="space-y-5">
            <p className="text-[10px] uppercase tracking-widest text-emerald/30 font-mono">
              02 — Telemetry Output
            </p>

            {/* Idle */}
            {!loading && !result && (
              <div className="flex flex-col items-center justify-center min-h-[520px] rounded-2xl border border-dashed border-emerald/12 text-emerald/20 gap-4">
                <Activity className="w-10 h-10 opacity-30" />
                <p className="font-mono text-xs uppercase tracking-widest">Standing by for raw data.</p>
              </div>
            )}

            {/* Loading */}
            {loading && !result && (
              <div className="flex flex-col items-center justify-center min-h-[520px] rounded-2xl border border-emerald/10 bg-charcoal/[0.04] gap-6">
                <div className="w-44 h-44">
                  <OrbScene score={50} active={true} />
                </div>
                <div className="text-center space-y-2">
                  <p className="font-mono text-xs uppercase tracking-widest text-emerald/40 animate-pulse">{phase}</p>
                  <p className="text-[10px] text-emerald/25 font-mono">This may take 30–90 seconds on GPU</p>
                </div>
              </div>
            )}

            {/* Result */}
            {result && !loading && (
              <div className="space-y-4">

                {/* Score card */}
                <div className="relative rounded-2xl border border-emerald/12 bg-charcoal overflow-hidden">
                  <div className="absolute right-0 top-0 w-52 h-52 opacity-50 pointer-events-none">
                    <OrbScene score={result.final_virality_score} active={false} />
                  </div>
                  <div className="relative z-10 p-8">
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-cream/30 mb-5">
                      <BarChart3 className="w-3.5 h-3.5" /> Virality Index
                    </div>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="font-heading text-8xl leading-none text-cream tabular-nums">
                        {result.final_virality_score.toFixed(1)}
                      </span>
                      <span className="text-gold font-semibold text-lg">/100</span>
                    </div>
                    <ProgressBar value={result.final_virality_score} color="bg-gold" delay={100} />
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <TierBadge tier={result.entity_tier} />
                      {result.entity_multiplier > 1 && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream/8 border border-cream/10 text-[10px] font-mono text-cream/40 uppercase tracking-widest">
                          <TrendingUp className="w-3 h-3" />
                          {result.entity_multiplier}× entity boost
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mini breakdown */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-charcoal/[0.06] border border-emerald/10 p-5">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-emerald/35 mb-2">Base Score</p>
                    <p className="text-3xl font-heading text-emerald tabular-nums">
                      {result.base_structural_score.toFixed(1)}
                    </p>
                    <ProgressBar value={result.base_structural_score} color="bg-emerald/50" delay={300} />
                  </div>
                  <div className="rounded-xl bg-charcoal/[0.06] border border-emerald/10 p-5">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-emerald/35 mb-2">Cohesion</p>
                    <p className="text-3xl font-heading text-emerald tabular-nums">
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

                {/* Vision analysis */}
                <div className="rounded-xl bg-charcoal/[0.06] border border-emerald/10 p-5">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-emerald/35 mb-3 flex items-center gap-2">
                    <Eye className="w-3.5 h-3.5" /> LLaVA Vision Analysis
                  </p>
                  <p className="text-sm text-emerald/65 leading-relaxed italic">
                    &ldquo;{result.thumbnail_analysis}&rdquo;
                  </p>
                </div>

                {/* Strategy report */}
                <div className="rounded-xl bg-charcoal border border-cream/8 p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-burgundy/20 border border-burgundy/20 text-burgundy">
                      <BrainCircuit className="w-4 h-4" />
                    </div>
                    <span className="font-heading text-2xl text-cream flex items-center gap-2">
                      AI Coach <Sparkles className="w-3.5 h-3.5 text-gold" />
                    </span>
                  </div>

                  {parsedReport.length > 0 ? (
                    <div className="space-y-3">
                      {parsedReport.slice(0, 3).map((section, i) => (
                        <div key={i} className="flex gap-3 bg-cream/[0.04] rounded-lg p-4">
                          <div className="shrink-0 mt-0.5 text-gold">
                            {reportIcons[i] ?? <ChevronRight className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-[10px] font-mono uppercase tracking-widest text-cream/30 mb-1">
                              {reportLabels[i] ?? `Point ${i + 1}`}
                            </p>
                            <p className="text-sm text-cream/65 leading-relaxed">{section}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-cream/[0.04] rounded-lg p-4">
                      <p className="text-sm text-cream/65 leading-relaxed whitespace-pre-line">
                        {result.ai_strategy_report}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer meta */}
                <div className="flex items-center gap-2 text-emerald/20 pt-1">
                  <Cpu className="w-3 h-3" />
                  <span className="font-mono text-[10px] uppercase tracking-widest">
                    trendsense_core_v4.pt · CUDA · Llama 3 · LLaVA
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Live Pulse ──────────────────── */}
        <section className="relative rounded-2xl border border-emerald/10 bg-charcoal/[0.04] p-6 overflow-hidden">
          <div className="absolute -left-20 -bottom-20 w-56 h-56 bg-burgundy/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
            {/* Header */}
            <div className="flex items-center gap-4 shrink-0 md:border-r md:border-emerald/10 md:pr-6">
              <div className="relative flex items-center justify-center">
                <span className="absolute w-5 h-5 bg-burgundy/30 rounded-full animate-ping" />
                <span className="w-2.5 h-2.5 bg-burgundy rounded-full relative z-10" />
              </div>
              <div>
                <h3 className="font-heading text-xl text-emerald flex items-center gap-2">
                  Live Pulse <Radio className="w-4 h-4 text-burgundy" />
                </h3>
                <p className="text-[10px] font-mono uppercase tracking-widest text-emerald/30 mt-0.5">
                  Trending Entity Radar
                </p>
              </div>
            </div>

            {/* Trend badges */}
            <div className="flex-1 flex flex-wrap gap-3">
              {MOCK_TRENDS.map((trend, idx) => (
                <div
                  key={trend.id}
                  className={`px-4 py-2 rounded-lg border flex items-center gap-3 transition-all duration-300 ${
                    trend.isHyperViral
                      ? "border-burgundy/35 bg-burgundy/8"
                      : "border-emerald/10 bg-emerald/[0.03]"
                  }`}
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  {trend.isHyperViral && (
                    <Flame className="w-3.5 h-3.5 text-burgundy animate-pulse shrink-0" />
                  )}
                  <span className="text-sm font-medium text-emerald">{trend.name}</span>
                  <span className="text-[10px] font-mono text-emerald/35 bg-emerald/5 px-2 py-0.5 rounded border border-emerald/8">
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