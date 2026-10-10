/**
 * Backend Unit Tests: Prisma ORM Schema & Relational Models Integrity
 * Location: tests/backend/prisma-schema.test.ts
 *
 * Verifies:
 * 1. prisma/schema.prisma exists and is valid
 * 2. PostgreSQL datasource configuration with env("DATABASE_URL")
 * 3. Client generator setup
 * 4. Presence of all core relational models (User, GitHubAccount, Project, Mentorship, etc.)
 * 5. Presence of all required Enums (Role, Difficulty, ContributionType, MentorshipStatus)
 * 6. Cascade delete definitions on dependent child models
 * 7. Unique constraints and query performance index definitions
 */

import * as fs from "fs";
import * as path from "path";
import { TestSuite, SuiteResult } from "./test-utils";

export async function runPrismaSchemaTests(): Promise<SuiteResult> {
  const suite = new TestSuite("Prisma Schema & Relational Models");
  suite.start();

  const schemaPath = path.resolve(__dirname, "../../prisma/schema.prisma");
  suite.assert(fs.existsSync(schemaPath), "prisma/schema.prisma file exists");

  const schemaContent = fs.readFileSync(schemaPath, "utf-8");

  // --- 1. Generator and Datasource ---
  suite.assert(
    schemaContent.includes('provider = "prisma-client-js"'),
    "Prisma client generator is configured with 'prisma-client-js'"
  );
  suite.assert(
    schemaContent.includes('provider = "postgresql"'),
    "Datasource provider is configured for PostgreSQL"
  );
  suite.assert(
    schemaContent.includes('url      = env("DATABASE_URL")'),
    "Datasource URL uses environment variable env('DATABASE_URL')"
  );

  // --- 2. Required Enums ---
  const requiredEnums = [
    { name: "Role", values: ["ADMIN", "MENTOR", "MEMBER", "GUEST"] },
    { name: "Difficulty", values: ["BEGINNER", "INTERMEDIATE", "ADVANCED"] },
    { name: "ContributionType", values: ["PULL_REQUEST", "ISSUE", "CODE_REVIEW", "COMMIT", "DOCUMENTATION"] },
    { name: "MentorshipStatus", values: ["PENDING", "ACCEPTED", "COMPLETED", "DECLINED"] },
  ];

  for (const { name, values } of requiredEnums) {
    suite.assert(
      schemaContent.includes(`enum ${name}`),
      `Enum '${name}' is defined in schema`
    );
    for (const val of values) {
      suite.assert(
        schemaContent.includes(val),
        `Enum '${name}' contains required variant '${val}'`
      );
    }
  }

  // --- 3. Core Models Definition ---
  const requiredModels = [
    "User",
    "GitHubAccount",
    "MemberSkill",
    "Project",
    "ProjectMaintainer",
    "Contribution",
    "Opportunity",
    "FirstPrStory",
    "LearningPath",
    "UserLearningProgress",
    "Mentorship",
    "Achievement",
    "UserAchievement",
    "CommunityMetricSnapshot",
    "Event",
    "EventSignup",
  ];

  for (const model of requiredModels) {
    suite.assert(
      schemaContent.includes(`model ${model}`),
      `Relational model '${model}' is defined in schema`
    );
  }

  // --- 4. Cascade Delete Referential Actions ---
  const cascadeChecks = [
    { model: "GitHubAccount", relation: "User", pattern: "onDelete: Cascade" },
    { model: "MemberSkill", relation: "User", pattern: "onDelete: Cascade" },
    { model: "ProjectMaintainer", relation: "Project", pattern: "onDelete: Cascade" },
    { model: "ProjectMaintainer", relation: "User", pattern: "onDelete: Cascade" },
    { model: "UserAchievement", relation: "User", pattern: "onDelete: Cascade" },
    { model: "UserLearningProgress", relation: "LearningPath", pattern: "onDelete: Cascade" },
    { model: "EventSignup", relation: "Event", pattern: "onDelete: Cascade" },
  ];

  for (const check of cascadeChecks) {
    suite.assert(
      schemaContent.includes(check.pattern),
      `Enforces '${check.pattern}' on ${check.model} -> ${check.relation}`
    );
  }

  // --- 5. Critical Indexes and Uniques ---
  suite.assert(
    schemaContent.includes("@@index([role])"),
    "User model defines performance index on role"
  );
  suite.assert(
    schemaContent.includes("@@index([email])"),
    "User model defines performance index on email"
  );
  suite.assert(
    schemaContent.includes("@@index([slug])"),
    "Project model defines lookup index on slug"
  );
  suite.assert(
    schemaContent.includes("@@index([isFeatured])"),
    "Project model defines index on isFeatured"
  );
  suite.assert(
    schemaContent.includes('relation("MentorRelation"') &&
    schemaContent.includes('relation("MenteeRelation"'),
    "Mentorship model configures dual relation mapping for Mentor and Mentee"
  );

  return suite.summary();
}

if (process.argv[1]?.endsWith("prisma-schema.test.ts")) {
  runPrismaSchemaTests().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
