import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { sentimentConfig } from '@/config';
import type { SentimentType } from '@/types';
import { TrendingUp, Minus, TrendingDown } from 'lucide-react';

interface SentimentIndicatorProps {
  sentiment: SentimentType;
  animated?: boolean;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function SentimentIndicator({ 
  sentiment, 
  animated = true,
  showLabel = true,
  size = 'md'
}: SentimentIndicatorProps) {
  const config = sentimentConfig[sentiment.toLowerCase() as keyof typeof sentimentConfig];
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const iconSizes = {
    sm: 16,
    md: 24,
    lg: 32,
  };

  const getIcon = () => {
    switch (sentiment) {
      case 'Positive':
        return <TrendingUp size={iconSizes[size]} />;
      case 'Negative':
        return <TrendingDown size={iconSizes[size]} />;
      default:
        return <Minus size={iconSizes[size]} />;
    }
  };

  return (
    <motion.div
      initial={animated ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex items-center gap-4"
    >
      {/* Icon container with glow */}
      <motion.div
        className={cn(
          'rounded-xl flex items-center justify-center',
          sizeClasses[size]
        )}
        style={{
          background: `linear-gradient(135deg, ${config.color}20 0%, ${config.color}10 100%)`,
          border: `1px solid ${config.color}40`,
          boxShadow: `0 0 20px ${config.glow}`,
          color: config.color,
        }}
        animate={animated ? {
          boxShadow: [
            `0 0 20px ${config.glow}`,
            `0 0 40px ${config.glow}`,
            `0 0 20px ${config.glow}`,
          ]
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        {getIcon()}
      </motion.div>

      {/* Label */}
      {showLabel && (
        <div className="flex flex-col">
          <span className="text-white/50 text-sm font-medium">Sentiment</span>
          <motion.span
            className="font-semibold text-lg"
            style={{ color: config.color }}
            initial={animated ? { opacity: 0, x: -10 } : false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {config.label}
          </motion.span>
        </div>
      )}
    </motion.div>
  );
}
