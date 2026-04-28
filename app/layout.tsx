import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";

import "@/app/globals.css";
import "@/styles/resume.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-app" });
const merriweather = Merriweather({
  subsets: ["latin"],
  variable: "--font-resume",
  weight: ["400", "700", "900"],
});

export const metadata: Metadata = {
  title: "AI Resume Builder | Smart Resume Studio",
  description: "A polished resume builder with live preview, PDF export, DOCX export, and local autosave.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${merriweather.variable}`}>{children}</body>
    </html>
  );
}
