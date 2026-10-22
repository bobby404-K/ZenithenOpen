/**
 * Achievements & First PR Hall of Fame API Route
 * Location: app/api/achievements/route.ts
 * 
 * Manages community badges, unlocked milestones, and First PR Hall of Fame stories
 * with Supabase PostgreSQL persistence and Upstash Redis caching.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/db/prisma";
import { getCached, setCached, deleteCached } from "../../../lib/redis/client";
import { FirstPrStory } from "../../../types";
import { MOCK_FIRST_PR_STORIES } from "../../../lib/data/mock-data";

export interface CommunityBadge {
  code: string;
  name: string;
  desc: string;
  icon: string;
  criteria: string;
  category: string;
  unlockedCount: number;
}

const DEFAULT_BADGES: Omit<CommunityBadge, "unlockedCount">[] = [
  {
    code: "first-pr-shipped",
    name: "First PR Shipped",
    desc: "Successfully merged 1st pull request into a campus repo",
    icon: "🌱",
    criteria: "1 PR merged",
    category: "Milestone",
  },
  {
    code: "consistent-contributor",
    name: "Consistent Contributor",
    desc: "Contributions across 4 consecutive calendar weeks",
    icon: "🔥",
    criteria: "4-week streak",
    category: "Streak",
  },
  {
    code: "top-reviewer",
    name: "Top Reviewer",
    desc: "Reviewed and guided 15+ student pull requests with empathy",
    icon: "💎",
    criteria: "15 code reviews",
    category: "Community",
  },
  {
    code: "project-maintainer",
    name: "Project Maintainer",
    desc: "Core release lead for a verified ZenithenOpen repo",
    icon: "🛡️",
    criteria: "Maintainer role",
    category: "Leadership",
  },
  {
    code: "gsoc-scholar",
    name: "GSoC Scholar",
    desc: "Accepted into Google Summer of Code or LFX Mentorship",
    icon: "🎓",
    criteria: "Fellowship accepted",
    category: "Excellence",
  },
  {
    code: "docs-champion",
    name: "Docs Champion",
    desc: "Authored comprehensive architectural specs and tutorials",
    icon: "📚",
    criteria: "3+ docs contributions",
    category: "Documentation",
  },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryParam = searchParams.get("category")?.trim().toLowerCase() || "all";
    const searchParam = searchParams.get("search")?.trim().toLowerCase() || "";

    const cacheKey = `achievements:data:${categoryParam}:${searchParam || "all"}`;

    // 1. Check Redis Cache
    const cachedData = await getCached<{
      badges: CommunityBadge[];
      stories: FirstPrStory[];
      totalUnlocked: number;
    }>(cacheKey);

    if (cachedData) {
      return NextResponse.json(
        {
          success: true,
          badges: cachedData.badges,
          stories: cachedData.stories,
          totalUnlocked: cachedData.totalUnlocked,
          cached: true,
        },
        {
          status: 200,
          headers: {
            "X-Cache": "HIT",
            "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
          },
        }
      );
    }

    // 2. Query Prisma for Unlocked Badges & First PR Stories
    let dbStories: FirstPrStory[] = [];
    const unlockCountsMap: Record<string, number> = {};
    let totalUnlockedCount = 0;

    try {
      const [storiesRecords, userAchievements] = await Promise.all([
        prisma.firstPrStory.findMany({
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                githubAccount: {
                  select: {
                    username: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
          orderBy: {
            mergedDate: "desc",
          },
        }),
        prisma.userAchievement.findMany({
          include: {
            achievement: {
              select: {
                code: true,
              },
            },
          },
        }),
      ]);

      if (storiesRecords && storiesRecords.length > 0) {
        dbStories = storiesRecords.map((story) => ({
          id: story.id,
          memberName: story.user?.name || "IST Student Contributor",
          memberUsername: story.user?.githubAccount?.username || "student",
          memberAvatar:
            story.user?.githubAccount?.avatarUrl ||
            story.user?.image ||
            "https://github.com/ghost.png",
          repoName: story.repoName,
          repoUrl: story.repoUrl,
          prNumber: story.prNumber,
          prTitle: story.prTitle,
          prUrl: story.prUrl,
          mergedDate: story.mergedDate.toISOString().split("T")[0],
          quote: story.quote,
          category: (["Bug Fix", "Feature", "Documentation", "Refactoring", "Test"].includes(story.category)
            ? story.category
            : "Feature") as "Bug Fix" | "Feature" | "Documentation" | "Refactoring" | "Test",
          linesAdded: 45,
          linesRemoved: 12,
        }));
      }

      if (userAchievements && userAchievements.length > 0) {
        totalUnlockedCount = userAchievements.length;
        userAchievements.forEach((ua) => {
          const code = ua.achievement?.code;
          if (code) {
            unlockCountsMap[code] = (unlockCountsMap[code] || 0) + 1;
          }
        });
      }
    } catch (dbError) {
      console.warn("[Achievements API] Database query fallback:", dbError);
    }

    // Fallback stories if database is clean
    const allStories = dbStories.length > 0 ? dbStories : MOCK_FIRST_PR_STORIES;

    // Build badge list with live unlock counts
    let badges: CommunityBadge[] = DEFAULT_BADGES.map((b) => ({
      ...b,
      unlockedCount: unlockCountsMap[b.code] || 0,
    }));

    // Filter badges by category if requested
    if (categoryParam !== "all") {
      badges = badges.filter((b) => b.category.toLowerCase() === categoryParam);
    }

    // Filter by search query if requested
    if (searchParam) {
      badges = badges.filter(
        (b) =>
          b.name.toLowerCase().includes(searchParam) ||
          b.desc.toLowerCase().includes(searchParam) ||
          b.criteria.toLowerCase().includes(searchParam)
      );
    }

    const payload = {
      badges,
      stories: allStories,
      totalUnlocked: totalUnlockedCount,
    };

    // 3. Cache in Redis for 120 seconds
    await setCached(cacheKey, payload, 120);

    return NextResponse.json(
      {
        success: true,
        badges,
        stories: allStories,
        totalUnlocked: totalUnlockedCount,
        cached: false,
      },
      {
        status: 200,
        headers: {
          "X-Cache": "MISS",
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("[Achievements API] Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error fetching achievements data",
        badges: DEFAULT_BADGES.map((b) => ({ ...b, unlockedCount: 0 })),
        stories: MOCK_FIRST_PR_STORIES,
        totalUnlocked: 0,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      action = "story",
      userId,
      repoName,
      repoUrl,
      prNumber,
      prTitle,
      prUrl,
      quote,
      category = "Community",
      achievementCode,
    } = body;

    if (action === "unlock") {
      if (!userId || !achievementCode) {
        return NextResponse.json(
          {
            success: false,
            error: "userId and achievementCode are required to record an achievement unlock",
          },
          { status: 400 }
        );
      }

      // Check or find achievement by code
      let achievement = await prisma.achievement.findUnique({
        where: { code: achievementCode },
      });

      if (!achievement) {
        const badgeDef = DEFAULT_BADGES.find((b) => b.code === achievementCode) || {
          code: achievementCode,
          name: achievementCode,
          desc: "Community Achievement",
          icon: "🌱",
          category: "General",
        };

        achievement = await prisma.achievement.create({
          data: {
            code: badgeDef.code,
            title: badgeDef.name,
            description: badgeDef.desc,
            badgeIcon: badgeDef.icon,
            category: badgeDef.category,
          },
        });
      }

      const unlocked = await prisma.userAchievement.upsert({
        where: {
          userId_achievementId: {
            userId,
            achievementId: achievement.id,
          },
        },
        update: {},
        create: {
          userId,
          achievementId: achievement.id,
        },
      });

      await deleteCached("achievements:data:all:all");

      return NextResponse.json(
        {
          success: true,
          message: "Achievement successfully unlocked",
          unlocked,
        },
        { status: 201 }
      );
    }

    // Default action: Record First PR Hall of Fame Story
    if (!userId || !repoName || !prNumber || !prTitle || !prUrl || !quote) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required story fields: userId, repoName, prNumber, prTitle, prUrl, and quote are required",
        },
        { status: 400 }
      );
    }

    const newStory = await prisma.firstPrStory.create({
      data: {
        userId,
        repoName,
        repoUrl: repoUrl || `https://github.com/${repoName}`,
        prNumber: Number(prNumber),
        prTitle,
        prUrl,
        quote,
        category,
        mergedDate: new Date(),
      },
    });

    // Invalidate Redis caches
    await deleteCached("achievements:data:all:all");

    return NextResponse.json(
      {
        success: true,
        message: "First PR story successfully added to Hall of Fame",
        story: newStory,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Achievements API POST] Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error creating achievement or story",
      },
      { status: 500 }
    );
  }
}
