/**
 * Production Deployment & Containerization Configuration Test Suite
 * Location: tests/backend/deployment-config.test.ts
 *
 * Validates Dockerfile, docker-compose.yml, .dockerignore, and vercel.json.
 */

import * as fs from "fs";
import * as path from "path";
import { TestSuite, SuiteResult } from "./test-utils";

export async function runDeploymentConfigTests(): Promise<SuiteResult> {
  const suite = new TestSuite("Production Deployment & Containerization Configuration");
  suite.start();

  const rootDir = path.resolve(__dirname, "../..");

  // ==========================================
  // 1. Dockerfile Validation
  // ==========================================
  const dockerfilePath = path.join(rootDir, "Dockerfile");
  const dockerfileExists = fs.existsSync(dockerfilePath);
  suite.assert(dockerfileExists, "Dockerfile exists in root directory");

  if (dockerfileExists) {
    const dockerfileContent = fs.readFileSync(dockerfilePath, "utf-8");

    suite.assert(
      dockerfileContent.includes("FROM node:20-alpine AS base"),
      "Dockerfile uses node:20-alpine as base image"
    );
    suite.assert(
      dockerfileContent.includes("FROM base AS deps"),
      "Dockerfile defines dependency installation stage (deps)"
    );
    suite.assert(
      dockerfileContent.includes("FROM base AS builder"),
      "Dockerfile defines application compilation stage (builder)"
    );
    suite.assert(
      dockerfileContent.includes("FROM base AS runner"),
      "Dockerfile defines minimal runtime stage (runner)"
    );
    suite.assert(
      dockerfileContent.includes("libc6-compat") && dockerfileContent.includes("curl"),
      "Dockerfile installs libc6-compat and curl utilities"
    );
    suite.assert(
      dockerfileContent.includes("npm ci"),
      "Dockerfile installs clean production-ready dependencies via npm ci"
    );
    suite.assert(
      dockerfileContent.includes("prisma generate"),
      "Dockerfile generates Prisma Client during build stage"
    );
    suite.assert(
      dockerfileContent.includes("npm run build"),
      "Dockerfile compiles Next.js bundle during build stage"
    );
    suite.assert(
      dockerfileContent.includes("adduser --system --uid 1001 nextjs"),
      "Dockerfile creates non-root system user nextjs (UID 1001)"
    );
    suite.assert(
      dockerfileContent.includes("USER nextjs"),
      "Dockerfile executes container as non-root user nextjs"
    );
    suite.assert(
      dockerfileContent.includes("EXPOSE 3000"),
      "Dockerfile exposes default application port 3000"
    );
    suite.assert(
      dockerfileContent.includes("HEALTHCHECK") && dockerfileContent.includes("/api/health"),
      "Dockerfile defines automated container HEALTHCHECK against /api/health"
    );
    suite.assert(
      dockerfileContent.includes('CMD ["npm", "start"]'),
      "Dockerfile defines default startup command via CMD"
    );
  }

  // ==========================================
  // 2. docker-compose.yml Validation
  // ==========================================
  const composePath = path.join(rootDir, "docker-compose.yml");
  const composeExists = fs.existsSync(composePath);
  suite.assert(composeExists, "docker-compose.yml exists in root directory");

  if (composeExists) {
    const composeContent = fs.readFileSync(composePath, "utf-8");

    suite.assert(
      composeContent.includes("services:"),
      "docker-compose.yml defines services block"
    );
    suite.assert(
      composeContent.includes("app:") && composeContent.includes("container_name: zenithen-open-app"),
      "docker-compose.yml defines app service for ZenithenOpen"
    );
    suite.assert(
      composeContent.includes("postgres:") && composeContent.includes("image: postgres:16-alpine"),
      "docker-compose.yml defines postgres service with PostgreSQL 16 Alpine"
    );
    suite.assert(
      composeContent.includes("redis:") && composeContent.includes("image: redis:7-alpine"),
      "docker-compose.yml defines redis service with Redis 7 Alpine"
    );
    suite.assert(
      composeContent.includes("pg_isready"),
      "docker-compose.yml defines postgres healthcheck via pg_isready"
    );
    suite.assert(
      composeContent.includes("redis-cli") && composeContent.includes("ping"),
      "docker-compose.yml defines redis healthcheck via redis-cli ping"
    );
    suite.assert(
      composeContent.includes("DATABASE_URL=") && composeContent.includes("REDIS_URL="),
      "docker-compose.yml provides DATABASE_URL and REDIS_URL environment variables"
    );
    suite.assert(
      composeContent.includes("3000:3000"),
      "docker-compose.yml maps port 3000 for host access"
    );
    suite.assert(
      composeContent.includes("zenithen-network:"),
      "docker-compose.yml defines unified bridge network zenithen-network"
    );
    suite.assert(
      composeContent.includes("postgres_data:") && composeContent.includes("redis_data:"),
      "docker-compose.yml defines persistent data volumes for postgres and redis"
    );
  }

  // ==========================================
  // 3. .dockerignore Validation
  // ==========================================
  const dockerignorePath = path.join(rootDir, ".dockerignore");
  const dockerignoreExists = fs.existsSync(dockerignorePath);
  suite.assert(dockerignoreExists, ".dockerignore exists in root directory");

  if (dockerignoreExists) {
    const dockerignoreContent = fs.readFileSync(dockerignorePath, "utf-8");

    suite.assert(
      dockerignoreContent.includes("node_modules"),
      ".dockerignore excludes node_modules from build context"
    );
    suite.assert(
      dockerignoreContent.includes(".next"),
      ".dockerignore excludes .next build cache from build context"
    );
    suite.assert(
      dockerignoreContent.includes(".git"),
      ".dockerignore excludes .git repository data from build context"
    );
    suite.assert(
      dockerignoreContent.includes(".env"),
      ".dockerignore excludes .env secrets from build context"
    );
    suite.assert(
      dockerignoreContent.includes("tests"),
      ".dockerignore excludes test files from container image"
    );
  }

  // ==========================================
  // 4. vercel.json Validation
  // ==========================================
  const vercelPath = path.join(rootDir, "vercel.json");
  const vercelExists = fs.existsSync(vercelPath);
  suite.assert(vercelExists, "vercel.json exists in root directory");

  if (vercelExists) {
    let vercelConfig: any = null;
    try {
      const vercelRaw = fs.readFileSync(vercelPath, "utf-8");
      vercelConfig = JSON.parse(vercelRaw);
      suite.assert(true, "vercel.json parses as valid JSON");
    } catch {
      suite.assert(false, "vercel.json parses as valid JSON");
    }

    if (vercelConfig) {
      suite.assertEqual(
        vercelConfig.framework,
        "nextjs",
        "vercel.json configures framework as nextjs"
      );
      suite.assert(
        Array.isArray(vercelConfig.headers) && vercelConfig.headers.length >= 2,
        "vercel.json defines deployment security and caching header rules"
      );

      const globalHeaders = vercelConfig.headers.find(
        (h: any) => h.source === "/(.*)"
      );
      suite.assert(
        !!globalHeaders && Array.isArray(globalHeaders.headers),
        "vercel.json defines global security header rules"
      );

      if (globalHeaders?.headers) {
        const headerKeys = globalHeaders.headers.map((h: any) => h.key);
        suite.assert(
          headerKeys.includes("X-Content-Type-Options"),
          "vercel.json includes X-Content-Type-Options header"
        );
        suite.assert(
          headerKeys.includes("X-Frame-Options"),
          "vercel.json includes X-Frame-Options header"
        );
        suite.assert(
          headerKeys.includes("Strict-Transport-Security"),
          "vercel.json includes Strict-Transport-Security header"
        );
        suite.assert(
          headerKeys.includes("Permissions-Policy"),
          "vercel.json includes Permissions-Policy header"
        );
      }

      const apiHeaders = vercelConfig.headers.find(
        (h: any) => h.source === "/api/(.*)"
      );
      suite.assert(
        !!apiHeaders && Array.isArray(apiHeaders.headers),
        "vercel.json defines API-specific no-store cache headers"
      );
    }
  }

  return {
    name: suite.name,
    passed: suite.passed,
    failed: suite.failed,
    failures: suite.failures,
  };
}

// Direct CLI execution
if (require.main === module) {
  runDeploymentConfigTests().then((res) => {
    if (res.failed > 0) process.exit(1);
    process.exit(0);
  });
}
