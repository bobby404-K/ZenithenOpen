"use client";

import React, { useState, useEffect } from "react";

interface ConstellationOrg {
  id: string;
  name: string;
  handle: string;
  top: number; // percentage from top (0-100)
  left: number; // percentage from left (0-100)
  size: "lg" | "md" | "sm";
  depth: "fore" | "mid" | "back";
  animVariant: 1 | 2 | 3;
  delay: number; // animation delay in seconds
  duration?: number;
}

/**
 * Top GitHub Organizations from Reference 2 (PDF Pages)
 * Positioned to replicate the organic, left-side clustered constellation in Reference 1.
 */
const CONSTELLATION_ORGS: ConstellationOrg[] = [
  // --- Foreground & Primary Anchors (PyTorch, Kubernetes, Microsoft, OpenAI, Google, etc.) ---
  {
    id: "pytorch",
    name: "PyTorch",
    handle: "pytorch",
    top: 35,
    left: 14,
    size: "lg",
    depth: "fore",
    animVariant: 1,
    delay: 0.2,
  },
  {
    id: "kubernetes",
    name: "Kubernetes",
    handle: "kubernetes",
    top: 22,
    left: 8,
    size: "lg",
    depth: "fore",
    animVariant: 2,
    delay: 1.1,
  },
  {
    id: "microsoft",
    name: "Microsoft",
    handle: "microsoft",
    top: 8,
    left: 5,
    size: "lg",
    depth: "fore",
    animVariant: 3,
    delay: 2.3,
  },
  {
    id: "google",
    name: "Google",
    handle: "google",
    top: 48,
    left: 9,
    size: "lg",
    depth: "fore",
    animVariant: 1,
    delay: 1.7,
  },
  {
    id: "openai",
    name: "OpenAI",
    handle: "openai",
    top: 28,
    left: 22,
    size: "lg",
    depth: "fore",
    animVariant: 2,
    delay: 0.6,
  },
  {
    id: "meta",
    name: "Meta",
    handle: "meta",
    top: 63,
    left: 6,
    size: "lg",
    depth: "fore",
    animVariant: 3,
    delay: 3.2,
  },
  {
    id: "docker",
    name: "Docker",
    handle: "docker",
    top: 74,
    left: 9,
    size: "lg",
    depth: "fore",
    animVariant: 1,
    delay: 1.4,
  },
  {
    id: "zenithen",
    name: "ZenithenLab",
    handle: "IST-ZenithenLab",
    top: 16,
    left: 20,
    size: "lg",
    depth: "fore",
    animVariant: 2,
    delay: 0.4,
  },

  // --- Mid-ground Cluster (Rust, Anthropic, HuggingFace, Supabase, Flutter, Go, Node, etc.) ---
  {
    id: "rust",
    name: "Rust",
    handle: "rust-lang",
    top: 12,
    left: 15,
    size: "md",
    depth: "mid",
    animVariant: 1,
    delay: 1.9,
  },
  {
    id: "anthropics",
    name: "Anthropic",
    handle: "anthropics",
    top: 42,
    left: 1.5,
    size: "md",
    depth: "mid",
    animVariant: 2,
    delay: 2.8,
  },
  {
    id: "huggingface",
    name: "Hugging Face",
    handle: "huggingface",
    top: 3.5,
    left: 10,
    size: "md",
    depth: "mid",
    animVariant: 3,
    delay: 0.9,
  },
  {
    id: "apache",
    name: "Apache",
    handle: "apache",
    top: 17,
    left: 2.5,
    size: "md",
    depth: "mid",
    animVariant: 1,
    delay: 3.5,
  },
  {
    id: "tensorflow",
    name: "TensorFlow",
    handle: "tensorflow",
    top: 15,
    left: 27,
    size: "md",
    depth: "mid",
    animVariant: 2,
    delay: 1.3,
  },
  {
    id: "golang",
    name: "Go",
    handle: "golang",
    top: 20,
    left: 31,
    size: "md",
    depth: "mid",
    animVariant: 3,
    delay: 2.1,
  },
  {
    id: "nodejs",
    name: "Node.js",
    handle: "nodejs",
    top: 56,
    left: 13,
    size: "md",
    depth: "mid",
    animVariant: 1,
    delay: 2.6,
  },
  {
    id: "flutter",
    name: "Flutter",
    handle: "flutter",
    top: 32,
    left: 13.5,
    size: "md",
    depth: "mid",
    animVariant: 2,
    delay: 0.8,
  },
  {
    id: "supabase",
    name: "Supabase",
    handle: "supabase",
    top: 43,
    left: 28,
    size: "md",
    depth: "mid",
    animVariant: 3,
    delay: 1.6,
  },
  {
    id: "vercel",
    name: "Vercel",
    handle: "vercel",
    top: 68,
    left: 2,
    size: "md",
    depth: "mid",
    animVariant: 1,
    delay: 3.8,
  },
  {
    id: "redis",
    name: "Redis",
    handle: "redis",
    top: 82,
    left: 8,
    size: "md",
    depth: "mid",
    animVariant: 2,
    delay: 2.4,
  },
  {
    id: "denoland",
    name: "Deno",
    handle: "denoland",
    top: 71,
    left: 24,
    size: "md",
    depth: "mid",
    animVariant: 3,
    delay: 1.5,
  },
  {
    id: "jetbrains",
    name: "JetBrains",
    handle: "JetBrains",
    top: 79,
    left: 28.5,
    size: "md",
    depth: "mid",
    animVariant: 1,
    delay: 0.7,
  },
  {
    id: "fastapi",
    name: "FastAPI",
    handle: "fastapi",
    top: 50,
    left: 18,
    size: "md",
    depth: "mid",
    animVariant: 2,
    delay: 3.1,
  },
  {
    id: "github",
    name: "GitHub",
    handle: "github",
    top: 62.5,
    left: 17,
    size: "md",
    depth: "mid",
    animVariant: 3,
    delay: 2.0,
  },

  // --- Background Depth (Astro, Django, Homebrew, NestJS, Neovim, Bun, Redux, etc.) ---
  {
    id: "neovim",
    name: "Neovim",
    handle: "neovim",
    top: 77,
    left: 22.5,
    size: "sm",
    depth: "back",
    animVariant: 1,
    delay: 4.1,
  },
  {
    id: "django",
    name: "Django",
    handle: "django",
    top: 42,
    left: 40.5,
    size: "sm",
    depth: "back",
    animVariant: 2,
    delay: 2.2,
  },
  {
    id: "homebrew",
    name: "Homebrew",
    handle: "Homebrew",
    top: 30.5,
    left: 36.5,
    size: "sm",
    depth: "back",
    animVariant: 3,
    delay: 1.8,
  },
  {
    id: "nestjs",
    name: "NestJS",
    handle: "nestjs",
    top: 43,
    left: 49.5,
    size: "sm",
    depth: "back",
    animVariant: 1,
    delay: 3.3,
  },
  {
    id: "withastro",
    name: "Astro",
    handle: "withastro",
    top: 58,
    left: 19.5,
    size: "sm",
    depth: "back",
    animVariant: 2,
    delay: 0.5,
  },
  {
    id: "reduxjs",
    name: "Redux",
    handle: "reduxjs",
    top: 71,
    left: 37.5,
    size: "sm",
    depth: "back",
    animVariant: 3,
    delay: 2.9,
  },
  {
    id: "oven-sh",
    name: "Bun",
    handle: "oven-sh",
    top: 26,
    left: 2,
    size: "sm",
    depth: "back",
    animVariant: 1,
    delay: 1.6,
  },
  {
    id: "spring-projects",
    name: "Spring",
    handle: "spring-projects",
    top: 6,
    left: 18.5,
    size: "sm",
    depth: "back",
    animVariant: 2,
    delay: 3.6,
  },
  {
    id: "ollama",
    name: "Ollama",
    handle: "ollama",
    top: 86,
    left: 4.5,
    size: "sm",
    depth: "back",
    animVariant: 3,
    delay: 1.2,
  },
];

export function FloatingOrgBadges() {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  // Subtle interactive parallax mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 20; // max 20px tilt
      const y = (e.clientY / innerHeight - 0.5) * 20;
      setMouseOffset({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none transition-transform duration-700 ease-out"
      style={{
        transform: `translate3d(${mouseOffset.x * 0.4}px, ${mouseOffset.y * 0.4}px, 0)`,
      }}
      aria-label="Floating GitHub organization badges constellation"
    >
      {CONSTELLATION_ORGS.map((org) => {
        // Size styling mapping
        let containerSize = "w-13 h-13 sm:w-14 sm:h-14";
        let logoSize = "w-7 h-7 sm:w-8 sm:h-8";
        let depthOpacity = "opacity-95";
        let zLayer = "z-3";

        if (org.size === "md") {
          containerSize = "w-10 h-10 sm:w-11 sm:h-11";
          logoSize = "w-5.5 h-5.5 sm:w-6 sm:h-6";
          depthOpacity = "opacity-85";
          zLayer = "z-2";
        } else if (org.size === "sm") {
          containerSize = "w-8.5 h-8.5 sm:w-9 sm:h-9";
          logoSize = "w-4.5 h-4.5 sm:w-5 sm:h-5";
          depthOpacity = "opacity-70";
          zLayer = "z-1";
        }

        // Animation variant mapping
        const animClass =
          org.animVariant === 1
            ? "animate-float-1"
            : org.animVariant === 2
            ? "animate-float-2"
            : "animate-float-3";

        return (
          <div
            key={org.id}
            className={`absolute pointer-events-auto ${zLayer} ${depthOpacity} transition-opacity duration-300`}
            style={{
              top: `${org.top}%`,
              left: `${org.left}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              className={`${animClass}`}
              style={{
                animationDelay: `${org.delay}s`,
              }}
            >
              <a
                href={`https://github.com/${org.handle}`}
                target="_blank"
                rel="noopener noreferrer"
                title={`@${org.handle} (${org.name}) on GitHub`}
                className={`group relative flex items-center justify-center ${containerSize} rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-md shadow-md shadow-slate-200/70 hover:scale-120 hover:border-blue-400 hover:bg-white hover:shadow-xl hover:shadow-blue-500/15 hover:z-20 transition-all duration-300 cursor-pointer`}
              >
                {/* Dynamic GitHub CDN avatar */}
                <img
                  src={`https://github.com/${org.handle}.png?size=96`}
                  alt={org.name}
                  loading="eager"
                  className={`${logoSize} rounded-xl object-contain filter group-hover:brightness-110 transition-all duration-200`}
                  onError={(e) => {
                    // Fallback to unavatar CDN if needed
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes("unavatar.io")) {
                      target.src = `https://unavatar.io/github/${org.handle}`;
                    }
                  }}
                />

                {/* Subtle hover pill tooltip */}
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md text-[11px] font-mono tracking-tight text-white bg-[#0f172a]/95 border border-white/15 backdrop-blur-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-30">
                  @{org.handle}
                </span>
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
