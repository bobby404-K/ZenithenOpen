/**
 * Opportunities Board API Route Test Suite
 * Location: tests/backend/opportunities-route.test.ts
 */

import { TestSuite, SuiteResult } from "./test-utils";
import { GET, POST } from "../../app/api/opportunities/route";
import { NextRequest } from "next/server";

export async function runOpportunitiesRouteTests(): Promise<SuiteResult> {
  const suite = new TestSuite("Opportunities Board API Route");
  suite.start();

  // --- 1. Query All Opportunities ---
  const allReq = new NextRequest("http://localhost:3000/api/opportunities");
  const allRes = await GET(allReq);
  suite.assertEqual(allRes.status, 200, "GET /api/opportunities returns 200 OK");

  const allData = await allRes.json();
  suite.assertEqual(allData.success, true, "Response reports success: true");
  suite.assert(Array.isArray(allData.opportunities), "opportunities is an array");
  suite.assert(allData.opportunities.length > 0, "opportunities list is non-empty");
  suite.assert(typeof allData.count === "number", "count is a number");

  const cacheHeader = allRes.headers.get("X-Cache");
  suite.assert(
    cacheHeader === "HIT" || cacheHeader === "MISS",
    "Response includes X-Cache header (HIT or MISS)"
  );

  // --- 2. Filter By Difficulty ---
  const diffReq = new NextRequest("http://localhost:3000/api/opportunities?difficulty=beginner");
  const diffRes = await GET(diffReq);
  suite.assertEqual(diffRes.status, 200, "GET ?difficulty=beginner returns 200 OK");
  const diffData = await diffRes.json();
  suite.assertEqual(diffData.success, true, "Difficulty filter query succeeds");
  suite.assert(
    diffData.opportunities.every((o: any) => o.difficulty === "beginner"),
    "All filtered opportunities are categorized as beginner"
  );

  // --- 3. Filter By Search ---
  const searchReq = new NextRequest("http://localhost:3000/api/opportunities?search=ZenithenOpen");
  const searchRes = await GET(searchReq);
  suite.assertEqual(searchRes.status, 200, "GET ?search=ZenithenOpen returns 200 OK");
  const searchData = await searchRes.json();
  suite.assertEqual(searchData.success, true, "Search query succeeds");
  suite.assert(searchData.opportunities.length > 0, "Finds ZenithenOpen starter opportunities");

  // --- 4. POST Validation (Missing Fields) ---
  const invalidPost = new NextRequest("http://localhost:3000/api/opportunities", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Incomplete Issue" }),
  });
  const invalidRes = await POST(invalidPost);
  suite.assertEqual(invalidRes.status, 400, "POST missing required fields returns 400 Bad Request");
  const invalidData = await invalidRes.json();
  suite.assertEqual(invalidData.success, false, "Response reports success: false on validation error");

  // --- 5. Successful POST (Register New Opportunity) ---
  const validPost = new NextRequest("http://localhost:3000/api/opportunities", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Add Redis cluster failover monitoring telemetry",
      repoFullName: "IST-ZenithenLab/ZenithenOpen",
      issueNumber: 99,
      issueUrl: "https://github.com/IST-ZenithenLab/ZenithenOpen/issues/99",
      language: "TypeScript",
      difficulty: "intermediate",
      labels: ["backend", "performance"],
    }),
  });
  const validRes = await POST(validPost);
  suite.assertEqual(validRes.status, 201, "POST valid opportunity returns 201 Created");
  const validData = await validRes.json();
  suite.assertEqual(validData.success, true, "Opportunity curation succeeds");
  suite.assertEqual(validData.opportunity.issueNumber, 99, "Issue number recorded accurately");

  return suite.summary();
}

if (process.argv[1]?.endsWith("opportunities-route.test.ts")) {
  runOpportunitiesRouteTests().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
