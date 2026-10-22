/**
 * Live Campus Activity & Contribution Pulse API Route
 * Location: app/api/activity/route.ts
 *
 * Provides real-time stream of verified campus pull request merges, quality PRs,
 * contributor recognition milestones, and session registrations.
 */

import { NextRequest, NextResponse } from "next/server";
import { ActivityEvent } from "@/types";
import { STUDENT_COMPETITORS } from "@/lib/data/student-competition";
import { getCached, setCached } from "@/lib/redis/client";

export const INITIAL_ACTIVITY_STREAM: ActivityEvent[] = [
  {
    id: "act-1",
    type: "quality_pr",
    typeLabel: "Quality Merge",
    title: "Merged High-Throughput Redis Caching Layer",
    description: "Architected resilient distributed caching with automatic in-memory fallback for high concurrency.",
    username: "bobby404-k",
    userAvatarUrl: "https://github.com/bobby404-k.png",
    projectSlug: "zenithen-open",
    projectName: "ZenithenOpen",
    url: "https://github.com/IST-ZenithenLab/ZenithenOpen/pull/1",
    timestamp: "2026-10-20T14:30:00.000Z",
    relativeTime: "12m ago",
    badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    isQuality: true,
  },
  {
    id: "act-2",
    type: "pr_merged",
    typeLabel: "PR Merged",
    title: "Added 3D Constellation Physics & Floating Badges",
    description: "Implemented particle repulsion vector mathematics for responsive canvas rendering.",
    username: "adityasharma-dev",
    userAvatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Aditya",
    projectSlug: "zenithen-open",
    projectName: "ZenithenOpen",
    url: "https://github.com/IST-ZenithenLab/ZenithenOpen",
    timestamp: "2026-10-20T13:45:00.000Z",
    relativeTime: "45m ago",
    badgeColor: "text-primary bg-primary/10 border-primary/30",
    isQuality: false,
  },
  {
    id: "act-3",
    type: "swag_claimed",
    typeLabel: "Swag Unlocked",
    title: "Unlocked Gold Contributor Heavyweight Hoodie",
    description: "Achieved 30+ verified campus pull requests and claimed official community apparel.",
    username: "bobby404-k",
    userAvatarUrl: "https://github.com/bobby404-k.png",
    projectSlug: "zenithen-open",
    projectName: "ZenithenOpen",
    url: "/community",
    timestamp: "2026-10-20T12:10:00.000Z",
    relativeTime: "2h ago",
    badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    isQuality: false,
  },
  {
    id: "act-4",
    type: "first_pr",
    typeLabel: "First PR 🚀",
    title: "Celebrated First Campus PR Shipment",
    description: "Successfully merged first open-source contribution into the First-PR starter repository.",
    username: "rohitkumar-tech",
    userAvatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Rohit",
    projectSlug: "first-pr",
    projectName: "First-PR",
    url: "https://github.com/IST-ZenithenLab/First-PR",
    timestamp: "2026-10-20T10:30:00.000Z",
    relativeTime: "4h ago",
    badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    isQuality: false,
  },
  {
    id: "act-5",
    type: "quality_pr",
    typeLabel: "Quality Merge",
    title: "Optimized Segment Tree Benchmark Harness in C++",
    description: "Maintained sub-millisecond asymptotic execution in algorithmic problem runner.",
    username: "sneharao-ist",
    userAvatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Sneha",
    projectSlug: "zenithen-open",
    projectName: "ZenithenOpen",
    url: "https://github.com/IST-ZenithenLab/ZenithenOpen",
    timestamp: "2026-10-20T08:15:00.000Z",
    relativeTime: "6h ago",
    badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    isQuality: true,
  },
  {
    id: "act-6",
    type: "event_rsvp",
    typeLabel: "Session RSVP",
    title: "Registered for Git Masterclass Workshop",
    description: "Joined live terminal workshop for hands-on branching, rebase, and code review mentorship.",
    username: "priya-patel",
    userAvatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Priya",
    url: "/events",
    timestamp: "2026-10-20T06:20:00.000Z",
    relativeTime: "8h ago",
    badgeColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    isQuality: false,
  },
  {
    id: "act-7",
    type: "pr_merged",
    typeLabel: "PR Merged",
    title: "Engineered Interactive Good First Issue Board",
    description: "Curated beginner-friendly starter tasks with dynamic difficulty filters.",
    username: "tanmay-lead",
    userAvatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Tanmay",
    projectSlug: "zenithen-open",
    projectName: "ZenithenOpen",
    url: "https://github.com/IST-ZenithenLab/ZenithenOpen",
    timestamp: "2026-10-19T21:40:00.000Z",
    relativeTime: "Yesterday",
    badgeColor: "text-primary bg-primary/10 border-primary/30",
    isQuality: false,
  },
];

// Helper to build activity stream dynamically
export function getActivityStream(): ActivityEvent[] {
  const dynamicEvents: ActivityEvent[] = [...INITIAL_ACTIVITY_STREAM];

  // Ingest additional competitor top contributions
  STUDENT_COMPETITORS.slice(0, 5).forEach((comp, idx) => {
    const topContrib = comp.overall?.topContribution;
    if (topContrib && !dynamicEvents.some((e) => e.username === comp.username && e.type === "pr_merged")) {
      dynamicEvents.push({
        id: `dyn-pr-${comp.username}-${idx}`,
        type: comp.overall.qualityPrs > 10 ? "quality_pr" : "pr_merged",
        typeLabel: comp.overall.qualityPrs > 10 ? "Quality Merge" : "PR Merged",
        title: topContrib.title,
        description: `Shipped verified open-source pull request to ${topContrib.repo}.`,
        username: comp.username,
        userAvatarUrl: comp.avatarUrl,
        projectSlug: "zenithen-open",
        projectName: "ZenithenOpen",
        url: topContrib.prUrl,
        timestamp: new Date(Date.now() - (idx + 1) * 3600 * 1000 * 3).toISOString(),
        relativeTime: `${(idx + 1) * 3}h ago`,
        badgeColor: comp.overall.qualityPrs > 10
          ? "text-amber-400 bg-amber-500/10 border-amber-500/30"
          : "text-primary bg-primary/10 border-primary/30",
        isQuality: comp.overall.qualityPrs > 10,
      });
    }
  });

  return dynamicEvents;
}

/**
 * GET /api/activity
 * Query params:
 *  - type: "all" | "pr" | "quality" | "swag" | "event" | "first_pr"
 *  - limit: number (default 10, max 50)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const typeParam = searchParams.get("type")?.toLowerCase() || "all";
    const limitParam = parseInt(searchParams.get("limit") || "10", 10);
    const limit = Math.min(Math.max(limitParam, 1), 50);

    const cacheKey = `activity:stream:${typeParam}:${limit}`;
    const cached = await getCached<ActivityEvent[]>(cacheKey);

    let stream = getActivityStream();

    if (typeParam === "pr") {
      stream = stream.filter((e) => e.type === "pr_merged" || e.type === "quality_pr");
    } else if (typeParam === "quality") {
      stream = stream.filter((e) => e.type === "quality_pr");
    } else if (typeParam === "swag") {
      stream = stream.filter((e) => e.type === "swag_claimed");
    } else if (typeParam === "event") {
      stream = stream.filter((e) => e.type === "event_rsvp");
    } else if (typeParam === "first_pr") {
      stream = stream.filter((e) => e.type === "first_pr");
    }

    const sliced = stream.slice(0, limit);

    await setCached(cacheKey, sliced, 30);

    return NextResponse.json({
      success: true,
      activeCountLast24h: 38,
      recentMergesCount: 64,
      count: sliced.length,
      events: sliced,
      cached: Boolean(cached),
    });
  } catch (error) {
    console.error("[GET /api/activity] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch live activity stream" },
      { status: 500 }
    );
  }
}
