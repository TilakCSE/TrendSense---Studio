"use client";

import { motion } from "framer-motion";
import { Database, Fingerprint, BrainCircuit, Rocket } from "lucide-react";

const steps = [
  {
    id: "01",
    title: "Data Ingestion",
    description: "Paste your raw social copy, hashtags, and concepts into the Neural Core. The engine instantly strips and formats your input.",
    icon: Database,
  },
  {
    id: "02",
    title: "Vector Analysis",
    description: "Our proprietary ML models map your text against millions of historical virality vectors, scoring sentiment and aesthetic resonance.",
    icon: Fingerprint,
  },
  {
    id: "03",
    title: "Oracle Prediction",
    description: "Receive a deterministic Virality Index (0-100) alongside granular AI suggestions to optimize your hook and delivery timing.",
    icon: BrainCircuit,
  },
  {
    id: "04",
    title: "Confident Deployment",
    description: "Stop guessing. Hit publish knowing your content has been engineered for maximum algorithmic velocity.",
    icon: Rocket,
  },
];

export default function HowItWorks() {
  return (
    <section className="relative w-full py-32 px-6 bg-mashed-potatoes overflow-hidden">
      <div className="max-w-5xl mx-auto">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-24"
        >
          <h2 className="font-heading text-4xl md:text-5xl text-green-bean mb-4">
            The Architecture of <span className="text-cranberry italic">Virality.</span>
          </h2>
          <p className="text-artichoke text-lg max-w-2xl mx-auto">
            A transparent look at how we transform raw copy into predictable outcomes.
          </p>
        </motion.div>

        {/* Timeline Container */}
        <div className="relative">
          
          {/* Center Vertical Line (Animated on scroll) */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-artichoke/20 -translate-x-1/2 hidden md:block">
            <motion.div 
              className="absolute top-0 left-0 w-full bg-cranberry/50 origin-top"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, margin: "-20%" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </div>

          {/* Mobile Vertical Line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-artichoke/20 md:hidden">
            <motion.div 
              className="absolute top-0 left-0 w-full h-full bg-cranberry/50 origin-top"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, margin: "-20%" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-12 md:gap-24 relative z-10">
            {steps.map((step, index) => {
              const isEven = index % 2 === 0;
              const Icon = step.icon;

              return (
                <div key={step.id} className="relative flex flex-col md:flex-row items-start md:items-center w-full group">
                  
                  {/* Desktop Layout Alternation */}
                  <div className={`hidden md:flex w-1/2 ${isEven ? 'justify-end pr-16 text-right' : 'order-last pl-16 text-left'}`}>
                    <motion.div 
                      initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    >
                      <div className="text-cranberry font-heading text-xl mb-2">{step.id} /</div>
                      <h3 className="font-heading text-3xl text-mulled-wine mb-3 group-hover:text-cabernet transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-artichoke leading-relaxed max-w-sm ml-auto">
                        {step.description}
                      </p>
                    </motion.div>
                  </div>

                  {/* Mobile Layout Content */}
                  <div className="md:hidden pl-16 pr-4 pb-8 w-full">
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="text-cranberry font-heading text-lg mb-1">{step.id} /</div>
                      <h3 className="font-heading text-2xl text-mulled-wine mb-2">
                        {step.title}
                      </h3>
                      <p className="text-artichoke text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </motion.div>
                  </div>

                  {/* Center Node / Icon */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
                    className="absolute left-6 md:left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-mashed-potatoes border border-cranberry/30 flex items-center justify-center shadow-[0_0_20px_rgba(115,65,65,0.1)] group-hover:bg-cranberry group-hover:border-cranberry transition-all duration-500 z-10"
                  >
                    <Icon className="w-5 h-5 text-cranberry group-hover:text-mashed-potatoes transition-colors duration-500" />
                    
                    {/* Hover Pulse Effect */}
                    <div className="absolute inset-0 rounded-full border border-cranberry opacity-0 scale-150 group-hover:animate-ping" />
                  </motion.div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}