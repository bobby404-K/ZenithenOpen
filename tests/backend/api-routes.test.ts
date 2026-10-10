/**
 * Backend Unit Tests: Next.js API Route Handlers
 * Location: tests/backend/api-routes.test.ts
 *
 * Verifies:
 * 1. POST /api/auth/verify-usn:
 *    - 400 Bad Request when USN is missing or empty
 *    - 404 Not Found when USN belongs to non-IST institution
 *    - 200 OK with VerifiedStudent when valid IST USN is provided
 *    - 500 Internal Server Error when request payload is malformed
 * 2. GET /api/metrics:
 *    - 200 OK status
 *    - Valid JSON payload structure (success, data, cached, provider)
 *    - Cache-Control headers presence and correctness
 *    - Non-negative metric values in response
 */

import { NextRequest } from "next/server";
import { POST as verifyUsnHandler } from "../../app/api/auth/verify-usn/route";
import { GET as metricsHandler } from "../../app/api/metrics/route";
import { TestSuite, SuiteResult } from "./test-utils";

export async function runApiRoutesTests(): Promise<SuiteResult> {
  const suite = new TestSuite("API Route Handlers");
  suite.start();

  // ========================================================
  // 1. POST /api/auth/verify-usn
  // ========================================================

  // Case A: Missing USN field in body
  const missingReq = new NextRequest("http://localhost:3000/api/auth/verify-usn", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const missingRes = await verifyUsnHandler(missingReq);
  suite.assertEqual(missingRes.status, 400, "POST /api/auth/verify-usn returns 400 when USN is missing");
  const missingJson = await missingRes.json();
  suite.assertEqual(missingJson.valid, false, "Response body contains valid: false for missing USN");
  suite.assertEqual(missingJson.error, "USN is required", "Response error specifies 'USN is required'");

  // Case B: Non-IST USN (Rejected with 404)
  const nonIstReq = new NextRequest("http://localhost:3000/api/auth/verify-usn", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usn: "1RV23CS999" }),
  });
  const nonIstRes = await verifyUsnHandler(nonIstReq);
  suite.assertEqual(nonIstRes.status, 404, "POST /api/auth/verify-usn returns 404 for non-IST USN");
  const nonIstJson = await nonIstRes.json();
  suite.assertEqual(nonIstJson.valid, false, "Response body contains valid: false for rejected USN");
  suite.assert(
    typeof nonIstJson.error === "string" && nonIstJson.error.includes("Only students of IST"),
    "Response contains informative error message"
  );

  // Case C: Valid Authentic IST USN (200 OK)
  const validReq = new NextRequest("http://localhost:3000/api/auth/verify-usn", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usn: "1SV23CS042" }),
  });
  const validRes = await verifyUsnHandler(validReq);
  suite.assertEqual(validRes.status, 200, "POST /api/auth/verify-usn returns 200 for authentic IST USN");
  const validJson = await validRes.json();
  suite.assertEqual(validJson.valid, true, "Response body contains valid: true");
  suite.assertEqual(validJson.student?.usn, "1SV23CS042", "Returned student USN matches requested USN");
  suite.assertEqual(validJson.student?.department, "Computer Science & Engineering", "Returned student has correct department");
  suite.assertEqual(validJson.student?.college, "IST Bengaluru", "Returned student has college set to IST Bengaluru");
  suite.assert(Boolean(validJson.student?.verifiedAt), "Returned student has verifiedAt timestamp");

  // Case D: Malformed JSON payload (triggers 500 error catch block)
  const malformedReq = {
    json: async () => {
      throw new Error("SyntaxError: Unexpected token in JSON");
    },
  } as unknown as NextRequest;
  const malformedRes = await verifyUsnHandler(malformedReq);
  suite.assertEqual(malformedRes.status, 500, "POST /api/auth/verify-usn catches exception and returns 500");
  const malformedJson = await malformedRes.json();
  suite.assertEqual(malformedJson.valid, false, "Malformed response contains valid: false");
  suite.assertEqual(malformedJson.error, "Internal server error during verification", "Returns appropriate internal error message");

  // ========================================================
  // 2. GET /api/metrics
  // ========================================================
  const metricsRes = await metricsHandler();
  suite.assertEqual(metricsRes.status, 200, "GET /api/metrics returns 200 OK status");

  // Check Cache-Control header
  const cacheControl = metricsRes.headers.get("Cache-Control");
  suite.assert(
    Boolean(cacheControl && cacheControl.includes("public") && cacheControl.includes("s-maxage=300")),
    "GET /api/metrics includes proper Cache-Control caching header"
  );

  // Check JSON payload structure
  const metricsJson = await metricsRes.json();
  suite.assertEqual(metricsJson.success, true, "Payload contains success: true");
  suite.assertEqual(metricsJson.cached, true, "Payload contains cached: true flag");
  suite.assertEqual(metricsJson.provider, "redis", "Payload provider indicates 'redis'");

  // Check data properties
  const data = metricsJson.data;
  suite.assert(typeof data.totalMembers === "number" && data.totalMembers >= 0, "totalMembers is non-negative number");
  suite.assert(typeof data.totalContributors === "number" && data.totalContributors >= 0, "totalContributors is non-negative number");
  suite.assert(typeof data.prsMerged === "number" && data.prsMerged >= 0, "prsMerged is non-negative number");
  suite.assert(typeof data.activeRepositories === "number" && data.activeRepositories >= 0, "activeRepositories is non-negative number");
  suite.assert(Boolean(data.lastUpdated), "metrics data contains lastUpdated timestamp");

  return suite.summary();
}

if (process.argv[1]?.endsWith("api-routes.test.ts")) {
  runApiRoutesTests().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
