import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

// Assuming you download 'Paradiso' or similar from your font list
const headingFont = localFont({
  src: "../../public/fonts/Paradiso.otf",
  variable: "--font-heading",
  display: "swap",
});

const bodyFont = Inter({ 
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "TrendSense | Predict the Unpredictable",
  description: "AI-powered virality predictor for social content.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={cn(
          "min-h-screen bg-mashed-potatoes text-mulled-wine font-body antialiased selection:bg-cranberry selection:text-mashed-potatoes",
          headingFont.variable,
          bodyFont.variable
        )}
      >
        {children}
      </body>
    </html>
  );
}