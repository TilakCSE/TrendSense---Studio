"use client";
import { motion, HTMLMotionProps } from "framer-motion";
import { ElementType } from "react";

interface TimelineContentProps extends HTMLMotionProps<any> {
  animationNum: number;
  timelineRef?: any;
  customVariants: any;
  as?: ElementType;
  children: React.ReactNode;
}

export const TimelineContent = ({ 
  children, animationNum, customVariants, as: Component = "div", className, ...props 
}: TimelineContentProps) => {
  const MotionComponent = motion.create(Component as any);
  return (
    <MotionComponent
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-20%" }} // Triggers when element is 20% into the screen
      custom={animationNum}
      variants={customVariants}
      className={className}
      {...props}
    >
      {children}
    </MotionComponent>
  );
};