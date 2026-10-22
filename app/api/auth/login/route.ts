import { NextRequest, NextResponse } from "next/server";
import { verifyStudentUSN } from "@/lib/auth/usn-verification";
import { prisma } from "@/lib/db/prisma";
import { isDatabaseConfigured } from "@/lib/db";
import { checkRateLimit } from "@/lib/redis/client";
import { syncStudentGitHubData } from "@/lib/github/sync";

export interface LoginRequestBody {
  usn?: string;
  githubUsername?: string;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
    const rateLimit = await checkRateLimit(`login:${ip}`, 30, 60);

    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: "Too many login attempts. Please try again shortly." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.resetSeconds),
            "X-RateLimit-Limit": String(rateLimit.limit),
            "X-RateLimit-Remaining": String(rateLimit.remaining),
          },
        }
      );
    }

    const body: LoginRequestBody = await req.json();
    const { usn, githubUsername } = body;

    if (!usn || typeof usn !== "string" || !usn.trim()) {
      return NextResponse.json(
        { success: false, error: "USN is required" },
        { status: 400 }
      );
    }

    if (!githubUsername || typeof githubUsername !== "string" || !githubUsername.trim()) {
      return NextResponse.json(
        { success: false, error: "GitHub username is required" },
        { status: 400 }
      );
    }

    const cleanUsn = usn.trim().toUpperCase();
    const cleanUsername = githubUsername.trim().replace(/^@/, "");

    // GitHub username format validation: 1-39 alphanumeric characters or single hyphens
    const githubPattern = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;
    if (!githubPattern.test(cleanUsername)) {
      return NextResponse.json(
        { success: false, error: "Invalid GitHub username format" },
        { status: 400 }
      );
    }

    // Step 1: Verify student USN enrollment
    const verification = await verifyStudentUSN(cleanUsn);
    if (!verification.valid || !verification.student) {
      return NextResponse.json(
        { success: false, error: verification.error || "Student enrollment verification failed" },
        { status: 404 }
      );
    }

    // Step 2: Database linkage & Real-Time GitHub Ingestion
    let syncedStats = {
      totalPrs: 0,
      openPrs: 0,
      mergedPrs: 0,
      closedPrs: 0,
      qualityPrs: 0,
    };

    if (isDatabaseConfigured()) {
      try {
        const user = await prisma.user.upsert({
          where: { email: `${cleanUsn.toLowerCase()}@ist.edu.in` },
          update: {
            name: verification.student.name || cleanUsername,
            department: verification.student.department,
            yearOfStudy: verification.student.year,
            updatedAt: new Date(),
          },
          create: {
            name: verification.student.name || cleanUsername,
            email: `${cleanUsn.toLowerCase()}@ist.edu.in`,
            department: verification.student.department,
            yearOfStudy: verification.student.year,
          },
        });

        // Trigger real-time GitHub sync across open, merged, and closed PRs
        const syncResult = await syncStudentGitHubData(user.id, cleanUsername);
        if (syncResult.success) {
          syncedStats = {
            totalPrs: syncResult.totalPrs,
            openPrs: syncResult.openPrs,
            mergedPrs: syncResult.mergedPrs,
            closedPrs: syncResult.closedPrs,
            qualityPrs: syncResult.qualityPrs,
          };
        }
      } catch (dbErr) {
        console.warn("[Login API] DB linkage or sync notice:", dbErr);
      }
    }

    // Step 3: Construct authenticated student session
    const authenticatedUser = {
      usn: verification.student.usn,
      name: verification.student.name,
      department: verification.student.department,
      year: verification.student.year,
      college: verification.student.college,
      githubUsername: cleanUsername,
      avatarUrl: `https://github.com/${cleanUsername}.png`,
      role: "MEMBER" as const,
      loggedInAt: new Date().toISOString(),
      stats: syncedStats,
    };

    return NextResponse.json({
      success: true,
      user: authenticatedUser,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error during authentication" },
      { status: 500 }
    );
  }
}
