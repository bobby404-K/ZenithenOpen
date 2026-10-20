/**
 * Production Database Seeder Test Suite
 * Location: tests/backend/db-seed.test.ts
 */

import { TestSuite, SuiteResult } from "./test-utils";
import { SEED_DATA, seedDatabase } from "../../scripts/seed-production";

export async function runDbSeedTests(): Promise<SuiteResult> {
  const suite = new TestSuite("Supabase Database Production Seeder Engine");
  suite.start();

  // --- 1. Blueprint Achievements Data Integrity ---
  suite.assert(Array.isArray(SEED_DATA.achievements), "Achievements blueprint is an array");
  suite.assert(SEED_DATA.achievements.length >= 4, "Includes at least 4 core achievement badges");

  const firstPrBadge = SEED_DATA.achievements.find((a) => a.code === "FIRST_PR");
  suite.assert(Boolean(firstPrBadge), "Includes FIRST_PR milestone achievement");
  suite.assert(firstPrBadge?.title === "First Step Forward", "FIRST_PR badge title matches specification");

  const qualityBadge = SEED_DATA.achievements.find((a) => a.code === "QUALITY_CONTRIBUTOR");
  suite.assert(Boolean(qualityBadge), "Includes QUALITY_CONTRIBUTOR achievement badge");

  // --- 2. Blueprint Projects Data Integrity ---
  suite.assert(Array.isArray(SEED_DATA.projects), "Projects blueprint is an array");
  suite.assert(SEED_DATA.projects.length >= 2, "Includes official verified campus projects (ZenithenOpen and First-PR)");

  const zenithenProj = SEED_DATA.projects.find((p) => p.slug === "zenithen-open");
  suite.assert(Boolean(zenithenProj), "Includes 'zenithen-open' foundational project");
  suite.assert(zenithenProj ? zenithenProj.starsCount >= 100 : false, "ZenithenOpen satisfies star threshold");
  suite.assert(zenithenProj ? zenithenProj.forksCount >= 100 : false, "ZenithenOpen satisfies fork threshold");
  suite.assert(zenithenProj ? Array.isArray(zenithenProj.tags) : false, "Project tags is an array");

  // --- 3. Blueprint Students Data Integrity ---
  suite.assert(Array.isArray(SEED_DATA.students), "Students blueprint is an array");
  suite.assert(SEED_DATA.students.length >= 3, "Includes at least 3 student profiles");

  for (const student of SEED_DATA.students) {
    suite.assert(
      student.email.endsWith("@ist.edu.in"),
      `Student ${student.name} possesses authentic IST institutional email: ${student.email}`
    );
    suite.assert(
      Boolean(student.githubUsername && !student.githubUsername.includes(" ")),
      `Student ${student.name} has valid GitHub username: ${student.githubUsername}`
    );
  }

  // --- 4. Blueprint Opportunities Data Integrity ---
  suite.assert(Array.isArray(SEED_DATA.opportunities), "Opportunities blueprint is an array");
  suite.assert(SEED_DATA.opportunities.length >= 3, "Includes starter issue opportunities");

  for (const opp of SEED_DATA.opportunities) {
    suite.assert(opp.issueNumber > 0, `Opportunity ${opp.title} has positive issue number`);
    suite.assert(
      Boolean(opp.difficulty),
      `Opportunity ${opp.title} has difficulty level assigned`
    );
  }

  // --- 5. Blueprint Learning Paths Data Integrity ---
  suite.assert(Array.isArray(SEED_DATA.learningPaths), "Learning paths blueprint is an array");
  suite.assert(SEED_DATA.learningPaths.length >= 4, "Includes at least 4 engineering learning roadmaps");
  const fullstackPath = SEED_DATA.learningPaths.find((lp) => lp.slug === "modern-fullstack-oss");
  suite.assert(Boolean(fullstackPath), "Includes 'modern-fullstack-oss' learning roadmap");
  suite.assert(fullstackPath ? fullstackPath.estimatedWeeks > 0 : false, "Learning roadmap has positive estimatedWeeks");
  suite.assert(fullstackPath ? Array.isArray(fullstackPath.targetSkills) : false, "Target skills is an array");

  // --- 6. seedDatabase Execution & Resilience ---
  const result = await seedDatabase();
  suite.assertEqual(result.success, true, "seedDatabase executes safely and returns success: true");
  suite.assert(
    typeof result.inserted === "object",
    "seedDatabase returns summary of inserted/verified records"
  );

  return suite.summary();
}

if (process.argv[1]?.endsWith("db-seed.test.ts")) {
  runDbSeedTests().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
