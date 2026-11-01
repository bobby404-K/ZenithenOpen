# ZenithenOpen Backend Automated Test Suite

**Location:** `tests/backend/`  
**Test Runner:** `tests/backend/run-all.ts`  
**Total Active Suites:** 32 Suites  
**Total Assertions:** 985+ Automated Checks  
**TypeScript Typecheck Status:** 0 Compilation Errors (`tsc --noEmit`)

---

## 🏗️ Architecture & Philosophy

The ZenithenOpen test architecture is engineered to validate:
1. **API Route Handlers**: HTTP status codes (200, 201, 400, 404, 409, 500), payload structures, caching headers, and Zod input validations.
2. **Domain Isolation**: Resilient fallback execution when remote database or Redis instances are offline.
3. **Data Integrity & Zero Fake Data**: Enforcing non-negative metrics, authentic zero-states, and 5-tier contributor ranking hierarchy.
4. **Security & Deployment Configurations**: Validating Docker container files, Vercel edge headers, and environment schema constraints.

---

## 📋 Comprehensive Suite Coverage (32 Suites)

| # | Test Suite File | Backend Target Area | Checks | Description |
|:---:|:---|:---|:---:|:---|
| 1 | `auth-verification.test.ts` | `lib/auth/usn-verification.ts` | 39 | IST USN formats (`1SV...`, `SV...`), department decoding, study year inference, and error handling. |
| 2 | `api-routes.test.ts` | `app/api/*` | 46 | Core route handlers (`verify-usn`, `metrics`), HTTP status codes, JSON schemas, Cache-Control headers. |
| 3 | `db-layer.test.ts` | `lib/db/index.ts` | 11 | DB environment detection, standalone mode safety, student querying and linking hooks. |
| 4 | `prisma-schema.test.ts` | `prisma/schema.prisma` | 52 | Relational schema integrity: 16 models, enums, cascade delete rules, foreign keys, and indexes. |
| 5 | `data-contracts.test.ts` | `lib/data/*` | 126 | Zero fake profile enforcement, metrics non-negative bounds, student competition data models. |
| 6 | `redis-cache.test.ts` | `lib/redis/client.ts` | 14 | Upstash Redis KV operations, in-memory resilient fallback, and distributed rate-limiting tokens. |
| 7 | `github-sync.test.ts` | `lib/github/sync.ts` | 15 | Quality PR rules ($\ge$ 100 stars and $\ge$ 100 forks), point calculations, and Octokit requests. |
| 8 | `leaderboard-route.test.ts` | `app/api/students/leaderboard` | 18 | 5-tier ranking hierarchy, timeframe queries (`week`, `month`, `overall`), and rank badges. |
| 9 | `contributions-route.test.ts` | `app/api/contributions` | 11 | Pull request querying, status filters (`OPEN`, `MERGED`, `CLOSED`), and quality PR flags. |
| 10 | `members-route.test.ts` | `app/api/members` | 14 | Member directory querying, contributor profile search, and registration. |
| 11 | `projects-route.test.ts` | `app/api/projects` | 17 | Repository catalog listing, language filtering, search queries, and project registration. |
| 12 | `project-slug.test.ts` | `app/api/projects/[slug]` | 19 | Dynamic project deep-dives, computed stats, maintainers, top contributors, and PATCH updates. |
| 13 | `opportunities-route.test.ts` | `app/api/opportunities` | 17 | Good-first-issues board, difficulty filtering (`beginner`, `intermediate`, `advanced`), and search. |
| 14 | `achievements-route.test.ts` | `app/api/achievements` | 17 | Hall of fame badges, milestone categories, First PR stories, and unlock records. |
| 15 | `health-route.test.ts` | `app/api/health` | 16 | Production uptime probe, version matching, latency measurements, and environment checks. |
| 16 | `github-webhook.test.ts` | `app/api/github/webhook` | 11 | GitHub real-time webhook endpoint, HMAC SHA256 validation, and campus PR event processing. |
| 17 | `member-profile.test.ts` | `app/api/members/[username]` | 10 | Dynamic contributor profile controller, stats resolution, achievements, and PATCH bio updates. |
| 18 | `github-sync-route.test.ts` | `app/api/github/sync` | 28 | Sync route scopes (`all`, `members`, `projects`, `issues`), telemetry stats, and rate-limit guard. |
| 19 | `db-seed.test.ts` | `scripts/seed-production.ts` | 38 | Database production seeder engine, student records, blueprints, and resilient DB execution. |
| 20 | `deployment-config.test.ts` | Docker & Vercel configs | 41 | Multi-stage Dockerfile, docker-compose services/healthchecks, .dockerignore, and vercel.json headers. |
| 21 | `learning-paths-route.test.ts` | `app/api/learning-paths` | 31 | Curriculum progression, roadmaps by slug, progress tracking (PUT/GET), and week completion. |
| 22 | `showcase-pages.test.ts` | Showcase architectures | 32 | Dynamic project and member showcase routing, case-insensitive lookups, and 404 boundaries. |
| 23 | `campus-projects-leaderboard.test.ts` | `app/api/projects/leaderboard` | 35 | Campus-only merge evaluation, tie-breaking heuristics, and sequence validation. |
| 24 | `student-preview-modal.test.ts` | `components/members/preview` | 22 | Quick-preview modal data contracts across Leaderboard, Projects, and Member profile feeds. |
| 25 | `projects-lookup.test.ts` | `app/api/projects/sync` | 29 | GitHub metadata auto-sync, URL parsing (`.git`, protocols, trailing slashes), and cache headers. |
| 26 | `resources-interactive-guide.test.ts` | `app/resources` Guide | 7 | Interactive First PR Guide 7-step structure, personalized branch commands, and preflight steps. |
| 27 | `command-search.test.ts` | `app/api/search` | 53 | Global Command Palette search, multi-category index (`All`, `Pages`, `Projects`, `Contributors`). |
| 28 | `events-hub.test.ts` | `app/api/events` | 50 | Campus workshops, category filters, RSVP capacity, duplicate prevention, and .ics/Google Calendar. |
| 29 | `community-swag.test.ts` | `app/api/community/swag` | 38 | Swag rewards engine, 4 tiers, PR eligibility thresholds, voucher generation, and double-claim guard. |
| 30 | `activity-pulse.test.ts` | `app/api/activity` | 30 | Live campus activity feed, 24h contributor counts, event type filtering (`pr`, `quality`, `swag`). |
| 31 | `resources-articles.test.ts` | `app/api/resources/articles` | 47 | Technical article documentation hub, slug lookups, markdown content validation, and difficulty tags. |
| 32 | `notifications-service.test.ts` | `lib/notifications/*`, `app/api/notifications/broadcast` | 51 | Discord Webhook Rich Embeds, Telegram HTML messages, multi-channel dispatcher, and broadcast probe. |

---

## 🚀 How to Execute Tests

### Run All 32 Backend Suites
```bash
npm test
```
*or:*
```bash
npm run test:backend
```

### Run an Individual Suite
```bash
# Student Leaderboard & Competition Route
npx tsx tests/backend/leaderboard-route.test.ts

# Discord & Telegram Notifications Service
npx tsx tests/backend/notifications-service.test.ts

# Global Command Palette Search
npx tsx tests/backend/command-search.test.ts

# Contributor Swag Rewards Engine
npx tsx tests/backend/community-swag.test.ts
```

### Run Theme & CSS Token Tests
```bash
npm run test:themes
```

---

<p align="center">
  <b>ZenithenOpen Quality Assurance</b><br/>
  <i>Engineered for zero regressions, strict type compliance, and 100% route reliability.</i>
</p>
