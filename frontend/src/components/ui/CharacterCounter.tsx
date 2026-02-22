import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CharacterCounterProps {
  current: number;
  max: number;
  animated?: boolean;
}

export function CharacterCounter({ 
  current, 
  max, 
  animated = true 
}: CharacterCounterProps) {
  const percentage = (current / max) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = current >= max;

  return (
    <div className="flex items-center gap-2 text-sm">
      {/* Progress bar */}
      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className={cn(
            'h-full rounded-full transition-colors duration-300',
            isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-[#00FF88]'
          )}
          initial={animated ? { width: 0 } : false}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
      
      {/* Counter text */}
      <AnimatePresence mode="wait">
        <motion.span
          key={current}
          initial={animated ? { opacity: 0, y: -5 } : false}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.15 }}
          className={cn(
            'font-mono-custom tabular-nums transition-colors duration-300',
            isAtLimit ? 'text-red-400' : isNearLimit ? 'text-yellow-400' : 'text-white/50'
          )}
        >
          {current}/{max}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
