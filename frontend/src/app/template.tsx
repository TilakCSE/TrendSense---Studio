"use client";
import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      // Starts slightly lower, invisible, and slightly blurred
      initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
      // Animates to its final resting place perfectly sharp
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      // Uses a custom bezier curve for that "Apple/Linear" snap
      transition={{ 
        duration: 0.5, 
        ease: [0.22, 1, 0.36, 1] 
      }}
      className="w-full h-full flex flex-col flex-1"
    >
      {children}
    </motion.div>
  );
}