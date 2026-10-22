/**
 * GitHub API & Real Contribution Synchronization Service
 * Location: lib/github/sync.ts
 * 
 * Synchronizes real GitHub profiles, Open PRs, Merged PRs, Closed PRs,
 * and Quality PR tracking with Supabase PostgreSQL and Upstash Redis.
 */

import { prisma } from "../db/prisma";
import { getCached, setCached, deleteCached } from "../redis/client";
import { ContributionStatus, ContributionType } from "@prisma/client";

export interface GitHubUserProfile {
  id: string;
  username: string;
  avatarUrl: string;
  profileUrl: string;
  publicRepos: number;
  followers: number;
}

export interface GitHubPullRequestItem {
  id: string;
  title: string;
  url: string;
  prNumber: number;
  repoName: string;
  status: ContributionStatus;
  isQualityPr: boolean;
  linesAdded?: number;
  linesRemoved?: number;
  mergedAt?: string | null;
  closedAt?: string | null;
  createdAt: string;
}

export interface SyncResult {
  success: boolean;
  githubUsername: string;
  totalPrs: number;
  openPrs: number;
  mergedPrs: number;
  closedPrs: number;
  qualityPrs: number;
  codeReviews?: number;
  commitsCount?: number;
  points?: number;
  error?: string;
}

export interface RepoStats {
  stars: number;
  forks: number;
}

/**
 * Common headers for authenticating GitHub REST API requests
 */
export function getGitHubHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "ZenithenOpen-Platform-IST",
  };

  const token = process.env.GITHUB_TOKEN?.trim();
  if (token && token !== "") {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Fetch GitHub repository stars and forks with Redis caching.
 * Resolves to the upstream parent repository if the repository is a fork.
 */
export async function fetchRepositoryStats(repoFullName: string): Promise<RepoStats> {
  const cleanRepo = repoFullName.trim().toLowerCase();
  const cacheKey = `github:repo:${cleanRepo}`;
  const cached = await getCached<RepoStats>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`https://api.github.com/repos/${cleanRepo}`, {
      headers: getGitHubHeaders(),
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return { stars: 0, forks: 0 };
    }

    const data = await res.json();
    let stars = Number(data.stargazers_count || 0);
    let forks = Number(data.forks_count || 0);

    // Upstream Resolution: If repository is a fork, resolve to upstream parent repository
    if (data.fork && data.parent) {
      const parentStars = Number(data.parent.stargazers_count || 0);
      const parentForks = Number(data.parent.forks_count || 0);
      stars = Math.max(stars, parentStars);
      forks = Math.max(forks, parentForks);
    }

    const stats: RepoStats = { stars, forks };
    await setCached(cacheKey, stats, 3600);
    return stats;
  } catch (err) {
    console.warn(`[GitHub] Failed to fetch stats for ${cleanRepo}:`, err);
    return { stars: 0, forks: 0 };
  }
}

/**
 * Fetch GitHub user profile with Redis caching
 */
export async function fetchGitHubUser(
  username: string
): Promise<GitHubUserProfile | null> {
  const cleanUsername = username.trim().toLowerCase();
  const cacheKey = `github:user:${cleanUsername}`;

  // 1. Check Redis cache
  const cached = await getCached<GitHubUserProfile>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUsername)}`, {
      headers: getGitHubHeaders(),
      next: { revalidate: 600 },
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      console.warn(`[GitHub] API error ${res.status} fetching user: ${cleanUsername}`);
      return null;
    }

    const data = await res.json();
    const profile: GitHubUserProfile = {
      id: String(data.id),
      username: data.login,
      avatarUrl: data.avatar_url,
      profileUrl: data.html_url,
      publicRepos: Number(data.public_repos || 0),
      followers: Number(data.followers || 0),
    };

    // Cache in Redis for 10 minutes
    await setCached(cacheKey, profile, 600);
    return profile;
  } catch (error) {
    console.error(`[GitHub] Failed to fetch profile for ${cleanUsername}:`, error);
    return null;
  }
}

export interface GitHubItemSignal {
  labels?: Array<{ name: string }>;
  comments?: number;
  body?: string | null;
  state?: string;
  pull_request?: { merged_at?: string | null };
  repository_url?: string;
  html_url?: string;
  id?: number | string;
  number?: number;
  title?: string;
  created_at?: string;
  closed_at?: string | null;
}

/**
 * Determines whether a pull request meets Quality PR criteria:
 * Strict rule: Repository must have >= 100 stars AND >= 100 forks ONLY.
 * No special exemptions for campus repositories.
 */
export function evaluateQualityPr(
  _item: GitHubItemSignal,
  _repoName?: string,
  repoStats?: RepoStats
): boolean {
  if (repoStats && repoStats.stars >= 100 && repoStats.forks >= 100) {
    return true;
  }

  return false;
}

/**
 * Fetch real user pull requests from GitHub Search API.
 * Supports deep pagination up to GitHub's search cap (up to 1,000 PRs).
 */
export async function fetchUserPullRequests(
  username: string
): Promise<GitHubPullRequestItem[]> {
  const cleanUsername = username.trim().toLowerCase();
  const cacheKey = `github:prs:${cleanUsername}`;

  // 1. Check Redis cache
  const cached = await getCached<GitHubPullRequestItem[]>(cacheKey);
  if (cached) return cached;

  try {
    const allItems: GitHubItemSignal[] = [];
    let page = 1;
    const maxPages = 10; // GitHub Search API caps at 1,000 results (10 pages * 100)

    while (page <= maxPages) {
      const query = encodeURIComponent(`author:${cleanUsername} type:pr`);
      const res = await fetch(
        `https://api.github.com/search/issues?q=${query}&per_page=100&page=${page}&sort=created&order=desc`,
        {
          headers: getGitHubHeaders(),
          next: { revalidate: 300 },
        }
      );

      if (!res.ok) {
        if (page === 1) {
          console.warn(`[GitHub] API error ${res.status} searching PRs for: ${cleanUsername}`);
        }
        break;
      }

      const data = await res.json();
      const items: GitHubItemSignal[] = Array.isArray(data.items) ? data.items : [];
      if (items.length === 0) break;

      allItems.push(...items);

      if (items.length < 100 || allItems.length >= Number(data.total_count || 0)) {
        break;
      }

      page++;
    }

    // Collect all distinct repositories
    const distinctRepos = new Set<string>();
    for (const item of allItems) {
      let repoName = "unknown-repo";
      if (item.repository_url) {
        const parts = item.repository_url.split("/");
        repoName = parts.slice(-2).join("/");
      } else if (item.html_url) {
        const match = item.html_url.match(/github\.com\/([^/]+\/[^/]+)/);
        if (match) repoName = match[1];
      }
      if (repoName !== "unknown-repo") distinctRepos.add(repoName);
    }

    // Inspect repository stars & forks (resolves parent repository for forks)
    const repoStatsMap = new Map<string, RepoStats>();
    await Promise.all(
      Array.from(distinctRepos).map(async (repo) => {
        const stats = await fetchRepositoryStats(repo);
        repoStatsMap.set(repo.toLowerCase(), stats);
      })
    );

    const pullRequests: GitHubPullRequestItem[] = allItems.map((item: GitHubItemSignal) => {
      // Determine status: MERGED, CLOSED, or OPEN
      let status: ContributionStatus = ContributionStatus.OPEN;
      if (item.pull_request?.merged_at) {
        status = ContributionStatus.MERGED;
      } else if (item.state === "closed") {
        status = ContributionStatus.CLOSED;
      }

      // Extract repository name
      let repoName = "unknown-repo";
      if (item.repository_url) {
        const parts = item.repository_url.split("/");
        repoName = parts.slice(-2).join("/");
      } else if (item.html_url) {
        const match = item.html_url.match(/github\.com\/([^/]+\/[^/]+)/);
        if (match) repoName = match[1];
      }

      const stats = repoStatsMap.get(repoName.toLowerCase());
      const isQualityPr = evaluateQualityPr(item, repoName, stats);

      return {
        id: String(item.id),
        title: item.title || "Untitled PR",
        url: item.html_url || "",
        prNumber: Number(item.number),
        repoName,
        status,
        isQualityPr,
        mergedAt: item.pull_request?.merged_at || null,
        closedAt: item.closed_at || null,
        createdAt: item.created_at || new Date().toISOString(),
      };
    });

    // Cache in Redis for 5 minutes
    await setCached(cacheKey, pullRequests, 300);
    return pullRequests;
  } catch (error) {
    console.error(`[GitHub] Failed to search PRs for ${cleanUsername}:`, error);
    return [];
  }
}

export interface GitHubReviewItem {
  id: string;
  title: string;
  url: string;
  prNumber: number;
  repoName: string;
  createdAt: string;
}

/**
 * Fetch Code Reviews performed by the student on GitHub
 */
export async function fetchUserCodeReviews(
  username: string
): Promise<GitHubReviewItem[]> {
  const cleanUsername = username.trim().toLowerCase();
  const cacheKey = `github:reviews:${cleanUsername}`;
  const cached = await getCached<GitHubReviewItem[]>(cacheKey);
  if (cached) return cached;

  try {
    const query = encodeURIComponent(`reviewed-by:${cleanUsername} type:pr`);
    const res = await fetch(
      `https://api.github.com/search/issues?q=${query}&per_page=100&sort=created&order=desc`,
      {
        headers: getGitHubHeaders(),
        next: { revalidate: 600 },
      }
    );

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    const items: GitHubItemSignal[] = Array.isArray(data.items) ? data.items : [];

    const reviews: GitHubReviewItem[] = items.map((item) => {
      let repoName = "unknown-repo";
      if (item.repository_url) {
        const parts = item.repository_url.split("/");
        repoName = parts.slice(-2).join("/");
      } else if (item.html_url) {
        const match = item.html_url.match(/github\.com\/([^/]+\/[^/]+)/);
        if (match) repoName = match[1];
      }

      return {
        id: String(item.id),
        title: `Code Review: ${item.title || "Pull Request"}`,
        url: item.html_url || "",
        prNumber: Number(item.number),
        repoName,
        createdAt: item.created_at || new Date().toISOString(),
      };
    });

    await setCached(cacheKey, reviews, 600);
    return reviews;
  } catch (err) {
    console.warn(`[GitHub] Failed to search reviews for ${cleanUsername}:`, err);
    return [];
  }
}

export interface GitHubCommitItem {
  sha: string;
  message: string;
  url: string;
  repoName: string;
  committedAt: string;
}

/**
 * Fetch public commits authored by the student on GitHub
 */
export async function fetchUserCommits(
  username: string
): Promise<GitHubCommitItem[]> {
  const cleanUsername = username.trim().toLowerCase();
  const cacheKey = `github:commits:${cleanUsername}`;
  const cached = await getCached<GitHubCommitItem[]>(cacheKey);
  if (cached) return cached;

  try {
    const headers: Record<string, string> = {
      ...(getGitHubHeaders() as Record<string, string>),
      Accept: "application/vnd.github.cloak-preview+json",
    };

    const query = encodeURIComponent(`author:${cleanUsername}`);
    const res = await fetch(
      `https://api.github.com/search/commits?q=${query}&per_page=100&sort=author-date&order=desc`,
      {
        headers,
        next: { revalidate: 600 },
      }
    );

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    const items: Array<{
      sha?: string;
      html_url?: string;
      commit?: { message?: string; author?: { date?: string } };
      repository?: { full_name?: string };
    }> = Array.isArray(data.items) ? data.items : [];

    const commits: GitHubCommitItem[] = items.map((c) => ({
      sha: c.sha || "unknown",
      message: (c.commit?.message || "Commit").split("\n")[0].substring(0, 150),
      url: c.html_url || "",
      repoName: c.repository?.full_name || "unknown-repo",
      committedAt: c.commit?.author?.date || new Date().toISOString(),
    }));

    await setCached(cacheKey, commits, 600);
    return commits;
  } catch (err) {
    console.warn(`[GitHub] Failed to search commits for ${cleanUsername}:`, err);
    return [];
  }
}

/**
 * Calculate contribution activity score (legacy compatibility)
 */
export function calculateContributionPoints(prs: GitHubPullRequestItem[]): number {
  let points = 0;
  for (const pr of prs) {
    if (pr.status === ContributionStatus.MERGED) {
      points += 80;
      if (pr.isQualityPr) points += 50;
    } else if (pr.status === ContributionStatus.OPEN) {
      points += 20;
      if (pr.isQualityPr) points += 20;
    } else if (pr.status === ContributionStatus.CLOSED) {
      points += 5;
    }
  }
  return points;
}

/**
 * Synchronize GitHub profile, Pull Requests, Code Reviews & Commits into Supabase PostgreSQL
 */
export async function syncStudentGitHubData(
  userId: string,
  githubUsername: string
): Promise<SyncResult> {
  const cleanUsername = githubUsername.trim().toLowerCase();

  // Clear PR and review caches to ensure real-time fresh fetch
  await Promise.all([
    deleteCached(`github:prs:${cleanUsername}`),
    deleteCached(`github:reviews:${cleanUsername}`),
    deleteCached(`github:commits:${cleanUsername}`),
  ]);

  const profile = await fetchGitHubUser(cleanUsername);
  if (!profile) {
    return {
      success: false,
      githubUsername,
      totalPrs: 0,
      openPrs: 0,
      mergedPrs: 0,
      closedPrs: 0,
      qualityPrs: 0,
      codeReviews: 0,
      commitsCount: 0,
      error: `GitHub user "${cleanUsername}" not found`,
    };
  }

  // Fetch PRs, Code Reviews, and Commits in parallel
  const [prs, codeReviews, commits] = await Promise.all([
    fetchUserPullRequests(cleanUsername),
    fetchUserCodeReviews(cleanUsername),
    fetchUserCommits(cleanUsername),
  ]);

  const openPrs = prs.filter((p) => p.status === ContributionStatus.OPEN).length;
  const mergedPrs = prs.filter((p) => p.status === ContributionStatus.MERGED).length;
  const closedPrs = prs.filter((p) => p.status === ContributionStatus.CLOSED).length;
  const qualityPrs = prs.filter((p) => p.isQualityPr).length;
  const points = calculateContributionPoints(prs);
  const totalActivityCount = prs.length + codeReviews.length + commits.length;

  // Database persistence via Prisma
  try {
    // 1. Upsert GitHubAccount record
    await prisma.gitHubAccount.upsert({
      where: { userId },
      update: {
        githubId: profile.id,
        username: profile.username,
        avatarUrl: profile.avatarUrl,
        profileUrl: profile.profileUrl,
        publicRepos: profile.publicRepos,
        followers: profile.followers,
        prsMergedCount: mergedPrs,
        contributionsThisYear: totalActivityCount,
        lastSyncedAt: new Date(),
      },
      create: {
        userId,
        githubId: profile.id,
        username: profile.username,
        avatarUrl: profile.avatarUrl,
        profileUrl: profile.profileUrl,
        publicRepos: profile.publicRepos,
        followers: profile.followers,
        prsMergedCount: mergedPrs,
        contributionsThisYear: totalActivityCount,
        lastSyncedAt: new Date(),
      },
    });

    // 2. High-performance batch upsert of Contributions (PRs + Code Reviews + Commits)
    const existingContributions = await prisma.contribution.findMany({
      where: { userId },
      select: { id: true, url: true },
    });
    const existingMap = new Map<string, string>(
      existingContributions.map((c) => [c.url, c.id])
    );

    const toCreate: Array<{
      userId: string;
      title: string;
      url: string;
      prNumber: number | null;
      type: ContributionType;
      status: ContributionStatus;
      isQualityPr: boolean;
      mergedAt: Date | null;
      closedAt: Date | null;
      createdAt: Date;
    }> = [];

    const updatePromises: Promise<unknown>[] = [];

    // Ingest Pull Requests
    for (const pr of prs) {
      const existingId = existingMap.get(pr.url);
      if (existingId) {
        updatePromises.push(
          prisma.contribution.update({
            where: { id: existingId },
            data: {
              title: pr.title,
              status: pr.status,
              isQualityPr: pr.isQualityPr,
              mergedAt: pr.mergedAt ? new Date(pr.mergedAt) : null,
              closedAt: pr.closedAt ? new Date(pr.closedAt) : null,
            },
          })
        );
      } else {
        toCreate.push({
          userId,
          title: pr.title,
          url: pr.url,
          prNumber: pr.prNumber,
          type: ContributionType.PULL_REQUEST,
          status: pr.status,
          isQualityPr: pr.isQualityPr,
          mergedAt: pr.mergedAt ? new Date(pr.mergedAt) : null,
          closedAt: pr.closedAt ? new Date(pr.closedAt) : null,
          createdAt: new Date(pr.createdAt),
        });
      }
    }

    // Ingest Code Reviews
    for (const review of codeReviews) {
      if (!existingMap.has(review.url)) {
        toCreate.push({
          userId,
          title: review.title,
          url: review.url,
          prNumber: review.prNumber,
          type: ContributionType.CODE_REVIEW,
          status: ContributionStatus.MERGED,
          isQualityPr: false,
          mergedAt: new Date(review.createdAt),
          closedAt: null,
          createdAt: new Date(review.createdAt),
        });
      }
    }

    // Ingest Commits
    for (const commit of commits) {
      if (!existingMap.has(commit.url)) {
        toCreate.push({
          userId,
          title: commit.message,
          url: commit.url,
          prNumber: null,
          type: ContributionType.COMMIT,
          status: ContributionStatus.MERGED,
          isQualityPr: false,
          mergedAt: new Date(commit.committedAt),
          closedAt: null,
          createdAt: new Date(commit.committedAt),
        });
      }
    }

    if (toCreate.length > 0) {
      await prisma.contribution.createMany({
        data: toCreate,
        skipDuplicates: true,
      });
    }

    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
    }

    // 3. Automatically award First PR Shipped achievement if student has merged PRs
    if (mergedPrs > 0) {
      const achievement = await prisma.achievement.findFirst({
        where: {
          code: {
            in: ["first-pr-shipped", "FIRST_PR_SHIPPED", "first-pr-merged"],
          },
        },
      });

      if (achievement) {
        const alreadyAwarded = await prisma.userAchievement.findUnique({
          where: {
            userId_achievementId: {
              userId,
              achievementId: achievement.id,
            },
          },
        });

        if (!alreadyAwarded) {
          await prisma.userAchievement.create({
            data: {
              userId,
              achievementId: achievement.id,
            },
          });
        }
      }
    }

    // 4. Invalidate aggregate caches so metrics and leaderboards refresh immediately
    await Promise.all([
      deleteCached("metrics:community"),
      deleteCached("leaderboard:week"),
      deleteCached("leaderboard:month"),
      deleteCached("leaderboard:overall"),
    ]);
  } catch (dbError) {
    console.error("[Database] Error persisting GitHub sync:", dbError);
  }

  return {
    success: true,
    githubUsername: profile.username,
    totalPrs: prs.length,
    openPrs,
    mergedPrs,
    closedPrs,
    qualityPrs,
    codeReviews: codeReviews.length,
    commitsCount: commits.length,
    points,
  };
}
