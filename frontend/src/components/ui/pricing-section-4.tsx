"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Sparkles } from "@/components/ui/sparkles";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const plans = [
  {
    name: "Starter",
    description: "Great for individual analysts looking to get started.",
    price: 49, yearlyPrice: 399, buttonText: "Access Engine", buttonVariant: "outline" as const,
    popular: false,
    includes: ["Free includes:", "Real-time semantic analysis", "Basic temporal decay", "50 API calls/day"],
  },
  {
    name: "Business",
    description: "Best value for growing agencies that need advanced features.",
    price: 149, yearlyPrice: 1299, buttonText: "Access Engine", buttonVariant: "default" as const,
    popular: true,
    includes: ["Everything in Starter, plus:", "VADER sentiment tracking", "Competitor indexing", "Unlimited API calls"],
  },
  {
    name: "Enterprise",
    description: "Advanced plan with enhanced security for large teams.",
    price: 299, yearlyPrice: 2899, buttonText: "Contact Sales", buttonVariant: "outline" as const,
    popular: false,
    includes: ["Everything in Business, plus:", "Dedicated account manager", "Custom model training", "On-premise deployment"],
  },
];

const PricingSwitch = ({ onSwitch }: { onSwitch: (value: string) => void }) => {
  const [selected, setSelected] = useState("0");
  const handleSwitch = (value: string) => { setSelected(value); onSwitch(value); };
  return (
    <div className="flex justify-center">
      <div className="relative z-10 mx-auto flex w-fit rounded-full bg-wine/50 border border-olive/30 p-1 backdrop-blur-md">
        {["Monthly", "Yearly"].map((label, idx) => (
          <button key={label} onClick={() => handleSwitch(idx.toString())} className={cn("relative z-10 w-fit h-10 rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors", selected === idx.toString() ? "text-wine" : "text-starlight/70")}>
            {selected === idx.toString() && <motion.span layoutId="switch" className="absolute top-0 left-0 h-10 w-full rounded-full bg-starlight shadow-sm" transition={{ type: "spring", stiffness: 500, damping: 30 }} />}
            <span className="relative z-20">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);
  const pricingRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLHeadingElement>(null);
  const cutRevealRef = useRef<any>(null);
  
  // WAIT to trigger text animation until user scrolls to it!
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" });
  useEffect(() => {
    if (isHeaderInView) cutRevealRef.current?.startAnimation();
  }, [isHeaderInView]);

  const revealVariants = {
    visible: (i: number) => ({ y: 0, opacity: 1, filter: "blur(0px)", transition: { delay: i * 0.2, duration: 0.5 } }),
    hidden: { filter: "blur(10px)", y: -20, opacity: 0 },
  };

  return (
    <div className="min-h-screen mx-auto relative bg-wine overflow-x-hidden pt-20 pb-32" ref={pricingRef}>
      <TimelineContent animationNum={4} customVariants={revealVariants} className="absolute top-0 h-96 w-screen overflow-hidden [mask-image:radial-gradient(50%_50%,white,transparent)]">
        <Sparkles density={800} direction="bottom" speed={1} color="#F0E7C2" className="absolute inset-x-0 bottom-0 h-full w-full opacity-30" />
      </TimelineContent>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[80%] h-[500px] bg-olive/20 blur-[120px] rounded-full pointer-events-none" />

      <article className="text-center mb-12 pt-10 max-w-3xl mx-auto space-y-4 relative z-50">
        <h2 ref={headerRef} className="text-5xl md:text-6xl font-serif text-starlight tracking-tight">
          <VerticalCutReveal ref={cutRevealRef} autoStart={false} splitBy="words" staggerDuration={0.1} staggerFrom="first" reverse={true} containerClassName="justify-center">
            Institutional power, priced for scale.
          </VerticalCutReveal>
        </h2>
        <TimelineContent as="p" animationNum={0} customVariants={revealVariants} className="text-starlight/70 font-sans text-lg">
          Select the compute tier that matches your operational volume.
        </TimelineContent>
        <TimelineContent as="div" animationNum={1} customVariants={revealVariants} className="pt-6">
          <PricingSwitch onSwitch={(val) => setIsYearly(val === "1")} />
        </TimelineContent>
      </article>

      <div className="grid md:grid-cols-3 max-w-6xl gap-6 px-6 mx-auto relative z-20">
        {plans.map((plan, index) => (
          <TimelineContent key={plan.name} as="div" animationNum={2 + index} customVariants={revealVariants}>
            <Card className={`relative text-starlight border border-starlight/10 overflow-hidden ${plan.popular ? "bg-[#2A000E] shadow-[0px_0px_60px_rgba(104,116,81,0.2)] scale-105 z-20" : "bg-wine/80 z-10"}`}>
              <CardHeader className="text-left p-8">
                <h3 className="text-2xl font-serif mb-2 text-starlight">{plan.name}</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-5xl font-serif font-semibold text-starlight">
                    $<NumberFlow format={{ currency: "USD" }} value={isYearly ? plan.yearlyPrice : plan.price} />
                  </span>
                  <span className="text-starlight/50 ml-2 font-mono text-xs uppercase">/{isYearly ? "year" : "month"}</span>
                </div>
                <p className="text-sm text-starlight/70 leading-relaxed min-h-[40px]">{plan.description}</p>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <button className={`w-full mb-8 py-4 text-sm font-semibold uppercase tracking-widest transition-all ${plan.popular ? "bg-olive text-starlight hover:bg-starlight hover:text-wine" : "bg-transparent border border-starlight/20 text-starlight hover:bg-starlight/10"}`}>
                  {plan.buttonText}
                </button>
                <div className="space-y-4 pt-6 border-t border-starlight/10">
                  <h4 className="font-mono text-xs text-olive uppercase tracking-widest">{plan.includes[0]}</h4>
                  <ul className="space-y-3">
                    {plan.includes.slice(1).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="h-1.5 w-1.5 mt-1.5 bg-olive rounded-full flex-shrink-0" />
                        <span className="text-sm text-starlight/80">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TimelineContent>
        ))}
      </div>
    </div>
  );
}