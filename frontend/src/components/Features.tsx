"use client";

import { motion, Variants } from "framer-motion";
import { Activity, Sparkles, Radar } from "lucide-react";

const featuresData = [
  {
    id: 1,
    title: "Real-time Analysis",
    description: "Process live social signals and engagement velocity in milliseconds before you ever hit publish.",
    icon: Activity,
  },
  {
    id: 2,
    title: "The AI Oracle",
    description: "Consult our proprietary neural net for data-driven copy adjustments and precise optimal posting windows.",
    icon: Sparkles,
  },
  {
    id: 3,
    title: "Signal Detection",
    description: "Identify granular micro-trends and aesthetic shifts before they hit the mainstream trajectory.",
    icon: Radar,
  },
];

export default function Features() {
  // Staggering the cards as they come into view
  const containerVariants : Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants : Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 15,
      },
    },
  };

  const iconVariants : Variants = {
    hidden: { scale: 0, rotate: -45 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: { type: "spring", stiffness: 200, damping: 12, delay: 0.2 }
    }
  };

  return (
    <section className="relative w-full py-32 px-6 bg-mashed-potatoes overflow-hidden z-10">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="font-heading text-4xl md:text-5xl text-green-bean mb-4">
            Engineered for <span className="text-cranberry italic">Precision.</span>
          </h2>
          <p className="text-artichoke text-lg max-w-2xl mx-auto">
            Stop guessing what works. Our architecture translates chaotic social data into deterministic outcomes.
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {featuresData.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div 
                key={feature.id}
                variants={cardVariants}
                // The group class allows us to trigger hover effects on child elements
                className="group relative rounded-2xl bg-mashed-potatoes p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(115,65,65,0.2)]"
              >
                {/* Gradient Border Illusion */}
                <div className="absolute inset-0 rounded-2xl border border-artichoke/20 transition-colors duration-500 group-hover:border-transparent pointer-events-none" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cranberry/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" style={{ padding: '1px' }}>
                   <div className="w-full h-full bg-mashed-potatoes rounded-2xl" />
                </div>

                {/* Card Content */}
                <div className="relative z-10">
                  <motion.div variants={iconVariants} className="mb-6">
                    <div className="w-14 h-14 rounded-full bg-mashed-potatoes border border-artichoke/20 flex items-center justify-center group-hover:bg-cranberry group-hover:border-cranberry transition-colors duration-500">
                      <Icon className="w-6 h-6 text-green-bean group-hover:text-mashed-potatoes transition-colors duration-500" strokeWidth={1.5} />
                    </div>
                  </motion.div>
                  
                  <h3 className="font-heading text-2xl text-mulled-wine mb-3 group-hover:text-cabernet transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-artichoke font-medium leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}