"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Twitter, Github, Linkedin, ArrowUpRight } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full bg-mashed-potatoes text-mulled-wine overflow-hidden border-t border-artichoke/20">
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-12">

        {/* Top Section: Links & CTA */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-24">

          {/* Brand & Tagline */}
          <div className="col-span-1 md:col-span-4 flex flex-col items-start">
            <span className="font-heading text-3xl font-bold tracking-tighter text-green-bean mb-4">
              TrendSense.
            </span>
            <p className="text-artichoke max-w-xs text-sm leading-relaxed mb-8">
              We don't chase trends, we engineer them. Predict the unpredictable with the ultimate AI Oracle.
            </p>
            <Link
              href="/dashboard"
              className="group flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-cranberry hover:text-cabernet transition-colors"
            >
              Launch Engine
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="col-span-1 md:col-span-2 md:col-start-7">
            <h4 className="text-xs font-mono uppercase tracking-widest text-artichoke mb-6">Platform</h4>
            <ul className="space-y-4">
              <li><Link href="/dashboard" className="text-sm font-medium hover:text-cranberry transition-colors">Neural Core</Link></li>
              <li><Link href="/architecture" className="text-sm font-medium hover:text-cranberry transition-colors">Architecture</Link></li>
              <li><Link href="/docs" className="text-sm font-medium hover:text-cranberry transition-colors">Documentation</Link></li>
              <li><Link href="/team" className="text-sm font-medium hover:text-cranberry transition-colors">The Team</Link></li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-2">
            <h4 className="text-xs font-mono uppercase tracking-widest text-artichoke mb-6">Legal</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-sm font-medium hover:text-cranberry transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-sm font-medium hover:text-cranberry transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="text-sm font-medium hover:text-cranberry transition-colors">Data Ethics</Link></li>
            </ul>
          </div>

          {/* Socials */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-xs font-mono uppercase tracking-widest text-artichoke mb-6">Connect</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full border border-artichoke/30 flex items-center justify-center text-green-bean hover:bg-cranberry hover:text-mashed-potatoes hover:border-cranberry transition-all duration-300">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-artichoke/30 flex items-center justify-center text-green-bean hover:bg-cranberry hover:text-mashed-potatoes hover:border-cranberry transition-all duration-300">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-artichoke/30 flex items-center justify-center text-green-bean hover:bg-cranberry hover:text-mashed-potatoes hover:border-cranberry transition-all duration-300">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section: Massive Typography & Copyright */}
        <div className="flex flex-col items-center border-t border-artichoke/20 pt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full text-center overflow-hidden mb-8"
          >
            <h1 className="font-heading text-[12vw] leading-none tracking-tighter text-artichoke/10 select-none">
              TRENDSENSE
            </h1>
          </motion.div>

          <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-artichoke uppercase tracking-widest">
            <p>&copy; {currentYear} TrendSense AI.</p>
            <p>Engineered for Virality.</p>
            <p>All Rights Reserved.</p>
          </div>
        </div>

      </div>
    </footer>
  );
}