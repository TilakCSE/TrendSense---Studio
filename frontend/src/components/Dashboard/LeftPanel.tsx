import React from 'react'
import { Send, Twitter, Shield } from 'lucide-react'

interface LeftPanelProps {
    caption: string
    setCaption: (val: string) => void
    onPredict: () => void
    isPredicting: boolean
}

const LeftPanel: React.FC<LeftPanelProps> = ({ caption, setCaption, onPredict, isPredicting }) => {
    return (
        <div className="w-full lg:w-[400px] flex flex-col gap-6 p-6 glass-card rounded-2xl relative z-10 transition-all duration-500 hover:border-neon-green/30">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-neon-green/10 rounded-lg">
                    <Send className="w-5 h-5 text-neon-green" />
                </div>
                <h2 className="text-xl font-display uppercase tracking-wider text-neon-glow">Trend Analyzer</h2>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-white/40 font-bold">Post Drafter</label>
                    <textarea
                        className="w-full h-40 glass-input p-4 font-sans text-sm outline-none focus:ring-1 focus:ring-neon-green/50 placeholder:text-white/20"
                        placeholder="Type your viral content here..."
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-white/40 font-bold">Platform Context</label>
                    <select className="w-full glass-input p-3 text-sm appearance-none outline-none focus:ring-1 focus:ring-neon-green/50">
                        <option>X / Twitter</option>
                        <option>Reddit (r/technology)</option>
                        <option>LinkedIn (B2B SaaS)</option>
                    </select>
                </div>

                <button
                    onClick={onPredict}
                    disabled={isPredicting || !caption.trim()}
                    className={`neon-button w-full py-4 rounded-xl flex items-center justify-center gap-3 mt-4 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed`}
                >
                    {isPredicting ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            <span>Analyzing Node...</span>
                        </div>
                    ) : (
                        <>
                            <Twitter className="w-5 h-5" />
                            <span>Analyze Virality</span>
                        </>
                    )}
                </button>
            </div>

            <div className="mt-auto pt-6 flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/20 font-bold">
                <Shield className="w-3 h-3" />
                Safe Engine: ML-v1.6-Stable
            </div>
        </div>
    )
}

export default LeftPanel
