/**
 * Community Contributor Swag & Rewards Engine Test Suite
 * Location: tests/backend/community-swag.test.ts
 *
 * Validates contributor tier evaluation, contribution metric validation,
 * apparel size selection, duplicate protection, and voucher code generation.
 */

import { TestSuite, SuiteResult } from "./test-utils";
import { GET, POST, resetClaimsStore } from "../../app/api/community/swag/route";
import { NextRequest } from "next/server";

export async function runCommunitySwagTests(): Promise<SuiteResult> {
  const suite = new TestSuite("Community Contributor Swag & Rewards Engine");
  suite.start();

  // Reset in-memory claims store to baseline
  resetClaimsStore();

  // --- 1. General Swag Tiers Discovery ---
  const defaultReq = new NextRequest("http://localhost:3000/api/community/swag");
  const defaultRes = await GET(defaultReq);
  suite.assertEqual(defaultRes.status, 200, "GET /api/community/swag returns 200 OK");

  const defaultData = await defaultRes.json();
  suite.assertEqual(defaultData.success, true, "Response reports success: true");
  suite.assert(Array.isArray(defaultData.tiers), "tiers is an array");
  suite.assertEqual(defaultData.tiers.length, 4, "Platform defines exactly 4 contributor recognition tiers");
  suite.assert(Array.isArray(defaultData.recentClaims), "recentClaims is an array");
  suite.assert(defaultData.recentClaims.length > 0, "Contains seeded recent claims");

  // Validate tier schemas
  const tier1 = defaultData.tiers[0];
  suite.assertEqual(tier1.id, "tier-1", "Tier 1 ID is 'tier-1'");
  suite.assertEqual(tier1.minPrs, 1, "Tier 1 requires 1 merged PR");
  suite.assertEqual(tier1.hasPhysicalSwag, false, "Tier 1 is digital badge recognition");

  const tier4 = defaultData.tiers[3];
  suite.assertEqual(tier4.id, "tier-4", "Tier 4 ID is 'tier-4'");
  suite.assertEqual(tier4.minPrs, 30, "Tier 4 requires 30 merged PRs");
  suite.assertEqual(tier4.hasPhysicalSwag, true, "Tier 4 includes physical community hoodie");

  // --- 2. Student Eligibility Evaluation (Bobby Kumar - Top Contributor) ---
  const bobbyReq = new NextRequest("http://localhost:3000/api/community/swag?username=bobby404-k");
  const bobbyRes = await GET(bobbyReq);
  suite.assertEqual(bobbyRes.status, 200, "GET /api/community/swag?username=bobby404-k returns 200 OK");

  const bobbyData = await bobbyRes.json();
  suite.assertEqual(bobbyData.success, true, "Eligibility evaluation reports success: true");
  suite.assertEqual(bobbyData.student.username, "bobby404-k", "Returns matching student username");
  suite.assert(bobbyData.student.mergedPrs >= 30, "Bobby has at least 30 verified merged PRs");
  suite.assertEqual(bobbyData.highestEligibleTier?.id, "tier-4", "Highest unlocked tier is Gold Contributor (Tier 4)");
  suite.assert(
    bobbyData.tiers.every((t: { isEligible: boolean }) => t.isEligible === true),
    "Top contributor unlocks all 4 swag tiers"
  );
  suite.assert(Array.isArray(bobbyData.claims), "Returns claims array for user");
  suite.assert(
    bobbyData.claims.some((c: { tierId: string }) => c.tierId === "tier-4"),
    "Recognizes prior Tier 4 claim by Bobby"
  );

  // --- 3. Interactive Swag Claim Submission ---
  // Tanmay (24 merged PRs) claims Tier 2 (Bronze Contributor Stickers)
  const claimReq = new NextRequest("http://localhost:3000/api/community/swag", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "tanmay-lead",
      tierId: "tier-2",
      pickupLocation: "Campus Lab 3 (Maintainers Desk)",
    }),
  });

  const claimRes = await POST(claimReq);
  suite.assertEqual(claimRes.status, 200, "POST /api/community/swag returns 200 OK");

  const claimData = await claimRes.json();
  suite.assertEqual(claimData.success, true, "Claim submission reports success: true");
  suite.assert(Boolean(claimData.voucher), "Voucher object is returned");
  suite.assert(
    claimData.voucher.voucherCode.startsWith("SWAG-2026-IST-"),
    "Voucher code matches SWAG-2026-IST-XXXX format"
  );
  suite.assertEqual(claimData.voucher.username, "tanmay-lead", "Voucher is assigned to claimant");
  suite.assertEqual(claimData.voucher.tierId, "tier-2", "Voucher corresponds to requested tier");
  suite.assertEqual(claimData.voucher.status, "CONFIRMED", "Voucher status is CONFIRMED");

  // Verify voucher appears in user claims
  const verifyReq = new NextRequest("http://localhost:3000/api/community/swag?username=tanmay-lead");
  const verifyRes = await GET(verifyReq);
  const verifyData = await verifyRes.json();
  suite.assert(
    verifyData.claims.some((c: { voucherCode: string }) => c.voucherCode === claimData.voucher.voucherCode),
    "New voucher is persisted in student claims history"
  );

  // --- 4. Duplicate Claim Prevention ---
  const duplicateReq = new NextRequest("http://localhost:3000/api/community/swag", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "tanmay-lead",
      tierId: "tier-2",
    }),
  });
  const duplicateRes = await POST(duplicateReq);
  suite.assertEqual(duplicateRes.status, 409, "Duplicate tier claim returns 409 Conflict");
  const duplicateData = await duplicateRes.json();
  suite.assertEqual(duplicateData.success, false, "Duplicate claim reports success: false");
  suite.assertEqual(duplicateData.alreadyClaimed, true, "Flag alreadyClaimed is true");

  // --- 5. Ineligible Tier Claim Rejection ---
  // A first-time student with 1 PR attempts to claim Tier 4 Hoodie
  const ineligibleReq = new NextRequest("http://localhost:3000/api/community/swag", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "junior-coder-ist",
      tierId: "tier-4",
      size: "L",
    }),
  });
  const ineligibleRes = await POST(ineligibleReq);
  suite.assertEqual(ineligibleRes.status, 403, "Claiming tier without required PRs returns 403 Forbidden");
  const ineligibleData = await ineligibleRes.json();
  suite.assertEqual(ineligibleData.success, false, "Ineligible claim reports success: false");
  suite.assertEqual(ineligibleData.minPrs, 30, "Response specifies minimum required PRs (30)");

  // --- 6. Apparel Size Validation ---
  // Attempting to claim Tier 3 T-Shirt without selecting a valid size
  const invalidSizeReq = new NextRequest("http://localhost:3000/api/community/swag", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "bobby404-k",
      tierId: "tier-3",
      size: "INVALID_SIZE",
    }),
  });
  const invalidSizeRes = await POST(invalidSizeReq);
  suite.assertEqual(invalidSizeRes.status, 400, "Invalid apparel size returns 400 Bad Request");

  // --- 7. Input Validation & Edge Cases ---
  const missingTierReq = new NextRequest("http://localhost:3000/api/community/swag", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "bobby404-k" }),
  });
  const missingTierRes = await POST(missingTierReq);
  suite.assertEqual(missingTierRes.status, 400, "Missing tierId returns 400 Bad Request");

  const nonExistentTierReq = new NextRequest("http://localhost:3000/api/community/swag", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "bobby404-k", tierId: "tier-99" }),
  });
  const nonExistentTierRes = await POST(nonExistentTierReq);
  suite.assertEqual(nonExistentTierRes.status, 400, "Non-existent tierId returns 400 Bad Request");

  const missingUserReq = new NextRequest("http://localhost:3000/api/community/swag", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tierId: "tier-1", username: "" }),
  });
  const missingUserRes = await POST(missingUserReq);
  suite.assertEqual(missingUserRes.status, 400, "Missing username returns 400 Bad Request");

  return suite.summary();
}

if (process.argv[1]?.endsWith("community-swag.test.ts")) {
  runCommunitySwagTests().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
