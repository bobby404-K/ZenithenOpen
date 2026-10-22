/**
 * GitHub API & Contribution Sync Test Suite
 * Location: tests/backend/github-sync.test.ts
 */

import { TestSuite, SuiteResult } from "./test-utils";
import {
  getGitHubHeaders,
  evaluateQualityPr,
  calculateContributionPoints,
  GitHubPullRequestItem,
  fetchGitHubUser,
  fetchUserCodeReviews,
  fetchUserCommits,
} from "../../lib/github/sync";
import { ContributionStatus } from "@prisma/client";

export async function runGitHubSyncTests(): Promise<SuiteResult> {
  const suite = new TestSuite("GitHub Sync Service & Quality PR Tracking");
  suite.start();

  // --- 1. Header Authentication Contract ---
  const headers = getGitHubHeaders() as Record<string, string>;
  suite.assertEqual(
    headers["Accept"],
    "application/vnd.github.v3+json",
    "Headers contain required GitHub API Accept format"
  );
  suite.assert(
    typeof headers["User-Agent"] === "string" && headers["User-Agent"].length > 0,
    "Headers contain required User-Agent string"
  );

  if (process.env.GITHUB_TOKEN) {
    suite.assert(
      headers["Authorization"]?.startsWith("Bearer ") ?? false,
      "Headers inject Bearer Authorization when GITHUB_TOKEN is present"
    );
  }

  // --- 2. Quality PR Evaluation Logic (Strict >= 100 stars AND >= 100 forks ONLY) ---
  const qualityByStats = evaluateQualityPr(
    { labels: [], comments: 0, body: "test" },
    "facebook/react",
    { stars: 220000, forks: 45000 }
  );
  suite.assertEqual(qualityByStats, true, "PR in repository with >= 100 stars and >= 100 forks qualifies as Quality PR");

  const campusUnderThreshold = evaluateQualityPr(
    { labels: [{ name: "enhancement" }], comments: 5, body: "campus work" },
    "IST-ZenithenLab/ZenithenOpen",
    { stars: 2, forks: 1 }
  );
  suite.assertEqual(
    campusUnderThreshold,
    false,
    "Campus repository without 100 stars and 100 forks does NOT qualify as Quality PR"
  );

  const highStarsLowForks = evaluateQualityPr(
    { labels: [], comments: 0, body: "test" },
    "org/repo",
    { stars: 500, forks: 20 }
  );
  suite.assertEqual(highStarsLowForks, false, "PR in repository with < 100 forks does not qualify");

  const lowStarsHighForks = evaluateQualityPr(
    { labels: [], comments: 0, body: "test" },
    "org/repo",
    { stars: 40, forks: 250 }
  );
  suite.assertEqual(lowStarsHighForks, false, "PR in repository with < 100 stars does not qualify");

  const nonQualityPr = evaluateQualityPr(
    { labels: [{ name: "typo" }], comments: 0, body: "fixed spelling" },
    "small-project",
    { stars: 10, forks: 2 }
  );
  suite.assertEqual(nonQualityPr, false, "PR below 100 stars and 100 forks is not marked as Quality PR");

  const exactThresholdBoundary = evaluateQualityPr(
    { labels: [], comments: 0, body: "test" },
    "org/repo",
    { stars: 100, forks: 100 }
  );
  suite.assertEqual(exactThresholdBoundary, true, "Repository with exactly 100 stars and 100 forks qualifies as Quality PR");

  const underStarsBoundary = evaluateQualityPr(
    { labels: [], comments: 0, body: "test" },
    "org/repo",
    { stars: 99, forks: 100 }
  );
  suite.assertEqual(underStarsBoundary, false, "Repository with 99 stars and 100 forks fails Quality PR");

  const underForksBoundary = evaluateQualityPr(
    { labels: [], comments: 0, body: "test" },
    "org/repo",
    { stars: 100, forks: 99 }
  );
  suite.assertEqual(underForksBoundary, false, "Repository with 100 stars and 99 forks fails Quality PR");

  // --- 3. Contribution Points Calculation Formula ---
  const mockPrs: GitHubPullRequestItem[] = [
    {
      id: "1",
      title: "Feature A",
      url: "https://github.com/IST-ZenithenLab/ZenithenOpen/pull/1",
      prNumber: 1,
      repoName: "IST-ZenithenLab/ZenithenOpen",
      status: ContributionStatus.MERGED,
      isQualityPr: true, // 80 + 50 = 130
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      title: "Bugfix B",
      url: "https://github.com/IST-ZenithenLab/ZenithenOpen/pull/2",
      prNumber: 2,
      repoName: "IST-ZenithenLab/ZenithenOpen",
      status: ContributionStatus.MERGED,
      isQualityPr: false, // 80
      createdAt: new Date().toISOString(),
    },
    {
      id: "3",
      title: "WIP C",
      url: "https://github.com/IST-ZenithenLab/ZenithenOpen/pull/3",
      prNumber: 3,
      repoName: "IST-ZenithenLab/ZenithenOpen",
      status: ContributionStatus.OPEN,
      isQualityPr: true, // 20 + 20 = 40
      createdAt: new Date().toISOString(),
    },
    {
      id: "4",
      title: "Closed Experiment D",
      url: "https://github.com/IST-ZenithenLab/ZenithenOpen/pull/4",
      prNumber: 4,
      repoName: "IST-ZenithenLab/ZenithenOpen",
      status: ContributionStatus.CLOSED,
      isQualityPr: false, // 5
      createdAt: new Date().toISOString(),
    },
  ];

  // Expected points: 130 + 80 + 40 + 5 = 255
  const points = calculateContributionPoints(mockPrs);
  suite.assertEqual(
    points,
    255,
    "calculateContributionPoints correctly awards 255 pts across Merged, Quality, Open, and Closed PRs"
  );

  // --- 4. Live / Mock Fetch Safe Error Handling ---
  const notFound = await fetchGitHubUser("definitely-non-existent-user-xyz-998877");
  suite.assertEqual(
    notFound,
    null,
    "fetchGitHubUser safely returns null for non-existent user without throwing"
  );

  // --- 5. Code Reviews and Commits Ingestion Functions ---
  suite.assertEqual(
    typeof fetchUserCodeReviews,
    "function",
    "fetchUserCodeReviews is defined as an async ingestion function"
  );
  suite.assertEqual(
    typeof fetchUserCommits,
    "function",
    "fetchUserCommits is defined as an async ingestion function"
  );

  return suite.summary();
}

if (process.argv[1]?.endsWith("github-sync.test.ts")) {
  runGitHubSyncTests().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
