"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Terminal, Key, Cpu, Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function DocsPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const jsonResponse = `{
  "virality_index": 88,
  "sentiment_score": 0.65,
  "top_features": [
    ["aesthetic", 0.45],
    ["routine", 0.38]
  ],
  "ai_suggestion": "High virality potential detected..."
}`;

  return (
    <main className="min-h-screen bg-green-bean text-mashed-potatoes font-body selection:bg-cranberry selection:text-mashed-potatoes">
      
      {/* Top Navigation */}
      <nav className="w-full flex items-center justify-between px-6 py-4 border-b border-artichoke/20 bg-green-bean/95 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-artichoke hover:text-cranberry transition-colors flex items-center gap-2 text-sm uppercase tracking-widest font-semibold">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
          <div className="w-px h-4 bg-artichoke/30" />
          <span className="font-heading text-xl tracking-wide">TrendSense<span className="text-cranberry">.</span></span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-xs font-mono uppercase tracking-widest text-artichoke">
          <span>v2.1.0</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cranberry animate-pulse" />
            API Operational
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-start">
        
        {/* Left Sidebar (Sticky) */}
        <aside className="w-full md:w-64 shrink-0 md:sticky md:top-[73px] md:h-[calc(100vh-73px)] border-r border-artichoke/20 p-6 overflow-y-auto hidden md:block">
          <div className="space-y-8">
            <div>
              <h4 className="text-xs font-mono uppercase tracking-widest text-artichoke mb-4">Getting Started</h4>
              <ul className="space-y-3">
                <li><a href="#introduction" className="text-sm font-medium text-mashed-potatoes hover:text-cranberry transition-colors flex items-center gap-2"><Terminal className="w-4 h-4 text-artichoke" /> Introduction</a></li>
                <li><a href="#authentication" className="text-sm font-medium text-artichoke hover:text-cranberry transition-colors flex items-center gap-2"><Key className="w-4 h-4 text-artichoke" /> Authentication</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-mono uppercase tracking-widest text-artichoke mb-4">Endpoints</h4>
              <ul className="space-y-3">
                <li><a href="#predict" className="text-sm font-medium text-artichoke hover:text-cranberry transition-colors flex items-center gap-2"><Cpu className="w-4 h-4 text-artichoke" /> POST /predict</a></li>
              </ul>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 w-full p-6 md:p-12 lg:p-16 max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-16"
          >
            
            {/* Introduction Section */}
            <section id="introduction" className="scroll-mt-24">
              <span className="text-cranberry text-xs uppercase tracking-widest font-bold mb-2 block">TrendSense API</span>
              <h1 className="font-heading text-4xl md:text-5xl mb-6">Introduction</h1>
              <p className="text-artichoke leading-relaxed text-lg mb-6">
                The TrendSense API provides programmatic access to our proprietary neural core. Integrate real-time virality prediction, sentiment analysis, and AI-driven copy suggestions directly into your CMS or deployment pipelines.
              </p>
              <div className="bg-cranberry/10 border border-cranberry/30 rounded-xl p-4 flex gap-4 text-sm text-mashed-potatoes/90">
                <div className="shrink-0 mt-0.5 w-2 h-2 rounded-full bg-cranberry" />
                <p>Base URL: <code className="font-mono text-cranberry bg-cranberry/10 px-2 py-0.5 rounded ml-1">https://api.trendsense.io/v1</code></p>
              </div>
            </section>

            <hr className="border-artichoke/20" />

            {/* Authentication Section */}
            <section id="authentication" className="scroll-mt-24">
              <h2 className="font-heading text-3xl mb-4">Authentication</h2>
              <p className="text-artichoke leading-relaxed mb-6">
                Authenticate your API requests by including your secret API key in the Authorization header of your HTTP request. 
              </p>
              <div className="bg-black/40 border border-artichoke/20 rounded-xl overflow-hidden font-mono text-sm">
                <div className="flex items-center justify-between px-4 py-2 bg-black/60 border-b border-artichoke/20">
                  <span className="text-artichoke">HTTP Header</span>
                </div>
                <div className="p-4 text-mashed-potatoes">
                  Authorization: Bearer <span className="text-cranberry">ts_live_xxxxxxxxxxxxx</span>
                </div>
              </div>
            </section>

            <hr className="border-artichoke/20" />

            {/* Predict Endpoint Section */}
            <section id="predict" className="scroll-mt-24">
              <div className="flex items-center gap-4 mb-6">
                <span className="bg-cranberry text-mashed-potatoes text-xs font-mono font-bold px-2 py-1 rounded uppercase tracking-wider">Post</span>
                <h2 className="font-heading text-3xl">/predict</h2>
              </div>
              <p className="text-artichoke leading-relaxed mb-8">
                Analyzes raw social copy and returns a deterministic virality index, sentiment valence, and influence vectors.
              </p>

              {/* Request Layout */}
              <div className="mb-10">
                <h3 className="text-sm font-mono uppercase tracking-widest text-mashed-potatoes mb-4">Request Body</h3>
                <div className="bg-black/20 border border-artichoke/20 rounded-xl p-6">
                  <div className="grid grid-cols-12 gap-4 mb-4 border-b border-artichoke/10 pb-4">
                    <div className="col-span-4 font-mono text-sm text-cranberry">post_text</div>
                    <div className="col-span-2 font-mono text-xs text-artichoke">string</div>
                    <div className="col-span-6 text-sm text-artichoke">The raw copy/content to be analyzed. Max 2000 characters.</div>
                  </div>
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-4 font-mono text-sm text-cranberry">simulated_hour<span className="text-artichoke/50 ml-2 text-xs">optional</span></div>
                    <div className="col-span-2 font-mono text-xs text-artichoke">integer</div>
                    <div className="col-span-6 text-sm text-artichoke">Target posting hour (0-23). Defaults to current server time if omitted.</div>
                  </div>
                </div>
              </div>

              {/* Response Layout with Mock IDE */}
              <div>
                <h3 className="text-sm font-mono uppercase tracking-widest text-mashed-potatoes mb-4">Response Configuration</h3>
                <div className="bg-[#0D1117] border border-artichoke/20 rounded-xl overflow-hidden shadow-2xl relative group">
                  <div className="flex items-center justify-between px-4 py-3 bg-[#161B22] border-b border-artichoke/10">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-cranberry/80" />
                      <div className="w-3 h-3 rounded-full bg-artichoke/30" />
                      <div className="w-3 h-3 rounded-full bg-artichoke/30" />
                    </div>
                    <span className="text-xs font-mono text-artichoke uppercase tracking-widest">JSON</span>
                    <button 
                      onClick={handleCopy}
                      className="text-artichoke hover:text-mashed-potatoes transition-colors"
                    >
                      {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <pre className="p-6 overflow-x-auto text-sm font-mono leading-relaxed">
                    <code className="text-artichoke">
                      {jsonResponse.split('\n').map((line, i) => (
                        <div key={i} className="table-row">
                          <span className="table-cell text-right pr-6 opacity-30 select-none">{i + 1}</span>
                          <span className="table-cell">
                            <span dangerouslySetInnerHTML={{
                              __html: line
                                .replace(/"([^"]+)":/g, '<span class="text-[#79C0FF]">"$1"</span>:')
                                .replace(/([0-9.]+)/g, '<span class="text-[#D2A8FF]">$1</span>')
                                .replace(/"([^"]+)"(?=[,\n\r}])/g, '<span class="text-[#A5D6FF]">"$1"</span>')
                            }} />
                          </span>
                        </div>
                      ))}
                    </code>
                  </pre>
                </div>
              </div>
            </section>
            
          </motion.div>
        </div>
      </div>
    </main>
  );
}