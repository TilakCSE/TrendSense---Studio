import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "TrendSense | Predictive Intelligence",
  description: "Advanced social virality forecasting",
};

// Pure global wrapper. NO sidebar here.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.variable} ${mono.variable} bg-[#030303] text-zinc-400 font-sans antialiased min-h-screen flex flex-col selection:bg-cyan-500/30`}>
        {children}
      </body>
    </html>
  );
}