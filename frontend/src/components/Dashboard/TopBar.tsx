import React from 'react'

interface TopBarProps {
    trends: string[]
}

const TopBar: React.FC<TopBarProps> = ({ trends }) => {
    return (
        <div className="fixed top-0 left-0 w-full h-12 glass-card border-t-0 border-x-0 z-50 flex items-center overflow-hidden">
            <div className="flex whitespace-nowrap animate-marquee">
                {[...trends, ...trends, ...trends].map((trend, i) => (
                    <span key={i} className="mx-8 text-sm font-mono-custom text-neon-glow flex items-center">
                        <span className="text-white opacity-50 mr-2">🔥 Trending:</span>
                        {trend}
                    </span>
                ))}
            </div>
        </div>
    )
}

export default TopBar
