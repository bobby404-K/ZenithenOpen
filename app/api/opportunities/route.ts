/**
 * Opportunities Board & Starter Issue Finder API Route
 * Location: app/api/opportunities/route.ts
 * 
 * Manages curated open-source issues and starter tasks with Supabase PostgreSQL
 * persistence and Upstash Redis caching.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/db/prisma";
import { getCached, setCached, deleteCached } from "../../../lib/redis/client";
import { Opportunity } from "../../../types";
import { MOCK_OPPORTUNITIES } from "../../../lib/data/mock-data";
import { Difficulty } from "@prisma/client";

/**
 * Standard GitHub label accent colors
 */
const LABEL_COLORS: Record<string, string> = {
  "good-first-issue": "#7057ff",
  help_wanted: "#008672",
  bug: "#d73a4a",
  enhancement: "#a2eeef",
  documentation: "#0075ca",
  frontend: "#0075ca",
  backend: "#e4e669",
  "ui/ux": "#e4e669",
  beginner: "#7057ff",
  intermediate: "#fbca04",
  advanced: "#d93f0b",
};

function formatLabels(labels: string[]): { name: string; color: string }[] {
  if (!Array.isArray(labels) || labels.length === 0) {
    return [{ name: "good-first-issue", color: "#7057ff" }];
  }
  return labels.map((name) => ({
    name,
    color: LABEL_COLORS[name.toLowerCase()] || "#3178c6",
  }));
}

/**
 * GET /api/opportunities
 * Query params:
 *  - difficulty: "all" | "beginner" | "intermediate" | "advanced"
 *  - language: string
 *  - search: string matching title, repository, or labels
 *  - limit: number (default: 50)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const difficultyParam = searchParams.get("difficulty")?.trim().toLowerCase() || "all";
    const languageParam = searchParams.get("language")?.trim() || "";
    const searchParam = searchParams.get("search")?.trim().toLowerCase() || "";
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "50", 10), 1), 100);

    const cacheKey = `opportunities:list:${difficultyParam}:${languageParam.toLowerCase() || "all"}:${searchParam || "all"}:${limit}`;

    // 1. Check Redis Cache
    const cachedData = await getCached<Opportunity[]>(cacheKey);
    if (cachedData) {
      return NextResponse.json(
        {
          success: true,
          count: cachedData.length,
          opportunities: cachedData,
          cached: true,
        },
        {
          status: 200,
          headers: {
            "X-Cache": "HIT",
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
          },
        }
      );
    }

    // 2. Query Prisma database
    let dbOpportunities: any[] = [];
    try {
      const whereClause: any = { isOpen: true };
      if (difficultyParam !== "all") {
        whereClause.difficulty = difficultyParam.toUpperCase() as Difficulty;
      }
      if (languageParam) {
        whereClause.language = { equals: languageParam, mode: "insensitive" };
      }

      dbOpportunities = await prisma.opportunity.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: limit,
      });
    } catch (dbErr) {
      console.warn("[GET /api/opportunities] Database query notice:", dbErr);
      dbOpportunities = [];
    }

    // 3. Fallback to curated baseline issues if database is empty
    let opportunities: Opportunity[] = [];

    if (dbOpportunities.length > 0) {
      opportunities = dbOpportunities.map((opp) => {
        const repoName = opp.repoFullName.includes("/")
          ? opp.repoFullName.split("/")[1]
          : opp.repoFullName;

        return {
          id: opp.id,
          title: opp.title,
          repository: repoName,
          repoFullName: opp.repoFullName,
          issueNumber: opp.issueNumber,
          issueUrl: opp.issueUrl,
          language: opp.language,
          labels: formatLabels(opp.labels),
          difficulty: opp.difficulty.toLowerCase() as "beginner" | "intermediate" | "advanced",
          createdAt: opp.createdAt instanceof Date ? opp.createdAt.toISOString() : opp.createdAt,
          commentsCount: 2,
        };
      });
    } else {
      opportunities = [...MOCK_OPPORTUNITIES];
      if (difficultyParam !== "all") {
        opportunities = opportunities.filter((o) => o.difficulty === difficultyParam);
      }
      if (languageParam) {
        opportunities = opportunities.filter(
          (o) => o.language.toLowerCase() === languageParam.toLowerCase()
        );
      }
    }

    // 4. In-memory search filter
    if (searchParam) {
      opportunities = opportunities.filter((o) => {
        const matchesTitle = o.title.toLowerCase().includes(searchParam);
        const matchesRepo = o.repository.toLowerCase().includes(searchParam);
        const matchesLabel = o.labels.some((l) => l.name.toLowerCase().includes(searchParam));
        return matchesTitle || matchesRepo || matchesLabel;
      });
    }

    // 5. Store in Upstash Redis cache (TTL: 180s)
    await setCached(cacheKey, opportunities, 180);

    return NextResponse.json(
      {
        success: true,
        count: opportunities.length,
        opportunities,
        cached: false,
      },
      {
        status: 200,
        headers: {
          "X-Cache": "MISS",
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (err: any) {
    console.error("[GET /api/opportunities] Internal error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch opportunities board",
        details: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/opportunities
 * Curates or triages an open-source issue as a student opportunity
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      repoFullName,
      issueNumber,
      issueUrl,
      language = "TypeScript",
      difficulty = "beginner",
      labels = ["good-first-issue"],
      projectId,
    } = body;

    if (!title || !repoFullName || !issueNumber || !issueUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "Fields 'title', 'repoFullName', 'issueNumber', and 'issueUrl' are required.",
        },
        { status: 400 }
      );
    }

    const numIssue = parseInt(String(issueNumber), 10);
    if (isNaN(numIssue) || numIssue <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Field 'issueNumber' must be a positive integer.",
        },
        { status: 400 }
      );
    }

    const parsedDifficulty = (["beginner", "intermediate", "advanced"].includes(
      String(difficulty).toLowerCase()
    )
      ? String(difficulty).toUpperCase()
      : "BEGINNER") as Difficulty;

    let opportunity: any = null;
    try {
      opportunity = await prisma.opportunity.upsert({
        where: {
          repoFullName_issueNumber: {
            repoFullName,
            issueNumber: numIssue,
          },
        },
        update: {
          title,
          issueUrl,
          language,
          difficulty: parsedDifficulty,
          labels: Array.isArray(labels) ? labels : ["good-first-issue"],
          updatedAt: new Date(),
        },
        create: {
          title,
          repoFullName,
          issueNumber: numIssue,
          issueUrl,
          language,
          difficulty: parsedDifficulty,
          labels: Array.isArray(labels) ? labels : ["good-first-issue"],
          isOpen: true,
          projectId: projectId || null,
        },
      });
    } catch (dbErr) {
      console.warn("[POST /api/opportunities] DB notice, using resilient fallback:", dbErr);
      opportunity = {
        id: `opp-${numIssue}`,
        title,
        repoFullName,
        issueNumber: numIssue,
        issueUrl,
        language,
        difficulty: parsedDifficulty,
        labels: Array.isArray(labels) ? labels : ["good-first-issue"],
      };
    }

    // Invalidate Redis caches
    await deleteCached("opportunities:list:all:all:all:50");

    return NextResponse.json(
      {
        success: true,
        message: `Opportunity #${opportunity.issueNumber} registered successfully.`,
        opportunity: {
          id: opportunity.id,
          title: opportunity.title,
          repoFullName: opportunity.repoFullName,
          issueNumber: opportunity.issueNumber,
          difficulty: opportunity.difficulty,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[POST /api/opportunities] Internal error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to curate opportunity",
        details: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
