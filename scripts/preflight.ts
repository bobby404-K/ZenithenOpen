/**
 * ZenithenOpen — Production Preflight Verification CLI
 * Location: scripts/preflight.ts
 *
 * Automated diagnostic tool to verify environment variables, database connectivity,
 * Redis cache & rate-limiting, and GitHub API credentials prior to production deployment.
 *
 * Usage:
 *   npm run preflight
 *   npx tsx scripts/preflight.ts [--strict]
 */

// Load environment variables if available
if (typeof (process as unknown as { loadEnvFile?: (path?: string) => void }).loadEnvFile === "function") {
  try {
    (process as unknown as { loadEnvFile: (path?: string) => void }).loadEnvFile(".env");
  } catch {
    // Ignore if .env doesn't exist (e.g. running in container with injected env)
  }
}

import { prisma } from "../lib/db/prisma";
import { isDatabaseConfigured } from "../lib/db";
import { getRedisClient } from "../lib/redis/client";
import { getEnv, validateProductionEnv } from "../lib/env";
import packageJson from "../package.json";
import { GET as checkHealthProbe } from "../app/api/health/route";

interface CheckItem {
  name: string;
  category: "ENV" | "DATABASE" | "CACHE" | "GITHUB" | "HEALTH";
  status: "PASS" | "WARN" | "FAIL";
  message: string;
  latencyMs?: number;
}

const results: CheckItem[] = [];

function record(item: CheckItem) {
  results.push(item);
  const tag =
    item.status === "PASS"
      ? "\x1b[32m[PASS]\x1b[0m"
      : item.status === "WARN"
      ? "\x1b[33m[WARN]\x1b[0m"
      : "\x1b[31m[FAIL]\x1b[0m";
  const latency = item.latencyMs !== undefined ? ` \x1b[90m(${item.latencyMs}ms)\x1b[0m` : "";
  console.log(`  ${tag} \x1b[1m[${item.category}]\x1b[0m ${item.name}: ${item.message}${latency}`);
}

async function runPreflight() {
  const isStrict = process.argv.includes("--strict");
  const startTime = Date.now();

  console.log("\n╔══════════════════════════════════════════════════════════════════╗");
  console.log("║         ZENITHENOPEN PRODUCTION PREFLIGHT VERIFICATION           ║");
  console.log(`║         Version: v${packageJson.version.padEnd(10)} | Node: ${process.version.padEnd(20)}║`);
  console.log("╚══════════════════════════════════════════════════════════════════╝\n");

  // ---------------------------------------------------------------------------
  // 1. Environment Variables Check
  // ---------------------------------------------------------------------------
  console.log("\x1b[36m▶ 1. Validating Runtime Environment Variables...\x1b[0m");
  try {
    const env = getEnv();
    record({
      name: "Environment Schema",
      category: "ENV",
      status: "PASS",
      message: `Zod runtime validation passed (NODE_ENV: ${env.NODE_ENV})`,
    });

    const prodCheck = validateProductionEnv();
    if (prodCheck.isValid) {
      record({
        name: "Production Essentials",
        category: "ENV",
        status: "PASS",
        message: "All mandatory production environment variables are satisfied",
      });
    } else {
      record({
        name: "Production Essentials",
        category: "ENV",
        status: env.NODE_ENV === "production" ? "FAIL" : "WARN",
        message: `Missing variables for production: ${prodCheck.missingVariables.join(", ")}`,
      });
    }

    if (process.env.DATABASE_URL) {
      const isPostgres = process.env.DATABASE_URL.startsWith("postgres://") || process.env.DATABASE_URL.startsWith("postgresql://");
      record({
        name: "DATABASE_URL Format",
        category: "ENV",
        status: isPostgres ? "PASS" : "WARN",
        message: isPostgres ? "Valid PostgreSQL connection URI format" : "Non-standard database URI format",
      });
    } else {
      record({
        name: "DATABASE_URL Format",
        category: "ENV",
        status: "WARN",
        message: "DATABASE_URL not set; system will use in-memory mock datasets",
      });
    }

    if (process.env.AUTH_SECRET) {
      const isStrong = process.env.AUTH_SECRET.length >= 16;
      record({
        name: "AUTH_SECRET Entropy",
        category: "ENV",
        status: isStrong ? "PASS" : "WARN",
        message: isStrong ? "Secret length is adequate (>= 16 chars)" : "AUTH_SECRET is short (< 16 chars); recommend 32+ characters",
      });
    } else {
      record({
        name: "AUTH_SECRET Entropy",
        category: "ENV",
        status: "WARN",
        message: "AUTH_SECRET not configured; session tokens may use development fallback",
      });
    }
  } catch (err: unknown) {
    record({
      name: "Environment Schema",
      category: "ENV",
      status: "FAIL",
      message: err instanceof Error ? err.message : "Failed to parse environment variables",
    });
  }

  // ---------------------------------------------------------------------------
  // 2. Relational Database Health & Schema Connectivity
  // ---------------------------------------------------------------------------
  console.log("\n\x1b[36m▶ 2. Verifying Relational Database (Prisma / PostgreSQL)...\x1b[0m");
  if (isDatabaseConfigured()) {
    const dbStart = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      const dbLatency = Date.now() - dbStart;
      record({
        name: "Database Connection",
        category: "DATABASE",
        status: "PASS",
        message: "Successfully queried PostgreSQL database",
        latencyMs: dbLatency,
      });

      // Query core table counts
      try {
        const [usersCount, contributionsCount, projectsCount] = await Promise.all([
          prisma.user.count(),
          prisma.contribution.count(),
          prisma.project.count(),
        ]);
        record({
          name: "Database Schema Entities",
          category: "DATABASE",
          status: "PASS",
          message: `Active records verified: ${usersCount} users, ${contributionsCount} contributions, ${projectsCount} projects`,
        });
      } catch (countErr: unknown) {
        record({
          name: "Database Schema Entities",
          category: "DATABASE",
          status: "WARN",
          message: `Could not query table counts: ${countErr instanceof Error ? countErr.message : "Unknown schema query error"}`,
        });
      }
    } catch (err: unknown) {
      record({
        name: "Database Connection",
        category: "DATABASE",
        status: "FAIL",
        message: `Connection failed: ${err instanceof Error ? err.message : "Unknown error"}`,
        latencyMs: Date.now() - dbStart,
      });
    }
  } else {
    record({
      name: "Database Connection",
      category: "DATABASE",
      status: "WARN",
      message: "Database not configured. Platform operating in mock in-memory mode.",
    });
  }

  // ---------------------------------------------------------------------------
  // 3. Cache & Rate-Limiting Engine (Upstash Redis)
  // ---------------------------------------------------------------------------
  console.log("\n\x1b[36m▶ 3. Verifying In-Memory & Distributed Cache (Upstash Redis)...\x1b[0m");
  const redis = getRedisClient();
  if (redis) {
    const redisStart = Date.now();
    try {
      const pong = await redis.ping();
      const redisLatency = Date.now() - redisStart;
      record({
        name: "Redis Connectivity",
        category: "CACHE",
        status: "PASS",
        message: `Upstash Redis responded with '${pong}'`,
        latencyMs: redisLatency,
      });

      // Test temporary ephemeral key
      const testKey = "zenithen:preflight:probe";
      await redis.set(testKey, "healthy", { ex: 5 });
      const testVal = await redis.get<string>(testKey);
      if (testVal === "healthy") {
        record({
          name: "Redis Read/Write & Expiration",
          category: "CACHE",
          status: "PASS",
          message: "Set and read key with 5s TTL succeeded",
        });
      }
    } catch (err: unknown) {
      record({
        name: "Redis Connectivity",
        category: "CACHE",
        status: "WARN",
        message: `Redis ping failed; falling back to in-memory: ${err instanceof Error ? err.message : "Unknown"}`,
        latencyMs: Date.now() - redisStart,
      });
    }
  } else {
    record({
      name: "Redis Connectivity",
      category: "CACHE",
      status: "WARN",
      message: "Upstash Redis credentials not supplied; in-memory LRU cache fallback is active",
    });
  }

  // ---------------------------------------------------------------------------
  // 4. GitHub API Ingestion Headroom
  // ---------------------------------------------------------------------------
  console.log("\n\x1b[36m▶ 4. Checking GitHub API Headroom & Live Sync...\x1b[0m");
  const ghToken = process.env.GITHUB_TOKEN;
  try {
    const ghStart = Date.now();
    const headers: Record<string, string> = {
      "User-Agent": "ZenithenOpen-Production-Preflight",
      Accept: "application/vnd.github.v3+json",
    };
    if (ghToken) {
      headers.Authorization = `Bearer ${ghToken}`;
    }

    const ghRes = await fetch("https://api.github.com/rate_limit", { headers });
    const ghLatency = Date.now() - ghStart;

    if (ghRes.ok) {
      const ghData = (await ghRes.json()) as {
        resources?: { core?: { limit: number; remaining: number; reset: number } };
      };
      const core = ghData.resources?.core;
      if (core) {
        const resetDate = new Date(core.reset * 1000).toLocaleTimeString();
        if (ghToken) {
          record({
            name: "GitHub API Authenticated Quota",
            category: "GITHUB",
            status: core.remaining > 100 ? "PASS" : "WARN",
            message: `Authenticated limit: ${core.remaining}/${core.limit} calls remaining (resets at ${resetDate})`,
            latencyMs: ghLatency,
          });
        } else {
          record({
            name: "GitHub API Public Quota",
            category: "GITHUB",
            status: "WARN",
            message: `Unauthenticated rate limit: ${core.remaining}/${core.limit} calls remaining (set GITHUB_TOKEN for 5,000/hr)`,
            latencyMs: ghLatency,
          });
        }
      }
    } else {
      record({
        name: "GitHub API Quota Check",
        category: "GITHUB",
        status: "WARN",
        message: `Rate limit check returned HTTP ${ghRes.status}`,
        latencyMs: ghLatency,
      });
    }
  } catch (err: unknown) {
    record({
      name: "GitHub API Quota Check",
      category: "GITHUB",
      status: "WARN",
      message: `Could not reach GitHub API: ${err instanceof Error ? err.message : "Network error"}`,
    });
  }

  // ---------------------------------------------------------------------------
  // 5. Health Probe API Handler Verification
  // ---------------------------------------------------------------------------
  console.log("\n\x1b[36m▶ 5. Probing /api/health Self-Check Handler...\x1b[0m");
  try {
    const probeRes = await checkHealthProbe();
    const probeData = (await probeRes.json()) as {
      status: string;
      version: string;
      uptimeSeconds: number;
    };

    record({
      name: "Health Probe API",
      category: "HEALTH",
      status: probeRes.status === 200 ? "PASS" : "WARN",
      message: `Status: '${probeData.status}', Version: 'v${probeData.version}', HTTP: ${probeRes.status}`,
    });
  } catch (err: unknown) {
    record({
      name: "Health Probe API",
      category: "HEALTH",
      status: "FAIL",
      message: `Health handler threw exception: ${err instanceof Error ? err.message : "Unknown error"}`,
    });
  }

  // ---------------------------------------------------------------------------
  // Summary & Diagnostics Verdict
  // ---------------------------------------------------------------------------
  const totalElapsed = Date.now() - startTime;
  const passes = results.filter((r) => r.status === "PASS").length;
  const warnings = results.filter((r) => r.status === "WARN").length;
  const failures = results.filter((r) => r.status === "FAIL").length;

  console.log("\n══════════════════════════════════════════════════════════════════");
  console.log("                     PREFLIGHT SCORECARD");
  console.log("══════════════════════════════════════════════════════════════════");
  console.log(`  Total Checks Completed : ${results.length} in ${totalElapsed}ms`);
  console.log(`  Passed                 : \x1b[32m${passes}\x1b[0m`);
  console.log(`  Warnings               : \x1b[33m${warnings}\x1b[0m`);
  console.log(`  Failures               : \x1b[31m${failures}\x1b[0m`);
  console.log("──────────────────────────────────────────────────────────────────");

  if (failures > 0) {
    console.log("  \x1b[41m\x1b[37m VERDICT: DEPLOYMENT BLOCKED \x1b[0m — Resolve fatal failures above before deploying.");
    process.exit(1);
  } else if (isStrict && warnings > 0) {
    console.log("  \x1b[43m\x1b[30m VERDICT: STRICT CHECK FAILED \x1b[0m — Unresolved warnings present with --strict enabled.");
    process.exit(1);
  } else if (warnings > 0) {
    console.log("  \x1b[42m\x1b[30m VERDICT: READY WITH WARNINGS \x1b[0m — Core services operational; check warnings for optimal scale.");
    process.exit(0);
  } else {
    console.log("  \x1b[42m\x1b[30m VERDICT: ALL SYSTEMS OPERATIONAL \x1b[0m — Platform is fully primed for production deployment!");
    process.exit(0);
  }
}

runPreflight().catch((err) => {
  console.error("Fatal preflight runner error:", err);
  process.exit(1);
});
