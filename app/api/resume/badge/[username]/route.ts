/**
 * Student Proof-of-Work Badge Card Dynamic Generator Route
 * Location: app/api/resume/badge/[username]/route.ts
 *
 * Generates official verifiable SVG badge cards and JSON metadata
 * for student engineers to embed in GitHub READMEs, LinkedIn, and portfolios.
 */

import { NextRequest, NextResponse } from "next/server";
import { STUDENT_COMPETITORS } from "@/lib/data/student-competition";
import { prisma } from "@/lib/db/prisma";
import { ContributionStatus } from "@prisma/client";

interface RouteContext {
  params: Promise<{ username: string }>;
}

export interface BadgeCardPayload {
  username: string;
  name: string;
  department: string;
  year: string;
  qualityPrs: number;
  campusMerges: number;
  totalPrs: number;
  badgeLevel: string;
  verifiedAt: string;
  verificationUrl: string;
  embedCodes: {
    markdown: string;
    html: string;
    shareUrl: string;
    linkedInShareUrl: string;
  };
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}

function generateSvgBadge(payload: {
  username: string;
  name: string;
  department: string;
  qualityPrs: number;
  campusMerges: number;
  totalPrs: number;
  verificationUrl: string;
}): string {
  const cleanName = escapeXml(payload.name);
  const cleanUsername = escapeXml(payload.username);
  const cleanDept = escapeXml(payload.department || "Engineering");

  return `<svg width="500" height="190" viewBox="0 0 500 190" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="500" y2="190" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#090D16" />
      <stop offset="50%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
    <linearGradient id="cyanBorder" x1="0" y1="0" x2="500" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#06B6D4" stop-opacity="0.8" />
      <stop offset="50%" stop-color="#3B82F6" stop-opacity="0.5" />
      <stop offset="100%" stop-color="#10B981" stop-opacity="0.8" />
    </linearGradient>
    <linearGradient id="pillGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1E293B" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#0F172A" stop-opacity="0.9" />
    </linearGradient>
    <filter id="glow" x="-10" y="-10" width="520" height="210" filterUnits="userSpaceOnUse">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background Card with rounded corners and border -->
  <rect x="1.5" y="1.5" width="497" height="187" rx="20" fill="url(#bgGrad)" stroke="url(#cyanBorder)" stroke-width="2" />

  <!-- Top Header / Verified Shield -->
  <g transform="translate(24, 20)">
    <!-- Verified Shield Icon -->
    <path d="M9 2L2 5V10C2 14.5 5 18.5 9 19.8C13 18.5 16 14.5 16 10V5L9 2Z" fill="#06B6D4" fill-opacity="0.15" stroke="#06B6D4" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M6 10.5L8 12.5L12 8.5" stroke="#06B6D4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    
    <text x="24" y="14" fill="#06B6D4" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" letter-spacing="1">VERIFIED CAMPUS ENGINEER</text>
    <text x="360" y="14" fill="#64748B" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="600">IST BENGALURU</text>
  </g>

  <!-- Divider -->
  <line x1="24" y1="44" x2="476" y2="44" stroke="#1E293B" stroke-width="1" />

  <!-- Student Identity Row -->
  <g transform="translate(24, 58)">
    <!-- Avatar Circle with Neon Ring -->
    <circle cx="24" cy="24" r="23" fill="#0F172A" stroke="#06B6D4" stroke-width="2" />
    <circle cx="24" cy="24" r="20" fill="#1E293B" />
    <text x="24" y="30" text-anchor="middle" fill="#E2E8F0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800">${cleanName.charAt(0)}</text>

    <!-- Student Name & Department -->
    <text x="60" y="18" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="800">${cleanName}</text>
    <text x="60" y="36" fill="#94A3B8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="500">@${cleanUsername} • ${cleanDept}</text>
  </g>

  <!-- 3 Proof of Work Metric Stat Cards -->
  <g transform="translate(24, 118)">
    <!-- 1. Quality Merges -->
    <rect x="0" y="0" width="144" height="48" rx="10" fill="url(#pillGrad)" stroke="#F59E0B" stroke-opacity="0.3" stroke-width="1" />
    <text x="14" y="24" fill="#F59E0B" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800">${payload.qualityPrs}</text>
    <text x="14" y="38" fill="#94A3B8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="9" font-weight="700" letter-spacing="0.5">QUALITY MERGES</text>
    <circle cx="126" cy="18" r="4" fill="#F59E0B" fill-opacity="0.5"/>

    <!-- 2. Campus Merges -->
    <rect x="154" y="0" width="144" height="48" rx="10" fill="url(#pillGrad)" stroke="#06B6D4" stroke-opacity="0.3" stroke-width="1" />
    <text x="168" y="24" fill="#06B6D4" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800">${payload.campusMerges}</text>
    <text x="168" y="38" fill="#94A3B8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="9" font-weight="700" letter-spacing="0.5">CAMPUS MERGES</text>
    <circle cx="280" cy="18" r="4" fill="#06B6D4" fill-opacity="0.5"/>

    <!-- 3. Total Merged PRs -->
    <rect x="308" y="0" width="144" height="48" rx="10" fill="url(#pillGrad)" stroke="#10B981" stroke-opacity="0.3" stroke-width="1" />
    <text x="322" y="24" fill="#10B981" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800">${payload.totalPrs}</text>
    <text x="322" y="38" fill="#94A3B8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="9" font-weight="700" letter-spacing="0.5">TOTAL MERGED</text>
    <circle cx="434" cy="18" r="4" fill="#10B981" fill-opacity="0.5"/>
  </g>

  <!-- Watermark / Authenticity Hash -->
  <text x="476" y="178" text-anchor="end" fill="#475569" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="8">zenithenopen.ist/verify</text>
</svg>`;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { username } = await params;
    const cleanUsername = decodeURIComponent(username || "").trim().toLowerCase();

    if (!cleanUsername) {
      return NextResponse.json(
        { success: false, error: "Username parameter is required" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format")?.toLowerCase() || "svg";

    // 1. Resolve student data
    let studentData: any = STUDENT_COMPETITORS.find(
      (s) => s.username.toLowerCase() === cleanUsername
    );

    if (!studentData) {
      try {
        const dbUser = await prisma.user.findFirst({
          where: {
            OR: [
              { githubAccount: { username: { equals: cleanUsername, mode: "insensitive" } } },
              { id: cleanUsername },
            ],
          },
          include: {
            githubAccount: true,
            contributions: {
              where: { status: ContributionStatus.MERGED },
              include: { project: true },
            },
          },
        });

        if (dbUser) {
          const qualityCount = dbUser.contributions.filter((c) => c.isQualityPr).length;
          const campusCount = dbUser.contributions.filter(
            (c) => c.project?.repositoryUrl?.toLowerCase().includes("ist-zenithenlab")
          ).length;

          studentData = {
            username: dbUser.githubAccount?.username || cleanUsername,
            name: dbUser.name || cleanUsername,
            department: dbUser.department || "Computer Science & Engineering",
            year: dbUser.yearOfStudy || "3rd Year",
            overall: {
              qualityPrs: qualityCount,
              mergedPrs: dbUser.contributions.length,
              prs: dbUser.contributions.length,
            },
            campusMerges: campusCount,
          };
        }
      } catch (dbErr) {
        console.warn("[Badge Route] DB notice:", dbErr);
      }
    }

    // Baseline fallback if not found in mock or DB
    if (!studentData) {
      studentData = {
        username: cleanUsername,
        name: cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1),
        department: "Computer Science & Engineering",
        year: "3rd Year",
        overall: {
          qualityPrs: 0,
          mergedPrs: 0,
          prs: 0,
        },
        campusMerges: 0,
      };
    }

    const qualityPrs = studentData.overall?.qualityPrs ?? 0;
    const totalPrs = studentData.overall?.mergedPrs ?? studentData.overall?.prs ?? 0;
    const campusMerges = studentData.campusMerges ?? Math.min(qualityPrs, totalPrs);
    const name = studentData.name;
    const department = studentData.department;
    const year = studentData.year || "3rd Year";

    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const origin = `${protocol}://${host}`;
    const verificationUrl = `${origin}/resume?username=${encodeURIComponent(cleanUsername)}`;
    const badgeImageUrl = `${origin}/api/resume/badge/${encodeURIComponent(cleanUsername)}`;

    if (format === "json") {
      const payload: BadgeCardPayload = {
        username: cleanUsername,
        name,
        department,
        year,
        qualityPrs,
        campusMerges,
        totalPrs,
        badgeLevel: qualityPrs >= 5 ? "Distinguished Campus Engineer" : "Verified Campus Contributor",
        verifiedAt: new Date().toISOString(),
        verificationUrl,
        embedCodes: {
          markdown: `[![ZenithenOpen Proof of Work](${badgeImageUrl})](${verificationUrl})`,
          html: `<a href="${verificationUrl}" target="_blank" rel="noopener noreferrer"><img src="${badgeImageUrl}" alt="Verified Open-Source Engineer - ZenithenOpen IST" /></a>`,
          shareUrl: verificationUrl,
          linkedInShareUrl: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verificationUrl)}`,
        },
      };

      return NextResponse.json(
        {
          success: true,
          badge: payload,
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
          },
        }
      );
    }

    // Default: Return Dynamic SVG image
    const svg = generateSvgBadge({
      username: cleanUsername,
      name,
      department,
      qualityPrs,
      campusMerges,
      totalPrs,
      verificationUrl,
    });

    return new NextResponse(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
      },
    });
  } catch (error: any) {
    console.error("[GET /api/resume/badge/[username]] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate proof-of-work badge card",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
