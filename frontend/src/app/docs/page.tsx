"use client";
import Link from "next/link";
import { ArrowLeft, Code, Database, Server } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#030303] text-zinc-400 font-sans selection:bg-cyan-500/30">
      
      {/* Minimal Navbar */}
      <nav className="border-b border-white/[0.05] bg-[#030303]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto h-16 px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white hover:text-cyan-400 transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="text-xs font-mono tracking-widest uppercase">TrendSense / Documentation</div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-20">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white tracking-tight mb-4">System Architecture</h1>
          <p className="text-lg text-zinc-500 leading-relaxed">
            Understand how the TrendSense Neural Core processes social data in real-time.
          </p>
        </div>

        <div className="space-y-16">
          {/* Section 1 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Server className="w-4 h-4 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-semibold text-white">The FastAPI Engine</h2>
            </div>
            <p className="leading-relaxed mb-6">
              Our prediction pipeline is powered by a high-performance Python FastAPI backend. It receives incoming text payloads and runs them against an optimized VADER sentiment analysis model combined with a TF-IDF vectorizer trained on current viral datasets.
            </p>
            <div className="bg-[#09090B] border border-white/10 rounded-xl p-4 font-mono text-sm overflow-x-auto">
              <div className="text-zinc-500 mb-2">// Example Payload</div>
              <code className="text-cyan-300">
                POST /predict <br/>
                {`{`} <br/>
                &nbsp;&nbsp;"post_text": "This UI is absolutely insane fr fr", <br/>
                &nbsp;&nbsp;"simulated_hour": 14 <br/>
                {`}`}
              </code>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Database className="w-4 h-4 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-semibold text-white">Data Ingestion (MongoDB)</h2>
            </div>
            <p className="leading-relaxed">
              TrendSense doesn't just guess; it learns. We utilize MongoDB to cache live trending keywords. Every time the Oracle is queried, it compares the semantic weight of your text against the live database, assigning higher influence scores to keywords that are currently surging in the zeitgeist.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Code className="w-4 h-4 text-purple-400" />
              </div>
              <h2 className="text-2xl font-semibold text-white">Frontend Hydration</h2>
            </div>
            <p className="leading-relaxed">
              Built on Next.js 15, the dashboard utilizes strict Server-Side Rendering (SSR) boundaries. The 3D R3F (React Three Fiber) Neural Core is isolated in a client wrapper, allowing complex WebGL refractions without blocking the main DOM thread.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}