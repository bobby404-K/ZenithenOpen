/**
 * Global Command Palette & Unified Search API Test Suite
 * Location: tests/backend/command-search.test.ts
 *
 * Validates unified search indexing, category filtering, keyword matching,
 * and resilient pagination across contributors, repositories, and pages.
 */

import { TestSuite, SuiteResult } from "./test-utils";
import { GET } from "../../app/api/search/route";
import { NextRequest } from "next/server";

export async function runCommandSearchTests(): Promise<SuiteResult> {
  const suite = new TestSuite("Global Command Palette & Unified Search API");
  suite.start();

  // --- 1. Baseline Search Query (Default) ---
  const defaultReq = new NextRequest("http://localhost:3000/api/search");
  const defaultRes = await GET(defaultReq);
  suite.assertEqual(defaultRes.status, 200, "GET /api/search returns 200 OK");

  const defaultData = await defaultRes.json();
  suite.assertEqual(defaultData.success, true, "Search response reports success: true");
  suite.assert(Array.isArray(defaultData.results), "Results is an array");
  suite.assert(defaultData.results.length > 0, "Default search returns indexed platform items");
  suite.assertEqual(defaultData.results.length, defaultData.count, "Count matches results array length");

  // Validate item schema
  const firstItem = defaultData.results[0];
  suite.assert(Boolean(firstItem.id), "Item has unique ID");
  suite.assert(Boolean(firstItem.title), "Item has non-empty title");
  suite.assert(Boolean(firstItem.subtitle), "Item has subtitle description");
  suite.assert(Boolean(firstItem.url), "Item has destination URL");
  suite.assert(Boolean(firstItem.category), "Item has assigned category");

  // --- 2. Keyword Search for Known Contributor ---
  const studentReq = new NextRequest("http://localhost:3000/api/search?q=bobby");
  const studentRes = await GET(studentReq);
  suite.assertEqual(studentRes.status, 200, "GET /api/search?q=bobby returns 200 OK");

  const studentData = await studentRes.json();
  suite.assertEqual(studentData.success, true, "Student search reports success: true");
  suite.assert(studentData.results.length > 0, "Finds matching student record for 'bobby'");
  const bobbyResult = studentData.results.find((r: any) =>
    r.title.toLowerCase().includes("bobby") || r.subtitle.toLowerCase().includes("bobby")
  );
  suite.assert(Boolean(bobbyResult), "Finds Bobby Kumar in search index");
  suite.assertEqual(bobbyResult?.category, "contributor", "Bobby Kumar is categorized as contributor");
  suite.assertEqual(bobbyResult?.url, "/members/bobby404-k", "Contributor URL links to member profile");

  // --- 3. Keyword Search for Campus Project ---
  const projectReq = new NextRequest("http://localhost:3000/api/search?q=zenithen");
  const projectRes = await GET(projectReq);
  suite.assertEqual(projectRes.status, 200, "GET /api/search?q=zenithen returns 200 OK");

  const projectData = await projectRes.json();
  suite.assertEqual(projectData.success, true, "Project search reports success: true");
  const zenithenProject = projectData.results.find(
    (r: any) => r.category === "project" && r.title.toLowerCase().includes("zenithen")
  );
  suite.assert(Boolean(zenithenProject), "Finds ZenithenOpen in campus projects");
  suite.assertEqual(zenithenProject?.url, "/projects/zenithen-open", "Project URL links to project deep-dive");

  // --- 4. Category Filtering: Pages ---
  const pagesReq = new NextRequest("http://localhost:3000/api/search?category=page");
  const pagesRes = await GET(pagesReq);
  suite.assertEqual(pagesRes.status, 200, "GET /api/search?category=page returns 200 OK");

  const pagesData = await pagesRes.json();
  suite.assertEqual(pagesData.success, true, "Pages search reports success: true");
  suite.assert(pagesData.results.length >= 4, "Includes multiple core navigation pages");
  for (const page of pagesData.results) {
    suite.assertEqual(page.category, "page", `Item ${page.title} is strictly categorized as page`);
    suite.assert(page.url.startsWith("/"), `Page URL ${page.url} is a relative platform route`);
  }

  // --- 5. Category Filtering: Projects ---
  const projectsOnlyReq = new NextRequest("http://localhost:3000/api/search?category=project");
  const projectsOnlyRes = await GET(projectsOnlyReq);
  suite.assertEqual(projectsOnlyRes.status, 200, "GET /api/search?category=project returns 200 OK");

  const projectsOnlyData = await projectsOnlyRes.json();
  for (const proj of projectsOnlyData.results) {
    suite.assertEqual(proj.category, "project", `Item ${proj.title} is strictly categorized as project`);
  }

  // --- 6. Custom Limit Parameter ---
  const limitReq = new NextRequest("http://localhost:3000/api/search?limit=3");
  const limitRes = await GET(limitReq);
  const limitData = await limitRes.json();
  suite.assert(limitData.results.length <= 3, "Search respects custom limit parameter (<=3)");

  // --- 7. Graceful Empty Match for Non-Existent Term ---
  const emptyReq = new NextRequest("http://localhost:3000/api/search?q=xyznonexistentterm999");
  const emptyRes = await GET(emptyReq);
  suite.assertEqual(emptyRes.status, 200, "Non-existent search term returns 200 OK");

  const emptyData = await emptyRes.json();
  suite.assertEqual(emptyData.success, true, "Empty search reports success: true");
  suite.assertEqual(emptyData.count, 0, "Non-existent search term returns 0 count");
  suite.assertEqual(emptyData.results.length, 0, "Non-existent search term returns empty array");

  return suite.summary();
}

if (process.argv[1]?.endsWith("command-search.test.ts")) {
  runCommandSearchTests().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
