"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { Database, HardDrive, Zap, Layers, Beaker, BrainCircuit, ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";

const lineVariants: Variants = {
    hidden: { scaleY: 0, opacity: 0 },
    visible: { scaleY: 1, opacity: 0.6, transition: { duration: 1, ease: "easeInOut" } }
};

const nodeVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 15 } }
};

export default function ArchitecturePage() {
    return (
        <main className="min-h-screen bg-mashed-potatoes text-mulled-wine font-body flex flex-col selection:bg-cranberry selection:text-mashed-potatoes">

            {/* Navigation */}
            <nav className="w-full flex items-center justify-between px-6 py-6 absolute top-0 z-50">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-artichoke hover:text-cranberry transition-colors flex items-center gap-2 text-sm uppercase tracking-widest font-semibold">
                        <ArrowLeft className="w-4 h-4" /> Return Home
                    </Link>
                </div>
                <div className="font-heading text-xl tracking-wide text-green-bean">
                    TrendSense<span className="text-cranberry">.</span>
                </div>
            </nav>

            {/* Main Content Area */}
            <div className="w-full max-w-5xl mx-auto pt-32 pb-16 px-4 md:px-8 overflow-hidden flex-1">

                <div className="mb-16 text-center">
                    <h1 className="font-heading text-5xl md:text-6xl text-green-bean mb-4">Architecture <span className="italic text-cranberry">Topology</span></h1>
                    <p className="text-artichoke uppercase tracking-widest text-sm font-mono">Real-time Data Funnel & Processing Matrix</p>
                </div>

                <div className="relative flex flex-col items-center w-full mb-24">

                    {/* === LEVEL 1 & 2: THE FUNNEL & THE LIVE STREAM === */}
                    <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-8 md:gap-16 relative z-10">

                        {/* Left Column: The Heavy Archive Path */}
                        <div className="flex flex-col items-center w-full relative">
                            <motion.div
                                initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={nodeVariants}
                                className="w-full max-w-sm bg-mashed-potatoes p-6 rounded-xl border border-artichoke/30 relative z-20 shadow-xl"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-artichoke/10 rounded-lg border border-artichoke/20"><Database className="w-5 h-5 text-mulled-wine" /></div>
                                    <h3 className="font-heading text-xl text-mulled-wine">Data Lake Ingestion</h3>
                                </div>
                                <p className="font-mono text-sm text-mulled-wine bg-black/5 px-3 py-2 rounded border border-black/10">
                                    6.01 GB Raw Archive (4.7M Rows)
                                </p>
                            </motion.div>

                            {/* Vertical connector within left column */}
                            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={lineVariants} className="w-[2px] h-12 bg-artichoke origin-top" />

                            <motion.div
                                initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={nodeVariants} transition={{ delay: 0.2 }}
                                className="w-full max-w-sm bg-mashed-potatoes p-6 rounded-xl border border-artichoke/30 relative z-20 shadow-lg"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-artichoke/10 rounded-lg border border-artichoke/20"><HardDrive className="w-5 h-5 text-mulled-wine" /></div>
                                    <h3 className="font-heading text-xl text-mulled-wine">Out-of-Core ETL</h3>
                                </div>
                                <p className="font-mono text-xs text-artichoke leading-relaxed border-l-2 border-artichoke/40 pl-3">
                                    Chunked Processing (96 Batches)<br />
                                    Regex Scrub<br />
                                    IQR Outlier Rejection
                                </p>
                            </motion.div>
                        </div>

                        {/* Right Column: The Live Stream */}
                        <div className="flex flex-col items-center w-full justify-end relative mt-8 md:mt-0">
                            <motion.div
                                initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={nodeVariants} transition={{ delay: 0.3 }}
                                className="w-full max-w-sm bg-mashed-potatoes p-6 rounded-xl border border-cranberry/30 relative z-20 shadow-xl"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-cranberry/10 rounded-lg border border-cranberry/20"><Zap className="w-5 h-5 text-cranberry" /></div>
                                    <h3 className="font-heading text-xl text-mulled-wine">Velocity Stream</h3>
                                </div>
                                <p className="font-mono text-sm text-mulled-wine bg-cranberry/5 px-3 py-2 rounded border border-cranberry/20">
                                    Live MongoDB Reddit Ingestion<br />
                                    <span className="text-cranberry font-bold text-xs">(~1,200 records/day)</span>
                                </p>
                            </motion.div>
                        </div>
                    </div>

                    {/* === THE MERGE CIRCUIT === */}
                    <div className="hidden md:block relative w-full h-24 z-0">
                        <motion.div initial={{ scaleY: 0, opacity: 0 }} whileInView={{ scaleY: 1, opacity: 0.6 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className="absolute left-[25%] top-0 w-[2px] h-12 bg-artichoke origin-top" />
                        <motion.div initial={{ scaleY: 0, opacity: 0 }} whileInView={{ scaleY: 1, opacity: 0.6 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className="absolute right-[25%] top-0 w-[2px] h-12 bg-cranberry origin-top" />
                        <motion.div initial={{ scaleX: 0, opacity: 0 }} whileInView={{ scaleX: 1, opacity: 0.6 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.4 }} className="absolute left-[25%] right-[25%] top-12 h-[2px] bg-gradient-to-r from-artichoke to-cranberry origin-left" />
                        <motion.div initial={{ scaleY: 0, opacity: 0 }} whileInView={{ scaleY: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 1.0 }} className="absolute left-1/2 top-12 w-[2px] h-12 bg-cranberry origin-top -translate-x-1/2" />
                    </div>

                    <div className="md:hidden flex flex-col items-center w-full">
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={lineVariants} className="w-[2px] h-12 bg-artichoke origin-top" />
                        <div className="text-xs font-mono text-cranberry uppercase tracking-widest my-2 opacity-60">Streams Merging</div>
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={lineVariants} className="w-[2px] h-12 bg-artichoke origin-top" />
                    </div>

                    {/* === LEVEL 3: DISTILLATION === */}
                    <div className="w-full flex justify-center relative z-20">
                        <motion.div
                            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={nodeVariants} transition={{ delay: 0.6 }}
                            className="w-full max-w-lg bg-mashed-potatoes p-6 rounded-xl border border-artichoke/40 shadow-2xl relative overflow-hidden group"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-cranberry group-hover:w-2 transition-all" />
                            <div className="flex flex-col items-center text-center">
                                <div className="p-3 bg-white border border-artichoke/20 rounded-full mb-4 shadow-sm"><Layers className="w-6 h-6 text-mulled-wine" /></div>
                                <h3 className="font-heading text-2xl text-mulled-wine mb-2">Data Distillation</h3>
                                <p className="font-mono text-sm text-cranberry font-bold bg-cranberry/5 px-4 py-2 rounded-full border border-cranberry/20">
                                    Global Deduplication → 219,012 High-Signal Parquet Rows
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={lineVariants} className="w-[2px] h-16 bg-artichoke origin-top relative z-0" />

                    {/* === LEVEL 4: FEATURE ENGINEERING === */}
                    <div className="w-full flex justify-center relative z-20">
                        <motion.div
                            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={nodeVariants} transition={{ delay: 0.7 }}
                            className="w-full max-w-md bg-mashed-potatoes p-6 rounded-xl border border-artichoke/30 shadow-lg"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-artichoke/10 rounded-xl border border-artichoke/20"><Beaker className="w-6 h-6 text-mulled-wine" /></div>
                                <div>
                                    <h3 className="font-heading text-xl text-mulled-wine mb-1">Feature Engineering</h3>
                                    <p className="font-mono text-xs text-artichoke">22 Total Features<br />(15 Hashed Text Topics, 7 Engineered)</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={lineVariants} className="w-[2px] h-16 bg-artichoke origin-top relative z-0" />

                    {/* === LEVEL 5: TRAINING === */}
                    <div className="w-full flex justify-center relative z-20">
                        <motion.div
                            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={nodeVariants} transition={{ delay: 0.8 }}
                            className="w-full max-w-lg bg-mashed-potatoes text-mulled-wine p-8 rounded-2xl shadow-2xl relative overflow-hidden border border-cranberry/30"
                        >
                            <div className="flex flex-col items-center text-center relative z-10">
                                <div className="p-4 bg-cranberry/10 rounded-2xl mb-5 border border-cranberry/20">
                                    <BrainCircuit className="w-8 h-8 text-cranberry" />
                                </div>
                                <h3 className="font-heading text-3xl mb-3">Weighted Training</h3>
                                <p className="font-mono text-sm text-cranberry bg-cranberry/5 px-5 py-3 rounded-lg border border-cranberry/20">
                                    RandomForest Model with Anti-Temporal Bias Sample Weighting
                                </p>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>

            <Footer />
        </main>
    );
}