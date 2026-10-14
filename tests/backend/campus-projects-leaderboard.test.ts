/**
 * Campus Repositories Projects Leaderboard Test Suite
 * Location: tests/backend/campus-projects-leaderboard.test.ts
 *
 * Verifies that the projects section leaderboard algorithm strictly ranks
 * contributors by how many merges they made into campus repositories (IST-ZenithenLab).
 */

import { TestSuite, SuiteResult } from "./test-utils";
import { GET, CampusContributorStanding } from "../../app/api/projects/leaderboard/route";
import { NextRequest } from "next/server";

export async function runCampusProjectsLeaderboardTests(): Promise<SuiteResult> {
  const suite = new TestSuite("Campus Projects Merges Leaderboard Route");
  suite.start();

  // --- 1. Basic Query ---
  const req = new NextRequest("http://localhost:3000/api/projects/leaderboard");
  const res = await GET(req);
  suite.assertEqual(res.status, 200, "GET /api/projects/leaderboard returns 200 OK");

  const data = await res.json();
  suite.assertEqual(data.success, true, "Response reports success: true");
  suite.assertEqual(data.algorithm, "campus_merges_count", "Algorithm is campus_merges_count");
  suite.assert(Array.isArray(data.leaderboard), "leaderboard is an array");
  suite.assert(data.leaderboard.length > 0, "leaderboard contains ranked contributors");

  const cacheHeader = res.headers.get("X-Cache");
  suite.assert(cacheHeader === "HIT" || cacheHeader === "MISS", "Response includes X-Cache header");

  // --- 2. Verify Strict Ranking by Campus Merges ---
  const list: CampusContributorStanding[] = data.leaderboard;
  for (let i = 0; i < list.length - 1; i++) {
    const current = list[i];
    const next = list[i + 1];

    suite.assertEqual(current.rank, i + 1, `Rank index matches sequence (${current.rank})`);
    suite.assert(
      current.campusMerges >= next.campusMerges,
      `Rank #${current.rank} (${current.username}: ${current.campusMerges} merges) >= Rank #${next.rank} (${next.username}: ${next.campusMerges} merges)`
    );

    // If campus merges are equal, tiebreak should be campusQualityMerges
    if (current.campusMerges === next.campusMerges) {
      suite.assert(
        current.campusQualityMerges >= next.campusQualityMerges,
        `Tiebreak on campus merges: Rank #${current.rank} (${current.campusQualityMerges} quality) >= Rank #${next.rank} (${next.campusQualityMerges} quality)`
      );
    }
  }

  // --- 3. Verify Contributor Properties & Top Campus Repo ---
  const topContributor = list[0];
  suite.assert(typeof topContributor.username === "string", "Top contributor has username");
  suite.assert(typeof topContributor.name === "string", "Top contributor has name");
  suite.assert(typeof topContributor.campusMerges === "number", "campusMerges is a number");
  suite.assert(topContributor.campusMerges >= 0, "campusMerges is non-negative");
  suite.assert(typeof topContributor.topCampusRepo === "string", "topCampusRepo is defined");
  suite.assert(
    topContributor.topCampusRepo.includes("IST-ZenithenLab"),
    "topCampusRepo targets an IST campus repository"
  );

  // --- 4. Verify Limit Query Parameter ---
  const limitReq = new NextRequest("http://localhost:3000/api/projects/leaderboard?limit=3");
  const limitRes = await GET(limitReq);
  suite.assertEqual(limitRes.status, 200, "GET with limit parameter returns 200 OK");
  const limitData = await limitRes.json();
  suite.assert(limitData.leaderboard.length <= 3, "Limit query returns <= 3 entries");

  return suite.summary();
}

if (process.argv[1]?.endsWith("campus-projects-leaderboard.test.ts")) {
  runCampusProjectsLeaderboardTests().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
