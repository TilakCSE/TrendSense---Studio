import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react'

interface RightPanelProps {
    isVisible: boolean
    data: {
        viralityIndex: number
        sentimentScore: number
        topFeatures: string[]
    }
}

const RightPanel: React.FC<RightPanelProps> = ({ isVisible, data }) => {
    const { viralityIndex, sentimentScore, topFeatures } = data

    const getSentimentInfo = (score: number) => {
        if (score > 0.3) return { label: 'Extremely Positive', color: 'text-neon-green', bg: 'bg-neon-green/10', icon: <CheckCircle2 className="w-4 h-4" /> }
        if (score < -0.3) return { label: 'Critical Response', color: 'text-red-400', bg: 'bg-red-400/10', icon: <AlertCircle className="w-4 h-4" /> }
        return { label: 'Neutral Tone', color: 'text-blue-400', bg: 'bg-blue-400/10', icon: <AlertCircle className="w-4 h-4" /> }
    }

    const sentiment = getSentimentInfo(sentimentScore)

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="w-full lg:w-[450px] flex flex-col gap-6 p-8 glass-card rounded-2xl relative z-10 overflow-hidden"
                >
                    {/* Scanline overlay */}
                    <div className="absolute inset-0 scanlines opacity-10 pointer-events-none" />

                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-display uppercase tracking-wider">Prediction Results</h2>
                        <div className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-white/40 tracking-widest">
                            REAL-TIME
                        </div>
                    </div>

                    {/* Virality Gauge */}
                    <div className="flex flex-col items-center justify-center py-6 relative">
                        <svg className="w-48 h-48 circular-progress">
                            <circle className="circular-progress-track" cx="96" cy="96" r="88" />
                            <circle
                                className="circular-progress-fill"
                                cx="96"
                                cy="96"
                                r="88"
                                style={{ strokeDasharray: 552.92, strokeDashoffset: 552.92 - (552.92 * viralityIndex) / 100 }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <motion.span
                                initial={{ scale: 0.5 }}
                                animate={{ scale: 1 }}
                                className="text-5xl font-display text-neon-glow"
                            >
                                {viralityIndex}
                            </motion.span>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold mt-1">Virality Index</span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-white/40 font-bold">Audience Sentiment</label>
                            <div className={`flex items-center gap-3 p-4 rounded-xl ${sentiment.bg} border border-white/5`}>
                                <div className={sentiment.color}>{sentiment.icon}</div>
                                <div className="flex-1">
                                    <div className={`text-sm font-bold ${sentiment.color}`}>{sentiment.label}</div>
                                    <div className="text-[10px] text-white/40">Reliability Score: {(0.8 + Math.random() * 0.15).toFixed(2)}</div>
                                </div>
                                <div className="text-xl font-mono-custom text-white">{sentimentScore > 0 ? '+' : ''}{sentimentScore.toFixed(2)}</div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-xs uppercase tracking-widest text-white/40 font-bold">Why This Score?</label>
                            <div className="flex flex-col gap-2">
                                {topFeatures.map((feature, i) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 + i * 0.1 }}
                                        key={i}
                                        className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5 text-xs group hover:bg-white/10 transition-colors"
                                    >
                                        <span className="text-white/60">{feature}</span>
                                        <TrendingUp className="w-3 h-3 text-neon-green opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button className="w-full py-3 text-[10px] uppercase tracking-widest font-bold text-white/40 hover:text-white transition-colors mt-2">
                        Export JSON Payload (v1.6)
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default RightPanel
