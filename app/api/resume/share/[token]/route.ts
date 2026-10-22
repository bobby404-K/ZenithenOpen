/**
 * Public Shareable Resume Token Resolver
 * Location: app/api/resume/share/[token]/route.ts
 *
 * Implements Section 6 of the Backend Architecture Guide:
 * "GET /api/resume/[shareToken]: Read a deliberately shared resume snapshot. Public token access; no private fields."
 *
 * Enables external recruiters and mentors to inspect a student's frozen verified
 * open-source engineering achievements without authentication.
 */

import { NextRequest, NextResponse } from "next/server";
import { getCached, setCached } from "../../../../../lib/redis/client";
import { sharedSnapshotStore, SharedResumeSnapshot } from "../route";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{
    token: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { token } = await params;
    const cleanToken = decodeURIComponent(token || "").trim();

    if (!cleanToken) {
      return NextResponse.json(
        { success: false, error: "Share token parameter is required" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format")?.toLowerCase() || "json";

    // 1. Check Redis Cache
    const cacheKey = `resume:share:${cleanToken}`;
    let record = await getCached<SharedResumeSnapshot>(cacheKey);
    const cacheHit = Boolean(record);

    // 2. Fallback to resilient store if not in Redis
    if (!record) {
      record = sharedSnapshotStore.get(cleanToken) || null;
      if (record) {
        await setCached(cacheKey, record, 3600);
      }
    }

    // 3. Not Found check
    if (!record) {
      return NextResponse.json(
        {
          success: false,
          error: "Shared resume snapshot not found or token has expired",
        },
        { status: 404 }
      );
    }

    // 4. Expiration check
    if (record.expiresAt && new Date(record.expiresAt).getTime() < Date.now()) {
      return NextResponse.json(
        {
          success: false,
          error: "This shared resume link has expired",
          expiredAt: record.expiresAt,
        },
        { status: 410 }
      );
    }

    // Increment view count
    record.viewCount = (record.viewCount || 0) + 1;

    // 5. Format check
    if (format === "markdown") {
      return new NextResponse(record.markdown, {
        status: 200,
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "X-Cache": cacheHit ? "HIT" : "MISS",
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        shareToken: record.shareToken,
        username: record.username,
        createdAt: record.createdAt,
        expiresAt: record.expiresAt,
        viewCount: record.viewCount,
        profile: record.snapshot,
        markdown: record.markdown,
      },
      {
        status: 200,
        headers: {
          "X-Cache": cacheHit ? "HIT" : "MISS",
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (err: any) {
    console.error("[GET /api/resume/share/[token]] Internal error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to resolve shared resume token",
        details: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
