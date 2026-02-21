import { useCallback } from 'react';

interface RippleOptions {
  duration?: number;
  color?: string;
}

export function useRipple(options: RippleOptions = {}) {
  const { duration = 600, color = 'rgba(255, 255, 255, 0.4)' } = options;

  const createRipple = useCallback((event: React.MouseEvent<HTMLElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    
    const diameter = Math.max(rect.width, rect.height);
    const radius = diameter / 2;
    
    const x = event.clientX - rect.left - radius;
    const y = event.clientY - rect.top - radius;
    
    ripple.style.width = ripple.style.height = `${diameter}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.background = color;
    
    // Remove existing ripples
    const existingRipple = button.querySelector('.ripple');
    if (existingRipple) {
      existingRipple.remove();
    }
    
    button.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, duration);
  }, [duration, color]);

  return createRipple;
}
