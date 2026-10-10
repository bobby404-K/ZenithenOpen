/**
 * Master Backend Test Runner
 * Location: tests/backend/run-all.ts
 *
 * Runs all backend test suites across:
 * 1. API Route Handlers (app/api/auth/verify-usn, app/api/metrics)
 * 2. Auth & Student USN Verification Service (lib/auth/usn-verification.ts)
 * 3. Database Abstraction Layer (lib/db/index.ts)
 * 4. Prisma Schema & Relational Models (prisma/schema.prisma)
 * 5. Data Contracts & State Integrity (lib/data/mock-data.ts, student-competition.ts)
 */

import { runAuthVerificationTests } from "./auth-verification.test";
import { runApiRoutesTests } from "./api-routes.test";
import { runDbLayerTests } from "./db-layer.test";
import { runPrismaSchemaTests } from "./prisma-schema.test";
import { runDataContractsTests } from "./data-contracts.test";
import { SuiteResult } from "./test-utils";

async function main() {
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║         ZENITHENOPEN BACKEND TEST SUITE RUNNER            ║");
  console.log("║         IST Bengaluru - Open Source Architecture           ║");
  console.log("╚════════════════════════════════════════════════════════════╝");

  const startTime = Date.now();
  const results: SuiteResult[] = [];

  try {
    results.push(await runAuthVerificationTests());
    results.push(await runApiRoutesTests());
    results.push(await runDbLayerTests());
    results.push(await runPrismaSchemaTests());
    results.push(await runDataContractsTests());
  } catch (error) {
    console.error("\n[FATAL ERROR IN TEST RUNNER]:", error);
    process.exit(1);
  }

  const durationMs = Date.now() - startTime;
  let totalPassed = 0;
  let totalFailed = 0;

  console.log("\n============================================================");
  console.log("                BACKEND TEST EXECUTION SUMMARY               ");
  console.log("============================================================");
  console.log("Suite Name                                 Passed   Failed");
  console.log("------------------------------------------------------------");

  for (const res of results) {
    totalPassed += res.passed;
    totalFailed += res.failed;
    const namePadded = res.name.padEnd(42, " ");
    const passedPadded = String(res.passed).padStart(6, " ");
    const failedPadded = String(res.failed).padStart(8, " ");
    console.log(`${namePadded}${passedPadded}${failedPadded}`);
  }

  console.log("------------------------------------------------------------");
  console.log(
    `TOTAL: ${totalPassed + totalFailed} tests executed in ${(durationMs / 1000).toFixed(2)}s | Passed: ${totalPassed} | Failed: ${totalFailed}`
  );
  console.log("============================================================\n");

  if (totalFailed > 0) {
    console.error("❌ Some backend tests failed.");
    process.exit(1);
  } else {
    console.log("✅ ALL BACKEND TEST SUITES PASSED SUCCESSFULLY!\n");
    process.exit(0);
  }
}

main();
