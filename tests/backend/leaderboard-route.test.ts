/**
 * Student Leaderboard & Competition Arena Route Test Suite
 * Location: tests/backend/leaderboard-route.test.ts
 */

import { TestSuite, SuiteResult } from "./test-utils";
import { GET, POST } from "../../app/api/students/leaderboard/route";
import { NextRequest } from "next/server";

export async function runLeaderboardRouteTests(): Promise<SuiteResult> {
  const suite = new TestSuite("Student Leaderboard & Competition Arena Route");
  suite.start();

  // --- 1. Default (Week) Leaderboard Query ---
  const defaultReq = new NextRequest("http://localhost:3000/api/students/leaderboard");
  const defaultRes = await GET(defaultReq);
  suite.assertEqual(defaultRes.status, 200, "GET /api/students/leaderboard returns 200 OK");

  const defaultData = await defaultRes.json();
  suite.assertEqual(defaultData.success, true, "Response reports success: true");
  suite.assertEqual(defaultData.timeframe, "week", "Default timeframe is 'week'");
  suite.assert(Array.isArray(defaultData.competitors), "competitors is an array");
  suite.assert(defaultData.competitors.length > 0, "competitors array has elements");

  const topWeekStudent = defaultData.competitors[0];
  suite.assertEqual(topWeekStudent.week.rank, 1, "First student has rank 1 for week timeframe");
  suite.assert(
    typeof topWeekStudent.week.prs === "number" && topWeekStudent.week.prs > 0,
    "Top student has positive PR count"
  );
  suite.assert(
    typeof topWeekStudent.week.qualityPrs === "number",
    "Top student has tracked quality PRs"
  );
  suite.assert(
    typeof topWeekStudent.week.topContribution?.title === "string",
    "Student includes structured topContribution details"
  );

  // Validate strict 5-tier sorting order: Quality Merge > Total PR > Open PR > Closed PR > Total Merges
  let sortingCompliant = true;
  for (let i = 0; i < defaultData.competitors.length - 1; i++) {
    const a = defaultData.competitors[i].week;
    const b = defaultData.competitors[i + 1].week;

    const qDiff = (a.qualityPrs ?? 0) - (b.qualityPrs ?? 0);
    if (qDiff !== 0) {
      if (qDiff < 0) sortingCompliant = false;
      continue;
    }
    const tDiff = (a.prs ?? 0) - (b.prs ?? 0);
    if (tDiff !== 0) {
      if (tDiff < 0) sortingCompliant = false;
      continue;
    }
    const oDiff = (a.openPrs ?? 0) - (b.openPrs ?? 0);
    if (oDiff !== 0) {
      if (oDiff < 0) sortingCompliant = false;
      continue;
    }
    const cDiff = (a.closedPrs ?? 0) - (b.closedPrs ?? 0);
    if (cDiff !== 0) {
      if (cDiff < 0) sortingCompliant = false;
      continue;
    }
    const mDiff = (a.mergedPrs ?? 0) - (b.mergedPrs ?? 0);
    if (mDiff < 0) sortingCompliant = false;
  }
  suite.assertEqual(sortingCompliant, true, "Leaderboard satisfies strict 5-tier ranking order (Quality > Total PR > Open > Closed > Merges)");

  // --- 2. Month Timeframe Query ---
  const monthReq = new NextRequest("http://localhost:3000/api/students/leaderboard?timeframe=month");
  const monthRes = await GET(monthReq);
  suite.assertEqual(monthRes.status, 200, "GET ?timeframe=month returns 200 OK");

  const monthData = await monthRes.json();
  suite.assertEqual(monthData.timeframe, "month", "Response confirms timeframe is 'month'");
  suite.assertEqual(monthData.competitors[0].month.rank, 1, "First student has rank 1 for month timeframe");

  // --- 3. Overall Timeframe Query ---
  const overallReq = new NextRequest("http://localhost:3000/api/students/leaderboard?timeframe=overall");
  const overallRes = await GET(overallReq);
  suite.assertEqual(overallRes.status, 200, "GET ?timeframe=overall returns 200 OK");

  const overallData = await overallRes.json();
  suite.assertEqual(overallData.timeframe, "overall", "Response confirms timeframe is 'overall'");
  suite.assertEqual(overallData.competitors[0].overall.rank, 1, "First student has rank 1 for overall timeframe");

  // --- 4. Invalid POST Body Validation ---
  const invalidReq = new NextRequest("http://localhost:3000/api/students/leaderboard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const invalidRes = await POST(invalidReq);
  suite.assertEqual(invalidRes.status, 400, "POST with invalid action returns 400 Bad Request");

  const invalidData = await invalidRes.json();
  suite.assertEqual(invalidData.success, false, "Response reports success: false on invalid payload");

  return suite.summary();
}

if (process.argv[1]?.endsWith("leaderboard-route.test.ts")) {
  runLeaderboardRouteTests().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
