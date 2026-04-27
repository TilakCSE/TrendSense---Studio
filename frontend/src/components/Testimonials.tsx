"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "TrendSense caught the 'quiet luxury' shift three weeks before it trended on TikTok. It fundamentally changed our content strategy.",
    author: "Julian Reed",
    role: "Creative Director, Studio Blanc",
  },
  {
    quote: "The Virality Index isn't just a gimmick. We run every draft through the Neural Core. Our engagement velocity is up 400% this quarter.",
    author: "Maya Patel",
    role: "Head of Growth, Vanguard Media",
  },
  {
    quote: "It feels like cheating. The AI Oracle suggested moving our post window by two hours and swapping one keyword. The video hit 2.4M views.",
    author: "David Chen",
    role: "Independent Creator",
  },
  {
    quote: "We used to guess what would resonate based on gut feeling. Now we use deterministic data. TrendSense is the ultimate unfair advantage.",
    author: "Elena Vasquez",
    role: "Brand Strategist",
  },
  {
    quote: "The interface is gorgeous, but the telemetry is what keeps us here. Being able to isolate specific influence vectors is invaluable.",
    author: "Samir Vance",
    role: "Founder, Apex Social",
  },
];

export default function Testimonials() {
  // We duplicate the array to create a seamless infinite loop
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <section className="relative w-full py-24 bg-mashed-potatoes overflow-hidden border-b border-artichoke/20">
      
      <div className="max-w-7xl mx-auto px-6 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-xl"
        >
          <span className="text-cranberry text-xs uppercase tracking-widest font-bold mb-2 block">The Vanguard</span>
          <h2 className="font-heading text-3xl md:text-4xl text-green-bean">
            Trusted by the <span className="italic text-cranberry">Elite.</span>
          </h2>
        </motion.div>
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-artichoke text-sm uppercase tracking-widest font-mono hidden md:block"
        >
          Live Telemetry / Active Users
        </motion.p>
      </div>

      {/* Infinite Marquee Container */}
      <div className="relative w-full flex items-center overflow-hidden">
        
        {/* Left/Right Fade Masks so cards don't just abruptly cut off */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-mashed-potatoes to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-mashed-potatoes to-transparent z-10 pointer-events-none" />

        <motion.div
          className="flex gap-6 pl-6 cursor-grab active:cursor-grabbing"
          animate={{
            x: ["0%", "-50%"],
          }}
          transition={{
            ease: "linear",
            duration: 40,
            repeat: Infinity,
          }}
          // Pauses the animation on hover!
          whileHover={{ animationPlayState: "paused" }} 
        >
          {duplicatedTestimonials.map((testimonial, idx) => (
            <div 
              key={idx} 
              className="w-[350px] md:w-[450px] shrink-0 bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-artichoke/20 hover:border-cranberry/40 hover:bg-white/90 transition-colors duration-300 group"
            >
              <Quote className="w-8 h-8 text-cranberry/30 mb-6 group-hover:text-cranberry/60 transition-colors" />
              <p className="text-mulled-wine text-lg md:text-xl leading-relaxed font-heading mb-8">
                "{testimonial.quote}"
              </p>
              <div className="flex flex-col">
                <span className="text-green-bean font-semibold text-sm uppercase tracking-wider">{testimonial.author}</span>
                <span className="text-artichoke text-xs font-mono mt-1">{testimonial.role}</span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}