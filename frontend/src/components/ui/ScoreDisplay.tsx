import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCountUp } from '@/hooks/useCountUp';
import { cn } from '@/lib/utils';

interface ScoreDisplayProps {
  score: number;
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ScoreDisplay({ 
  score, 
  animated = true,
  size = 'lg'
}: ScoreDisplayProps) {
  const [showScore, setShowScore] = useState(false);
  const { value, isComplete } = useCountUp({
    end: score,
    duration: 1500,
    delay: 300,
  });

  useEffect(() => {
    const timer = setTimeout(() => setShowScore(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const sizeClasses = {
    sm: 'text-4xl',
    md: 'text-6xl',
    lg: 'text-8xl',
  };

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-[#00FF88]';
    if (s >= 60) return 'text-yellow-400';
    if (s >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreGlow = (s: number) => {
    if (s >= 80) return '0 0 30px rgba(0, 255, 136, 0.5)';
    if (s >= 60) return '0 0 30px rgba(250, 204, 21, 0.4)';
    if (s >= 40) return '0 0 30px rgba(251, 146, 60, 0.4)';
    return '0 0 30px rgba(248, 113, 113, 0.4)';
  };

  return (
    <div className="relative flex flex-col items-center">
      <AnimatePresence>
        {showScore && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.5, 
              type: 'spring',
              stiffness: 200,
              damping: 15
            }}
            className="relative"
          >
            {/* Glow background */}
            <motion.div
              className="absolute inset-0 blur-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              style={{ 
                background: `radial-gradient(circle, ${getScoreColor(score).replace('text-', '').replace('[', '').replace(']', '')} 0%, transparent 70%)` 
              }}
            />
            
            {/* Score number */}
            <span
              className={cn(
                'font-display font-bold tabular-nums relative z-10',
                sizeClasses[size],
                getScoreColor(score)
              )}
              style={{
                textShadow: getScoreGlow(score)
              }}
            >
              {animated ? value : score}
            </span>
            
            {/* Unit suffix */}
            <span className={cn(
              'text-white/40 font-medium ml-1',
              size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-xl' : 'text-lg'
            )}>
              /100
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion indicator */}
      {isComplete && animated && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-white/40 font-mono-custom"
        >
          Analysis Complete
        </motion.div>
      )}
    </div>
  );
}
