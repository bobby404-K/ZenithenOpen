/**
 * Peer Mentorship Connection API Test Suite
 * Location: tests/backend/mentorship-route.test.ts
 */

import { TestSuite, SuiteResult } from "./test-utils";
import { GET, POST, PATCH } from "../../app/api/mentorship/requests/route";
import { NextRequest } from "next/server";

export async function runMentorshipRouteTests(): Promise<SuiteResult> {
  const suite = new TestSuite("Peer Mentorship Connection API (/api/mentorship/requests)");
  suite.start();

  // --- 1. GET Mentorship Requests List ---
  const listReq = new NextRequest("http://localhost:3000/api/mentorship/requests");
  const listRes = await GET(listReq);
  suite.assertEqual(listRes.status, 200, "GET /api/mentorship/requests returns 200 OK");
  const listData = await listRes.json();
  suite.assertEqual(listData.success, true, "Response reports success: true");
  suite.assert(typeof listData.total === "number", "Total count is a number");
  suite.assert(Array.isArray(listData.requests), "Requests is an array");
  suite.assert(listData.requests.length > 0, "Returns mentorship requests");

  const firstReq = listData.requests[0];
  suite.assert(typeof firstReq.id === "string", "Request includes id");
  suite.assert(typeof firstReq.mentorUsername === "string", "Request includes mentorUsername");
  suite.assert(typeof firstReq.menteeName === "string", "Request includes menteeName");
  suite.assert(typeof firstReq.topic === "string", "Request includes topic");
  suite.assert(typeof firstReq.status === "string", "Request includes status");

  const cacheHeader = listRes.headers.get("X-Cache");
  suite.assert(
    cacheHeader === "HIT" || cacheHeader === "MISS",
    "Response includes X-Cache header (HIT or MISS)"
  );

  // --- 2. GET Filtered by Status ---
  const statusReq = new NextRequest("http://localhost:3000/api/mentorship/requests?status=Accepted");
  const statusRes = await GET(statusReq);
  suite.assertEqual(statusRes.status, 200, "GET ?status=Accepted returns 200 OK");
  const statusData = await statusRes.json();
  suite.assert(
    statusData.requests.every((r: any) => r.status.toLowerCase() === "accepted"),
    "All filtered records match status 'Accepted'"
  );

  // --- 3. GET Filtered by Topic ---
  const topicReq = new NextRequest("http://localhost:3000/api/mentorship/requests?topic=gsoc");
  const topicRes = await GET(topicReq);
  suite.assertEqual(topicRes.status, 200, "GET ?topic=gsoc returns 200 OK");
  const topicData = await topicRes.json();
  suite.assert(
    topicData.requests.every((r: any) => r.topic.toLowerCase().includes("gsoc")),
    "All filtered records contain 'gsoc' in topic"
  );

  // --- 4. POST Validation Failure (Invalid / Missing Fields) ---
  const invalidReq = new NextRequest("http://localhost:3000/api/mentorship/requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      menteeName: "R", // too short
      menteeEmail: "invalid-email",
    }),
  });
  const invalidRes = await POST(invalidReq);
  suite.assertEqual(invalidRes.status, 400, "POST invalid payload returns 400 Bad Request");
  const invalidData = await invalidRes.json();
  suite.assertEqual(invalidData.success, false, "Response reports success: false on validation error");
  suite.assert(invalidData.issues, "Response includes Zod validation issues");

  // --- 5. POST Valid Mentorship Request ---
  const validReq = new NextRequest("http://localhost:3000/api/mentorship/requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      menteeName: "Arjun Nair",
      menteeEmail: "arjun.nair@ist.edu.in",
      menteeUsername: "arjun-nair",
      mentorUsername: "alex-chen",
      topic: "Google Summer of Code (GSoC)",
      message: "Looking for advice on proposal drafting and contributing to cloud native projects.",
    }),
  });
  const validRes = await POST(validReq);
  suite.assertEqual(validRes.status, 201, "POST valid request returns 201 Created");
  const validData = await validRes.json();
  suite.assertEqual(validData.success, true, "Response reports success: true on creation");
  suite.assert(validData.request && typeof validData.request.id === "string", "Returns created request with ID");
  suite.assertEqual(validData.request.menteeName, "Arjun Nair", "Mentee name persisted accurately");
  suite.assertEqual(validData.request.status, "Pending", "New request initialized with Pending status");

  const createdId = validData.request.id;

  // --- 6. PATCH Validation Failure ---
  const patchInvalidReq = new NextRequest("http://localhost:3000/api/mentorship/requests", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: createdId,
      status: "INVALID_STATUS_VALUE",
    }),
  });
  const patchInvalidRes = await PATCH(patchInvalidReq);
  suite.assertEqual(patchInvalidRes.status, 400, "PATCH invalid status returns 400 Bad Request");

  // --- 7. PATCH Status Update (PENDING -> ACCEPTED) ---
  const patchReq = new NextRequest("http://localhost:3000/api/mentorship/requests", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: createdId,
      status: "ACCEPTED",
    }),
  });
  const patchRes = await PATCH(patchReq);
  suite.assertEqual(patchRes.status, 200, "PATCH valid status update returns 200 OK");
  const patchData = await patchRes.json();
  suite.assertEqual(patchData.success, true, "Response reports success: true on status update");
  suite.assertEqual(patchData.request.status, "Accepted", "Request status transitioned to Accepted");

  // --- 8. PATCH Non-Existent Record ---
  const nonExistentPatchReq = new NextRequest("http://localhost:3000/api/mentorship/requests", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: "non-existent-request-id-9999",
      status: "DECLINED",
    }),
  });
  const nonExistentPatchRes = await PATCH(nonExistentPatchReq);
  suite.assertEqual(nonExistentPatchRes.status, 404, "PATCH non-existent record returns 404 Not Found");

  return suite.summary();
}

if (process.argv[1]?.endsWith("mentorship-route.test.ts")) {
  runMentorshipRouteTests().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
