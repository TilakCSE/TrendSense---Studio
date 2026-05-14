import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import SmoothScroller from "@/components/SmoothScroller";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const headingFont = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TrendSense | Predict the Unpredictable",
  description: "AI-powered virality predictor for social content.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn("scroll-smooth", geist.variable, headingFont.variable)}
    >
      <body
        className={cn(
          "min-h-screen bg-cream text-emerald antialiased",
          "selection:bg-burgundy selection:text-cream",
          geist.className
        )}
      >
        <SmoothScroller>{children}</SmoothScroller>
      </body>
    </html>
  );
}