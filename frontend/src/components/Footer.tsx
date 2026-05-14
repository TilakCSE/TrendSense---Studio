"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Twitter, Github, Linkedin, ArrowUpRight } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative w-full bg-cream text-emerald overflow-hidden border-t border-emerald/10">
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-12">

        {/* Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-24">

          {/* Brand */}
          <div className="col-span-1 md:col-span-4 flex flex-col items-start">
            <span className="font-heading text-3xl font-bold tracking-tighter text-emerald mb-4">
              TrendSense.
            </span>
            <p className="text-emerald/45 max-w-xs text-sm leading-relaxed mb-8">
              We don&apos;t chase trends, we engineer them. Predict the
              unpredictable with the ultimate AI Oracle.
            </p>
            <Link
              href="/dashboard"
              className="group flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-widest text-burgundy hover:text-emerald transition-colors"
            >
              Launch Engine
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          {/* Platform */}
          <div className="col-span-1 md:col-span-2 md:col-start-7">
            <h4 className="text-[10px] font-mono uppercase tracking-widest text-emerald/35 mb-6">
              Platform
            </h4>
            <ul className="space-y-4">
              {["Neural Core", "Architecture", "Documentation", "The Team"].map(
                (item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="text-sm text-emerald/70 hover:text-burgundy transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-[10px] font-mono uppercase tracking-widest text-emerald/35 mb-6">
              Legal
            </h4>
            <ul className="space-y-4">
              {["Privacy Policy", "Terms of Service", "Data Ethics"].map(
                (item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="text-sm text-emerald/70 hover:text-burgundy transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Connect */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-[10px] font-mono uppercase tracking-widest text-emerald/35 mb-6">
              Connect
            </h4>
            <div className="flex gap-3">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full border border-emerald/15 flex items-center justify-center text-emerald/50 hover:border-burgundy hover:text-burgundy transition-all duration-300"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Wordmark + copyright */}
        <div className="flex flex-col items-center border-t border-emerald/10 pt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full text-center overflow-hidden mb-8"
          >
            <h1
              className="font-heading leading-none tracking-tighter select-none"
              style={{
                fontSize: "clamp(4rem, 12vw, 13rem)",
                color: "transparent",
                WebkitTextStroke: "1px rgba(21,66,48,0.08)",
              }}
            >
              TRENDSENSE
            </h1>
          </motion.div>

          <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono text-emerald/25 uppercase tracking-widest">
            <p>&copy; {year} TrendSense AI.</p>
            <p>Engineered for Virality.</p>
            <p>All Rights Reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}