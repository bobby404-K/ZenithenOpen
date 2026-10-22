/**
 * Learning Path Deep-Dive API Route
 * Location: app/api/learning-paths/[id]/route.ts
 *
 * Resolves a single learning path curriculum by database ID or slug.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/db/prisma";
import { getCached, setCached } from "../../../../lib/redis/client";
import { LearningPath } from "../../../../types";
import { MOCK_LEARNING_PATHS } from "../../../../lib/data/mock-data";

function normalizeDbPath(dbPath: any): LearningPath {
  let curriculum = [];
  try {
    curriculum = typeof dbPath.modulesJson === "string" 
      ? JSON.parse(dbPath.modulesJson) 
      : (Array.isArray(dbPath.modulesJson) ? dbPath.modulesJson : []);
  } catch {
    curriculum = [];
  }

  let levelStr: "Beginner" | "Intermediate" | "Advanced" = "Beginner";
  const rawLevel = String(dbPath.level || "").toUpperCase();
  if (rawLevel === "ADVANCED") levelStr = "Advanced";
  else if (rawLevel === "INTERMEDIATE") levelStr = "Intermediate";

  return {
    id: dbPath.id,
    slug: dbPath.slug,
    title: dbPath.title,
    description: dbPath.description || "",
    level: levelStr,
    estimatedWeeks: dbPath.estimatedWeeks || 4,
    iconName: dbPath.iconName || "Code2",
    color: dbPath.color || "#3b82f6",
    enrolledCount: dbPath._count?.progress || 0,
    curriculum,
    targetSkills: Array.isArray(dbPath.targetSkills) ? dbPath.targetSkills : [],
  };
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing identifier parameter" },
        { status: 400 }
      );
    }

    const cacheKey = `learning-path:item:${id.toLowerCase()}`;
    const cached = await getCached<LearningPath>(cacheKey);
    if (cached) {
      return NextResponse.json(
        { success: true, source: "cache", path: cached },
        { status: 200 }
      );
    }

    // Try finding by slug first, then by id
    let dbItem: any = null;
    try {
      dbItem = await prisma.learningPath.findFirst({
        where: {
          OR: [{ slug: id }, { id }],
        },
        include: {
          _count: {
            select: { progress: true },
          },
        },
      });
    } catch {
      dbItem = null;
    }

    if (dbItem) {
      const normalized = normalizeDbPath(dbItem);
      await setCached(cacheKey, normalized, 600);
      return NextResponse.json(
        { success: true, source: "database", path: normalized },
        { status: 200 }
      );
    }

    // Check mock data fallback
    const fallback = MOCK_LEARNING_PATHS.find(
      (lp) => lp.slug === id || lp.id === id
    );

    if (fallback) {
      await setCached(cacheKey, fallback, 600);
      return NextResponse.json(
        { success: true, source: "fallback", path: fallback },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Learning path not found" },
      { status: 404 }
    );
  } catch (error: any) {
    console.error("[GET /api/learning-paths/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
