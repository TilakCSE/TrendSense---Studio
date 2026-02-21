import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  glowColor?: string;
  animate?: boolean;
  delay?: number;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ 
    children, 
    className = '', 
    hover = true, 
    glow = false,
    glowColor = 'rgba(0, 255, 136, 0.15)',
    animate = true,
    delay = 0 
  }, ref) => {
    const baseStyles = 'glass-card rounded-2xl p-6 relative overflow-hidden';
    const hoverStyles = hover ? 'glass-card-hover cursor-default' : '';
    
    const glowStyles = glow ? {
      boxShadow: `0 0 30px ${glowColor}, 0 8px 32px rgba(0, 0, 0, 0.4)`
    } : {};

    if (animate) {
      return (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.6, 
            delay,
            ease: [0.22, 1, 0.36, 1]
          }}
          className={cn(baseStyles, hoverStyles, className)}
          style={glowStyles}
        >
          {/* Subtle gradient overlay */}
          <div 
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%, rgba(0,255,136,0.02) 100%)'
            }}
          />
          {children}
        </motion.div>
      );
    }

    return (
      <div 
        ref={ref}
        className={cn(baseStyles, hoverStyles, className)}
        style={glowStyles}
      >
        <div 
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%, rgba(0,255,136,0.02) 100%)'
          }}
        />
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
