/**
 * Contributions API Route Test Suite
 * Location: tests/backend/contributions-route.test.ts
 */

import { TestSuite, SuiteResult } from "./test-utils";
import { GET, POST } from "../../app/api/contributions/route";
import { NextRequest } from "next/server";

export async function runContributionsRouteTests(): Promise<SuiteResult> {
  const suite = new TestSuite("Pull Request & Contributions API Route");
  suite.start();

  // --- 1. Query All Contributions ---
  const allReq = new NextRequest("http://localhost:3000/api/contributions");
  const allRes = await GET(allReq);
  suite.assertEqual(allRes.status, 200, "GET /api/contributions returns 200 OK");

  const allData = await allRes.json();
  suite.assertEqual(allData.success, true, "Response reports success: true");
  suite.assert(Array.isArray(allData.contributions), "contributions is an array");
  suite.assert(typeof allData.count === "number", "count is a number");

  // --- 2. Query By Status (OPEN) ---
  const openReq = new NextRequest("http://localhost:3000/api/contributions?status=OPEN");
  const openRes = await GET(openReq);
  suite.assertEqual(openRes.status, 200, "GET ?status=OPEN returns 200 OK");
  const openData = await openRes.json();
  suite.assertEqual(openData.success, true, "Filter by status OPEN succeeds");

  // --- 3. Query By Status (MERGED) and Quality PR ---
  const qualityReq = new NextRequest("http://localhost:3000/api/contributions?status=MERGED&isQualityPr=true");
  const qualityRes = await GET(qualityReq);
  suite.assertEqual(qualityRes.status, 200, "GET ?status=MERGED&isQualityPr=true returns 200 OK");
  const qualityData = await qualityRes.json();
  suite.assertEqual(qualityData.success, true, "Filter by quality PR succeeds");

  // --- 4. Query By Status (CLOSED) ---
  const closedReq = new NextRequest("http://localhost:3000/api/contributions?status=CLOSED");
  const closedRes = await GET(closedReq);
  suite.assertEqual(closedRes.status, 200, "GET ?status=CLOSED returns 200 OK");

  // --- 5. Validation on POST ---
  const invalidPost = new NextRequest("http://localhost:3000/api/contributions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const invalidRes = await POST(invalidPost);
  suite.assertEqual(invalidRes.status, 400, "POST missing required fields returns 400 Bad Request");
  const invalidData = await invalidRes.json();
  suite.assertEqual(invalidData.success, false, "Response body reports success: false on validation error");

  return suite.summary();
}

if (process.argv[1]?.endsWith("contributions-route.test.ts")) {
  runContributionsRouteTests().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
