import { motion } from 'framer-motion';

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  animated?: boolean;
}

export function CircularProgress({ 
  value, 
  size = 200, 
  strokeWidth = 8,
  animated = true 
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  const getColor = (v: number) => {
    if (v >= 80) return '#00FF88';
    if (v >= 60) return '#FACC15';
    if (v >= 40) return '#FB923C';
    return '#F87171';
  };

  const color = getColor(value);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="circular-progress"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="circular-progress-track"
        />
        
        {/* Progress fill */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="circular-progress-fill"
          stroke={color}
          strokeDasharray={circumference}
          initial={animated ? { strokeDashoffset: circumference } : false}
          animate={{ strokeDashoffset: offset }}
          transition={{ 
            duration: 1.5, 
            ease: [0.22, 1, 0.36, 1],
            delay: 0.3
          }}
          style={{
            filter: `drop-shadow(0 0 6px ${color}80)`
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={animated ? { opacity: 0, scale: 0.8 } : false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center"
        >
          <span 
            className="font-display text-4xl font-bold"
            style={{ color, textShadow: `0 0 20px ${color}60` }}
          >
            {value}
          </span>
          <span className="text-white/40 text-sm ml-1">/100</span>
        </motion.div>
      </div>
    </div>
  );
}
