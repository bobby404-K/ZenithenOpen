/**
 * Global Search & Quick-Jump API Route
 * Location: app/api/search/route.ts
 *
 * Provides high-speed unified search across campus student contributors,
 * official open-source repositories, triaged opportunities, and platform pages.
 */

import { NextRequest, NextResponse } from "next/server";
import { STUDENT_COMPETITORS } from "@/lib/data/student-competition";
import { SEED_DATA } from "@/scripts/seed-production";

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: "contributor" | "project" | "opportunity" | "page";
  url: string;
  badge?: string;
  badgeColor?: string;
  iconName?: string;
}

const PLATFORM_PAGES: SearchResultItem[] = [
  {
    id: "page-leaderboard",
    title: "Contributor Hall of Fame",
    subtitle: "Deterministic 4-tier student contributor rankings & podium",
    category: "page",
    url: "/leaderboard",
    badge: "Hall of Fame",
    badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  },
  {
    id: "page-programs",
    title: "Open Source Arena & Programs",
    subtitle: "Campus sprint competition, GSoC track, and fellowship hub",
    category: "page",
    url: "/programs",
    badge: "Programs",
    badgeColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
  },
  {
    id: "page-projects",
    title: "Campus Repositories Catalog",
    subtitle: "Explore verified IST open-source repositories and packages",
    category: "page",
    url: "/projects",
    badge: "Repositories",
    badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  },
  {
    id: "page-members",
    title: "Members Directory",
    subtitle: "Directory of IST student engineers, alumni mentors, and leads",
    category: "page",
    url: "/members",
    badge: "Directory",
    badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  },
  {
    id: "page-opportunities",
    title: "Good First Issues & Opportunities",
    subtitle: "Curated beginner-friendly issues on campus repositories",
    category: "page",
    url: "/opportunities",
    badge: "Good First Issue",
    badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/30",
  },
  {
    id: "page-resources",
    title: "Interactive First PR Guide & Roadmaps",
    subtitle: "Interactive Git clone-to-PR terminal workflow and guides",
    category: "page",
    url: "/resources",
    badge: "Learn",
    badgeColor: "text-sky-400 bg-sky-500/10 border-sky-500/30",
  },
  {
    id: "page-resume",
    title: "Verified Open-Source Resume",
    subtitle: "Generate and export verified recruiter proof-of-work profiles",
    category: "page",
    url: "/resume",
    badge: "Proof of Work",
    badgeColor: "text-teal-400 bg-teal-500/10 border-teal-500/30",
  },
  {
    id: "page-events",
    title: "Workshops & Open Source Saturdays",
    subtitle: "Weekly live PR review office hours and hackathon tracks",
    category: "page",
    url: "/events",
    badge: "Events",
    badgeColor: "text-rose-400 bg-rose-500/10 border-rose-500/30",
  },
  {
    id: "page-achievements",
    title: "Milestones & First PR Hall of Fame",
    subtitle: "Celebrated student achievements and community badges",
    category: "page",
    url: "/achievements",
    badge: "Milestones",
    badgeColor: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  },
];

const FOUNDATIONAL_PROJECTS: SearchResultItem[] = [
  {
    id: "proj-zenithen-open",
    title: "ZenithenOpen",
    subtitle: "Flagship campus open-source community platform • TypeScript, Next.js",
    category: "project",
    url: "/projects/zenithen-open",
    badge: "Featured Repo",
    badgeColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
  },
  {
    id: "proj-first-pr",
    title: "First-PR",
    subtitle: "Official onboarding repository for first-time campus pull requests",
    category: "project",
    url: "/projects/first-pr",
    badge: "Beginner Friendly",
    badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("q") || "").trim().toLowerCase();
    const category = searchParams.get("category")?.toLowerCase() || "all";
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "12", 10), 1), 30);

    // 1. Build indexed contributor items
    const competitors: SearchResultItem[] = STUDENT_COMPETITORS.map((sc) => ({
      id: `student-${sc.username}`,
      title: sc.name,
      subtitle: `@${sc.username} • ${sc.department} (${sc.overall.mergedPrs} Merged, ${sc.overall.qualityPrs} Quality)`,
      category: "contributor" as const,
      url: `/members/${encodeURIComponent(sc.username)}`,
      badge: sc.badge,
      badgeColor: sc.badgeColor || "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    }));

    const seededStudents: SearchResultItem[] = SEED_DATA.students.map((stu) => ({
      id: `student-${stu.githubUsername}`,
      title: stu.name,
      subtitle: `@${stu.githubUsername} • ${stu.department} (IST Lead Engineer)`,
      category: "contributor" as const,
      url: `/members/${encodeURIComponent(stu.githubUsername)}`,
      badge: stu.isMentor ? "Campus Mentor" : "Core Engineer",
      badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    }));

    const contributorsMap = new Map<string, SearchResultItem>();
    for (const c of [...seededStudents, ...competitors]) {
      contributorsMap.set(c.url.toLowerCase(), c);
    }
    const contributors = Array.from(contributorsMap.values());

    // 2. Aggregate all search index items
    let allItems: SearchResultItem[] = [
      ...contributors,
      ...FOUNDATIONAL_PROJECTS,
      ...PLATFORM_PAGES,
    ];

    // Filter by category if requested
    if (category !== "all") {
      allItems = allItems.filter((item) => item.category === category);
    }

    // Filter by text query if present
    let results: SearchResultItem[] = allItems;
    if (query) {
      results = allItems.filter((item) => {
        const titleMatch = item.title.toLowerCase().includes(query);
        const subMatch = item.subtitle.toLowerCase().includes(query);
        const badgeMatch = item.badge?.toLowerCase().includes(query);
        const urlMatch = item.url.toLowerCase().includes(query);
        return titleMatch || subMatch || badgeMatch || urlMatch;
      });
    }

    // Slice to limit
    const paginated = results.slice(0, limit);

    return NextResponse.json(
      {
        success: true,
        count: paginated.length,
        totalMatches: results.length,
        query,
        results: paginated,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("[GET /api/search Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error occurred while searching.",
      },
      { status: 500 }
    );
  }
}
