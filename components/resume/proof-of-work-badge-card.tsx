"use client";

import * as React from "react";
import {
  ShieldCheck,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  X,
  Code2,
  Download,
  Award,
  Layers,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LinkedinIcon, XIcon, GithubIcon } from "@/components/ui/icons";

export interface ProofOfWorkBadgeData {
  username: string;
  name: string;
  department?: string;
  year?: string;
  qualityPrs?: number;
  campusMerges?: number;
  totalPrs?: number;
  openPrs?: number;
  closedPrs?: number;
  roleSubtitle?: string;
  verificationUrl?: string;
}

interface ProofOfWorkBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ProofOfWorkBadgeData;
}

export function ProofOfWorkBadgeModal({
  isOpen,
  onClose,
  data,
}: ProofOfWorkBadgeModalProps) {
  const [copiedType, setCopiedType] = React.useState<"markdown" | "html" | "link" | null>(null);
  const [isExportingPng, setIsExportingPng] = React.useState(false);
  const [isExportingSvg, setIsExportingSvg] = React.useState(false);

  // 3D Tilt and Holographic light tracking
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = React.useState(0);
  const [rotateY, setRotateY] = React.useState(0);
  const [glarePosition, setGlarePosition] = React.useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -12; // tilt degrees
    const rotY = ((x - centerX) / centerX) * 12;

    setRotateX(rotX);
    setRotateY(rotY);
    setGlarePosition({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePosition({ x: 50, y: 50 });
  };

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "https://zenithenopen.ist.edu.in";
  const badgeImageUrl = `${origin}/api/resume/badge/${encodeURIComponent(data.username)}`;
  const verificationUrl = data.verificationUrl || `${origin}/members/${encodeURIComponent(data.username)}`;

  const markdownSnippet = `[![ZenithenOpen Contributor Card](${badgeImageUrl})](${verificationUrl})`;
  const htmlSnippet = `<a href="${verificationUrl}" target="_blank" rel="noopener noreferrer"><img src="${badgeImageUrl}" alt="Verified Open Source Contributor - ZenithenOpen" /></a>`;
  const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verificationUrl)}`;

  const tweetText = `Proud to showcase my verified open-source contributions on @ZenithenOpen! 🚀\n\n⭐ Quality Merges: ${data.qualityPrs || 0} (>=100 stars & >=100 forks)\n🏛️ Campus Merges: ${data.campusMerges || 0}\n🔥 Total Merged: ${data.totalPrs || 0}\n\nCheck out my contributor proof-of-work:`;
  const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(verificationUrl)}&hashtags=OpenSource,BuildInPublic,ISTBengaluru`;

  const handleCopy = async (type: "markdown" | "html" | "link", text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2500);
    } catch (err) {
      console.warn("Failed to copy:", err);
    }
  };

  // Export SVG directly
  const handleDownloadSvg = async () => {
    try {
      setIsExportingSvg(true);
      const res = await fetch(badgeImageUrl);
      const svgText = await res.text();
      const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${data.username}-contributor-badge.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download SVG:", err);
    } finally {
      setIsExportingSvg(false);
    }
  };

  // Export High-Res PNG via HTML5 Canvas
  const handleDownloadPng = async () => {
    try {
      setIsExportingPng(true);
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 630;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 1. Dark Futuristic Gradient Background
      const bgGrad = ctx.createLinearGradient(0, 0, 1200, 630);
      bgGrad.addColorStop(0, "#080c16");
      bgGrad.addColorStop(0.5, "#0b1329");
      bgGrad.addColorStop(1, "#030611");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1200, 630);

      // 2. Ambient Chromatic Glow Orbs
      const cyanGlow = ctx.createRadialGradient(250, 150, 10, 250, 150, 400);
      cyanGlow.addColorStop(0, "rgba(6, 182, 212, 0.25)");
      cyanGlow.addColorStop(1, "rgba(6, 182, 212, 0)");
      ctx.fillStyle = cyanGlow;
      ctx.fillRect(0, 0, 1200, 630);

      const purpleGlow = ctx.createRadialGradient(950, 480, 10, 950, 480, 450);
      purpleGlow.addColorStop(0, "rgba(168, 85, 247, 0.22)");
      purpleGlow.addColorStop(1, "rgba(168, 85, 247, 0)");
      ctx.fillStyle = purpleGlow;
      ctx.fillRect(0, 0, 1200, 630);

      // 3. Inner Card Border & Glass
      ctx.save();
      ctx.roundRect(60, 50, 1080, 530, 28);
      ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
      ctx.fill();
      ctx.lineWidth = 3;
      const borderGrad = ctx.createLinearGradient(60, 50, 1140, 580);
      borderGrad.addColorStop(0, "rgba(6, 182, 212, 0.9)");
      borderGrad.addColorStop(0.5, "rgba(147, 51, 234, 0.6)");
      borderGrad.addColorStop(1, "rgba(16, 185, 129, 0.8)");
      ctx.strokeStyle = borderGrad;
      ctx.stroke();
      ctx.restore();

      // 4. Header Bar
      ctx.fillStyle = "#22d3ee";
      ctx.font = "bold 22px system-ui, -apple-system, sans-serif";
      ctx.fillText("✦ VERIFIED OPEN-SOURCE CONTRIBUTOR", 100, 115);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "600 20px monospace";
      ctx.textAlign = "right";
      ctx.fillText("IST BENGALURU • CAMPUS MERIT", 1100, 115);
      ctx.textAlign = "left";

      // Divider line
      ctx.beginPath();
      ctx.moveTo(100, 140);
      ctx.lineTo(1100, 140);
      ctx.strokeStyle = "rgba(148, 163, 184, 0.2)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 5. Contributor Name & Role
      ctx.fillStyle = "#ffffff";
      ctx.font = "800 48px system-ui, -apple-system, sans-serif";
      ctx.fillText(data.name, 100, 220);

      ctx.fillStyle = "#38bdf8";
      ctx.font = "600 24px system-ui, -apple-system, sans-serif";
      ctx.fillText(`@${data.username} • ${data.department || "Computer Science"}`, 100, 265);

      if (data.roleSubtitle) {
        ctx.fillStyle = "#94a3b8";
        ctx.font = "italic 20px system-ui, -apple-system, sans-serif";
        ctx.fillText(data.roleSubtitle, 100, 305);
      }

      // 6. 3 Contribution Metric Cards
      const cardY = 350;
      const cardW = 300;
      const cardH = 150;
      const metrics = [
        { label: "QUALITY MERGES", val: data.qualityPrs ?? 0, color: "#f59e0b", sub: ">=100★ & >=100 Forks" },
        { label: "CAMPUS MERGES", val: data.campusMerges ?? 0, color: "#06b6d4", sub: "IST Repositories" },
        { label: "TOTAL PRs MERGED", val: data.totalPrs ?? 0, color: "#10b981", sub: "All Verified Merges" },
      ];

      metrics.forEach((m, idx) => {
        const x = 100 + idx * 350;
        ctx.save();
        ctx.roundRect(x, cardY, cardW, cardH, 20);
        ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = m.color;
        ctx.stroke();

        ctx.fillStyle = m.color;
        ctx.font = "800 46px monospace";
        ctx.fillText(String(m.val), x + 24, cardY + 65);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 15px system-ui, -apple-system, sans-serif";
        ctx.fillText(m.label, x + 24, cardY + 102);

        ctx.fillStyle = "#94a3b8";
        ctx.font = "13px system-ui, -apple-system, sans-serif";
        ctx.fillText(m.sub, x + 24, cardY + 128);
        ctx.restore();
      });

      // 7. Footer Watermark
      ctx.fillStyle = "#64748b";
      ctx.font = "500 16px monospace";
      ctx.fillText("zenithenopen.ist/verify", 100, 545);

      ctx.textAlign = "right";
      ctx.fillText("Tamper-Proof Open-Source Proof of Work", 1100, 545);
      ctx.textAlign = "left";

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${data.username}-contributor-badge.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setIsExportingPng(false);
      }, "image/png");
    } catch (err) {
      console.error("Failed to generate PNG:", err);
      setIsExportingPng(false);
    }
  };

  return (
    <div
      id="contributor-badge-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl my-8 rounded-3xl border border-white/10 bg-gradient-to-b from-neutral-900 via-neutral-950 to-black p-6 sm:p-8 overflow-hidden shadow-2xl z-10 text-white">
        {/* Chromatic ambient glow */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-cyan-500/10 blur-[90px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-purple-500/10 blur-[90px] rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          id="close-badge-modal-btn"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 h-9 w-9 rounded-full bg-neutral-800/80 hover:bg-neutral-700 border border-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-all cursor-pointer z-20 shadow-md"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 font-mono mb-2">
          <Sparkles className="h-4 w-4" />
          <span>Holographic Proof of Work</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Contributor Badge & Social Card
        </h3>
        <p className="text-xs text-neutral-400 mt-1 max-w-lg">
          Verifiable open-source credential for LinkedIn, X (Twitter), portfolio embeds, and GitHub profile READMEs. Hover over the card to experience the holographic shimmer!
        </p>

        {/* 3D Holographic Card Preview */}
        <div
          className="mt-6 perspective-[1000px] flex justify-center cursor-pointer select-none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div
            ref={cardRef}
            id="holographic-badge-card"
            style={{
              transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
              transition: rotateX === 0 && rotateY === 0 ? "transform 0.5s ease-out" : "none",
            }}
            className="relative w-full max-w-xl rounded-2xl border-2 border-cyan-400/50 bg-gradient-to-br from-neutral-900 via-slate-950 to-neutral-950 p-6 sm:p-7 overflow-hidden shadow-[0_20px_50px_rgba(6,182,212,0.15)] ring-1 ring-cyan-400/20"
          >
            {/* Holographic dynamic sheen */}
            <div
              className="absolute inset-0 pointer-events-none opacity-40 mix-blend-color-dodge transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.6) 0%, rgba(6, 182, 212, 0.3) 25%, rgba(168, 85, 247, 0.25) 50%, transparent 75%)`,
              }}
            />

            {/* Diagonal iridescent beam */}
            <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/5 to-transparent rotate-45 pointer-events-none" />

            {/* Top Card Badge Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 relative z-10">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                  VERIFIED CAMPUS CONTRIBUTOR
                </span>
              </div>
              <span className="text-[10px] font-semibold text-neutral-400 font-mono tracking-wider">
                IST BENGALURU
              </span>
            </div>

            {/* Contributor Profile Header */}
            <div className="mt-4 flex items-center space-x-4 relative z-10">
              <div className="relative">
                <img
                  src={`https://github.com/${data.username}.png`}
                  alt={data.name}
                  className="h-14 w-14 rounded-full border-2 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] object-cover bg-neutral-800"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-neutral-950 flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-extrabold text-white text-lg sm:text-xl leading-tight truncate">
                  {data.name}
                </h4>
                <p className="text-xs text-cyan-300 font-mono truncate">
                  @{data.username} • {data.department || "Computer Science"}
                </p>
                {data.roleSubtitle && (
                  <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                    {data.roleSubtitle}
                  </p>
                )}
              </div>
            </div>

            {/* 3 Metrics Grid */}
            <div className="grid grid-cols-3 gap-2.5 mt-5 pt-4 border-t border-white/10 relative z-10">
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-center transition-transform hover:scale-105">
                <p className="text-xl sm:text-2xl font-extrabold text-amber-400 font-mono">
                  {data.qualityPrs ?? 0}
                </p>
                <p className="text-[9px] uppercase tracking-wider text-neutral-300 font-semibold truncate mt-0.5">
                  Quality Merges
                </p>
                <p className="text-[8px] text-neutral-500 truncate">&ge;100★ & &ge;100 forks</p>
              </div>

              <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-center transition-transform hover:scale-105">
                <p className="text-xl sm:text-2xl font-extrabold text-cyan-400 font-mono">
                  {data.campusMerges ?? 0}
                </p>
                <p className="text-[9px] uppercase tracking-wider text-neutral-300 font-semibold truncate mt-0.5">
                  Campus Merges
                </p>
                <p className="text-[8px] text-neutral-500 truncate">IST Repos</p>
              </div>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-center transition-transform hover:scale-105">
                <p className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono">
                  {data.totalPrs ?? 0}
                </p>
                <p className="text-[9px] uppercase tracking-wider text-neutral-300 font-semibold truncate mt-0.5">
                  Total Merged
                </p>
                <p className="text-[8px] text-neutral-500 truncate">All Repositories</p>
              </div>
            </div>

            {/* Footer Tag */}
            <div className="mt-4 flex items-center justify-between text-[9px] text-neutral-500 font-mono relative z-10">
              <span>Authentic Open-Source Proof of Work</span>
              <span className="text-cyan-400 font-semibold">zenithenopen.ist/verify</span>
            </div>
          </div>
        </div>

        {/* Quick Download Buttons */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button
            id="download-png-badge-btn"
            onClick={handleDownloadPng}
            disabled={isExportingPng}
            className="h-10 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs gap-2 rounded-xl shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>{isExportingPng ? "Rendering PNG..." : "Download High-Res PNG (1200x630)"}</span>
          </Button>

          <Button
            id="download-svg-badge-btn"
            onClick={handleDownloadSvg}
            disabled={isExportingSvg}
            variant="outline"
            className="h-10 border-white/10 bg-neutral-900/80 hover:bg-neutral-800 text-white font-semibold text-xs gap-2 rounded-xl cursor-pointer"
          >
            <Download className="h-4 w-4 text-cyan-400" />
            <span>{isExportingSvg ? "Fetching SVG..." : "Download Vector SVG"}</span>
          </Button>
        </div>

        {/* Social Share Grid */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <a
            id="share-linkedin-btn"
            href={linkedInShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button
              size="sm"
              className="w-full h-10 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs gap-2 rounded-xl shadow-md cursor-pointer"
            >
              <LinkedinIcon className="h-4 w-4" />
              <span>Share to LinkedIn</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-70" />
            </Button>
          </a>

          <a
            id="share-x-twitter-btn"
            href={xShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button
              size="sm"
              className="w-full h-10 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-semibold text-xs gap-2 rounded-xl shadow-md cursor-pointer"
            >
              <XIcon className="h-4 w-4 text-white" />
              <span>Share to X / Twitter</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-70" />
            </Button>
          </a>
        </div>

        {/* Embed Snippets Copy Buttons */}
        <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Button
            id="copy-markdown-badge-btn"
            variant="outline"
            size="sm"
            onClick={() => handleCopy("markdown", markdownSnippet)}
            className="h-9 text-xs border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:text-white gap-1.5 rounded-lg cursor-pointer"
          >
            {copiedType === "markdown" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Code2 className="h-3.5 w-3.5 text-cyan-400" />}
            <span className="truncate">{copiedType === "markdown" ? "Copied!" : "README Markdown"}</span>
          </Button>

          <Button
            id="copy-html-badge-btn"
            variant="outline"
            size="sm"
            onClick={() => handleCopy("html", htmlSnippet)}
            className="h-9 text-xs border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:text-white gap-1.5 rounded-lg cursor-pointer"
          >
            {copiedType === "html" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Code2 className="h-3.5 w-3.5 text-purple-400" />}
            <span className="truncate">{copiedType === "html" ? "Copied!" : "HTML Embed"}</span>
          </Button>

          <Button
            id="copy-verification-url-btn"
            variant="outline"
            size="sm"
            onClick={() => handleCopy("link", verificationUrl)}
            className="h-9 text-xs border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:text-white gap-1.5 rounded-lg cursor-pointer"
          >
            {copiedType === "link" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-neutral-400" />}
            <span className="truncate">{copiedType === "link" ? "Copied Link!" : "Copy URL"}</span>
          </Button>
        </div>

        {/* Live Raw SVG Endpoint Link */}
        <div className="mt-4 p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 text-[11px] text-neutral-400 flex items-center justify-between">
          <span className="truncate mr-3 font-mono text-neutral-400">{badgeImageUrl}</span>
          <a
            id="raw-svg-badge-link"
            href={badgeImageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 font-semibold shrink-0 flex items-center gap-1.5"
          >
            <span>Live SVG</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
