"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Linkedin, Github, Mail, Terminal, Database, Cloud, LayoutTemplate } from "lucide-react";

const TEAM_MEMBERS = [
  {
    name: "Tilaksinh Chauhan",
    id: "23000740",
    role: "Lead Full-Stack & AI Architect",
    desc: "Engineered the core prediction pipeline, integrated the FastAPI backend, and designed the overall system architecture.",
    icon: <Terminal className="w-5 h-5 text-cyan-400" />,
    linkedin: "https://linkedin.com/in/your-profile", // UPDATE THIS
    color: "from-cyan-500/20 to-transparent",
    borderColor: "group-hover:border-cyan-500/50"
  },
  {
    name: "Bhargav Panchal",
    id: "23000502",
    role: "Frontend Engineer & UI/UX",
    desc: "Crafted the Vercel-inspired design system, managed state hydration, and ensured responsive interactivity.",
    icon: <LayoutTemplate className="w-5 h-5 text-emerald-400" />,
    linkedin: "https://linkedin.com/in/bhargav-profile", // UPDATE THIS
    color: "from-emerald-500/20 to-transparent",
    borderColor: "group-hover:border-emerald-500/50"
  },
  {
    name: "Om Nathani",
    id: "23000883",
    role: "Data Engineer (Big Data)",
    desc: "Manages data ingestion pipelines, trends caching, and the high-volume MongoDB storage for live analytics.",
    icon: <Database className="w-5 h-5 text-purple-400" />,
    linkedin: "https://linkedin.com/in/om-profile", // UPDATE THIS
    color: "from-purple-500/20 to-transparent",
    borderColor: "group-hover:border-purple-500/50"
  },
  {
    name: "Kavya Jariwala",
    id: "23000543",
    role: "Cloud Ops & Documentation",
    desc: "Oversees system deployment, cloud infrastructure stability, and technical project documentation.",
    icon: <Cloud className="w-5 h-5 text-pink-400" />,
    linkedin: "https://linkedin.com/in/kavya-profile", // UPDATE THIS
    color: "from-pink-500/20 to-transparent",
    borderColor: "group-hover:border-pink-500/50"
  }
];

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-[#030303] flex flex-col items-center selection:bg-cyan-500/30 overflow-hidden relative">
      
      {/* Background Grid & Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <nav className="w-full max-w-7xl mx-auto h-20 flex items-center justify-between px-6 lg:px-12 relative z-50">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-5 h-5 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-sm shadow-[0_0_15px_rgba(6,182,212,0.4)]" />
          <span className="font-mono text-sm font-bold text-white tracking-tighter hover:text-cyan-400 transition-colors">TRENDSENSE.IO</span>
        </Link>
        <Link 
          href="/dashboard"
          className="h-9 px-5 rounded-full bg-white/10 border border-white/10 text-white text-sm font-semibold flex items-center gap-2 hover:bg-white hover:text-black transition-all"
        >
          Launch App <ArrowRight className="w-4 h-4" />
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="w-full max-w-5xl mx-auto flex flex-col items-center pt-20 pb-24 px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tighter leading-tight mb-6">
            Meet the engineers behind the <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-cyan-200 to-cyan-500">Neural Core.</span>
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg font-light leading-relaxed">
            TrendSense is developed by a dedicated team of computer science engineers specializing in full-stack architecture, machine learning, and big data processing.
          </p>
        </motion.div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {TEAM_MEMBERS.map((member, idx) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`group relative p-8 rounded-2xl border border-white/5 bg-[#09090B] overflow-hidden transition-all hover:shadow-2xl ${member.borderColor}`}
            >
              {/* Subtle gradient background specific to each role */}
              <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b ${member.color} opacity-20 pointer-events-none`} />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    {member.icon}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-600 bg-white/5 px-2 py-1 rounded border border-white/5">
                    ID: {member.id}
                  </div>
                </div>

                <h3 className="text-xl text-white font-semibold tracking-tight">{member.name}</h3>
                <p className="text-sm font-mono text-zinc-400 mt-1 mb-4">{member.role}</p>
                <p className="text-sm text-zinc-500 leading-relaxed flex-grow">
                  {member.desc}
                </p>

                {/* Social Links */}
                <div className="flex items-center gap-4 mt-8 pt-6 border-t border-white/5">
                  <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-[#0A66C2] transition-colors flex items-center gap-2 text-sm font-medium">
                    <Linkedin className="w-4 h-4" /> LinkedIn
                  </a>
                  <a href="#" className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
                    <Mail className="w-4 h-4" /> Contact
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

    </div>
  );
}