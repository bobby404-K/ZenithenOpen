/**
 * Projects GitHub Repo Metadata Lookup Test Suite
 * Location: tests/backend/projects-lookup.test.ts
 *
 * Validates GitHub repository parsing, metadata auto-sync, campus repo identification,
 * and caching behavior for the campus repository registration flow.
 */

import { TestSuite, SuiteResult } from "./test-utils";
import { GET, POST, parseGitHubRepo } from "../../app/api/projects/lookup/route";
import { NextRequest } from "next/server";

export async function runProjectsLookupTests(): Promise<SuiteResult> {
  const suite = new TestSuite("Projects GitHub Metadata Auto-Sync API");
  suite.start();

  // --- 1. Unit Tests for parseGitHubRepo Helper ---
  const valid1 = parseGitHubRepo("https://github.com/IST-ZenithenLab/ZenithenOpen");
  suite.assert(valid1 !== null, "Parses full HTTPS GitHub URL");
  suite.assertEqual(valid1?.owner, "IST-ZenithenLab", "Extracted owner matches IST-ZenithenLab");
  suite.assertEqual(valid1?.repo, "ZenithenOpen", "Extracted repo matches ZenithenOpen");

  const valid2 = parseGitHubRepo("http://github.com/IST-ZenithenLab/ZenithenCore.git");
  suite.assert(valid2 !== null, "Parses HTTP URL with .git extension");
  suite.assertEqual(valid2?.repo, "ZenithenCore", "Strips .git extension");

  const valid3 = parseGitHubRepo("github.com/IST-ZenithenLab/ZenithenVault/");
  suite.assert(valid3 !== null, "Parses URL with trailing slash and without protocol");
  suite.assertEqual(valid3?.repo, "ZenithenVault", "Strips trailing slash");

  const valid4 = parseGitHubRepo("IST-ZenithenLab/ZenithenOpen");
  suite.assert(valid4 !== null, "Parses owner/repo direct notation");
  suite.assertEqual(valid4?.owner, "IST-ZenithenLab", "Direct notation extracted owner");
  suite.assertEqual(valid4?.repo, "ZenithenOpen", "Direct notation extracted repo");

  const invalid1 = parseGitHubRepo("");
  suite.assertEqual(invalid1, null, "Empty string returns null");

  const invalid2 = parseGitHubRepo("random-invalid-string");
  suite.assertEqual(invalid2, null, "Invalid string returns null");

  // --- 2. Query Missing Parameters ---
  const emptyReq = new NextRequest("http://localhost:3000/api/projects/lookup");
  const emptyRes = await GET(emptyReq);
  suite.assertEqual(emptyRes.status, 400, "Missing repo param returns 400 Bad Request");

  const emptyData = await emptyRes.json();
  suite.assertEqual(emptyData.success, false, "Response reports success: false");

  // --- 3. Query Invalid Format ---
  const invalidReq = new NextRequest("http://localhost:3000/api/projects/lookup?repo=not-a-repo");
  const invalidRes = await GET(invalidReq);
  suite.assertEqual(invalidRes.status, 400, "Invalid repo format returns 400 Bad Request");

  // --- 4. Query Valid Campus Repo via GET ---
  const validReq = new NextRequest(
    "http://localhost:3000/api/projects/lookup?repo=IST-ZenithenLab/ZenithenOpen"
  );
  const validRes = await GET(validReq);
  suite.assertEqual(validRes.status, 200, "Valid repo lookup returns 200 OK");

  const validData = await validRes.json();
  suite.assertEqual(validData.success, true, "Lookup response reports success: true");
  suite.assert(typeof validData.metadata === "object" && validData.metadata !== null, "Returns metadata object");

  const meta = validData.metadata;
  suite.assert(typeof meta.name === "string" && meta.name.length > 0, "Metadata includes valid repository name");
  suite.assertEqual(meta.owner, "IST-ZenithenLab", "Owner is IST-ZenithenLab");
  suite.assert(typeof meta.starsCount === "number" && meta.starsCount >= 0, "starsCount is non-negative number");
  suite.assert(typeof meta.forksCount === "number" && meta.forksCount >= 0, "forksCount is non-negative number");
  suite.assert(typeof meta.primaryLanguage === "string", "primaryLanguage is string");
  suite.assert(Array.isArray(meta.topics), "topics is an array");
  suite.assertEqual(meta.isCampusRepo, true, "isCampusRepo is true for IST-ZenithenLab repo");

  // --- 5. Verify Caching Header ---
  const cacheHeader = validRes.headers.get("X-Cache");
  suite.assert(cacheHeader === "HIT" || cacheHeader === "MISS", "Returns X-Cache header");

  // --- 6. Query Valid Repo via POST ---
  const postReq = new NextRequest("http://localhost:3000/api/projects/lookup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repositoryUrl: "https://github.com/IST-ZenithenLab/ZenithenOpen" }),
  });
  const postRes = await POST(postReq);
  suite.assertEqual(postRes.status, 200, "POST lookup with repositoryUrl returns 200 OK");

  const postData = await postRes.json();
  suite.assertEqual(postData.success, true, "POST lookup reports success: true");
  suite.assertEqual(postData.metadata.owner, "IST-ZenithenLab", "POST extracted correct owner");

  return suite.summary();
}
