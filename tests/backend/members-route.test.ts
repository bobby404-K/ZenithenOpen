/**
 * Members Directory API Route Test Suite
 * Location: tests/backend/members-route.test.ts
 */

import { TestSuite, SuiteResult } from "./test-utils";
import { GET, POST } from "../../app/api/members/route";
import { NextRequest } from "next/server";

export async function runMembersRouteTests(): Promise<SuiteResult> {
  const suite = new TestSuite("Member Directory & Contributor Profiles API Route");
  suite.start();

  // --- 1. Query All Members Directory ---
  const allReq = new NextRequest("http://localhost:3000/api/members");
  const allRes = await GET(allReq);
  suite.assertEqual(allRes.status, 200, "GET /api/members returns 200 OK");

  const allData = await allRes.json();
  suite.assertEqual(allData.success, true, "Response reports success: true");
  suite.assert(Array.isArray(allData.members), "members is an array");
  suite.assert(typeof allData.count === "number", "count is a number");

  const cacheHeader = allRes.headers.get("X-Cache");
  suite.assert(
    cacheHeader === "HIT" || cacheHeader === "MISS",
    "Response includes X-Cache header (HIT or MISS)"
  );

  // --- 2. Query By Role Filter ---
  const roleReq = new NextRequest("http://localhost:3000/api/members?role=MEMBER");
  const roleRes = await GET(roleReq);
  suite.assertEqual(roleRes.status, 200, "GET ?role=MEMBER returns 200 OK");
  const roleData = await roleRes.json();
  suite.assertEqual(roleData.success, true, "Role filter query succeeds");

  // --- 3. Query By Search Query Filter ---
  const searchReq = new NextRequest("http://localhost:3000/api/members?search=Engineering");
  const searchRes = await GET(searchReq);
  suite.assertEqual(searchRes.status, 200, "GET ?search=Engineering returns 200 OK");
  const searchData = await searchRes.json();
  suite.assertEqual(searchData.success, true, "Search filter query succeeds");

  // --- 4. Validation on POST (Missing Email / Username) ---
  const invalidPost = new NextRequest("http://localhost:3000/api/members", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Incomplete Member" }),
  });
  const invalidRes = await POST(invalidPost);
  suite.assertEqual(invalidRes.status, 400, "POST missing email/username returns 400 Bad Request");
  const invalidData = await invalidRes.json();
  suite.assertEqual(invalidData.success, false, "Response reports success: false on validation error");

  // --- 5. Successful POST (Register / Update Student Profile) ---
  const validPost = new NextRequest("http://localhost:3000/api/members", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "test.student@ist.edu.in",
      githubUsername: "ist-student-coder",
      name: "IST Student Coder",
      department: "Computer Science & Engineering",
      yearOfStudy: "3rd Year",
      role: "MEMBER",
      bio: "Open source student developer at IST Bengaluru",
      skills: [
        { name: "TypeScript", category: "Frontend", level: "Advanced" },
        { name: "PostgreSQL", category: "Backend", level: "Intermediate" },
      ],
    }),
  });
  const validRes = await POST(validPost);
  suite.assertEqual(validRes.status, 201, "POST valid member returns 201 Created");
  const validData = await validRes.json();
  suite.assertEqual(validData.success, true, "Member registration succeeds");
  suite.assertEqual(validData.user.githubUsername, "ist-student-coder", "Username matches registered handle");

  return suite.summary();
}

if (process.argv[1]?.endsWith("members-route.test.ts")) {
  runMembersRouteTests().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
