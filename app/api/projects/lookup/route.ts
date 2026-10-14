/**
 * GitHub Repository Metadata Auto-Sync API Route
 * Location: app/api/projects/lookup/route.ts
 *
 * Automatically inspects and fetches GitHub repository metadata (name, description,
 * stars, forks, language, topics) to power auto-fill when registering campus repositories.
 */

import { NextRequest, NextResponse } from "next/server";
import { getGitHubHeaders } from "@/lib/github/sync";
import { getCached, setCached } from "@/lib/redis/client";
import { MOCK_PROJECTS } from "@/lib/data/mock-data";

export interface RepoLookupMetadata {
  name: string;
  fullName: string;
  owner: string;
  description: string;
  tagline: string;
  starsCount: number;
  forksCount: number;
  primaryLanguage: string;
  topics: string[];
  defaultBranch: string;
  repositoryUrl: string;
  homepage?: string | null;
  openIssuesCount: number;
  isCampusRepo: boolean;
}

/**
 * Extracts owner and repo from various GitHub URL formats:
 * - https://github.com/owner/repo
 * - http://github.com/owner/repo.git
 * - github.com/owner/repo
 * - owner/repo
 */
export function parseGitHubRepo(input: string): { owner: string; repo: string } | null {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim().replace(/\/+$/, "");

  const urlPattern = /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+?)(?:\.git|\/|$)/i;
  const match = trimmed.match(urlPattern);
  if (match) {
    return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
  }

  // Handle owner/repo direct notation
  const slashParts = trimmed.split("/");
  if (slashParts.length === 2 && !trimmed.includes(" ") && !trimmed.includes("http")) {
    const [owner, repo] = slashParts;
    if (owner && repo) {
      return { owner, repo: repo.replace(/\.git$/, "") };
    }
  }

  return null;
}

/**
 * Normalizes language name to catalog options
 */
function normalizeLanguage(lang: string | null | undefined): string {
  if (!lang) return "TypeScript";
  const lower = lang.toLowerCase();
  if (lower.includes("typescript")) return "TypeScript";
  if (lower.includes("javascript")) return "JavaScript";
  if (lower.includes("python")) return "Python";
  if (lower.includes("go")) return "Go";
  if (lower.includes("rust")) return "Rust";
  if (lower.includes("c++")) return "C++";
  if (lower.includes("c#")) return "C#";
  if (lower === "c") return "C";
  return lang;
}

/**
 * GET /api/projects/lookup?repo=... or ?url=...
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const repoParam = searchParams.get("repo") || searchParams.get("url") || "";

    if (!repoParam.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Query parameter 'repo' or 'url' is required (e.g. 'IST-ZenithenLab/ZenithenOpen' or 'https://github.com/IST-ZenithenLab/ZenithenOpen').",
        },
        { status: 400 }
      );
    }

    const parsed = parseGitHubRepo(repoParam);
    if (!parsed) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid GitHub repository format. Expected 'owner/repo' or 'https://github.com/owner/repo'.",
        },
        { status: 400 }
      );
    }

    const { owner, repo } = parsed;
    const cleanRepoName = repo.toLowerCase();
    const cleanOwner = owner.toLowerCase();
    const cacheKey = `github:lookup:${cleanOwner}:${cleanRepoName}`;

    // 1. Check Redis Cache
    const cached = await getCached<RepoLookupMetadata>(cacheKey);
    if (cached) {
      return NextResponse.json(
        {
          success: true,
          cached: true,
          metadata: cached,
        },
        {
          status: 200,
          headers: {
            "X-Cache": "HIT",
            "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
          },
        }
      );
    }

    // 2. Fetch from GitHub REST API
    const isCampusRepo = cleanOwner === "ist-zenithenlab" || cleanOwner === "zenithen";
    let metadata: RepoLookupMetadata | null = null;

    try {
      const ghRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: getGitHubHeaders(),
        next: { revalidate: 3600 },
      });

      if (ghRes.ok) {
        const data = await ghRes.json();
        metadata = {
          name: data.name || repo,
          fullName: data.full_name || `${owner}/${repo}`,
          owner: data.owner?.login || owner,
          description: data.description || "",
          tagline: data.description || `Open-source ${data.language || "software"} project by ${owner}`,
          starsCount: Number(data.stargazers_count || 0),
          forksCount: Number(data.forks_count || 0),
          primaryLanguage: normalizeLanguage(data.language),
          topics: Array.isArray(data.topics) ? data.topics : [],
          defaultBranch: data.default_branch || "main",
          repositoryUrl: data.html_url || `https://github.com/${owner}/${repo}`,
          homepage: data.homepage || null,
          openIssuesCount: Number(data.open_issues_count || 0),
          isCampusRepo,
        };
      }
    } catch (apiErr) {
      console.warn(`[Projects Lookup] GitHub API error for ${owner}/${repo}:`, apiErr);
    }

    // 3. Fallback: Check MOCK_PROJECTS for campus repositories if GitHub API is unreachable or rate limited
    if (!metadata) {
      const matchInMock = MOCK_PROJECTS.find(
        (p: any) =>
          p.repositoryUrl.toLowerCase().includes(`${cleanOwner}/${cleanRepoName}`) ||
          p.slug.toLowerCase() === cleanRepoName ||
          p.name.toLowerCase() === cleanRepoName
      );

      if (matchInMock) {
        metadata = {
          name: matchInMock.name,
          fullName: `${owner}/${repo}`,
          owner,
          description: matchInMock.description,
          tagline: matchInMock.tagline,
          starsCount: matchInMock.stars ?? (matchInMock as any).starsCount ?? 0,
          forksCount: matchInMock.forks ?? (matchInMock as any).forksCount ?? 0,
          primaryLanguage: matchInMock.primaryLanguage,
          topics: matchInMock.tags,
          defaultBranch: "main",
          repositoryUrl: matchInMock.repositoryUrl,
          homepage: matchInMock.demoUrl || null,
          openIssuesCount: 0,
          isCampusRepo: true,
        };
      } else {
        // Fallback for general valid repository structure
        metadata = {
          name: repo.charAt(0).toUpperCase() + repo.slice(1),
          fullName: `${owner}/${repo}`,
          owner,
          description: `Campus open-source repository for ${repo}`,
          tagline: `Collaborative repository by ${owner}`,
          starsCount: 0,
          forksCount: 0,
          primaryLanguage: "TypeScript",
          topics: ["campus", "open-source"],
          defaultBranch: "main",
          repositoryUrl: `https://github.com/${owner}/${repo}`,
          homepage: null,
          openIssuesCount: 0,
          isCampusRepo,
        };
      }
    }

    // Save to cache (1 hour)
    await setCached(cacheKey, metadata, 3600);

    return NextResponse.json(
      {
        success: true,
        cached: false,
        metadata,
      },
      {
        status: 200,
        headers: {
          "X-Cache": "MISS",
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      }
    );
  } catch (error: any) {
    console.error("[GET /api/projects/lookup] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch repository metadata",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects/lookup
 * Accepts JSON: { repositoryUrl: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const repositoryUrl = body?.repositoryUrl || body?.repo || "";
    const fakeUrl = new URL(
      `http://localhost:3000/api/projects/lookup?repo=${encodeURIComponent(repositoryUrl)}`
    );
    const getReq = new NextRequest(fakeUrl);
    return GET(getReq);
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid request payload",
        details: err?.message || String(err),
      },
      { status: 400 }
    );
  }
}
