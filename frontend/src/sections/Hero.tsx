import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { heroConfig } from '@/config';
import { PhysicsScene } from '@/components/three/PhysicsScene';
import { Cpu, Zap } from 'lucide-react';

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sphereKey, setSphereKey] = useState(0);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -50]);

  // Reset sphere animation periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setSphereKey(prev => prev + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.section
      ref={containerRef}
      style={{ opacity, scale, y }}
      className="relative w-full min-h-screen flex flex-col overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 animated-gradient-bg" />
      <div className="absolute inset-0 grid-pattern" />
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${6 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Top Navigation Bar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative z-20 w-full px-6 py-4 flex items-center justify-between"
      >
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00FF88] to-[#00CC6A] flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Zap className="w-5 h-5 text-black" />
          </motion.div>
          <span className="font-display text-xl tracking-tight">
            {heroConfig.brandName}
          </span>
        </div>

        {/* Corner Info */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full glass-card">
            <Cpu className="w-4 h-4 text-[#00FF88]" />
            <span className="text-xs text-white/60 font-mono-custom">
              {heroConfig.cornerLabel}
            </span>
            <span className="text-xs text-[#00FF88] font-mono-custom">
              {heroConfig.cornerValue}
            </span>
          </div>
        </div>
      </motion.nav>

      {/* Main Hero Content */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center px-6 py-12 gap-12">
        {/* Left: Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex-1 max-w-xl text-center lg:text-left"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00FF88]/10 border border-[#00FF88]/30 mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" />
            <span className="text-sm text-[#00FF88] font-medium">
              Next-Gen AI Analytics
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="font-display text-5xl sm:text-6xl lg:text-7xl mb-4 leading-tight"
          >
            <span className="text-white">Predict</span>
            <br />
            <span className="text-neon-glow text-[#00FF88]">Virality</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-lg text-white/60 mb-8 leading-relaxed"
          >
            {heroConfig.subtitle}
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex items-center justify-center lg:justify-start gap-8"
          >
            {[
              { value: '95%', label: 'Accuracy' },
              { value: '10M+', label: 'Predictions' },
              { value: '<2s', label: 'Response' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="font-display text-2xl text-[#00FF88]">
                  {stat.value}
                </div>
                <div className="text-xs text-white/40 font-mono-custom">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right: 3D Scene */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex-1 w-full max-w-lg h-[400px] lg:h-[500px]"
        >
          <div className="relative w-full h-full rounded-2xl overflow-hidden glass-card">
            {/* 3D Canvas */}
            <PhysicsScene 
              key={sphereKey}
              className="w-full h-full"
              spherePosition={[0, 6, 0]}
              onSphereClick={() => setSphereKey(prev => prev + 1)}
            />
            
            {/* Overlay UI */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" />
                <span className="text-xs text-white/60 font-mono-custom">
                  Physics Engine Active
                </span>
              </div>
              <div className="text-xs text-white/40 font-mono-custom">
                Click sphere to reset
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#030303] to-transparent pointer-events-none" />
    </motion.section>
  );
}
