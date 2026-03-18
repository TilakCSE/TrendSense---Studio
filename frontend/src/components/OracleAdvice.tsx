import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, Sparkles } from 'lucide-react'

interface OracleAdviceProps {
  suggestion: string
  className?: string
}

export function OracleAdvice({ suggestion, className = '' }: OracleAdviceProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  // Typing animation effect
  useEffect(() => {
    if (!suggestion) return

    // Reset animation when suggestion changes
    setDisplayedText('')
    setIsComplete(false)

    let currentIndex = 0
    const typingInterval = setInterval(() => {
      currentIndex++

      if (currentIndex <= suggestion.length) {
        setDisplayedText(suggestion.slice(0, currentIndex))
      } else {
        setIsComplete(true)
        clearInterval(typingInterval)
      }
    }, 30) // 30ms per character for smooth typing

    return () => clearInterval(typingInterval)
  }, [suggestion])

  if (!suggestion) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className={`glass-card rounded-xl p-6 border border-[#00D4FF]/20 bg-[#00D4FF]/5 relative overflow-hidden ${className}`}
    >
      {/* Animated background glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-[#00D4FF]/10 via-transparent to-transparent"
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="w-full h-full bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,#00D4FF_2px,#00D4FF_4px)]" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header Badge */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00D4FF]/10 border border-[#00D4FF]/30 mb-4"
        >
          <Brain className="w-4 h-4 text-[#00D4FF]" />
          <span className="text-xs font-bold uppercase tracking-widest text-[#00D4FF] font-mono-custom">
            System Oracle
          </span>
          {!isComplete && (
            <motion.div
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-[#00D4FF]"
            />
          )}
          {isComplete && (
            <Sparkles className="w-3 h-3 text-[#00D4FF]" />
          )}
        </motion.div>

        {/* Oracle Message */}
        <div className="space-y-2">
          <motion.p
            className="text-sm text-[#00D4FF]/80 font-mono-custom leading-relaxed tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {displayedText}
            {!isComplete && (
              <motion.span
                animate={{ opacity: [0, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="inline-block w-2 h-4 ml-1 bg-[#00D4FF]/70"
              />
            )}
          </motion.p>
        </div>

        {/* Bottom accent line */}
        {isComplete && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 h-[1px] bg-gradient-to-r from-[#00D4FF]/50 via-[#00D4FF]/20 to-transparent origin-left"
          />
        )}
      </div>

      {/* Corner decorations */}
      <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#00D4FF]/20" />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[#00D4FF]/20" />
    </motion.div>
  )
}
