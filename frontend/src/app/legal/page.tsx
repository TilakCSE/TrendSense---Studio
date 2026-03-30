import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#030303] text-zinc-400 font-sans selection:bg-cyan-500/30">
      
      <nav className="border-b border-white/[0.05] bg-[#030303]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-3xl mx-auto h-16 px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white hover:text-cyan-400 transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-sm font-mono text-zinc-500 mb-12 uppercase tracking-widest">Last Updated: March 2026</p>

        <div className="space-y-8 text-base leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">1. Data Processing</h2>
            <p>
              TrendSense operates as a real-time analysis engine. Text inputs sent to the Neural Core via our dashboard or API are processed strictly in-memory for the duration of the prediction request. We do not permanently store, log, or train on user-provided content.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">2. Live Analytics</h2>
            <p>
              Our systems continuously monitor global social platforms to aggregate trending keywords. This data is stored in our MongoDB clusters and contains no Personally Identifiable Information (PII). It is used solely to calibrate the weighting algorithms of the virality index.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">3. Local Storage & Cookies</h2>
            <p>
              The TrendSense frontend utilizes local browser storage strictly for functional UI purposes, such as maintaining user preferences (e.g., Night Mode toggles) and Command Palette state. We do not use tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">4. Academic & Enterprise Use</h2>
            <p>
              TrendSense was developed as an advanced academic architecture project by our engineering team. Any commercial use or API integration requires explicit authorization. Contact the administration team for SLA agreements.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}