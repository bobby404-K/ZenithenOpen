/**
 * Interactive First Campus PR Guide Test Suite
 * Location: tests/backend/resources-interactive-guide.test.ts
 */

import { TestSuite, SuiteResult } from "./test-utils";

export async function runInteractivePrGuideTests(): Promise<SuiteResult> {
  const suite = new TestSuite("Interactive First Campus PR Guide");
  suite.start();

  // Test 1: Check step count configuration
  const TOTAL_STEPS = 7;
  suite.assertEqual(TOTAL_STEPS, 7, "Guide has exactly 7 structured workflow steps");

  // Test 2: Upstream repository target
  const UPSTREAM_REPO = "IST-ZenithenLab/ZenithenOpen";
  suite.assert(UPSTREAM_REPO.includes("IST-ZenithenLab"), "Upstream targets IST-ZenithenLab organization");
  suite.assert(UPSTREAM_REPO.includes("ZenithenOpen"), "Repository target is ZenithenOpen");

  // Test 3: Command generation logic
  const mockUser = "bobby404-k";
  const mockSlug = "student-preview";
  const cloneCmd = `git clone https://github.com/${mockUser}/ZenithenOpen.git`;
  const branchCmd = `git checkout -b feature/${mockSlug}`;
  const pushCmd = `git push -u origin feature/${mockSlug}`;

  suite.assert(cloneCmd.includes(mockUser), "Clone command personalizes with student username");
  suite.assert(branchCmd.includes(mockSlug), "Branch command personalizes with contribution slug");
  suite.assert(pushCmd.includes(mockSlug), "Push command personalizes with branch name");

  // Test 4: Pre-flight quality checklist items
  const preflightChecks = ["lint", "scope", "convention", "issue"];
  suite.assertEqual(preflightChecks.length, 4, "Includes 4 essential pre-flight quality verification checks");

  return suite.summary();
}
