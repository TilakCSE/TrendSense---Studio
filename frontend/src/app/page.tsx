"use client";
import ScrollExpandMedia from "@/components/ui/scroll-expansion-hero";
import GlassCube from "@/components/ui/glass-cube";
import PricingSection from "@/components/ui/pricing-section-4";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-starlight selection:bg-olive selection:text-starlight overflow-x-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-screen w-full overflow-hidden">
        
        {/* Top Left: Logo */}
        <div className="absolute top-8 left-8 lg:left-12 z-50">
          <span className="font-serif text-2xl font-bold text-wine tracking-tighter">TS.</span>
        </div>

        {/* Top Right: Navigation */}
        <nav className="absolute top-8 right-8 lg:right-12 z-50 hidden md:flex items-center gap-8 font-mono text-xs uppercase tracking-widest text-olive">
          <Link href="#platform" className="hover:text-wine transition-colors">Platform</Link>
          <Link href="/team" className="hover:text-wine transition-colors">Team</Link>
          <Link href="/docs" className="hover:text-wine transition-colors">Docs</Link>
        </nav>

        {/* The 3D Glass Cube */}
        <GlassCube />

        {/* Slogan underneath the 3D Cube - BIGGER AND LOWER */}
        <div className="absolute inset-x-0 bottom-[12%] z-10 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-olive text-2xl md:text-3xl font-serif tracking-wide max-w-2xl text-center px-4 drop-shadow-sm">
            We're TrendSense. We don't chase trends, we predict them.
          </p>
        </div>

        {/* Bottom Left: Hero Details */}
        <div className="absolute bottom-8 left-8 lg:left-12 z-50 flex items-center gap-3">
           <div className="w-2 h-2 rounded-full bg-olive animate-pulse" />
           <span className="font-mono text-xs uppercase tracking-widest text-olive">Neural Engine Active</span>
        </div>

        {/* Bottom Right: Call To Goal (CTG) */}
        <div className="absolute bottom-8 right-8 lg:right-12 z-50">
          <Link href="/dashboard" className="h-12 px-6 rounded-full bg-wine text-starlight font-sans font-medium flex items-center gap-3 hover:bg-olive transition-colors duration-300">
            Launch App <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </section>

      {/* 2. SCROLL SHOWCASE */}
      <div id="platform" className="relative w-full">
        <ScrollExpandMedia
          mediaType="image"
          mediaSrc="https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2000&auto=format&fit=crop"
          bgImageSrc="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop"
          title="Neural Resonance"
          scrollToExpand="Scroll to dive deep"
          textBlend={true}
        >
          <div className="max-w-4xl mx-auto py-20 text-starlight">
            <h2 className="text-4xl md:text-6xl font-serif mb-8 text-starlight">
              Data, but make it visceral.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <p className="text-lg leading-relaxed opacity-90 font-sans">
                Welcome to the core. This is where we drop the dashboard, the analytics, and the real-time VADER sentiment graphs. The scroll animation pulled the user out of the marketing fluff and directly into the engine room.
              </p>
            </div>
          </div>
        </ScrollExpandMedia>
      </div>

      {/* 3. PRICING SECTION */}
      <PricingSection />

    </main>
  );
}