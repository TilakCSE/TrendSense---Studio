"use client";
import React from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#030303]">
      {/* Sidebar Area */}
      <aside className="w-64 border-r border-white/5 bg-[#09090B] flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="w-5 h-5 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-sm shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
          <span className="font-mono text-sm font-bold text-white tracking-tighter">TRENDSENSE.IO</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {/* We will add dashboard navigation links here later */}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#030303]">
        <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#030303]/80 backdrop-blur-md z-20">
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">Dashboard / Neural_Core</div>
          <div className="flex items-center gap-4">
            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-zinc-400">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          {children}
        </div>
      </main>
    </div>
  );
}