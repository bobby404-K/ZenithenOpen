/**
 * Resume Share Snapshot & Public Token Controller Test Suite
 * Location: tests/backend/resume-share.test.ts
 */

import { TestSuite, SuiteResult } from "./test-utils";
import { GET as listTokens, POST as createSnapshot } from "../../app/api/resume/share/route";
import { GET as resolveToken } from "../../app/api/resume/share/[token]/route";
import { NextRequest } from "next/server";

export async function runResumeShareTests(): Promise<SuiteResult> {
  const suite = new TestSuite("Resume Share Token & Snapshot Controller (/api/resume/share)");
  suite.start();

  // --- 1. GET Active Tokens List ---
  const listReq = new NextRequest("http://localhost:3000/api/resume/share");
  const listRes = await listTokens(listReq);
  suite.assertEqual(listRes.status, 200, "GET /api/resume/share returns 200 OK");
  const listData = await listRes.json();
  suite.assertEqual(listData.success, true, "Response reports success: true");
  suite.assert(typeof listData.count === "number", "Token count is a number");
  suite.assert(Array.isArray(listData.tokens), "Tokens is an array");
  suite.assert(listData.tokens.length > 0, "Includes seeded token");

  // --- 2. POST Validation Failure (Empty / Invalid Payload) ---
  const invalidReq = new NextRequest("http://localhost:3000/api/resume/share", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "", // Empty string
      expiresInDays: -5, // Invalid negative days
    }),
  });
  const invalidRes = await createSnapshot(invalidReq);
  suite.assertEqual(invalidRes.status, 400, "POST invalid payload returns 400 Bad Request");
  const invalidData = await invalidRes.json();
  suite.assertEqual(invalidData.success, false, "Response reports success: false on validation error");
  suite.assert(invalidData.issues, "Response includes Zod validation issues");

  // --- 3. POST Valid Snapshot Creation ---
  const validReq = new NextRequest("http://localhost:3000/api/resume/share", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "bobby404-k",
      expiresInDays: 60,
      customHeadline: "Lead Open-Source Maintainer & Distributed Systems Engineer",
    }),
  });
  const validRes = await createSnapshot(validReq);
  suite.assertEqual(validRes.status, 201, "POST valid snapshot returns 201 Created");
  const validData = await validRes.json();
  suite.assertEqual(validData.success, true, "Response reports success: true on snapshot creation");
  suite.assert(typeof validData.shareToken === "string" && validData.shareToken.startsWith("tok_"), "Generated secure shareToken");
  suite.assert(typeof validData.shareUrl === "string" && validData.shareUrl.includes("/resume/share/"), "Includes shareUrl");
  suite.assertEqual(validData.snapshot.headline, "Lead Open-Source Maintainer & Distributed Systems Engineer", "Custom headline persisted in frozen snapshot");
  suite.assert(validData.snapshot.highlightedRepos.length > 0, "Includes highlightedRepos");

  const generatedToken = validData.shareToken;

  // --- 4. GET Non-Existent Token Lookup ---
  const notFoundReq = new NextRequest("http://localhost:3000/api/resume/share/tok_invalid_xyz_9999");
  const notFoundRes = await resolveToken(notFoundReq, {
    params: Promise.resolve({ token: "tok_invalid_xyz_9999" }),
  });
  suite.assertEqual(notFoundRes.status, 404, "GET invalid token returns 404 Not Found");
  const notFoundData = await notFoundRes.json();
  suite.assertEqual(notFoundData.success, false, "Response reports success: false for invalid token");

  // --- 5. GET Resolve Valid Token ---
  const resolveReq = new NextRequest(`http://localhost:3000/api/resume/share/${generatedToken}`);
  const resolveRes = await resolveToken(resolveReq, {
    params: Promise.resolve({ token: generatedToken }),
  });
  suite.assertEqual(resolveRes.status, 200, "GET valid token returns 200 OK");
  const resolveData = await resolveRes.json();
  suite.assertEqual(resolveData.success, true, "Response reports success: true on token resolution");
  suite.assertEqual(resolveData.shareToken, generatedToken, "Returned shareToken matches queried token");
  suite.assert(resolveData.profile && typeof resolveData.profile.fullName === "string", "Includes profile data");
  suite.assert(typeof resolveData.markdown === "string", "Includes formatted markdown");
  suite.assert(resolveData.viewCount >= 1, "View count incremented");

  const cacheHeader = resolveRes.headers.get("X-Cache");
  suite.assert(cacheHeader === "HIT" || cacheHeader === "MISS", "Response includes X-Cache telemetry header");

  // --- 6. GET Token with format=markdown ---
  const mdReq = new NextRequest(`http://localhost:3000/api/resume/share/${generatedToken}?format=markdown`);
  const mdRes = await resolveToken(mdReq, {
    params: Promise.resolve({ token: generatedToken }),
  });
  suite.assertEqual(mdRes.status, 200, "GET ?format=markdown returns 200 OK");
  const mdText = await mdRes.text();
  suite.assert(mdText.includes("Verified Open-Source Engineering"), "Markdown contains open source engineering section");
  suite.assert(mdText.includes("Technical Proficiencies"), "Markdown contains proficiencies section");

  // --- 7. GET Filter Tokens by Username ---
  const userTokensReq = new NextRequest("http://localhost:3000/api/resume/share?username=bobby404-k");
  const userTokensRes = await listTokens(userTokensReq);
  suite.assertEqual(userTokensRes.status, 200, "GET ?username=bobby404-k returns 200 OK");
  const userTokensData = await userTokensRes.json();
  suite.assert(
    userTokensData.tokens.every((t: any) => t.username.toLowerCase() === "bobby404-k"),
    "All filtered tokens belong to requested user"
  );

  return suite.summary();
}

if (process.argv[1]?.endsWith("resume-share.test.ts")) {
  runResumeShareTests().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
