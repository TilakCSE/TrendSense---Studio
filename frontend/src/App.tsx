import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { siteConfig } from './config';
import { Hero } from './sections/Hero';
import { PredictorSection } from './sections/PredictorSection';
import './index.css';

function App() {
  useEffect(() => {
    // Set page title
    if (siteConfig.title) {
      document.title = siteConfig.title;
    }

    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && siteConfig.description) {
      metaDescription.setAttribute('content', siteConfig.description);
    }

    // Add viewport meta for better mobile experience
    const metaViewport = document.querySelector('meta[name="viewport"]');
    if (metaViewport) {
      metaViewport.setAttribute(
        'content',
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
      );
    }
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full min-h-screen bg-[#030303] overflow-x-hidden"
      >
        {/* Global Background Effects */}
        <div className="fixed inset-0 pointer-events-none">
          {/* Animated gradient orbs */}
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#00FF88]/5 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#00FF88]/3 rounded-full blur-[120px]" />
          
          {/* Subtle noise texture overlay */}
          <div 
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Hero Section with 3D Scene */}
        <Hero />

        {/* Predictor Section - Main Interface */}
        <PredictorSection />

        {/* Footer */}
        <footer className="relative z-10 w-full py-8 px-6 border-t border-white/5">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00FF88] to-[#00CC6A] flex items-center justify-center">
                <svg 
                  className="w-4 h-4 text-black" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M13 10V3L4 14h7v7l9-11h-7z" 
                  />
                </svg>
              </div>
              <span className="font-semibold text-white/70">{siteConfig.title.split(' | ')[0]}</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-white/40">
              <span className="font-mono-custom text-xs">
                API: localhost:8000
              </span>
              <span className="hidden sm:inline">|</span>
              <span>© 2024 TrendSense</span>
            </div>
          </div>
        </footer>
      </motion.main>
    </AnimatePresence>
  );
}

export default App;
