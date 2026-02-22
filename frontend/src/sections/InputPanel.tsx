import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { CharacterCounter } from '@/components/ui/CharacterCounter';
import { inputConfig } from '@/config';
import { Sparkles, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputPanelProps {
  onSubmit: (content: string) => void;
  isLoading: boolean;
  error: { message: string; code?: string } | null;
}

export function InputPanel({ onSubmit, isLoading, error }: InputPanelProps) {
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = useCallback(() => {
    if (content.trim() && !isLoading) {
      onSubmit(content);
    }
  }, [content, isLoading, onSubmit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  }, [handleSubmit]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= inputConfig.maxLength) {
      setContent(value);
    }
  }, []);

  return (
    <GlassCard 
      className="h-full flex flex-col"
      delay={0.1}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: isLoading ? 360 : 0 }}
            transition={{ duration: 2, repeat: isLoading ? Infinity : 0, ease: 'linear' }}
          >
            <Sparkles className="w-5 h-5 text-[#00FF88]" />
          </motion.div>
          <span className="font-semibold text-white/90">{inputConfig.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40 font-mono-custom">AI POWERED</span>
          <div className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" />
        </div>
      </div>

      {/* Text Input Area */}
      <div className="relative flex-1 min-h-[200px]">
        <motion.div
          className={cn(
            'absolute inset-0 rounded-xl pointer-events-none transition-all duration-300',
            isFocused && 'ring-2 ring-[#00FF88]/30'
          )}
        />
        <textarea
          value={content}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={inputConfig.placeholder}
          disabled={isLoading}
          className={cn(
            'glass-input w-full h-full p-4 text-base leading-relaxed',
            'placeholder:text-white/30',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          style={{ minHeight: '200px' }}
        />
        
        {/* Focus indicator */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-4 right-4 text-xs text-[#00FF88]/60 font-mono-custom"
            >
              Ctrl+Enter to predict
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Character Counter */}
      <div className="mt-4">
        <CharacterCounter 
          current={content.length} 
          max={inputConfig.maxLength} 
        />
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 overflow-hidden"
          >
            <div className="alert-futuristic p-3 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 text-sm font-medium">{error.message}</p>
                {error.code && (
                  <p className="text-red-400/60 text-xs font-mono-custom mt-1">
                    Error: {error.code}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Button */}
      <div className="mt-6">
        <NeonButton
          onClick={handleSubmit}
          disabled={!content.trim() || isLoading}
          loading={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? inputConfig.buttonTextLoading : inputConfig.buttonText}
        </NeonButton>
      </div>

      {/* Loading indicator */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 text-center"
          >
            <div className="flex items-center justify-center gap-2 text-[#00FF88]/70">
              <div className="loading-ring">
                <div />
                <div />
                <div />
                <div />
              </div>
              <span className="text-sm font-mono-custom">AI analyzing content...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
