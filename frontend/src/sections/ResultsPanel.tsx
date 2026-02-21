import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { ScoreDisplay } from '@/components/ui/ScoreDisplay';
import { SentimentIndicator } from '@/components/ui/SentimentIndicator';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { resultsConfig } from '@/config';
import { Activity, BarChart3, Zap } from 'lucide-react';
import type { PredictResponse, LoadingState } from '@/types';

interface ResultsPanelProps {
  data: PredictResponse | null;
  status: LoadingState;
}

export function ResultsPanel({ data, status }: ResultsPanelProps) {
  const isEmpty = status === 'idle' || (!data && status !== 'loading');
  const isLoading = status === 'loading';
  const hasResult = status === 'success' && data !== null;

  return (
    <GlassCard 
      className="h-full flex flex-col"
      delay={0.2}
      glow={hasResult}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#00FF88]" />
          <span className="font-semibold text-white/90">Results</span>
        </div>
        {hasResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00FF88]/10 border border-[#00FF88]/30"
          >
            <Zap className="w-3.5 h-3.5 text-[#00FF88]" />
            <span className="text-xs text-[#00FF88] font-medium">Complete</span>
          </motion.div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
        <AnimatePresence mode="wait">
          {/* Empty State */}
          {isEmpty && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="relative mb-6">
                <motion.div
                  className="w-24 h-24 mx-auto rounded-2xl bg-white/5 flex items-center justify-center"
                  animate={{
                    boxShadow: [
                      '0 0 0 rgba(0, 255, 136, 0)',
                      '0 0 30px rgba(0, 255, 136, 0.1)',
                      '0 0 0 rgba(0, 255, 136, 0)',
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Activity className="w-10 h-10 text-white/20" />
                </motion.div>
                {/* Orbiting dot */}
                <motion.div
                  className="absolute top-0 left-1/2 w-2 h-2 bg-[#00FF88] rounded-full"
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  style={{
                    transformOrigin: '0 48px',
                  }}
                />
              </div>
              <h3 className="text-xl font-semibold text-white/70 mb-2">
                {resultsConfig.emptyStateTitle}
              </h3>
              <p className="text-white/40 text-sm max-w-[200px]">
                {resultsConfig.emptyStateSubtitle}
              </p>
            </motion.div>
          )}

          {/* Loading State */}
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className="relative w-32 h-32 mx-auto mb-6">
                {/* Outer ring */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-[#00FF88]/20"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
                {/* Middle ring */}
                <motion.div
                  className="absolute inset-4 rounded-full border-2 border-[#00FF88]/40 border-t-transparent"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
                {/* Inner ring */}
                <motion.div
                  className="absolute inset-8 rounded-full border-2 border-[#00FF88]/60 border-b-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
                {/* Center pulse */}
                <motion.div
                  className="absolute inset-12 rounded-full bg-[#00FF88]/20"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </div>
              <p className="text-[#00FF88]/70 font-mono-custom text-sm ai-pulse">
                Processing neural networks...
              </p>
            </motion.div>
          )}

          {/* Result State */}
          {hasResult && data && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
              className="w-full"
            >
              {/* Score Section */}
              <div className="flex flex-col items-center mb-8">
                <motion.span
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-white/50 text-sm font-medium mb-4"
                >
                  {resultsConfig.scoreLabel}
                </motion.span>
                
                <div className="flex items-center gap-8">
                  {/* Circular Progress */}
                  <CircularProgress 
                    value={data.score} 
                    size={160} 
                    strokeWidth={10}
                  />
                  
                  {/* Large Score Display */}
                  <ScoreDisplay score={data.score} size="md" />
                </div>
              </div>

              {/* Divider */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6"
              />

              {/* Sentiment Section */}
              <div className="flex flex-col items-center">
                <motion.span
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-white/50 text-sm font-medium mb-4"
                >
                  {resultsConfig.sentimentLabel}
                </motion.span>
                
                <SentimentIndicator 
                  sentiment={data.sentiment} 
                  size="lg"
                  showLabel
                />
              </div>

              {/* Insights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-[#00FF88]" />
                  <span className="text-sm font-medium text-white/70">AI Insight</span>
                </div>
                <p className="text-sm text-white/50">
                  {data.score >= 80 
                    ? 'Exceptional viral potential! This content has all the markers of high engagement.'
                    : data.score >= 60
                    ? 'Strong viral potential. Consider optimizing your hook for better reach.'
                    : data.score >= 40
                    ? 'Moderate potential. Adding emotional triggers could improve performance.'
                    : 'Low viral potential. Consider revising your approach for better engagement.'}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
}
