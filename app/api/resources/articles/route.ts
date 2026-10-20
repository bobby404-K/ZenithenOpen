/**
 * Developer Resources & Technical Articles API
 * Location: app/api/resources/articles/route.ts
 *
 * Provides curated engineering deep dives, Git fundamentals, open-source
 * fellowship blueprints, and architecture masterclasses for campus student developers.
 */

import { NextRequest, NextResponse } from "next/server";
import { RESOURCE_ARTICLES } from "@/lib/data/resource-articles";
import { getCached, setCached } from "@/lib/redis/client";
import { ResourceArticle } from "@/types";

export const runtime = "nodejs";

const CACHE_TTL_SECONDS = 300; // 5 minutes

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category")?.toLowerCase().trim();
    const search = searchParams.get("search")?.toLowerCase().trim();
    const slug = searchParams.get("slug")?.toLowerCase().trim();
    const difficulty = searchParams.get("difficulty")?.toLowerCase().trim();
    const featured = searchParams.get("featured");

    // Check single article lookup by slug
    if (slug) {
      const singleArticle = RESOURCE_ARTICLES.find(
        (a) => a.slug.toLowerCase() === slug
      );

      if (!singleArticle) {
        return NextResponse.json(
          {
            success: false,
            error: `Resource article with slug '${slug}' not found`,
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          article: singleArticle,
        },
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=60, s-maxage=300",
          },
        }
      );
    }

    // Cache key for collection query
    const cacheKey = `resources:articles:${category || "all"}:${search || "all"}:${difficulty || "all"}:${featured || "all"}`;
    const cachedData = await getCached<any>(cacheKey);

    if (cachedData) {
      return NextResponse.json(cachedData, {
        status: 200,
        headers: {
          "X-Cache": "HIT",
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=60, s-maxage=300",
        },
      });
    }

    // Filter collection
    let filtered: ResourceArticle[] = [...RESOURCE_ARTICLES];

    if (category && category !== "all") {
      filtered = filtered.filter(
        (a) =>
          a.categorySlug.toLowerCase() === category ||
          a.category.toLowerCase().includes(category)
      );
    }

    if (difficulty && difficulty !== "all") {
      filtered = filtered.filter(
        (a) => a.difficulty.toLowerCase() === difficulty
      );
    }

    if (featured !== null && featured !== undefined) {
      const isFeatured = featured === "true" || featured === "1";
      filtered = filtered.filter((a) => Boolean(a.featured) === isFeatured);
    }

    if (search) {
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(search) ||
          a.excerpt.toLowerCase().includes(search) ||
          a.author.toLowerCase().includes(search) ||
          a.tags.some((t) => t.toLowerCase().includes(search)) ||
          a.keyTakeaways.some((k) => k.toLowerCase().includes(search))
      );
    }

    // Compute category counts
    const categories = [
      { slug: "all", label: "All Topics", count: RESOURCE_ARTICLES.length },
      {
        slug: "career",
        label: "Career & Fellowships",
        count: RESOURCE_ARTICLES.filter((a) => a.categorySlug === "career").length,
      },
      {
        slug: "git",
        label: "Git Architecture",
        count: RESOURCE_ARTICLES.filter((a) => a.categorySlug === "git").length,
      },
      {
        slug: "architecture",
        label: "Web Architecture",
        count: RESOURCE_ARTICLES.filter((a) => a.categorySlug === "architecture").length,
      },
      {
        slug: "community",
        label: "Community Insights",
        count: RESOURCE_ARTICLES.filter((a) => a.categorySlug === "community").length,
      },
    ];

    const payload = {
      success: true,
      count: filtered.length,
      categories,
      articles: filtered,
    };

    // Edge cache
    await setCached(cacheKey, payload, CACHE_TTL_SECONDS);

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        "X-Cache": "MISS",
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60, s-maxage=300",
      },
    });
  } catch (error) {
    console.error("[RESOURCES_ARTICLES_ERROR]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve developer resource articles",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
