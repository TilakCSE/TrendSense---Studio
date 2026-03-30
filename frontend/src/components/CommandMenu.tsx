"use client";
import React, { useEffect, useState } from "react";
import { Command } from "cmdk";
import { Search, Zap, Trash2, Moon, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CommandMenuProps {
    onPredict: () => void;
    onClear: () => void;
    onToggleTheme?: () => void;
}

export function CommandMenu({ onPredict, onClear, onToggleTheme }: CommandMenuProps) {
    const [open, setOpen] = useState(false);

    // Toggle on ⌘K / Ctrl+K globally
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((prev) => !prev);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const run = (action: () => void) => {
        action();
        setOpen(false);
    };

    return (
        <AnimatePresence>
            {open && (
                <Command.Dialog
                    open={open}
                    onOpenChange={setOpen}
                    className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-[3px]"
                    asChild
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.97, y: -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97, y: -8 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="w-full max-w-[600px] mx-4 bg-[#0A0A0B] border border-white/[0.08] rounded-xl overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.6)]"
                    >
                        {/* Search bar */}
                        <div className="flex items-center gap-3 px-4 border-b border-white/[0.06]">
                            <Search className="w-[14px] h-[14px] text-zinc-600 flex-shrink-0" />
                            <Command.Input
                                placeholder="Type a command…"
                                className="flex-1 py-4 bg-transparent outline-none text-zinc-200 placeholder:text-zinc-700 text-[13px] font-mono"
                            />
                            <kbd
                                className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded border border-white/10 bg-white/5 font-mono text-[10px] text-zinc-500 cursor-pointer"
                                onClick={() => setOpen(false)}
                            >
                                esc
                            </kbd>
                        </div>

                        <Command.List className="max-h-72 overflow-y-auto p-2 scrollbar-none">
                            <Command.Empty className="py-8 text-center text-xs text-zinc-600 font-mono">
                                No matching commands.
                            </Command.Empty>

                            {/* Actions group */}
                            <Command.Group
                                heading="Actions"
                                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-zinc-700"
                            >
                                <Item
                                    onSelect={() => run(onPredict)}
                                    shortcut="↵"
                                >
                                    <Zap className="w-[14px] h-[14px] mr-2.5 text-cyan-500" />
                                    Run Neural Prediction
                                    <span className="ml-auto text-[10px] font-mono text-zinc-700">
                                        /predict
                                    </span>
                                </Item>
                                <Item onSelect={() => run(onClear)}>
                                    <Trash2 className="w-[14px] h-[14px] mr-2.5 text-zinc-500" />
                                    Clear Editor
                                </Item>
                            </Command.Group>

                            {/* Settings group */}
                            <Command.Group
                                heading="Settings"
                                className="mt-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-zinc-700"
                            >
                                <Item onSelect={() => run(() => onToggleTheme?.())}>
                                    <Moon className="w-[14px] h-[14px] mr-2.5 text-zinc-500" />
                                    Toggle Night Mode
                                </Item>
                                <Item onSelect={() => setOpen(false)}>
                                    <Cpu className="w-[14px] h-[14px] mr-2.5 text-zinc-500" />
                                    System Diagnostics
                                </Item>
                            </Command.Group>
                        </Command.List>

                        {/* Footer */}
                        <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/[0.06] bg-white/[0.015]">
                            <span className="text-[10px] text-zinc-700 font-mono">
                                TrendSense Engine v2.0
                            </span>
                            <div className="flex items-center gap-3 text-[10px] text-zinc-700 font-mono uppercase tracking-wider">
                                <span>
                                    Navigate{" "}
                                    <kbd className="bg-white/5 border border-white/10 px-1 rounded text-[9px]">
                                        ↑↓
                                    </kbd>
                                </span>
                                <span>
                                    Select{" "}
                                    <kbd className="bg-white/5 border border-white/10 px-1 rounded text-[9px]">
                                        ↵
                                    </kbd>
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </Command.Dialog>
            )}
        </AnimatePresence>
    );
}

// ---------------------------------------------------------------------------

interface ItemProps {
    children: React.ReactNode;
    onSelect?: () => void;
    shortcut?: string;
}

function Item({ children, onSelect, shortcut }: ItemProps) {
    return (
        <Command.Item
            onSelect={onSelect}
            className="
        flex items-center px-3 py-2 rounded-lg text-[13px] text-zinc-400 cursor-default select-none
        aria-selected:bg-white/[0.05] aria-selected:text-white
        transition-colors duration-75
      "
        >
            {children}
            {shortcut && (
                <kbd className="ml-2 font-mono text-[10px] text-zinc-700">{shortcut}</kbd>
            )}
        </Command.Item>
    );
}