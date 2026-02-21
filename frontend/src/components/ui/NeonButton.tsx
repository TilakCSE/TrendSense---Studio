import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useRipple } from '@/hooks/useRipple';

interface NeonButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary';
}

export const NeonButton = forwardRef<HTMLButtonElement, NeonButtonProps>(
  ({ 
    children, 
    onClick, 
    disabled = false, 
    loading = false, 
    className = '', 
    type = 'button',
    size = 'md',
    variant = 'primary'
  }, ref) => {
    const createRipple = useRipple({ duration: 600 });

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      createRipple(e);
      onClick?.(e);
    };

    const sizeClasses = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    const variantClasses = {
      primary: 'neon-button',
      secondary: 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20',
    };

    return (
      <motion.button
        ref={ref}
        type={type}
        onClick={handleClick}
        disabled={disabled || loading}
        className={cn(
          'relative overflow-hidden rounded-xl font-semibold tracking-wide',
          'transition-all duration-300 ease-out',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
        whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      >
        {/* Loading spinner */}
        {loading && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2">
            <svg 
              className="animate-spin h-5 w-5" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </span>
        )}
        
        {/* Button content */}
        <span className={cn(
          'relative z-10 flex items-center justify-center gap-2',
          loading && 'pl-6'
        )}>
          {children}
        </span>

        {/* Glow effect overlay */}
        <div 
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)'
          }}
        />
      </motion.button>
    );
  }
);

NeonButton.displayName = 'NeonButton';
