/**
 * Learning Paths & Progress Tracking API Route Test Suite
 * Location: tests/backend/learning-paths-route.test.ts
 */

import { NextRequest } from "next/server";
import { GET as getLearningPaths, POST as createLearningPath } from "../../app/api/learning-paths/route";
import { GET as getLearningPathById } from "../../app/api/learning-paths/[id]/route";
import { GET as getPathProgress, PUT as updatePathProgress } from "../../app/api/learning-paths/[id]/progress/route";
import { deleteCached } from "../../lib/redis/client";
import { TestSuite, SuiteResult } from "./test-utils";

function createMockRequest(url: string, method: string = "GET", body?: any): NextRequest {
  const init: any = { method };
  if (body) {
    init.body = JSON.stringify(body);
    init.headers = { "content-type": "application/json" };
  }
  return new NextRequest(new URL(url, "http://localhost:3000"), init);
}

export async function runLearningPathsRouteTests(): Promise<SuiteResult> {
  const suite = new TestSuite("Learning Paths & Progress Tracking API");
  suite.start();

  // Clear any existing cached test keys
  await deleteCached("learning-paths:*");

  // -------------------------------------------------------------
  // 1. GET /api/learning-paths - Default List
  // -------------------------------------------------------------
  try {
    const req = createMockRequest("/api/learning-paths");
    const res = await getLearningPaths(req);
    suite.assertEqual(res.status, 200, "GET /api/learning-paths returns HTTP 200");

    const data = await res.json();
    suite.assertEqual(data.success, true, "Response reports success: true");
    suite.assert(Array.isArray(data.paths), "Response includes paths array");
    suite.assert(data.paths.length >= 4, "Returns at least 4 learning roadmaps");

    const sample = data.paths[0];
    suite.assert(Boolean(sample?.slug), "Learning path contains slug");
    suite.assert(Boolean(sample?.title), "Learning path contains title");
    suite.assert(Boolean(sample?.level), "Learning path contains difficulty level");
    suite.assert(sample?.estimatedWeeks > 0, "Learning path has positive estimatedWeeks");
    suite.assert(Array.isArray(sample?.targetSkills), "Learning path has targetSkills array");
    suite.assert(Array.isArray(sample?.curriculum), "Learning path has curriculum array");
  } catch (err: any) {
    suite.assert(false, `GET /api/learning-paths failed: ${err.message}`);
  }

  // -------------------------------------------------------------
  // 2. GET /api/learning-paths - Level Filter
  // -------------------------------------------------------------
  try {
    const req = createMockRequest("/api/learning-paths?level=beginner");
    const res = await getLearningPaths(req);
    suite.assertEqual(res.status, 200, "GET /api/learning-paths?level=beginner returns HTTP 200");

    const data = await res.json();
    suite.assert(data.paths.length > 0, "Level beginner returns at least one path");
    const allBeginner = data.paths.every((p: any) => p.level.toLowerCase() === "beginner");
    suite.assert(allBeginner, "All returned paths are beginner difficulty");
  } catch (err: any) {
    suite.assert(false, `GET /api/learning-paths level filter failed: ${err.message}`);
  }

  // -------------------------------------------------------------
  // 3. GET /api/learning-paths - Search Filter
  // -------------------------------------------------------------
  try {
    const req = createMockRequest("/api/learning-paths?search=fullstack");
    const res = await getLearningPaths(req);
    suite.assertEqual(res.status, 200, "GET /api/learning-paths?search=fullstack returns HTTP 200");

    const data = await res.json();
    suite.assert(data.paths.length >= 1, "Search returns matching paths");
    const matchesKeyword = data.paths.some(
      (p: any) =>
        p.title.toLowerCase().includes("full-stack") ||
        p.slug.toLowerCase().includes("fullstack")
    );
    suite.assert(matchesKeyword, "Results match search keyword");
  } catch (err: any) {
    suite.assert(false, `GET /api/learning-paths search filter failed: ${err.message}`);
  }

  // -------------------------------------------------------------
  // 4. GET /api/learning-paths/[id] - Item Lookup
  // -------------------------------------------------------------
  try {
    // Lookup by slug
    const reqBySlug = createMockRequest("/api/learning-paths/modern-fullstack-oss");
    const resBySlug = await getLearningPathById(reqBySlug, {
      params: Promise.resolve({ id: "modern-fullstack-oss" }),
    });
    suite.assertEqual(resBySlug.status, 200, "GET /api/learning-paths/[id] by slug returns HTTP 200");

    const dataBySlug = await resBySlug.json();
    suite.assertEqual(dataBySlug.success, true, "Lookup by slug reports success: true");
    suite.assertEqual(dataBySlug.path.slug, "modern-fullstack-oss", "Resolved correct path slug");

    // Lookup non-existent
    const reqInvalid = createMockRequest("/api/learning-paths/non-existent-path-999");
    const resInvalid = await getLearningPathById(reqInvalid, {
      params: Promise.resolve({ id: "non-existent-path-999" }),
    });
    suite.assertEqual(resInvalid.status, 404, "Invalid path identifier returns HTTP 404");
  } catch (err: any) {
    suite.assert(false, `GET /api/learning-paths/[id] failed: ${err.message}`);
  }

  // -------------------------------------------------------------
  // 5. GET & PUT /api/learning-paths/[id]/progress
  // -------------------------------------------------------------
  try {
    // Missing params check
    const reqMissing = createMockRequest("/api/learning-paths/modern-fullstack-oss/progress");
    const resMissing = await getPathProgress(reqMissing, {
      params: Promise.resolve({ id: "modern-fullstack-oss" }),
    });
    suite.assertEqual(resMissing.status, 400, "GET progress without userId returns HTTP 400");

    // Fetch default unenrolled state
    const reqUnenrolled = createMockRequest(
      "/api/learning-paths/modern-fullstack-oss/progress?userId=student-test-123"
    );
    const resUnenrolled = await getPathProgress(reqUnenrolled, {
      params: Promise.resolve({ id: "modern-fullstack-oss" }),
    });
    suite.assertEqual(resUnenrolled.status, 200, "GET progress with userId returns HTTP 200");
    const unenrolledData = await resUnenrolled.json();
    suite.assert(unenrolledData.progress.currentWeek >= 1, "Default progress initializes currentWeek >= 1");

    // Record progress via PUT
    const reqPut = createMockRequest(
      "/api/learning-paths/modern-fullstack-oss/progress",
      "PUT",
      {
        userId: "bobby404-k",
        currentWeek: 3,
        completedWeeks: [1, 2],
        isCompleted: false,
      }
    );
    const resPut = await updatePathProgress(reqPut, {
      params: Promise.resolve({ id: "modern-fullstack-oss" }),
    });
    suite.assertEqual(resPut.status, 200, "PUT progress returns HTTP 200");
    const putData = await resPut.json();
    suite.assertEqual(putData.success, true, "PUT progress reports success: true");
    suite.assertEqual(putData.progress.currentWeek, 3, "PUT progress saved currentWeek: 3");
    suite.assert(
      Array.isArray(putData.progress.completedWeeks) && putData.progress.completedWeeks.includes(1),
      "PUT progress saved completedWeeks"
    );
  } catch (err: any) {
    suite.assert(false, `Progress route failed: ${err.message}`);
  }

  // -------------------------------------------------------------
  // 6. POST /api/learning-paths - Create / Upsert
  // -------------------------------------------------------------
  try {
    // Missing slug/title rejection
    const reqInvalidPost = createMockRequest("/api/learning-paths", "POST", {});
    const resInvalidPost = await createLearningPath(reqInvalidPost);
    suite.assertEqual(resInvalidPost.status, 400, "POST without slug/title returns HTTP 400");

    // Valid path creation
    const reqValidPost = createMockRequest("/api/learning-paths", "POST", {
      slug: "systems-rust-oss",
      title: "Rust Systems Programming & OS Kernel",
      description: "Low-level concurrency, memory safety, and kernel modules.",
      level: "ADVANCED",
      estimatedWeeks: 10,
      iconName: "Terminal",
      color: "#ef4444",
      targetSkills: ["Rust", "Systems", "Linux Kernel", "Concurrency"],
      curriculum: [
        {
          weekNumber: 1,
          title: "Ownership & Borrow Checker",
          summary: "Zero-cost abstractions and safe memory management.",
          milestoneProject: "Build a multithreaded HTTP parser.",
        },
      ],
    });
    const resValidPost = await createLearningPath(reqValidPost);
    suite.assertEqual(resValidPost.status, 201, "POST valid learning path returns HTTP 201");
    const validData = await resValidPost.json();
    suite.assertEqual(validData.success, true, "POST reports success: true");
    suite.assertEqual(validData.path.slug, "systems-rust-oss", "Path created with correct slug");
  } catch (err: any) {
    suite.assert(false, `POST /api/learning-paths failed: ${err.message}`);
  }

  return {
    name: suite.name,
    passed: suite.passed,
    failed: suite.failed,
    failures: suite.failures,
  };
}

if (require.main === module) {
  runLearningPathsRouteTests().then((res) => {
    if (res.failed > 0) process.exit(1);
    process.exit(0);
  });
}
