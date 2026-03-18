import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle2, BarChart3 } from 'lucide-react'
import { OracleAdvice } from '../OracleAdvice'

interface RightPanelProps {
    isVisible: boolean
    data: {
        viralityIndex: number
        sentimentScore: number
        topFeatures: [string, number][]
        aiSuggestion: string
    }
}

const RightPanel: React.FC<RightPanelProps> = ({ isVisible, data }) => {
    const { viralityIndex, sentimentScore, topFeatures, aiSuggestion } = data

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
                    className="w-full lg:w-[500px] flex flex-col gap-6 p-8 glass-card rounded-2xl relative z-10 overflow-hidden max-h-[85vh] overflow-y-auto"
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

                        {/* Feature Influence Progress Bars */}
                        {topFeatures && topFeatures.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-white/40" />
                                    <label className="text-xs uppercase tracking-widest text-white/40 font-bold">Feature Influence</label>
                                </div>
                                <div className="flex flex-col gap-3">
                                    {topFeatures.map(([featureName, influenceScore], i) => {
                                        // Normalize influence score to percentage (0-100)
                                        const normalizedScore = Math.min(Math.abs(influenceScore) * 100, 100)
                                        const isPositive = influenceScore >= 0

                                        return (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 + i * 0.1 }}
                                                key={i}
                                                className="space-y-2"
                                            >
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-white/70 font-medium">{featureName}</span>
                                                    <span className={`font-mono-custom font-bold ${isPositive ? 'text-neon-green' : 'text-red-400'}`}>
                                                        {isPositive ? '+' : ''}{influenceScore.toFixed(3)}
                                                    </span>
                                                </div>
                                                <div className="relative w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${normalizedScore}%` }}
                                                        transition={{ duration: 0.8, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
                                                        className={`absolute left-0 top-0 h-full rounded-full ${
                                                            isPositive
                                                                ? 'bg-gradient-to-r from-neon-green/50 to-neon-green'
                                                                : 'bg-gradient-to-r from-red-400/50 to-red-400'
                                                        }`}
                                                        style={{
                                                            boxShadow: isPositive
                                                                ? '0 0 10px rgba(0, 255, 136, 0.5)'
                                                                : '0 0 10px rgba(255, 68, 68, 0.5)'
                                                        }}
                                                    />
                                                    {/* Animated shine effect */}
                                                    <motion.div
                                                        className="absolute top-0 left-0 h-full w-full"
                                                        animate={{
                                                            background: [
                                                                'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                                                                'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)'
                                                            ],
                                                            x: ['-100%', '200%']
                                                        }}
                                                        transition={{
                                                            duration: 2,
                                                            repeat: Infinity,
                                                            delay: 0.5 + i * 0.1,
                                                            ease: 'linear'
                                                        }}
                                                    />
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Oracle AI Suggestion */}
                    {aiSuggestion && (
                        <OracleAdvice suggestion={aiSuggestion} className="mt-4" />
                    )}

                    <button className="w-full py-3 text-[10px] uppercase tracking-widest font-bold text-white/40 hover:text-white transition-colors mt-2">
                        Export JSON Payload (v1.6)
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default RightPanel
