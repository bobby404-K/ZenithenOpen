import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navigation/navbar";
import { Footer } from "@/components/navigation/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZenithenOpen — Open-Source Community Platform | S-VYASA Bengaluru",
  description:
    "Data-driven open-source development community at S-VYASA Deemed to be University, Bengaluru. Showcasing member achievements, GitHub contributions, live projects, learning paths, mentorship, and GSoC preparation.",
  keywords: [
    "ZenithenOpen",
    "S-VYASA University",
    "Open Source Community",
    "Bengaluru Tech",
    "GitHub Contributions",
    "GSoC Preparation",
    "Student Developers",
    "Computer Science",
  ],
  authors: [{ name: "ZenithenOpen Community" }],
  openGraph: {
    title: "ZenithenOpen — We don't just learn to code. We ship.",
    description:
      "Join 2,000+ student developers contributing to open source, landing GSoC, and building production software.",
    type: "website",
    siteName: "ZenithenOpen",
  },
};

import { AuthProvider } from "@/components/auth/auth-context";
import { LoginModal } from "@/components/auth/login-modal";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-slate-900 selection:bg-blue-600 selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <LoginModal />
        </AuthProvider>
      </body>
    </html>
  );
}
