/**
 * Backend Unit Tests: Core Data Contracts & State Integrity
 * Location: tests/backend/data-contracts.test.ts
 *
 * Verifies:
 * 1. Community metrics schema, non-negative bounds, and ISO timestamps
 * 2. Authentic member list integrity (ensures zero fabricated student profiles)
 * 3. Verified project definitions (ZenithenOpen, ZenithenLab) and repository links
 * 4. Open-source contributor opportunity definitions and difficulty tags
 * 5. Student competition leaderboard data contracts across week/month/overall timeframes
 */

import {
  COMMUNITY_METRICS,
  MOCK_MEMBERS,
  MOCK_PROJECTS,
  MOCK_OPPORTUNITIES,
} from "../../lib/data/mock-data";
import { STUDENT_COMPETITORS } from "../../lib/data/student-competition";
import { TestSuite, SuiteResult } from "./test-utils";

export async function runDataContractsTests(): Promise<SuiteResult> {
  const suite = new TestSuite("Data Contracts & State Integrity");
  suite.start();

  // --- 1. Community Metrics Contract ---
  const numericMetricKeys: (keyof typeof COMMUNITY_METRICS)[] = [
    "totalMembers",
    "totalContributors",
    "qualityPrsMerged",
    "prsMerged",
    "activeRepositories",
    "openSourceProjects",
    "firstPrsMerged",
    "contributionsThisMonth",
    "codeReviewsCount",
  ];

  for (const key of numericMetricKeys) {
    const val = COMMUNITY_METRICS[key];
    suite.assert(
      typeof val === "number" && !isNaN(val) && val >= 0,
      `COMMUNITY_METRICS.${key} is a valid non-negative integer (${val})`
    );
  }

  suite.assert(
    !isNaN(Date.parse(COMMUNITY_METRICS.lastUpdated)),
    "COMMUNITY_METRICS.lastUpdated parses as a valid ISO timestamp"
  );

  // --- 2. Authentic Member Policy ---
  suite.assertEqual(
    MOCK_MEMBERS.length,
    0,
    "MOCK_MEMBERS adheres to zero-fake-profiles rule (starts empty for genuine student links)"
  );

  // --- 3. Projects Catalog Integrity ---
  suite.assert(MOCK_PROJECTS.length >= 2, "MOCK_PROJECTS contains at least 2 official projects");
  
  const zenithenOpen = MOCK_PROJECTS.find((p) => p.slug === "zenithen-open");
  suite.assert(Boolean(zenithenOpen), "Project 'zenithen-open' exists in catalog");
  suite.assertEqual(zenithenOpen?.name, "ZenithenOpen", "ZenithenOpen has correct name");
  suite.assert(
    Boolean(zenithenOpen?.repositoryUrl.startsWith("https://github.com/IST-ZenithenLab/ZenithenOpen")),
    "ZenithenOpen points to authentic IST-ZenithenLab GitHub repository"
  );

  const zenithenLab = MOCK_PROJECTS.find((p) => p.slug === "zenithen-lab");
  suite.assert(Boolean(zenithenLab), "Project 'zenithen-lab' exists in catalog");
  suite.assertEqual(zenithenLab?.primaryLanguage, "C++", "ZenithenLab primary language is C++");

  for (const proj of MOCK_PROJECTS) {
    suite.assert(
      proj.stars >= 0 && proj.forks >= 0 && proj.openIssuesCount >= 0,
      `Project '${proj.slug}' has non-negative star/fork/issue metrics`
    );
    suite.assert(
      Array.isArray(proj.maintainers) && proj.maintainers.length > 0,
      `Project '${proj.slug}' has defined maintainers`
    );
  }

  // --- 4. Opportunities Catalog ---
  suite.assert(MOCK_OPPORTUNITIES.length > 0, "MOCK_OPPORTUNITIES contains open starter tasks");
  for (const opp of MOCK_OPPORTUNITIES) {
    suite.assert(
      Boolean(opp.id && opp.title && opp.repository && opp.repoFullName),
      `Opportunity '${opp.id}' defines required title and repository bindings`
    );
    suite.assert(
      typeof opp.issueNumber === "number" && opp.issueNumber > 0,
      `Opportunity '${opp.id}' references a positive issue number (#${opp.issueNumber})`
    );
  }

  // --- 5. Student Competitors Data Contract ---
  suite.assert(STUDENT_COMPETITORS.length > 0, "STUDENT_COMPETITORS contains competitor profiles");

  for (const student of STUDENT_COMPETITORS) {
    suite.assert(
      Boolean(student.id && student.name && student.username && student.department),
      `Competitor '${student.username}' has complete profile information`
    );

    // Validate week, month, and overall timeframe metrics
    for (const tf of ["week", "month", "overall"] as const) {
      const stats = student[tf];
      suite.assert(
        stats.rank >= 1 && stats.points >= 0 && stats.prs >= 0,
        `Competitor '${student.username}' ${tf} stats are valid (Rank: ${stats.rank}, Pts: ${stats.points})`
      );
      suite.assert(
        stats.qualityPrs <= stats.prs,
        `Competitor '${student.username}' ${tf} qualityPrs (${stats.qualityPrs}) <= totalPrs (${stats.prs})`
      );
      suite.assert(
        Boolean(stats.topContribution.title && stats.topContribution.prUrl),
        `Competitor '${student.username}' ${tf} topContribution has title and PR URL`
      );
    }
  }

  return suite.summary();
}

if (process.argv[1]?.endsWith("data-contracts.test.ts")) {
  runDataContractsTests().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
