"use client";

import * as React from "react";
import Link from "next/link";
import {
  Star,
  GitPullRequest,
  CircleSlash,
  GitMerge,
  ArrowRight,
  FileText,
  X,
  CheckCircle2,
} from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";

export interface StudentPreviewData {
  username: string;
  name: string;
  avatarUrl: string;
  department?: string;
  year?: string;
  badge?: string;
  badgeColor?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  qualityPrs?: number;
  totalPrs?: number;
  openPrs?: number;
  closedPrs?: number;
  mergedPrs?: number;
  campusMerges?: number;
  topRepo?: string;
}

interface StudentPreviewModalProps {
  student: StudentPreviewData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function StudentPreviewModal({
  student,
  isOpen,
  onClose,
}: StudentPreviewModalProps) {
  // Close on ESC key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !student) return null;

  const githubLink = student.githubUrl || `https://github.com/${student.username}`;
  const linkedinLink = student.linkedinUrl || `https://linkedin.com/in/${student.username}`;

  const qualityCount = student.qualityPrs ?? 0;
  const totalCount = student.totalPrs ?? (student.openPrs ?? 0) + (student.closedPrs ?? 0) + (student.mergedPrs ?? 0);
  const openCount = student.openPrs ?? 0;
  const closedCount = student.closedPrs ?? 0;
  const mergedCount = student.mergedPrs ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Card - Styled Strictly Matching Reference Design */}
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-800/90 bg-gradient-to-b from-slate-900/95 via-slate-950 to-black p-6 sm:p-8 overflow-hidden shadow-2xl text-center z-10">
        <div className="absolute inset-0 bg-radial-at-t from-cyan-500/10 via-transparent to-transparent pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Preview"
          className="absolute top-4 right-4 h-8 w-8 rounded-full bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/60 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer z-20"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Centered Circular Avatar with Cyan Glow Ring */}
        <div className="relative mx-auto w-fit mt-2">
          <img
            src={student.avatarUrl || `https://github.com/${student.username}.png`}
            alt={student.name}
            className="h-24 w-24 sm:h-28 sm:w-28 rounded-full border-2 border-cyan-400/60 ring-4 ring-cyan-500/20 object-cover shadow-2xl mx-auto"
          />
        </div>

        {/* Student Name */}
        <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-4">
          {student.name}
        </h3>

        {/* Role Subtitle */}
        <p className="text-xs sm:text-sm font-medium text-cyan-400 mt-1">
          {student.badge || `${student.department || "Engineering"} · ${student.year || "3rd Year"}`}
        </p>

        {/* External Social Navigation Action Buttons */}
        <div className="flex items-center justify-center space-x-3 mt-4">
          <a
            href={githubLink}
            target="_blank"
            rel="noopener noreferrer"
            title={`@${student.username} on GitHub`}
            className="h-10 w-10 rounded-full bg-slate-950/80 border border-slate-700/80 hover:border-cyan-400 text-slate-300 hover:text-white flex items-center justify-center transition-all hover:scale-110 shadow-lg cursor-pointer"
          >
            <GithubIcon className="h-5 w-5" />
          </a>
          <a
            href={linkedinLink}
            target="_blank"
            rel="noopener noreferrer"
            title={`@${student.username} on LinkedIn`}
            className="h-10 w-10 rounded-full bg-slate-950/80 border border-slate-700/80 hover:border-blue-400 text-slate-300 hover:text-blue-400 flex items-center justify-center transition-all hover:scale-110 shadow-lg cursor-pointer"
          >
            <LinkedinIcon className="h-5 w-5" />
          </a>
        </div>

        {/* Verified IST Badge */}
        <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground">
          <span className="font-mono text-slate-400">@{student.username}</span>
          <span className="text-slate-700">•</span>
          <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3" />
            <span>Verified IST Student</span>
          </div>
        </div>

        {/* Campus Merges Callout (if available) */}
        {student.campusMerges !== undefined && student.campusMerges > 0 && (
          <div className="mt-4 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
            <span className="font-semibold">Official Campus Repo Merges:</span>
            <span className="font-mono font-bold text-sm text-amber-400">{student.campusMerges} merges</span>
          </div>
        )}

        {/* 5 PR Metric Stat Cards */}
        <div className="grid grid-cols-5 gap-2 sm:gap-2.5 mt-5">
          {/* 1. Quality Merge */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2 text-center">
            <div className="flex items-center justify-center text-amber-400 mb-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            </div>
            <p className="text-base sm:text-lg font-bold text-white font-mono">{qualityCount}</p>
            <p className="text-[9px] uppercase tracking-wider text-slate-400 font-medium truncate">Quality</p>
          </div>

          {/* 2. Total PR */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2 text-center">
            <div className="flex items-center justify-center text-slate-400 mb-1">
              <GitPullRequest className="h-3.5 w-3.5" />
            </div>
            <p className="text-base sm:text-lg font-bold text-white font-mono">{totalCount}</p>
            <p className="text-[9px] uppercase tracking-wider text-slate-400 font-medium truncate">Total PR</p>
          </div>

          {/* 3. Open PR */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2 text-center">
            <div className="flex items-center justify-center text-emerald-400 mb-1">
              <GitPullRequest className="h-3.5 w-3.5" />
            </div>
            <p className="text-base sm:text-lg font-bold text-emerald-400 font-mono">{openCount}</p>
            <p className="text-[9px] uppercase tracking-wider text-slate-400 font-medium truncate">Open</p>
          </div>

          {/* 4. Closed PR */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2 text-center">
            <div className="flex items-center justify-center text-rose-400 mb-1">
              <CircleSlash className="h-3.5 w-3.5" />
            </div>
            <p className="text-base sm:text-lg font-bold text-rose-400 font-mono">{closedCount}</p>
            <p className="text-[9px] uppercase tracking-wider text-slate-400 font-medium truncate">Closed</p>
          </div>

          {/* 5. Total Merges */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2 text-center">
            <div className="flex items-center justify-center text-purple-400 mb-1">
              <GitMerge className="h-3.5 w-3.5" />
            </div>
            <p className="text-base sm:text-lg font-bold text-purple-400 font-mono">{mergedCount}</p>
            <p className="text-[9px] uppercase tracking-wider text-slate-400 font-medium truncate">Merged</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-800/80">
          <Link
            href={`/resume?username=${encodeURIComponent(student.username)}`}
            className="flex-1"
            onClick={onClose}
          >
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs h-9 border-slate-700 bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800 gap-1.5 cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5 text-primary" />
              <span>Resume</span>
            </Button>
          </Link>

          <Link
            href={`/members/${encodeURIComponent(student.username)}`}
            className="flex-1"
            onClick={onClose}
          >
            <Button
              size="sm"
              className="w-full text-xs h-9 bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 font-semibold shadow-md cursor-pointer"
            >
              <span>Full Profile</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
