"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";
import Features from "@/components/Features";
import LivePreview from "@/components/LivePreview";
import Pricing from "@/components/Pricing";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";
import Testimonials from "@/components/Testimonials";
// import dynamic from "next/dynamic";

// TEMPORARILY DISABLED FOR GPU STABILITY
// const HeroCanvas = dynamic(() => import("@/components/HeroCanvas"), { 
//   ssr: false,
//   loading: () => <div className="absolute inset-0 z-0 bg-mashed-potatoes" />
// });

export default function HomePage() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 10 },
    },
  };

  return (
    <main className="relative w-full overflow-x-hidden">
      
      {/* HERO WRAPPER */}
      <div className="relative w-full h-screen overflow-hidden bg-mashed-potatoes">
        
        {/* 3D WEBGL BACKGROUND (Commented out) */}
        {/* <HeroCanvas /> */}
        
        {/* Abstract Blur Orbs (Keeps the background looking premium!) */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-artichoke rounded-full mix-blend-multiply filter blur-[128px] animate-float" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-cranberry rounded-full mix-blend-multiply filter blur-[128px] animate-float" style={{ animationDelay: '2s' }} />
        </div>

        {/* FOREGROUND HERO UI */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 pt-20 pb-10 max-w-7xl mx-auto">
          
          {/* Navigation */}
          <nav className="absolute top-0 w-full flex justify-between items-center py-6 px-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-heading text-3xl font-bold tracking-tighter text-green-bean"
            >
              TrendSense.
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Link 
                href="/dashboard" 
                className="text-sm uppercase tracking-widest font-semibold hover:text-cranberry transition-colors"
              >
                Enter App
              </Link>
            </motion.div>
          </nav>

          {/* Hero Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center max-w-4xl mx-auto flex flex-col items-center mt-[-5vh]" 
          >
            <motion.span 
              variants={itemVariants}
              className="inline-block py-1 px-3 rounded-full border border-artichoke/30 text-artichoke text-sm uppercase tracking-widest mb-6 backdrop-blur-sm"
            >
              The Oracle is Online
            </motion.span>

            <motion.h1 
              variants={itemVariants}
              className="font-heading text-6xl md:text-8xl lg:text-9xl leading-[0.9] tracking-tight text-green-bean mb-8"
            >
              Predict the <br />
              <span className="text-cranberry italic pr-4">Unpredictable.</span>
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-lg md:text-xl text-mulled-wine/80 max-w-2xl mb-12 font-medium"
            >
              We don't chase trends, we engineer them. Feed the engine your content and let our AI isolate the signals of virality before you hit post.
            </motion.p>

            <motion.div variants={itemVariants}>
              <Link 
                href="/dashboard"
                className="group relative inline-flex items-center justify-center px-8 py-4 bg-cabernet text-mashed-potatoes overflow-hidden rounded-sm transition-transform hover:scale-105 active:scale-95 shadow-2xl shadow-cabernet/20"
              >
                <div className="absolute inset-0 w-0 bg-green-bean transition-all duration-300 ease-out group-hover:w-full"></div>
                <span className="relative text-lg font-semibold uppercase tracking-wider flex items-center gap-2">
                  Launch Engine
                  <svg 
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </Link>
            </motion.div>
          </motion.div>

        </div>
      </div>

      {/* OTHER SECTIONS FLOW NORMALLY BELOW */}
      <Testimonials />
      <Features />
      <HowItWorks />
      <LivePreview />
      <Pricing />
      <Footer />

    </main>
  );
}