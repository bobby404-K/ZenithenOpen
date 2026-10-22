/**
 * Live Campus Activity & Contribution Pulse Test Suite
 * Location: tests/backend/activity-pulse.test.ts
 *
 * Validates real-time event aggregation, event type filtering,
 * limit constraints, and activity pulse telemetry.
 */

import { TestSuite, SuiteResult } from "./test-utils";
import { GET } from "../../app/api/activity/route";
import { NextRequest } from "next/server";

export async function runActivityPulseTests(): Promise<SuiteResult> {
  const suite = new TestSuite("Live Campus Activity & Contribution Pulse API");
  suite.start();

  // --- 1. Default Pulse Fetch ---
  const defaultReq = new NextRequest("http://localhost:3000/api/activity");
  const defaultRes = await GET(defaultReq);
  suite.assertEqual(defaultRes.status, 200, "GET /api/activity returns 200 OK");

  const defaultData = await defaultRes.json();
  suite.assertEqual(defaultData.success, true, "Response reports success: true");
  suite.assert(Array.isArray(defaultData.events), "events is an array");
  suite.assert(defaultData.events.length >= 7, "Contains multiple campus activity events");
  suite.assertEqual(defaultData.events.length, defaultData.count, "Count matches events array length");
  suite.assert(defaultData.activeCountLast24h > 0, "Reports active contributors in last 24h");
  suite.assert(defaultData.recentMergesCount > 0, "Reports recent merges count");

  // Schema verification on first event
  const firstEvt = defaultData.events[0];
  suite.assert(Boolean(firstEvt.id), "Event has unique ID");
  suite.assert(Boolean(firstEvt.type), "Event has type identifier");
  suite.assert(Boolean(firstEvt.typeLabel), "Event has human-readable typeLabel");
  suite.assert(Boolean(firstEvt.title), "Event has non-empty title");
  suite.assert(Boolean(firstEvt.description), "Event has non-empty description");
  suite.assert(Boolean(firstEvt.username), "Event identifies student username");
  suite.assert(Boolean(firstEvt.timestamp), "Event has ISO timestamp");
  suite.assert(Boolean(firstEvt.relativeTime), "Event has relative time (e.g. 12m ago)");

  // --- 2. Filter: PR Merges ---
  const prReq = new NextRequest("http://localhost:3000/api/activity?type=pr");
  const prRes = await GET(prReq);
  suite.assertEqual(prRes.status, 200, "GET /api/activity?type=pr returns 200 OK");
  const prData = await prRes.json();
  suite.assert(prData.events.length > 0, "Returns PR merge events");
  suite.assert(
    prData.events.every((e: { type: string }) => e.type === "pr_merged" || e.type === "quality_pr"),
    "All filtered items are PR merges"
  );

  // --- 3. Filter: Quality Merges Only ---
  const qualityReq = new NextRequest("http://localhost:3000/api/activity?type=quality");
  const qualityRes = await GET(qualityReq);
  suite.assertEqual(qualityRes.status, 200, "GET /api/activity?type=quality returns 200 OK");
  const qualityData = await qualityRes.json();
  suite.assert(qualityData.events.length > 0, "Returns quality merge events");
  suite.assert(
    qualityData.events.every((e: { isQuality?: boolean }) => e.isQuality === true),
    "All filtered events are verified quality merges"
  );

  // --- 4. Filter: Swag Unlocked ---
  const swagReq = new NextRequest("http://localhost:3000/api/activity?type=swag");
  const swagRes = await GET(swagReq);
  suite.assertEqual(swagRes.status, 200, "GET /api/activity?type=swag returns 200 OK");
  const swagData = await swagRes.json();
  suite.assert(swagData.events.length > 0, "Returns swag unlock events");
  suite.assert(
    swagData.events.every((e: { type: string }) => e.type === "swag_claimed"),
    "All items match type swag_claimed"
  );

  // --- 5. Filter: First PRs ---
  const firstPrReq = new NextRequest("http://localhost:3000/api/activity?type=first_pr");
  const firstPrRes = await GET(firstPrReq);
  suite.assertEqual(firstPrRes.status, 200, "GET /api/activity?type=first_pr returns 200 OK");
  const firstPrData = await firstPrRes.json();
  suite.assert(firstPrData.events.length > 0, "Returns first PR events");
  suite.assert(
    firstPrData.events.every((e: { type: string }) => e.type === "first_pr"),
    "All items match type first_pr"
  );

  // --- 6. Custom Limit Param ---
  const limitReq = new NextRequest("http://localhost:3000/api/activity?limit=3");
  const limitRes = await GET(limitReq);
  suite.assertEqual(limitRes.status, 200, "GET /api/activity?limit=3 returns 200 OK");
  const limitData = await limitRes.json();
  suite.assertEqual(limitData.events.length, 3, "Output array length respects custom limit (3)");
  suite.assertEqual(limitData.count, 3, "Count property matches limit (3)");

  return suite.summary();
}

if (process.argv[1]?.endsWith("activity-pulse.test.ts")) {
  runActivityPulseTests().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
