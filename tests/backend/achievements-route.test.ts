/**
 * Achievements & First PR Hall of Fame API Route Test Suite
 * Location: tests/backend/achievements-route.test.ts
 */

import { TestSuite, SuiteResult } from "./test-utils";
import { GET, POST } from "../../app/api/achievements/route";
import { NextRequest } from "next/server";

export async function runAchievementsRouteTests(): Promise<SuiteResult> {
  const suite = new TestSuite("Achievements & First PR Hall of Fame API Route");
  suite.start();

  // --- 1. Query All Achievements & Badges ---
  const allReq = new NextRequest("http://localhost:3000/api/achievements");
  const allRes = await GET(allReq);
  suite.assertEqual(allRes.status, 200, "GET /api/achievements returns 200 OK");

  const allData = await allRes.json();
  suite.assertEqual(allData.success, true, "Response reports success: true");
  suite.assert(Array.isArray(allData.badges), "badges is an array");
  suite.assert(allData.badges.length >= 6, "badges array includes at least 6 standard badges");
  suite.assert(Array.isArray(allData.stories), "stories is an array");
  suite.assert(typeof allData.totalUnlocked === "number", "totalUnlocked is a number");

  const cacheHeader = allRes.headers.get("X-Cache");
  suite.assert(
    cacheHeader === "HIT" || cacheHeader === "MISS",
    "Response includes X-Cache header (HIT or MISS)"
  );

  // --- 2. Filter Badges By Category ---
  const catReq = new NextRequest("http://localhost:3000/api/achievements?category=milestone");
  const catRes = await GET(catReq);
  suite.assertEqual(catRes.status, 200, "GET ?category=milestone returns 200 OK");
  const catData = await catRes.json();
  suite.assertEqual(catData.success, true, "Category filter query succeeds");
  suite.assert(
    catData.badges.every((b: any) => b.category.toLowerCase() === "milestone"),
    "All filtered badges match milestone category"
  );

  // --- 3. Filter Badges By Search ---
  const searchReq = new NextRequest("http://localhost:3000/api/achievements?search=First");
  const searchRes = await GET(searchReq);
  suite.assertEqual(searchRes.status, 200, "GET ?search=First returns 200 OK");
  const searchData = await searchRes.json();
  suite.assertEqual(searchData.success, true, "Search query succeeds");
  suite.assert(searchData.badges.length > 0, "Finds First PR Shipped badge");

  // --- 4. POST Validation (Missing Story Fields) ---
  const invalidStoryPost = new NextRequest("http://localhost:3000/api/achievements", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "story", quote: "Incomplete story without PR details" }),
  });
  const invalidStoryRes = await POST(invalidStoryPost);
  suite.assertEqual(
    invalidStoryRes.status,
    400,
    "POST missing required story fields returns 400 Bad Request"
  );
  const invalidStoryData = await invalidStoryRes.json();
  suite.assertEqual(
    invalidStoryData.success,
    false,
    "Response reports success: false on story validation error"
  );

  // --- 5. POST Validation (Missing Unlock Fields) ---
  const invalidUnlockPost = new NextRequest("http://localhost:3000/api/achievements", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "unlock", userId: "test-user-id" }),
  });
  const invalidUnlockRes = await POST(invalidUnlockPost);
  suite.assertEqual(
    invalidUnlockRes.status,
    400,
    "POST missing achievementCode returns 400 Bad Request"
  );
  const invalidUnlockData = await invalidUnlockRes.json();
  suite.assertEqual(
    invalidUnlockData.success,
    false,
    "Response reports success: false on unlock validation error"
  );

  return suite.summary();
}
