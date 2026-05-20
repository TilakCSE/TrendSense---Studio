"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Linkedin, Github } from "lucide-react";
import Footer from "@/components/Footer";

const teamMembers = [
  {
    name: "Tilaksinh Chauhan",
    id: "23000740",
    role: "Lead AI Architect & Visionary",
    bio: "Spearheads the Neural Core development and overall platform architecture. Obsessed with predictive modeling and algorithmic velocity.",
    socials: { linkedin: "https://www.linkedin.com/in/tilaksinh-chauhan-0817a3344/", github: "https://github.com/TilakCSE" },
  },
  {
    name: "Bhargav Panchal",
    id: "23000502",
    role: "Lead Frontend Engineer",
    bio: "Crafts the pixel-perfect, high-performance interfaces. Translates complex telemetry data into intuitive, luxury user experiences.",
    socials: { linkedin: "https://www.linkedin.com/in/bhargav-panchal/", github: "https://github.com/BhargavPanchal09" },
  },
  {
    name: "Om Nathani",
    id: "23000883",
    role: "Big Data & Infrastructure Lead",
    bio: "Architects the massive data pipelines that feed the Oracle. Ensures real-time signal processing and system stability at scale.",
    socials: { linkedin: "https://www.linkedin.com/in/om-nathani-124a1833b/", github: "https://github.com/Aum1905" },
  },
  {
    name: "Kavya Jariwala",
    id: "23000543",
    role: "UI/UX & Cloud Solutions",
    bio: "Bridges the gap between aesthetic design and robust cloud deployment. Engineers seamless user journeys and comprehensive platform docs.",
    socials: { linkedin: "https://www.linkedin.com/in/kavya-jariwala-1b7202400/", github: "https://github.com/kavyajariwala23" },
  },
];

export default function TeamPage() {
  const containerVariants: Variants = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
  };
  const cardVariants: Variants = {
    hidden:  { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 15 } },
  };

  return (
    <main className="min-h-screen bg-cream text-emerald font-body flex flex-col selection:bg-burgundy selection:text-cream">

      {/* Nav */}
      <nav className="w-full flex items-center justify-between px-6 py-5 sticky top-0 z-50 bg-cream/90 backdrop-blur-md border-b border-emerald/10">
        <Link href="/" className="text-emerald/50 hover:text-burgundy transition-colors flex items-center gap-2 text-xs uppercase tracking-widest font-semibold">
          <ArrowLeft className="w-4 h-4" /> Return Home
        </Link>
        <div className="font-heading text-xl tracking-wide text-emerald">
          TrendSense<span className="text-burgundy">.</span>
        </div>
      </nav>

      <div className="flex-1 w-full max-w-7xl mx-auto px-6 pt-20 pb-20 flex flex-col">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          className="mb-16 max-w-2xl"
        >
          <span className="text-gold text-xs uppercase tracking-[0.25em] font-mono mb-4 block">The Syndicate</span>
          <h1 className="font-heading text-5xl md:text-7xl text-emerald mb-6 leading-tight">
            Meet the <em className="text-burgundy not-italic italic">Architects.</em>
          </h1>
          <p className="text-emerald/55 text-lg leading-relaxed">
            A collective of AI researchers, data engineers, and interface designers obsessed with
            reverse-engineering the internet&apos;s attention span.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={containerVariants} initial="hidden" animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {teamMembers.map((member, idx) => (
            <motion.div
              key={idx} variants={cardVariants}
              className="group relative bg-charcoal rounded-2xl p-8 overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-charcoal/20 flex flex-col h-full border border-cream/5 hover:border-burgundy/30"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-burgundy/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="relative z-10 flex flex-col h-full">

                {/* Avatar + ID */}
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 rounded-full bg-emerald/15 flex items-center justify-center text-cream font-heading text-2xl border border-cream/10 group-hover:border-burgundy/50 group-hover:bg-burgundy/20 transition-all duration-500">
                    {member.name.charAt(0)}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-cream/25 block mb-1">Access Code</span>
                    <span className="text-xs font-mono text-cream/60 bg-cream/5 px-2 py-1 rounded border border-cream/8">
                      {member.id}
                    </span>
                  </div>
                </div>

                <h3 className="font-heading text-2xl text-cream mb-1">{member.name}</h3>
                <p className="text-burgundy text-xs uppercase tracking-widest mb-4 font-semibold">{member.role}</p>
                <p className="text-cream/50 text-sm leading-relaxed mb-8 flex-1">{member.bio}</p>

                {/* Socials */}
                <div className="flex gap-4 mt-auto pt-6 border-t border-cream/8">
                  <a href={member.socials.linkedin} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-cream/35 hover:text-cream transition-colors">
                    <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                  </a>
                  <a href={member.socials.github} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-cream/35 hover:text-cream transition-colors">
                    <Github className="w-3.5 h-3.5" /> GitHub
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}