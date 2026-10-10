# ZenithenOpen Backend Test Suite

This directory contains automated tests for all backend areas of the **ZenithenOpen** platform (IST Bengaluru).

## Architecture & Coverage

| Suite File | Target Backend Area | Tests | Description |
|---|---|:---:|---|
| [`auth-verification.test.ts`](file:///c:/Users/BITTU/.gemini/antigravity-ide/scratch/ZenithenOpen/tests/backend/auth-verification.test.ts) | `lib/auth/usn-verification.ts` | 39 | Validates IST USN formats (`1SV...`, `SV...`), case-insensitivity, 10+ branch codes, study year clamping, error states, and DB hook fallback. |
| [`api-routes.test.ts`](file:///c:/Users/BITTU/.gemini/antigravity-ide/scratch/ZenithenOpen/tests/backend/api-routes.test.ts) | `app/api/*` | 25 | Tests Next.js App Router API handlers (`POST /api/auth/verify-usn`, `GET /api/metrics`), HTTP status codes (200, 400, 404, 500), JSON schemas, and Cache-Control headers. |
| [`db-layer.test.ts`](file:///c:/Users/BITTU/.gemini/antigravity-ide/scratch/ZenithenOpen/tests/backend/db-layer.test.ts) | `lib/db/index.ts` | 11 | Tests database configuration detection (`DATABASE_URL`), standalone mode safety, student querying/linking hooks, and data type contracts. |
| [`prisma-schema.test.ts`](file:///c:/Users/BITTU/.gemini/antigravity-ide/scratch/ZenithenOpen/tests/backend/prisma-schema.test.ts) | `prisma/schema.prisma` | 52 | Verifies PostgreSQL datasource, client generator, 16 relational models, 4 Enums, `onDelete: Cascade` rules, and query indexes. |
| [`data-contracts.test.ts`](file:///c:/Users/BITTU/.gemini/antigravity-ide/scratch/ZenithenOpen/tests/backend/data-contracts.test.ts) | `lib/data/*` | 91 | Verifies community metrics non-negative bounds, zero fake member profiles policy, repository URLs, opportunities, and multi-timeframe student competition contracts. |

**Total:** 218 automated backend test cases.

---

## How to Run

### Run All Backend Suites
```bash
npm run test:backend
```
or directly with `tsx`:
```bash
npx tsx tests/backend/run-all.ts
```

### Run Individual Test Suites
```bash
# Auth & USN Verification Service
npx tsx tests/backend/auth-verification.test.ts

# API Route Handlers
npx tsx tests/backend/api-routes.test.ts

# Database Layer
npx tsx tests/backend/db-layer.test.ts

# Prisma Schema Integrity
npx tsx tests/backend/prisma-schema.test.ts

# Data Contracts
npx tsx tests/backend/data-contracts.test.ts
```
