/**
 * Student GitHub Activity Synchronization Route
 * Location: app/api/students/sync/route.ts
 *
 * Synchronizes real pull requests from GitHub (Open, Merged, Closed, Quality)
 * for registered students and ingests them into Supabase PostgreSQL.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { isDatabaseConfigured } from "@/lib/db";
import { syncStudentGitHubData } from "@/lib/github/sync";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { success: false, error: "Database not configured" },
      { status: 503 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { username, usn, syncAll: _syncAll } = body as {
      username?: string;
      usn?: string;
      syncAll?: boolean;
    };

    // Case 1: Sync a single targeted student by GitHub username or USN
    if (username || usn) {
      const cleanUsername = username?.trim().replace(/^@/, "");
      const cleanUsn = usn?.trim().toUpperCase();

      const user = await prisma.user.findFirst({
        where: {
          OR: [
            cleanUsername ? { githubAccount: { username: cleanUsername } } : {},
            cleanUsn ? { email: `${cleanUsn.toLowerCase()}@ist.edu.in` } : {},
          ],
        },
        include: { githubAccount: true },
      });

      if (!user || !user.githubAccount) {
        return NextResponse.json(
          { success: false, error: "Registered student with GitHub account not found" },
          { status: 404 }
        );
      }

      const syncResult = await syncStudentGitHubData(user.id, user.githubAccount.username);
      return NextResponse.json({
        success: true,
        message: `Successfully synchronized ${syncResult.totalPrs} PRs for @${user.githubAccount.username}`,
        data: syncResult,
      });
    }

    // Case 2: Sync all registered students (default or syncAll: true)
    const users = await prisma.user.findMany({
      where: {
        githubAccount: { isNot: null },
      },
      include: {
        githubAccount: true,
      },
    });

    if (users.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No registered students with linked GitHub accounts found to sync",
        syncedCount: 0,
        results: [],
      });
    }

    const results = [];
    for (const u of users) {
      if (u.githubAccount) {
        const res = await syncStudentGitHubData(u.id, u.githubAccount.username);
        results.push(res);
      }
    }

    const totalPrs = results.reduce((acc, r) => acc + r.totalPrs, 0);
    const mergedPrs = results.reduce((acc, r) => acc + r.mergedPrs, 0);
    const qualityPrs = results.reduce((acc, r) => acc + r.qualityPrs, 0);

    return NextResponse.json({
      success: true,
      message: `Synchronized ${results.length} students: ${totalPrs} total PRs (${mergedPrs} merged, ${qualityPrs} quality)`,
      syncedCount: results.length,
      totals: { totalPrs, mergedPrs, qualityPrs },
      results,
    });
  } catch (error) {
    console.error("[Sync API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during synchronization" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { success: false, error: "Database not configured" },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");

  try {
    if (username) {
      const cleanUsername = username.trim().replace(/^@/, "");
      const user = await prisma.user.findFirst({
        where: {
          githubAccount: { username: cleanUsername },
        },
        include: { githubAccount: true },
      });

      if (!user || !user.githubAccount) {
        return NextResponse.json(
          { success: false, error: `Student @${cleanUsername} not found` },
          { status: 404 }
        );
      }

      const res = await syncStudentGitHubData(user.id, user.githubAccount.username);
      return NextResponse.json({ success: true, data: res });
    }

    // Default GET: Sync all registered users
    const users = await prisma.user.findMany({
      where: {
        githubAccount: { isNot: null },
      },
      include: { githubAccount: true },
    });

    const results = [];
    for (const u of users) {
      if (u.githubAccount) {
        const res = await syncStudentGitHubData(u.id, u.githubAccount.username);
        results.push(res);
      }
    }

    return NextResponse.json({
      success: true,
      syncedCount: results.length,
      results,
    });
  } catch (err) {
    console.error("[Sync GET API] Error:", err);
    return NextResponse.json(
      { success: false, error: "Sync failed" },
      { status: 500 }
    );
  }
}
