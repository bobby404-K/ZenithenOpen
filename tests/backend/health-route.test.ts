/**
 * Production Health Route & Environment Validation Test Suite
 * Location: tests/backend/health-route.test.ts
 */

import { TestSuite, SuiteResult } from "./test-utils";
import { GET } from "../../app/api/health/route";
import { getEnv, validateProductionEnv } from "../../lib/env";
import packageJson from "../../package.json";

export async function runHealthRouteTests(): Promise<SuiteResult> {
  const suite = new TestSuite("Production Health Probe & Environment Validator");
  suite.start();

  // --- 1. Query Health Check Probe ---
  const res = await GET();
  suite.assert(
    res.status === 200 || res.status === 503,
    "GET /api/health returns valid HTTP status (200 OK or 503 Degraded)"
  );

  const data = await res.json();
  suite.assert(
    data.status === "healthy" || data.status === "degraded",
    "Health status reports 'healthy' or 'degraded'"
  );
  suite.assertEqual(
    data.version,
    packageJson.version,
    `Version matches package.json (${packageJson.version})`
  );
  suite.assert(typeof data.uptimeSeconds === "number", "uptimeSeconds is a number");
  suite.assert(data.uptimeSeconds >= 0, "uptimeSeconds is non-negative");
  suite.assert(typeof data.latencyMs === "number", "latencyMs is recorded");
  suite.assert(typeof data.timestamp === "string", "timestamp is a string");
  suite.assert(!isNaN(Date.parse(data.timestamp)), "timestamp is valid ISO-8601");

  // --- 2. Cache-Control Header ---
  const cacheControl = res.headers.get("Cache-Control");
  suite.assert(
    Boolean(cacheControl && cacheControl.includes("no-store")),
    "Cache-Control contains no-store to prevent probe staleness"
  );

  // --- 3. Diagnostics Checks Structure ---
  suite.assert(typeof data.checks === "object" && data.checks !== null, "checks object is defined");
  suite.assert(Boolean(data.checks.database), "checks includes database status");
  suite.assert(Boolean(data.checks.cache), "checks includes cache status");

  // --- 4. Environment Validator Tests ---
  const env = getEnv();
  suite.assert(Boolean(env), "getEnv() successfully returns typed environment object");
  suite.assert(
    env.NODE_ENV === "development" || env.NODE_ENV === "production" || env.NODE_ENV === "test",
    "NODE_ENV is valid enum value"
  );

  const prodCheck = validateProductionEnv();
  suite.assert(typeof prodCheck.isValid === "boolean", "validateProductionEnv returns isValid boolean");
  suite.assert(Array.isArray(prodCheck.missingVariables), "missingVariables is an array");

  return suite.summary();
}
