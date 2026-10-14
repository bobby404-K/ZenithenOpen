/**
 * Student Proof-of-Work Badge Card Test Suite
 * Location: tests/backend/resume-badge.test.ts
 *
 * Verifies dynamic SVG generation, JSON metadata contract, embed codes,
 * and social export links for the Student Proof-of-Work Badge Card.
 */

import { TestSuite, SuiteResult } from "./test-utils";
import { GET } from "../../app/api/resume/badge/[username]/route";
import { NextRequest } from "next/server";

export async function runResumeBadgeTests(): Promise<SuiteResult> {
  const suite = new TestSuite("Student Proof-of-Work Badge Card Dynamic API");
  suite.start();

  // --- 1. Query JSON format for known student ---
  const jsonReq = new NextRequest(
    "http://localhost:3000/api/resume/badge/bobby404-k?format=json"
  );
  const jsonRes = await GET(jsonReq, {
    params: Promise.resolve({ username: "bobby404-k" }),
  });
  suite.assertEqual(jsonRes.status, 200, "GET /api/resume/badge/bobby404-k?format=json returns 200 OK");

  const jsonData = await jsonRes.json();
  suite.assertEqual(jsonData.success, true, "Badge JSON response reports success: true");
  suite.assert(typeof jsonData.badge === "object" && jsonData.badge !== null, "badge object is defined");

  const badge = jsonData.badge;
  suite.assertEqual(badge.username, "bobby404-k", "badge username matches parameter");
  suite.assert(typeof badge.name === "string" && badge.name.length > 0, "badge has valid student name");
  suite.assert(typeof badge.qualityPrs === "number" && badge.qualityPrs >= 0, "qualityPrs is non-negative number");
  suite.assert(typeof badge.campusMerges === "number" && badge.campusMerges >= 0, "campusMerges is non-negative number");
  suite.assert(typeof badge.totalPrs === "number" && badge.totalPrs >= 0, "totalPrs is non-negative number");
  suite.assert(typeof badge.badgeLevel === "string", "badgeLevel is defined");

  // --- 2. Verify Embed Codes (Markdown, HTML, LinkedIn) ---
  suite.assert(typeof badge.embedCodes === "object", "embedCodes object is provided");
  suite.assert(
    badge.embedCodes.markdown.includes("[![ZenithenOpen Proof of Work]"),
    "Markdown snippet contains valid badge image markup"
  );
  suite.assert(
    badge.embedCodes.html.includes("<a href=") && badge.embedCodes.html.includes("<img src="),
    "HTML embed snippet contains linked image tag"
  );
  suite.assert(
    badge.embedCodes.linkedInShareUrl.includes("linkedin.com/sharing/share-offsite"),
    "LinkedIn share URL points to offsite share endpoint"
  );

  // --- 3. Query SVG format (default) ---
  const svgReq = new NextRequest(
    "http://localhost:3000/api/resume/badge/bobby404-k"
  );
  const svgRes = await GET(svgReq, {
    params: Promise.resolve({ username: "bobby404-k" }),
  });
  suite.assertEqual(svgRes.status, 200, "GET /api/resume/badge/bobby404-k returns 200 OK");

  const contentType = svgRes.headers.get("Content-Type") || "";
  suite.assert(contentType.includes("image/svg+xml"), "Response Content-Type is image/svg+xml");

  const svgText = await svgRes.text();
  suite.assert(svgText.includes("<svg") && svgText.includes("</svg>"), "Output contains valid SVG root elements");
  suite.assert(svgText.includes("VERIFIED CAMPUS ENGINEER"), "SVG includes verified badge header");
  suite.assert(svgText.includes("IST BENGALURU"), "SVG includes IST BENGALURU chapter tag");
  suite.assert(svgText.includes("QUALITY MERGES"), "SVG includes quality merges metric label");
  suite.assert(svgText.includes("CAMPUS MERGES"), "SVG includes campus merges metric label");

  // --- 4. Graceful Fallback for Non-Existent User ---
  const fallbackReq = new NextRequest(
    "http://localhost:3000/api/resume/badge/new-student-engineer"
  );
  const fallbackRes = await GET(fallbackReq, {
    params: Promise.resolve({ username: "new-student-engineer" }),
  });
  suite.assertEqual(fallbackRes.status, 200, "Fallback generates valid SVG badge for any valid handle");
  const fallbackSvg = await fallbackRes.text();
  suite.assert(fallbackSvg.includes("new-student-engineer"), "Fallback SVG incorporates candidate handle");

  return suite.summary();
}
