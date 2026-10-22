/**
 * Project Deep-Dive Dynamic Controller Test Suite
 * Location: tests/backend/project-slug.test.ts
 */

import { TestSuite, SuiteResult } from "./test-utils";
import { GET, PATCH } from "../../app/api/projects/[slug]/route";
import { NextRequest } from "next/server";

export async function runProjectSlugTests(): Promise<SuiteResult> {
  const suite = new TestSuite("Project Deep-Dive Dynamic Controller (/api/projects/[slug])");
  suite.start();

  // --- 1. GET Non-Existent Project ---
  const notFoundReq = new NextRequest("http://localhost:3000/api/projects/non-existent-project-xyz-999");
  const notFoundRes = await GET(notFoundReq, {
    params: Promise.resolve({ slug: "non-existent-project-xyz-999" }),
  });
  suite.assertEqual(notFoundRes.status, 404, "GET non-existent project returns 404 Not Found");
  const notFoundData = await notFoundRes.json();
  suite.assertEqual(notFoundData.success, false, "Response reports success: false on 404");

  // --- 2. GET Verified Baseline Project (zenithen-open) ---
  const validReq = new NextRequest("http://localhost:3000/api/projects/zenithen-open");
  const validRes = await GET(validReq, {
    params: Promise.resolve({ slug: "zenithen-open" }),
  });
  suite.assertEqual(validRes.status, 200, "GET valid project slug returns 200 OK");
  const validData = await validRes.json();
  suite.assertEqual(validData.success, true, "Response reports success: true");
  suite.assertEqual(validData.project.slug.toLowerCase(), "zenithen-open", "Project slug matches requested handle");
  suite.assertEqual(validData.project.name, "ZenithenOpen", "Project name matches catalog registry");
  suite.assertEqual(validData.project.primaryLanguage, "TypeScript", "Primary language is TypeScript");
  suite.assert(validData.project.stats && typeof validData.project.stats.mergedPrs === "number", "Includes computed project stats");
  suite.assert(Array.isArray(validData.project.maintainers), "Includes maintainers array");
  suite.assert(Array.isArray(validData.project.topContributors), "Includes top contributors array");
  suite.assert(Array.isArray(validData.project.recentContributions), "Includes recent contributions array");
  suite.assert(Array.isArray(validData.project.opportunities), "Includes starter opportunities array");

  const cacheHeader = validRes.headers.get("X-Cache");
  suite.assert(
    cacheHeader === "HIT" || cacheHeader === "MISS",
    "Response includes X-Cache header (HIT or MISS)"
  );

  // --- 3. PATCH Invalid Data (Invalid URL) ---
  const invalidPatchReq = new NextRequest("http://localhost:3000/api/projects/zenithen-open", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repositoryUrl: "invalid-url-format" }),
  });
  const invalidPatchRes = await PATCH(invalidPatchReq, {
    params: Promise.resolve({ slug: "zenithen-open" }),
  });
  suite.assertEqual(invalidPatchRes.status, 400, "PATCH with invalid URL returns 400 Bad Request");
  const invalidPatchData = await invalidPatchRes.json();
  suite.assertEqual(invalidPatchData.success, false, "Response reports success: false on validation error");

  // --- 4. PATCH Non-Existent Project ---
  const notFoundPatchReq = new NextRequest("http://localhost:3000/api/projects/non-existent-xyz-888", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tagline: "New tagline" }),
  });
  const notFoundPatchRes = await PATCH(notFoundPatchReq, {
    params: Promise.resolve({ slug: "non-existent-xyz-888" }),
  });
  suite.assertEqual(notFoundPatchRes.status, 404, "PATCH non-existent project returns 404 Not Found");

  // --- 5. PATCH Valid Project Metadata Update ---
  const validPatchReq = new NextRequest("http://localhost:3000/api/projects/zenithen-open", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tagline: "Official campus open source developer platform at IST",
      isFeatured: true,
    }),
  });
  const validPatchRes = await PATCH(validPatchReq, {
    params: Promise.resolve({ slug: "zenithen-open" }),
  });
  suite.assertEqual(validPatchRes.status, 200, "PATCH valid project updates returns 200 OK");
  const patchData = await validPatchRes.json();
  suite.assertEqual(patchData.success, true, "PATCH response confirms success: true");
  suite.assertEqual(
    patchData.project.tagline,
    "Official campus open source developer platform at IST",
    "Tagline updated and persisted accurately"
  );

  return suite.summary();
}

if (process.argv[1]?.endsWith("project-slug.test.ts")) {
  runProjectSlugTests().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
