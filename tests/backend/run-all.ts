/**
 * Master Backend Test Runner
 * Location: tests/backend/run-all.ts
 *
 * Runs all backend test suites across:
 * 1. API Route Handlers (app/api/auth/verify-usn, app/api/metrics)
 * 2. Auth & Student USN Verification Service (lib/auth/usn-verification.ts)
 * 3. Database Abstraction Layer (lib/db/index.ts)
 * 4. Prisma Schema & Relational Models (prisma/schema.prisma)
 * 5. Data Contracts & State Integrity (lib/data/mock-data.ts, student-competition.ts)
 */

// Load local environment for tests if available
if (typeof (process as any).loadEnvFile === "function") {
  try {
    (process as any).loadEnvFile(".env");
  } catch {
    // Ignore if file doesn't exist in CI
  }
}

import { runAuthVerificationTests } from "./auth-verification.test";
import { runApiRoutesTests } from "./api-routes.test";
import { runDbLayerTests } from "./db-layer.test";
import { runPrismaSchemaTests } from "./prisma-schema.test";
import { runDataContractsTests } from "./data-contracts.test";
import { runRedisCacheTests } from "./redis-cache.test";
import { runGitHubSyncTests } from "./github-sync.test";
import { runLeaderboardRouteTests } from "./leaderboard-route.test";
import { runContributionsRouteTests } from "./contributions-route.test";
import { runMembersRouteTests } from "./members-route.test";
import { runProjectsRouteTests } from "./projects-route.test";
import { runOpportunitiesRouteTests } from "./opportunities-route.test";
import { runAchievementsRouteTests } from "./achievements-route.test";
import { runHealthRouteTests } from "./health-route.test";
import { runGitHubWebhookTests } from "./github-webhook.test";
import { runMemberProfileTests } from "./member-profile.test";
import { runProjectSlugTests } from "./project-slug.test";
import { runGitHubSyncRouteTests } from "./github-sync-route.test";
import { runDbSeedTests } from "./db-seed.test";
import { runDeploymentConfigTests } from "./deployment-config.test";
import { runLearningPathsRouteTests } from "./learning-paths-route.test";
import { runShowcasePagesTests } from "./showcase-pages.test";
import { runCampusProjectsLeaderboardTests } from "./campus-projects-leaderboard.test";
import { runStudentPreviewModalTests } from "./student-preview-modal.test";
import { runProjectsLookupTests } from "./projects-lookup.test";
import { runInteractivePrGuideTests } from "./resources-interactive-guide.test";
import { runCommandSearchTests } from "./command-search.test";
import { runEventsHubTests } from "./events-hub.test";
import { runCommunitySwagTests } from "./community-swag.test";
import { runActivityPulseTests } from "./activity-pulse.test";
import { runResourcesArticlesTests } from "./resources-articles.test";
import { runNotificationsServiceTests } from "./notifications-service.test";
import { runOAuthLoginTests } from "./oauth-login.test";
import { SuiteResult } from "./test-utils";

async function main() {
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║         ZENITHENOPEN BACKEND TEST SUITE RUNNER            ║");
  console.log("║         IST Bengaluru - Open Source Architecture           ║");
  console.log("╚════════════════════════════════════════════════════════════╝");

  const startTime = Date.now();
  const results: SuiteResult[] = [];

  try {
    results.push(await runAuthVerificationTests());
    results.push(await runApiRoutesTests());
    results.push(await runDbLayerTests());
    results.push(await runPrismaSchemaTests());
    results.push(await runDataContractsTests());
    results.push(await runRedisCacheTests());
    results.push(await runGitHubSyncTests());
    results.push(await runLeaderboardRouteTests());
    results.push(await runContributionsRouteTests());
    results.push(await runMembersRouteTests());
    results.push(await runProjectsRouteTests());
    results.push(await runProjectSlugTests());
    results.push(await runOpportunitiesRouteTests());
    results.push(await runAchievementsRouteTests());
    results.push(await runHealthRouteTests());
    results.push(await runGitHubWebhookTests());
    results.push(await runMemberProfileTests());
    results.push(await runGitHubSyncRouteTests());
    results.push(await runDbSeedTests());
    results.push(await runDeploymentConfigTests());
    results.push(await runLearningPathsRouteTests());
    results.push(await runShowcasePagesTests());
    results.push(await runCampusProjectsLeaderboardTests());
    results.push(await runStudentPreviewModalTests());
    results.push(await runProjectsLookupTests());
    results.push(await runInteractivePrGuideTests());
    results.push(await runCommandSearchTests());
    results.push(await runEventsHubTests());
    results.push(await runCommunitySwagTests());
    results.push(await runActivityPulseTests());
    results.push(await runResourcesArticlesTests());
    results.push(await runNotificationsServiceTests());
    results.push(await runOAuthLoginTests());
  } catch (error) {
    console.error("\n[FATAL ERROR IN TEST RUNNER]:", error);
    process.exit(1);
  }

  const durationMs = Date.now() - startTime;
  let totalPassed = 0;
  let totalFailed = 0;

  console.log("\n============================================================");
  console.log("                BACKEND TEST EXECUTION SUMMARY               ");
  console.log("============================================================");
  console.log("Suite Name                                 Passed   Failed");
  console.log("------------------------------------------------------------");

  for (const res of results) {
    totalPassed += res.passed;
    totalFailed += res.failed;
    const namePadded = res.name.padEnd(42, " ");
    const passedPadded = String(res.passed).padStart(6, " ");
    const failedPadded = String(res.failed).padStart(8, " ");
    console.log(`${namePadded}${passedPadded}${failedPadded}`);
  }

  console.log("------------------------------------------------------------");
  console.log(
    `TOTAL: ${totalPassed + totalFailed} tests executed in ${(durationMs / 1000).toFixed(2)}s | Passed: ${totalPassed} | Failed: ${totalFailed}`
  );
  console.log("============================================================\n");

  if (totalFailed > 0) {
    console.error("❌ Some backend tests failed.");
    process.exit(1);
  } else {
    console.log("✅ ALL BACKEND TEST SUITES PASSED SUCCESSFULLY!\n");
    process.exit(0);
  }
}

main();
