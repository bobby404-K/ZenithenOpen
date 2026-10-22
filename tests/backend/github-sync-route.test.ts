/**
 * GitHub Organization Synchronization Route Test Suite
 * Location: tests/backend/github-sync-route.test.ts
 */

import { TestSuite, SuiteResult } from "./test-utils";
import { GET, POST } from "../../app/api/github/sync/route";
import { NextRequest } from "next/server";

export async function runGitHubSyncRouteTests(): Promise<SuiteResult> {
  const suite = new TestSuite("GitHub Organization Sync Controller (/api/github/sync)");
  suite.start();

  // --- 1. GET Sync Status & Telemetry ---
  const getReq = new NextRequest("http://localhost:3000/api/github/sync");
  const getRes = await GET(getReq);
  suite.assertEqual(getRes.status, 200, "GET /api/github/sync returns 200 OK");
  const getData = await getRes.json();
  suite.assertEqual(getData.success, true, "Response reports success: true");
  suite.assertEqual(getData.status, "operational", "Sync engine status is operational");
  suite.assert(Array.isArray(getData.availableScopes), "Includes availableScopes array");
  suite.assert(getData.availableScopes.includes("all"), "Available scopes includes 'all'");
  suite.assert(getData.availableScopes.includes("members"), "Available scopes includes 'members'");
  suite.assert(getData.availableScopes.includes("projects"), "Available scopes includes 'projects'");
  suite.assert(getData.recentStats && typeof getData.recentStats.syncedAt === "string", "Includes recentStats telemetry");

  // --- 2. POST Validation Failure (Invalid Scope) ---
  const invalidReq = new NextRequest("http://localhost:3000/api/github/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      scope: "invalid-scope-xyz",
    }),
  });
  const invalidRes = await POST(invalidReq);
  suite.assertEqual(invalidRes.status, 400, "POST invalid scope returns 400 Bad Request");
  const invalidData = await invalidRes.json();
  suite.assertEqual(invalidData.success, false, "Response reports success: false on validation error");
  suite.assert(invalidData.issues, "Response includes Zod validation issues");

  // --- 3. POST Targeted Single Student Sync ---
  const studentReq = new NextRequest("http://localhost:3000/api/github/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "bobby404-k",
    }),
  });
  const studentRes = await POST(studentReq);
  suite.assertEqual(studentRes.status, 200, "POST targeted student sync returns 200 OK");
  const studentData = await studentRes.json();
  suite.assertEqual(studentData.success, true, "Response reports success: true for targeted student");
  suite.assertEqual(studentData.stats.syncedMembersCount, 1, "Exactly 1 member synced");
  suite.assert(studentData.stats.totalPrsSynced >= 0, "totalPrsSynced is non-negative number");
  suite.assertEqual(studentData.cacheInvalidated, true, "Redis caches invalidated");

  // --- 4. POST Scope: Projects Sync ---
  const projectsReq = new NextRequest("http://localhost:3000/api/github/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      scope: "projects",
    }),
  });
  const projectsRes = await POST(projectsReq);
  suite.assertEqual(projectsRes.status, 200, "POST scope: projects returns 200 OK");
  const projectsData = await projectsRes.json();
  suite.assertEqual(projectsData.success, true, "Response reports success: true for projects scope");
  suite.assert(projectsData.stats.projectsRefreshed > 0, "Refreshed projects count is positive");

  // --- 5. POST Default Scope: All ---
  const allReq = new NextRequest("http://localhost:3000/api/github/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      scope: "all",
    }),
  });
  const allRes = await POST(allReq);
  suite.assertEqual(allRes.status, 200, "POST scope: all returns 200 OK");
  const allData = await allRes.json();
  suite.assertEqual(allData.success, true, "Response reports success: true for org-wide sync");
  suite.assert(allData.stats.syncedMembersCount > 0, "Batch synced members count is positive");
  suite.assert(allData.stats.totalPrsSynced >= 0, "Total synced PRs count is non-negative");
  suite.assert(typeof allData.stats.durationMs === "number", "Includes sync execution duration in ms");

  return suite.summary();
}

if (process.argv[1]?.endsWith("github-sync-route.test.ts")) {
  runGitHubSyncRouteTests().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
