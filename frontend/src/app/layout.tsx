import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "TrendSense | Predictive Intelligence",
  description: "Advanced social virality forecasting",
};

// Pure global wrapper. NO sidebar here.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("dark scroll-smooth", "font-sans", geist.variable)}>
      <body className={`${inter.variable} ${mono.variable} bg-[#030303] text-zinc-400 font-sans antialiased min-h-screen flex flex-col selection:bg-cyan-500/30`}>
        {children}
      </body>
    </html>
  );
}