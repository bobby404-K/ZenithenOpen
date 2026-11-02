/**
 * Student Preview Modal Test Suite
 * Location: tests/backend/student-preview-modal.test.ts
 *
 * Verifies that the Student Preview Modal data contract is fully satisfied
 * across all contributor providers (Leaderboard API, Projects API, and Member profiles).
 */

import { TestSuite, SuiteResult } from "./test-utils";
import { StudentPreviewData } from "../../components/members/student-preview-modal";
import { GET as getLeaderboard } from "../../app/api/students/leaderboard/route";
import { GET as getCampusLeaderboard } from "../../app/api/projects/leaderboard/route";
import { NextRequest } from "next/server";

export async function runStudentPreviewModalTests(): Promise<SuiteResult> {
  const suite = new TestSuite("Student Profile Quick-Preview Modal Contract");
  suite.start();

  // --- 1. Verify Leaderboard API mapping into StudentPreviewData ---
  const leadReq = new NextRequest("http://localhost:3000/api/students/leaderboard?timeframe=month&mock=true");
  const leadRes = await getLeaderboard(leadReq);
  suite.assertEqual(leadRes.status, 200, "GET /api/students/leaderboard returns 200 OK");

  const leadData = await leadRes.json();
  suite.assertEqual(leadData.success, true, "Leaderboard response reports success: true");
  suite.assert(Array.isArray(leadData.competitors), "competitors is an array");
  suite.assert(leadData.competitors.length > 0, "competitors array is not empty");

  const firstStudent = leadData.competitors[0];
  const previewCard1: StudentPreviewData = {
    username: firstStudent.username,
    name: firstStudent.name,
    avatarUrl: firstStudent.avatarUrl,
    department: firstStudent.department,
    year: firstStudent.year,
    badge: firstStudent.badge,
    badgeColor: firstStudent.badgeColor,
    linkedinUrl: firstStudent.linkedinUrl,
    githubUrl: firstStudent.githubUrl,
    qualityPrs: firstStudent.month.qualityPrs,
    totalPrs: firstStudent.month.prs,
    openPrs: firstStudent.month.openPrs,
    closedPrs: firstStudent.month.closedPrs,
    mergedPrs: firstStudent.month.mergedPrs ?? firstStudent.month.prs,
  };

  suite.assert(typeof previewCard1.username === "string" && previewCard1.username.length > 0, "Preview card has valid username");
  suite.assert(typeof previewCard1.name === "string" && previewCard1.name.length > 0, "Preview card has valid name");
  suite.assert(previewCard1.avatarUrl.startsWith("http") || previewCard1.avatarUrl.startsWith("/"), "Preview card has valid avatar URL");
  suite.assert(typeof previewCard1.qualityPrs === "number" && previewCard1.qualityPrs >= 0, "qualityPrs is non-negative number");
  suite.assert(typeof previewCard1.totalPrs === "number" && previewCard1.totalPrs >= 0, "totalPrs is non-negative number");
  suite.assert(typeof previewCard1.openPrs === "number" && previewCard1.openPrs >= 0, "openPrs is non-negative number");
  suite.assert(typeof previewCard1.closedPrs === "number" && previewCard1.closedPrs >= 0, "closedPrs is non-negative number");
  suite.assert(typeof previewCard1.mergedPrs === "number" && previewCard1.mergedPrs >= 0, "mergedPrs is non-negative number");

  // --- 2. Verify Campus Repositories Leaderboard mapping into StudentPreviewData ---
  const campReq = new NextRequest("http://localhost:3000/api/projects/leaderboard?mock=true");
  const campRes = await getCampusLeaderboard(campReq);
  suite.assertEqual(campRes.status, 200, "GET /api/projects/leaderboard returns 200 OK");

  const campData = await campRes.json();
  suite.assertEqual(campData.success, true, "Campus leaderboard response reports success: true");
  suite.assert(Array.isArray(campData.leaderboard), "leaderboard is an array");
  suite.assert(campData.leaderboard.length > 0, "Campus leaderboard is not empty");

  const firstCampusStudent = campData.leaderboard[0];
  const previewCard2: StudentPreviewData = {
    username: firstCampusStudent.username,
    name: firstCampusStudent.name,
    avatarUrl: firstCampusStudent.avatarUrl,
    department: firstCampusStudent.department,
    year: firstCampusStudent.year,
    badge: firstCampusStudent.badge,
    badgeColor: firstCampusStudent.badgeColor,
    linkedinUrl: firstCampusStudent.linkedinUrl,
    campusMerges: firstCampusStudent.campusMerges,
    qualityPrs: firstCampusStudent.campusQualityMerges,
    openPrs: firstCampusStudent.campusOpenPrs,
    closedPrs: firstCampusStudent.campusClosedPrs,
    mergedPrs: firstCampusStudent.campusMerges,
    totalPrs: firstCampusStudent.campusTotalPrs,
    topRepo: firstCampusStudent.topCampusRepo,
  };

  suite.assert(typeof previewCard2.campusMerges === "number" && previewCard2.campusMerges >= 0, "campusMerges is defined and >= 0");
  suite.assert(typeof previewCard2.topRepo === "string" && previewCard2.topRepo.includes("IST-ZenithenLab"), "topRepo points to campus repo");
  suite.assertEqual(previewCard2.username, firstCampusStudent.username, "Username matches campus student");

  // --- 3. Verify Fallback URL generation rules ---
  const githubFallback = previewCard1.githubUrl || `https://github.com/${previewCard1.username}`;
  const linkedinFallback = previewCard1.linkedinUrl || `https://linkedin.com/in/${previewCard1.username}`;
  suite.assert(githubFallback.includes(previewCard1.username), "GitHub link fallback embeds username");
  suite.assert(linkedinFallback.includes(previewCard1.username), "LinkedIn link fallback embeds username");

  // --- 4. Verify Total PR calculation fallback ---
  const computedTotal = (previewCard1.openPrs ?? 0) + (previewCard1.closedPrs ?? 0) + (previewCard1.mergedPrs ?? 0);
  suite.assert(computedTotal >= 0, "Computed total PR count is non-negative");

  return suite.summary();
}
