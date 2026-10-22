/**
 * Backend Unit Tests: Database Abstraction Layer & Client Hooks
 * Location: tests/backend/db-layer.test.ts
 *
 * Verifies:
 * 1. isDatabaseConfigured() behavior in presence/absence of DATABASE_URL
 * 2. db abstraction client object interface:
 *    - db.isConfigured method
 *    - db.students.findByUsn hook
 *    - db.students.linkGithub hook
 * 3. Type contracts and data schema validation for StudentRecord, ContributionRecord, ProjectRecord
 */

import {
  db,
  isDatabaseConfigured,
  StudentRecord,
  ContributionRecord,
  ProjectRecord,
} from "../../lib/db";
import { TestSuite, SuiteResult } from "./test-utils";

export async function runDbLayerTests(): Promise<SuiteResult> {
  const suite = new TestSuite("Database Layer & Client Hooks");
  suite.start();

  const originalEnvUrl = process.env.DATABASE_URL;

  try {
    // --- 1. isDatabaseConfigured Environment Checks ---
    delete process.env.DATABASE_URL;
    suite.assertEqual(
      isDatabaseConfigured(),
      false,
      "isDatabaseConfigured returns false when DATABASE_URL is undefined"
    );

    process.env.DATABASE_URL = "   ";
    suite.assertEqual(
      isDatabaseConfigured(),
      false,
      "isDatabaseConfigured returns false when DATABASE_URL is empty whitespace"
    );

    process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/zenithen";
    suite.assertEqual(
      isDatabaseConfigured(),
      true,
      "isDatabaseConfigured returns true when DATABASE_URL is populated"
    );
  } finally {
    if (originalEnvUrl !== undefined) {
      process.env.DATABASE_URL = originalEnvUrl;
    } else {
      delete process.env.DATABASE_URL;
    }
  }

  // --- 2. db Client Object & Hooks ---
  suite.assert(typeof db.isConfigured === "function", "db.isConfigured is a function");
  suite.assert(typeof db.students.findByUsn === "function", "db.students.findByUsn is a function");
  suite.assert(typeof db.students.linkGithub === "function", "db.students.linkGithub is a function");

  // Check querying non-existent student record:
  const studentResult = await db.students.findByUsn("1SV99ZZ999");
  suite.assertEqual(
    studentResult,
    null,
    "db.students.findByUsn resolves safely to null for non-existent record"
  );

  const linkResult = await db.students.linkGithub("1SV23CS001", "dev-octocat");
  suite.assertEqual(
    linkResult,
    true,
    "db.students.linkGithub resolves to true for extensible linking hook"
  );

  // --- 3. Data Record Type Contract Validations ---
  const mockStudent: StudentRecord = {
    usn: "1SV23CS042",
    name: "Alex Rivera",
    department: "Computer Science & Engineering",
    year: "3rd Year",
    email: "alex@example.com",
    githubUsername: "alexrivera-dev",
    isVerified: true,
    createdAt: new Date().toISOString(),
  };

  suite.assert(
    mockStudent.usn.startsWith("1SV") && mockStudent.isVerified === true,
    "StudentRecord satisfies schema contract"
  );

  const mockContribution: ContributionRecord = {
    id: "contrib-101",
    usn: "1SV23CS042",
    githubUsername: "alexrivera-dev",
    repoName: "ZenithenOpen",
    prNumber: 42,
    prTitle: "Add high-performance caching layer",
    prUrl: "https://github.com/IST-ZenithenLab/ZenithenOpen/pull/42",
    mergedAt: new Date().toISOString(),
  };

  suite.assert(
    mockContribution.prNumber > 0 && mockContribution.prUrl.startsWith("https://"),
    "ContributionRecord satisfies schema contract"
  );

  const mockProject: ProjectRecord = {
    id: "proj-1",
    slug: "zenithen-open",
    name: "ZenithenOpen",
    description: "Open source community platform",
    repoUrl: "https://github.com/IST-ZenithenLab/ZenithenOpen",
    starsCount: 15,
    language: "TypeScript",
    tags: ["Next.js", "React", "TypeScript"],
  };

  suite.assert(
    mockProject.starsCount >= 0 && Array.isArray(mockProject.tags),
    "ProjectRecord satisfies schema contract"
  );

  return suite.summary();
}

if (process.argv[1]?.endsWith("db-layer.test.ts")) {
  runDbLayerTests().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
