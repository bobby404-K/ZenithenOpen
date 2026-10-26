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
  title: "ZenithenOpen — Open-Source Community Platform | IST Bengaluru",
  description:
    "Data-driven open-source development community at IST Bengaluru. Showcasing member achievements, GitHub contributions, live projects, learning paths, and GSoC preparation.",
  keywords: [
    "ZenithenOpen",
    "IST",
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
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { ThemeMenu } from "@/components/theme/theme-menu";
import { NavigationProvider } from "@/components/navigation/navigation-context";
import { SidebarMenu } from "@/components/navigation/sidebar-menu";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-theme="sage-collective"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var valid=["aqua-circuit","violet-nexus","sage-collective","monochrome","obsidian-pulse","midnight-aurora","carbon-ember"];var t=null;try{var p=new URLSearchParams(window.location.search);var q=p.get("theme");if(q){if(q==="arctic-forge"||q==="indigo-core"){t="monochrome";localStorage.setItem("zenithen-theme","monochrome");}else if(valid.indexOf(q)!==-1){t=q;localStorage.setItem("zenithen-theme",q);}}}catch(_){}if(!t){t=localStorage.getItem("zenithen-theme");}if(t==="arctic-forge"||t==="indigo-core"){t="monochrome";localStorage.setItem("zenithen-theme","monochrome");}else if(!t||valid.indexOf(t)===-1){t="sage-collective";localStorage.setItem("zenithen-theme","sage-collective");}document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","sage-collective");}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
        <AuthProvider>
          <ThemeProvider>
            <NavigationProvider>
              <Navbar />
              <SidebarMenu />
              <main className="flex-1">{children}</main>
              <Footer />
              <LoginModal />
              <ThemeSwitcher />
              <ThemeMenu />
            </NavigationProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
