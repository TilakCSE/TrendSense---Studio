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
      "24-hour delayed analytics",
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
      "Priority API Access",
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
      "White-label Reports",
    ],
    highlight: false,
    cta: "Contact Sales",
  },
];

export default function Pricing() {
  const containerVariants: Variants = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const cardVariants: Variants = {
    hidden:  { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 75, damping: 16 },
    },
  };

  return (
    <section className="relative w-full py-32 px-6 bg-cream overflow-hidden">
      <div className="absolute top-0 left-6 right-6 h-px bg-emerald/10" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-20"
        >
          <span className="text-gold text-xs uppercase tracking-[0.25em] font-mono mb-4 block">
            Pricing
          </span>
          <h2 className="font-heading text-4xl md:text-5xl text-emerald leading-tight">
            Access the{" "}
            <em className="text-burgundy not-italic italic">Engine.</em>
          </h2>
          <p className="text-emerald/55 text-lg mt-4 max-w-xl leading-relaxed">
            Choose your level of intelligence. Upgrade anytime.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end"
        >
          {pricingTiers.map((tier) => (
            <motion.div
              key={tier.name}
              variants={cardVariants}
              className={`relative rounded-2xl p-8 md:p-10 transition-transform duration-500 hover:-translate-y-1 ${
                tier.highlight
                  ? "bg-charcoal text-cream shadow-[0_30px_60px_-15px_rgba(16,17,17,0.45)] md:-mt-6 md:pb-14 z-10 border border-cream/8"
                  : "bg-white/70 border border-emerald/12 text-emerald"
              }`}
            >
              {/* Featured label */}
              {tier.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-gold text-charcoal text-[10px] font-mono uppercase tracking-widest px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <h3
                className={`font-heading text-2xl mb-2 ${
                  tier.highlight ? "text-cream" : "text-emerald"
                }`}
              >
                {tier.name}
              </h3>
              <p
                className={`text-sm mb-8 ${
                  tier.highlight ? "text-cream/45" : "text-emerald/45"
                }`}
              >
                {tier.description}
              </p>

              {/* Price */}
              <div className="mb-8 flex items-baseline gap-2">
                <span className="font-heading text-5xl tracking-tight">
                  {tier.price}
                </span>
                <span
                  className={`text-xs uppercase tracking-widest ${
                    tier.highlight ? "text-gold" : "text-emerald/40"
                  }`}
                >
                  / {tier.period}
                </span>
              </div>

              {/* CTA */}
              <Link
                href="/dashboard"
                className={`inline-flex w-full items-center justify-center px-6 py-3.5 rounded-sm text-xs font-semibold uppercase tracking-widest transition-all duration-300 active:scale-95 mb-10 ${
                  tier.highlight
                    ? "bg-burgundy text-cream hover:bg-emerald"
                    : "bg-transparent border border-emerald/25 text-emerald hover:border-emerald hover:bg-emerald hover:text-cream"
                }`}
              >
                {tier.cta}
              </Link>

              {/* Features */}
              <div className="space-y-3.5">
                {tier.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Check
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        tier.highlight ? "text-gold" : "text-emerald"
                      }`}
                      strokeWidth={2.5}
                    />
                    <span
                      className={`text-sm ${
                        tier.highlight ? "text-cream/70" : "text-emerald/65"
                      }`}
                    >
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}