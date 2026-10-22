/**
 * Project and Member Showcase Pages Automated Test Suite
 * Location: tests/backend/showcase-pages.test.ts
 *
 * Verifies backend data contracts, fallback resilience, and property schemas
 * backing the dynamic showcase pages:
 * - app/projects/[slug]/page.tsx
 * - app/members/[username]/page.tsx
 */

import { TestSuite, SuiteResult } from "./test-utils";
import { GET as getProject } from "../../app/api/projects/[slug]/route";
import { GET as getMember } from "../../app/api/members/[username]/route";
import { NextRequest } from "next/server";

export async function runShowcasePagesTests(): Promise<SuiteResult> {
  const suite = new TestSuite("Project & Member Dynamic Showcase Pages Architecture");
  suite.start();

  // ==========================================
  // SECTION 1: PROJECT SHOWCASE ROUTE CONTRACT
  // ==========================================

  // 1.1 Non-existent project returns 404
  const notFoundProjReq = new NextRequest("http://localhost:3000/api/projects/unknown-proj-404");
  const notFoundProjRes = await getProject(notFoundProjReq, {
    params: Promise.resolve({ slug: "unknown-proj-404" }),
  });
  suite.assertEqual(notFoundProjRes.status, 404, "Unknown project slug returns HTTP 404");
  const notFoundProjJson = await notFoundProjRes.json();
  suite.assertEqual(notFoundProjJson.success, false, "Unknown project returns success: false");

  // 1.2 Baseline Project: zenithen-open
  const zenithenReq = new NextRequest("http://localhost:3000/api/projects/zenithen-open");
  const zenithenRes = await getProject(zenithenReq, {
    params: Promise.resolve({ slug: "zenithen-open" }),
  });
  suite.assertEqual(zenithenRes.status, 200, "GET /api/projects/zenithen-open returns HTTP 200");
  const zenithenJson = await zenithenRes.json();
  suite.assertEqual(zenithenJson.success, true, "Project response reports success: true");
  suite.assert(zenithenJson.project, "Response includes project object");
  suite.assertEqual(zenithenJson.project.name, "ZenithenOpen", "Project name is ZenithenOpen");
  suite.assertEqual(zenithenJson.project.primaryLanguage, "TypeScript", "Primary language is TypeScript");
  suite.assert(zenithenJson.project.repositoryUrl.includes("github.com"), "Repository URL points to GitHub");
  suite.assert(typeof zenithenJson.project.starsCount === "number", "Includes starsCount number");
  suite.assert(typeof zenithenJson.project.forksCount === "number", "Includes forksCount number");
  suite.assert(Array.isArray(zenithenJson.project.tags), "Includes project tags array");
  suite.assert(zenithenJson.project.tags.length > 0, "Project tags array is non-empty");
  suite.assert(Array.isArray(zenithenJson.project.maintainers), "Includes maintainers array");
  suite.assert(Array.isArray(zenithenJson.project.topContributors), "Includes topContributors array");
  suite.assert(Array.isArray(zenithenJson.project.recentContributions), "Includes recentContributions array");
  suite.assert(Array.isArray(zenithenJson.project.opportunities), "Includes opportunities array");

  // 1.3 Case insensitivity for project slugs
  const uppercaseReq = new NextRequest("http://localhost:3000/api/projects/ZENITHEN-OPEN");
  const uppercaseRes = await getProject(uppercaseReq, {
    params: Promise.resolve({ slug: "ZENITHEN-OPEN" }),
  });
  suite.assertEqual(uppercaseRes.status, 200, "Project slug lookup is case-insensitive");

  // 1.4 Secondary baseline project: first-pr
  const firstPrReq = new NextRequest("http://localhost:3000/api/projects/first-pr");
  const firstPrRes = await getProject(firstPrReq, {
    params: Promise.resolve({ slug: "first-pr" }),
  });
  suite.assertEqual(firstPrRes.status, 200, "GET /api/projects/first-pr returns HTTP 200");
  const firstPrJson = await firstPrRes.json();
  suite.assertEqual(firstPrJson.project.name, "First-PR", "Resolved First-PR project name accurately");

  // ==========================================
  // SECTION 2: MEMBER SHOWCASE ROUTE CONTRACT
  // ==========================================

  // 2.1 Non-existent member returns 404
  const notFoundMemberReq = new NextRequest("http://localhost:3000/api/members/non-existent-dev-999");
  const notFoundMemberRes = await getMember(notFoundMemberReq, {
    params: Promise.resolve({ username: "non-existent-dev-999" }),
  });
  suite.assertEqual(notFoundMemberRes.status, 404, "Unknown member username returns HTTP 404");

  // 2.2 Verified member: bobby404-k
  const bobbyReq = new NextRequest("http://localhost:3000/api/members/bobby404-k");
  const bobbyRes = await getMember(bobbyReq, {
    params: Promise.resolve({ username: "bobby404-k" }),
  });
  suite.assertEqual(bobbyRes.status, 200, "GET /api/members/bobby404-k returns HTTP 200");
  const bobbyJson = await bobbyRes.json();
  suite.assertEqual(bobbyJson.username.toLowerCase(), "bobby404-k", "Member username matches requested handle");
  suite.assert(Boolean(bobbyJson.name), "Member includes display name");
  suite.assert(Boolean(bobbyJson.department), "Member includes academic department");
  suite.assert(Boolean(bobbyJson.yearOfStudy), "Member includes year of study");
  suite.assert(bobbyJson.stats, "Member includes contribution stats");
  suite.assert(typeof bobbyJson.stats.mergedPrs === "number", "Includes mergedPrs count in stats");
  suite.assert(typeof bobbyJson.stats.qualityPrs === "number", "Includes qualityPrs count in stats");
  suite.assert(Array.isArray(bobbyJson.skills), "Includes skills array");
  suite.assert(Array.isArray(bobbyJson.achievements), "Includes achievements array");
  suite.assert(Array.isArray(bobbyJson.recentContributions), "Includes recentContributions array");

  // 2.3 Verified organization member: ist-zenithenlab
  const orgReq = new NextRequest("http://localhost:3000/api/members/ist-zenithenlab");
  const orgRes = await getMember(orgReq, {
    params: Promise.resolve({ username: "ist-zenithenlab" }),
  });
  suite.assertEqual(orgRes.status, 200, "GET /api/members/ist-zenithenlab returns HTTP 200");

  return suite.summary();
}

if (process.argv[1]?.endsWith("showcase-pages.test.ts")) {
  runShowcasePagesTests().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
