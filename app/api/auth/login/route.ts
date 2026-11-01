import { NextRequest, NextResponse } from "next/server";
import { verifyStudentUSN } from "@/lib/auth/usn-verification";
import { prisma } from "@/lib/db/prisma";
import { isDatabaseConfigured } from "@/lib/db";
import { checkRateLimit } from "@/lib/redis/client";
import { syncStudentGitHubData } from "@/lib/github/sync";

export interface LoginRequestBody {
  usn?: string;
  githubUsername?: string;
  githubAccount?: {
    username: string;
    avatarUrl?: string;
    githubId?: string;
    profileUrl?: string;
  };
  linkedinAccount?: {
    linkedinId?: string;
    vanityName?: string;
    profileUrl?: string;
    avatarUrl?: string;
  };
  fastLogin?: boolean;
  provider?: "github" | "linkedin";
  identifier?: string;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
    const rateLimit = await checkRateLimit(`login:${ip}`, 45, 60);

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
    const { usn, githubUsername, githubAccount, linkedinAccount, fastLogin, provider, identifier } = body;

    // -------------------------------------------------------------------------
    // A. FAST ONE-CLICK LOGIN FOR RETURNING USERS
    // -------------------------------------------------------------------------
    if (fastLogin && identifier) {
      const cleanIdentifier = identifier.trim().toLowerCase().replace(/^@/, "");

      // 1. Search database if active
      if (isDatabaseConfigured()) {
        try {
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { githubAccount: { username: { equals: cleanIdentifier, mode: "insensitive" } } },
                { linkedinUrl: { contains: cleanIdentifier, mode: "insensitive" } },
                { email: { startsWith: cleanIdentifier, mode: "insensitive" } },
              ],
            },
            include: {
              githubAccount: true,
            },
          });

          if (user) {
            const resolvedUsn = user.email.split("@")[0].toUpperCase();
            const ghUsername = user.githubAccount?.username || cleanIdentifier;

            return NextResponse.json({
              success: true,
              user: {
                usn: resolvedUsn,
                name: user.name,
                department: user.department || "School of Computing & Engineering",
                year: user.yearOfStudy || "Student",
                college: "IST Bengaluru",
                githubUsername: ghUsername,
                githubProfileUrl: `https://github.com/${ghUsername}`,
                avatarUrl: user.githubAccount?.avatarUrl || `https://github.com/${ghUsername}.png`,
                linkedinUrl: user.linkedinUrl || `https://www.linkedin.com/in/${cleanIdentifier}`,
                linkedinUsername: cleanIdentifier,
                role: user.role,
                loggedInAt: new Date().toISOString(),
                stats: {
                  totalPrs: user.githubAccount?.prsMergedCount ?? 0,
                  openPrs: 0,
                  mergedPrs: user.githubAccount?.prsMergedCount ?? 0,
                  closedPrs: 0,
                  qualityPrs: 0,
                },
              },
            });
          }
        } catch (dbErr) {
          console.warn("[Fast Login] DB lookup notice:", dbErr);
        }
      }

      // If user isn't in DB yet, notify client to prompt for one-time USN enrollment
      return NextResponse.json(
        {
          success: false,
          error: "Account not linked to an IST USN yet. Please complete one-time student onboarding.",
          needsEnrollment: true,
        },
        { status: 404 }
      );
    }

    // -------------------------------------------------------------------------
    // B. FULL ONBOARDING FLOW: USN + GITHUB OAUTH + LINKEDIN OAUTH
    // -------------------------------------------------------------------------
    if (!usn || typeof usn !== "string" || !usn.trim()) {
      return NextResponse.json(
        { success: false, error: "USN is required" },
        { status: 400 }
      );
    }

    const resolvedGhUsername = (githubAccount?.username || githubUsername || "").trim().replace(/^@/, "");
    if (!resolvedGhUsername) {
      return NextResponse.json(
        { success: false, error: "GitHub username is required" },
        { status: 400 }
      );
    }

    // GitHub username format validation: 1-39 alphanumeric characters or single hyphens
    const githubPattern = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;
    if (!githubPattern.test(resolvedGhUsername)) {
      return NextResponse.json(
        { success: false, error: "Invalid GitHub username format" },
        { status: 400 }
      );
    }

    const cleanUsn = usn.trim().toUpperCase();

    // Validate USN enrollment
    const verification = await verifyStudentUSN(cleanUsn);
    if (!verification.valid || !verification.student) {
      return NextResponse.json(
        { success: false, error: verification.error || "Student enrollment verification failed" },
        { status: 404 }
      );
    }

    // Resolve LinkedIn details
    const resolvedLinkedinUrl =
      linkedinAccount?.profileUrl ||
      `https://www.linkedin.com/in/${linkedinAccount?.vanityName || resolvedGhUsername}`;
    const resolvedLinkedinHandle = linkedinAccount?.vanityName || resolvedGhUsername;

    // Database linkage & Real-Time GitHub Ingestion
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
            name: verification.student.name || resolvedGhUsername,
            department: verification.student.department,
            yearOfStudy: verification.student.year,
            linkedinUrl: resolvedLinkedinUrl,
            updatedAt: new Date(),
          },
          create: {
            name: verification.student.name || resolvedGhUsername,
            email: `${cleanUsn.toLowerCase()}@ist.edu.in`,
            department: verification.student.department,
            yearOfStudy: verification.student.year,
            linkedinUrl: resolvedLinkedinUrl,
          },
        });

        // Trigger real-time GitHub sync across open, merged, and closed PRs
        const syncResult = await syncStudentGitHubData(user.id, resolvedGhUsername);
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

    // Construct authenticated student session
    const authenticatedUser = {
      usn: verification.student.usn,
      name: verification.student.name,
      department: verification.student.department,
      year: verification.student.year,
      college: verification.student.college,
      githubUsername: resolvedGhUsername,
      githubProfileUrl: githubAccount?.profileUrl || `https://github.com/${resolvedGhUsername}`,
      avatarUrl: githubAccount?.avatarUrl || `https://github.com/${resolvedGhUsername}.png`,
      linkedinUrl: resolvedLinkedinUrl,
      linkedinUsername: resolvedLinkedinHandle,
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
