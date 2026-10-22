/**
 * Verified Proof-of-Work Resume API Test Suite
 * Location: tests/backend/resume-route.test.ts
 */

import { TestSuite, SuiteResult } from "./test-utils";
import { GET as getBase, POST as postBase } from "../../app/api/resume/route";
import { GET as getByUsername } from "../../app/api/resume/[username]/route";
import { NextRequest } from "next/server";

export async function runResumeRouteTests(): Promise<SuiteResult> {
  const suite = new TestSuite("Verified Resume & Proof-of-Work API (/api/resume)");
  suite.start();

  // --- 1. GET Default Baseline Resume (/api/resume) ---
  const defaultReq = new NextRequest("http://localhost:3000/api/resume");
  const defaultRes = await getBase(defaultReq);
  suite.assertEqual(defaultRes.status, 200, "GET /api/resume returns 200 OK");
  const defaultData = await defaultRes.json();
  suite.assertEqual(defaultData.success, true, "Response reports success: true");
  suite.assert(defaultData.profile && typeof defaultData.profile.fullName === "string", "Includes profile object");
  suite.assert(Array.isArray(defaultData.profile.skills?.languages), "Includes skills.languages array");
  suite.assert(Array.isArray(defaultData.profile.highlightedRepos), "Includes highlightedRepos array");
  suite.assert(defaultData.profile.education && typeof defaultData.profile.education.institution === "string", "Includes education details");

  // --- 2. GET Non-Existent Member Resume ---
  const notFoundReq = new NextRequest("http://localhost:3000/api/resume/non-existent-user-xyz-999");
  const notFoundRes = await getByUsername(notFoundReq, {
    params: Promise.resolve({ username: "non-existent-user-xyz-999" }),
  });
  suite.assertEqual(notFoundRes.status, 404, "GET non-existent member resume returns 404 Not Found");
  const notFoundData = await notFoundRes.json();
  suite.assertEqual(notFoundData.success, false, "Response reports success: false on 404");

  // --- 3. GET Verified Member Resume (bobby404-k) ---
  const memberReq = new NextRequest("http://localhost:3000/api/resume/bobby404-k");
  const memberRes = await getByUsername(memberReq, {
    params: Promise.resolve({ username: "bobby404-k" }),
  });
  suite.assertEqual(memberRes.status, 200, "GET /api/resume/[username] returns 200 OK");
  const memberData = await memberRes.json();
  suite.assertEqual(memberData.success, true, "Response reports success: true");
  suite.assertEqual(
    memberData.profile.githubUsername.toLowerCase(),
    "bobby404-k",
    "Profile githubUsername matches handle"
  );
  suite.assert(typeof memberData.markdown === "string" && memberData.markdown.length > 50, "Generates formatted Markdown export");
  suite.assert(memberData.profile.highlightedRepos.length > 0, "Includes verified highlightedRepos");

  const cacheHeader = memberRes.headers.get("X-Cache");
  suite.assert(
    cacheHeader === "HIT" || cacheHeader === "MISS",
    "Response includes X-Cache header (HIT or MISS)"
  );

  // --- 4. GET Markdown Format Query ---
  const mdReq = new NextRequest("http://localhost:3000/api/resume/bobby404-k?format=markdown");
  const mdRes = await getByUsername(mdReq, {
    params: Promise.resolve({ username: "bobby404-k" }),
  });
  suite.assertEqual(mdRes.status, 200, "GET ?format=markdown returns 200 OK");
  const mdData = await mdRes.json();
  suite.assertEqual(mdData.format, "markdown", "Format parameter confirmed as markdown");
  suite.assert(mdData.markdown.includes("## Technical Proficiencies"), "Markdown contains proficiencies section");
  suite.assert(mdData.markdown.includes("## Education"), "Markdown contains education section");

  // --- 5. POST Invalid Resume Data (Invalid Email) ---
  const invalidPost = new NextRequest("http://localhost:3000/api/resume", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: "Test User",
      email: "invalid-email-string",
    }),
  });
  const invalidRes = await postBase(invalidPost);
  suite.assertEqual(invalidRes.status, 400, "POST invalid resume data returns 400 Bad Request");
  const invalidData = await invalidRes.json();
  suite.assertEqual(invalidData.success, false, "Response reports success: false on validation error");

  // --- 6. POST Valid Customized Resume Profile ---
  const validPost = new NextRequest("http://localhost:3000/api/resume", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: "Bobby K",
      headline: "Open-Source Systems Engineer & Rust Hacker",
      email: "bobby404@ist.edu.in",
      location: "Bengaluru, India",
      githubUsername: "bobby404-k",
      summary: "Undergraduate systems developer passionate about kernel drivers, distributed consensus, and TypeScript.",
      skills: {
        languages: ["TypeScript", "Rust", "C++", "Go"],
        frameworks: ["Next.js", "React 19", "Node.js"],
        tools: ["Docker", "Linux", "Git"],
        databases: ["PostgreSQL", "Redis"],
      },
      education: {
        institution: "IST Bengaluru",
        degree: "Bachelor of Technology",
        field: "Computer Science & Engineering",
        graduationYear: "2026",
      },
      achievements: ["First PR Shipped", "Speed Demon Merge"],
    }),
  });
  const validRes = await postBase(validPost);
  suite.assertEqual(validRes.status, 200, "POST valid resume data returns 200 OK");
  const validData = await validRes.json();
  suite.assertEqual(validData.success, true, "Response reports success: true");
  suite.assertEqual(
    validData.profile.headline,
    "Open-Source Systems Engineer & Rust Hacker",
    "Headline persisted accurately"
  );

  return suite.summary();
}

if (process.argv[1]?.endsWith("resume-route.test.ts")) {
  runResumeRouteTests().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
