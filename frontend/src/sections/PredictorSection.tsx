import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { InputPanel } from './InputPanel';
import { ResultsPanel } from './ResultsPanel';
import { usePrediction } from '@/hooks/usePrediction';
import { Brain, Sparkles } from 'lucide-react';

export function PredictorSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { status, data, predict } = usePrediction();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'start center'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 0.5], [50, 0]);

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-screen py-20 px-4 sm:px-6 lg:px-8"
    >
      {/* Section Background */}
      <div className="absolute inset-0 bg-[#030303]" />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 136, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 136, 0.02) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <motion.div
        style={{ opacity, y }}
        className="relative z-10 max-w-7xl mx-auto"
      >
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6"
          >
            <Brain className="w-4 h-4 text-[#00FF88]" />
            <span className="text-sm text-white/60 font-mono-custom">
              Neural Network Analysis
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl mb-4"
          >
            <span className="text-white">Analyze Your </span>
            <span className="text-[#00FF88] text-neon-glow">Content</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white/50 max-w-2xl mx-auto"
          >
            Enter your post draft below and let our AI analyze its viral potential 
            based on sentiment, engagement patterns, and trending factors.
          </motion.p>
        </div>

        {/* Main Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Panel - Input */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <InputPanel
              onSubmit={predict}
              isLoading={status === 'loading'}
              error={null}
            />
          </motion.div>

          {/* Right Panel - Results */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <ResultsPanel 
              data={data}
              status={status}
            />
          </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            {
              icon: Sparkles,
              title: 'Real-time Analysis',
              description: 'Get instant predictions powered by advanced neural networks',
            },
            {
              icon: Brain,
              title: 'Sentiment Detection',
              description: 'Understand the emotional impact of your content',
            },
            {
              icon: Sparkles,
              title: 'Viral Score',
              description: 'Quantified virality potential from 0 to 100',
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
              className="glass-card rounded-xl p-5 hover:border-[#00FF88]/20 transition-colors"
            >
              <feature.icon className="w-6 h-6 text-[#00FF88] mb-3" />
              <h3 className="font-semibold text-white/90 mb-1">{feature.title}</h3>
              <p className="text-sm text-white/50">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
