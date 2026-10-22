/**
 * Member Profile Dynamic Controller Test Suite
 * Location: tests/backend/member-profile.test.ts
 */

import { TestSuite, SuiteResult } from "./test-utils";
import { GET, PATCH } from "../../app/api/members/[username]/route";
import { NextRequest } from "next/server";

export async function runMemberProfileTests(): Promise<SuiteResult> {
  const suite = new TestSuite("Member Profile Dynamic Controller (/api/members/[username])");
  suite.start();

  // --- 1. GET Non-Existent Member ---
  const notFoundReq = new NextRequest("http://localhost:3000/api/members/non-existent-user-xyz-998877");
  const notFoundRes = await GET(notFoundReq, {
    params: Promise.resolve({ username: "non-existent-user-xyz-998877" }),
  });
  suite.assertEqual(notFoundRes.status, 404, "GET non-existent username returns 404 Not Found");

  // --- 2. GET Existing Member (bobby404-k) ---
  const validReq = new NextRequest("http://localhost:3000/api/members/bobby404-k");
  const validRes = await GET(validReq, {
    params: Promise.resolve({ username: "bobby404-k" }),
  });
  suite.assertEqual(validRes.status, 200, "GET existing member returns 200 OK");
  const validData = await validRes.json();
  suite.assertEqual(validData.username.toLowerCase(), "bobby404-k", "Profile username matches requested handle");
  suite.assert(validData.stats && typeof validData.stats.mergedPrs === "number", "Includes computed contribution stats");
  suite.assert(Array.isArray(validData.recentContributions), "Includes recent contributions array");
  suite.assert(Array.isArray(validData.achievements), "Includes achievements array");

  // --- 3. PATCH Invalid Data (Invalid URL) ---
  const invalidPatchReq = new NextRequest("http://localhost:3000/api/members/bobby404-k", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ linkedinUrl: "not-a-valid-url" }),
  });
  const invalidPatchRes = await PATCH(invalidPatchReq, {
    params: Promise.resolve({ username: "bobby404-k" }),
  });
  suite.assertEqual(invalidPatchRes.status, 400, "PATCH with invalid URL returns 400 Bad Request");

  // --- 4. PATCH Valid Profile Update ---
  const validPatchReq = new NextRequest("http://localhost:3000/api/members/bobby404-k", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      bio: "Open source contributor & systems hacker at IST Bengaluru",
      department: "Computer Science & Engineering",
    }),
  });
  const validPatchRes = await PATCH(validPatchReq, {
    params: Promise.resolve({ username: "bobby404-k" }),
  });
  suite.assertEqual(validPatchRes.status, 200, "PATCH with valid profile updates returns 200 OK");
  const patchData = await validPatchRes.json();
  suite.assertEqual(patchData.success, true, "PATCH response confirms success: true");
  suite.assertEqual(patchData.user.bio, "Open source contributor & systems hacker at IST Bengaluru", "Bio is persisted accurately");

  return suite.summary();
}

if (process.argv[1]?.endsWith("member-profile.test.ts")) {
  runMemberProfileTests().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
