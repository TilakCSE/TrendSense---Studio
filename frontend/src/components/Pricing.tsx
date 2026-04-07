"use client";

import { motion, Variants } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";

const pricingTiers = [
  {
    name: "Initiate",
    price: "Free",
    period: "forever",
    description: "Basic signal detection for casual creators.",
    features: [
      "10 Predictions per month",
      "Standard Virality Index",
      "Basic Keyword Extraction",
      "24-hour delayed analytics"
    ],
    highlight: false,
    cta: "Start Free",
  },
  {
    name: "The Oracle",
    price: "$49",
    period: "per month",
    description: "Full neural net access for serious strategists.",
    features: [
      "Unlimited Predictions",
      "Real-time Sentiment Scoring",
      "Advanced Influence Vectors",
      "Proprietary AI Copy Suggestions",
      "Priority API Access"
    ],
    highlight: true,
    cta: "Launch Engine",
  },
  {
    name: "Syndicate",
    price: "$199",
    period: "per month",
    description: "Bulk processing for agencies and teams.",
    features: [
      "Everything in Oracle",
      "Batch URL Processing",
      "Custom Model Fine-tuning",
      "Dedicated Account Manager",
      "White-label Reports"
    ],
    highlight: false,
    cta: "Contact Sales",
  },
];

export default function Pricing() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const cardVariants : Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 80, damping: 15 },
    },
  };

  return (
    <section className="relative w-full py-32 px-6 bg-mashed-potatoes overflow-hidden z-10">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-20"
        >
          <h2 className="font-heading text-4xl md:text-5xl text-green-bean mb-4">
            Access the <span className="text-cranberry italic">Engine.</span>
          </h2>
          <p className="text-artichoke text-lg max-w-2xl mx-auto">
            Choose your level of intelligence. Upgrade anytime.
          </p>
        </motion.div>

        {/* Pricing Cards Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center"
        >
          {pricingTiers.map((tier) => (
            <motion.div 
              key={tier.name}
              variants={cardVariants}
              className={`relative rounded-3xl p-8 md:p-10 transition-all duration-500 hover:-translate-y-2 ${
                tier.highlight 
                  ? "bg-green-bean text-mashed-potatoes shadow-2xl shadow-green-bean/20 scale-105 border-none z-10 py-12" 
                  : "bg-transparent text-mulled-wine border border-artichoke/30 hover:bg-white/50"
              }`}
            >
              {/* Highlight Glow */}
              {tier.highlight && (
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-3xl pointer-events-none" />
              )}

              <div className="relative z-10">
                <h3 className={`font-heading text-2xl mb-2 ${tier.highlight ? "text-mashed-potatoes" : "text-cabernet"}`}>
                  {tier.name}
                </h3>
                <p className={`text-sm mb-8 ${tier.highlight ? "text-mashed-potatoes/70" : "text-artichoke"}`}>
                  {tier.description}
                </p>
                
                <div className="mb-8 flex items-baseline gap-2">
                  <span className="font-heading text-5xl tracking-tight">{tier.price}</span>
                  <span className={`text-sm uppercase tracking-widest ${tier.highlight ? "text-cranberry" : "text-artichoke"}`}>
                    / {tier.period}
                  </span>
                </div>

                <Link 
                  href="/dashboard"
                  className={`group relative inline-flex w-full items-center justify-center px-6 py-4 overflow-hidden rounded-sm transition-transform active:scale-95 mb-10 ${
                    tier.highlight 
                      ? "bg-cranberry text-mashed-potatoes hover:bg-cabernet" 
                      : "bg-transparent border border-artichoke/50 text-mulled-wine hover:border-cabernet hover:text-cabernet"
                  }`}
                >
                  <span className="relative text-sm font-semibold uppercase tracking-widest">
                    {tier.cta}
                  </span>
                </Link>

                <div className="space-y-4">
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className={`w-5 h-5 shrink-0 ${tier.highlight ? "text-cranberry" : "text-green-bean"}`} />
                      <span className={`text-sm ${tier.highlight ? "text-mashed-potatoes/90" : "text-mulled-wine/80"}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}