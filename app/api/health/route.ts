import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { isDatabaseConfigured } from "@/lib/db";
import { getRedisClient } from "@/lib/redis/client";
import packageJson from "@/package.json";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  const checks: Record<string, { status: string; latencyMs?: number; error?: string }> = {};

  // 1. Check Database Connectivity
  if (isDatabaseConfigured()) {
    const dbStart = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = {
        status: "up",
        latencyMs: Date.now() - dbStart,
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Database connection failed";
      checks.database = {
        status: "degraded",
        latencyMs: Date.now() - dbStart,
        error: errorMessage,
      };
    }
  } else {
    checks.database = {
      status: "unconfigured",
      error: "DATABASE_URL not set (mock/memory mode active)",
    };
  }

  // 2. Check Redis / In-Memory Cache
  const redisClient = getRedisClient();
  if (redisClient) {
    const redisStart = Date.now();
    try {
      await redisClient.ping();
      checks.cache = {
        status: "up",
        latencyMs: Date.now() - redisStart,
      };
    } catch (err: unknown) {
      checks.cache = {
        status: "fallback_memory",
        latencyMs: Date.now() - redisStart,
        error: err instanceof Error ? err.message : "Redis ping failed",
      };
    }
  } else {
    checks.cache = {
      status: "in_memory_fallback",
    };
  }

  // 3. Process Health
  const totalLatencyMs = Date.now() - startTime;
  const isHealthy =
    checks.database.status !== "down" &&
    checks.database.status !== "degraded";

  const payload = {
    status: isHealthy ? "healthy" : "degraded",
    version: packageJson.version,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    latencyMs: totalLatencyMs,
    environment: process.env.NODE_ENV ?? "development",
    checks,
  };

  return NextResponse.json(payload, {
    status: isHealthy ? 200 : 503,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
