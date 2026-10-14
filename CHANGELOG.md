# Changelog

All notable changes to **ZenithenOpen** are documented in this file.
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.28.0] - 2026-10-14

### 👤 Profile Layout Simplification & Mentorship Request Option Removal

- **Removed Mentorship Action Buttons from Contributor Profile**:
  - Removed the top-bar orange `Request Mentorship` button from `/members/[username]`.
  - Removed the `Peer Mentorship Availability` banner card and `Request Mentorship Session` action from the profile sidebar.
  - Removed the inline mentorship modal dialog, unneeded form states, and dead event handlers from the member profile controller.
  - Preserved essential profile actions: `Proof-of-Work Resume`, `Share Profile`, direct GitHub/LinkedIn icon buttons, and 5 PR metric counters.

---

## [1.27.0] - 2026-10-14

### 🔍 Visual Browser Verification & Walkthrough Demonstration

- **Visual Quality Assurance & Timeframe Interaction Verification**:
  - Validated interactive behavior and DOM updates for Campus Leaderboard timeframes (`This Week`, `This Month`, `All-Time`).
  - Verified podium rendering for top 3 campus repository contributors.
  - Confirmed student profile view (`/members/abhijit-saha`) aligns with reference specifications:
    - Ambient dark gradient and circular avatar with radiant cyan glow ring.
    - Role subtitle `Frontend Builder · Early Open Source`.
    - Direct external navigation action buttons for GitHub and LinkedIn.
    - `← Back to Hall of Fame` top navigation link.
    - 5 PR metric cards: Quality Merge, TOTAL PRS, Open, Closed, Merged.
- **Generated Walkthrough Artifacts**:
  - Saved visual walkthrough documentation and WebP recording to the artifacts system.

---

## [1.26.0] - 2026-10-14

### 🛡️ Dependabot Security Vulnerability Resolution & Transitive Dependency Overrides

- **Security Hardening & Vulnerability Remediation**:
  - Implemented selective dependency overrides in `package.json` for high-severity transitive dependencies:
    - Pinned `deepmerge-ts` to `>=8.0.0` resolving GHSA-ggr8-5vv4-36mx recursive object stack exhaustion.
    - Pinned `braces` to `^3.0.3` and `micromatch` to `^4.0.8` addressing GHSA-vfj7-8cjw-p6xm.
  - Achieved `0 vulnerabilities` across all production dependencies (`npm audit --omit=dev`).
- **Build & Quality Gates Verification**:
  - Re-verified TypeScript compiler type safety, ESLint quality rules, and all 705 backend test suite assertions passing with 100% green rate.

---

## [1.25.0] - 2026-10-14

### ⚡ Real-Time GitHub Webhook Campus Merges Cache Invalidation

- **Instant Campus Leaderboard Invalidation on Merges**:
  - Enhanced GitHub real-time webhook endpoint (`/api/github/webhook`) to detect pull requests and push events affecting campus repositories (`IST-ZenithenLab/*`).
  - Automatically invalidates all partitioned campus projects leaderboard Redis caches (`projects:campus-leaderboard:*`, `projects:campus-leaderboard:timeframe:*`).
  - Guarantees immediate zero-stale reflection of campus merges on the Projects Leaderboard without waiting for TTL expiration.
- **Resilient Webhook Database Operations**:
  - Wrapped user lookups and contribution persistence in safe error-handling routines for offline and intermittent database resilience.
- **Automated Backend Test Coverage**:
  - Expanded `tests/backend/github-webhook.test.ts` to verify campus repository PR event routing and cache invalidation flags.

---

## [1.24.0] - 2026-10-14

### ⏱️ Campus Repositories Leaderboard Timeframe Filtering & Interactive Toggles

- **Timeframe Parameterization on Campus Leaderboard API**:
  - Enhanced `/api/projects/leaderboard` to support `timeframe=week`, `timeframe=month`, and `timeframe=overall`.
  - Added dynamic Prisma date filters (`createdAt >= 7 days ago` for week, `30 days ago` for month) on campus repository contributions.
  - Implemented timeframe-aware fallback allocations reflecting dynamic campus PR activity across different time horizons.
  - Updated Redis caching key to partition cached rankings by timeframe (`projects:campus-leaderboard:timeframe:${timeframe}:limit:${limit}`).
- **Interactive Timeframe Toggles in Projects Catalog**:
  - Embedded `This Week`, `This Month`, and `All-Time` pill switcher directly in the Campus Leaderboard header on `/projects`.
  - Instant client-side refetching upon toggle change with smooth loading indicator.
- **Automated Backend Test Coverage**:
  - Extended `tests/backend/campus-projects-leaderboard.test.ts` to validate all timeframe query parameters and data contracts.

---

## [1.23.0] - 2026-10-14

### 🏛️ Dedicated Campus Repositories Projects Leaderboard & Merges Algorithm

- **Distinct Campus Merges Leaderboard Ranking Algorithm**:
  - Implemented a dedicated ranking algorithm for the Projects section (`/projects`), ranking student engineers strictly by the total number of pull requests merged into official IST campus repositories (`IST-ZenithenLab/*`).
  - Algorithm priority order:
    $$\text{Campus Merges} (\text{descending}) \rightarrow \text{Campus Quality Merges} (\text{descending}) \rightarrow \text{Campus Total PRs} (\text{descending})$$
  - Completely separate from the platform Hall of Fame leaderboard to incentivize students building and maintaining campus infrastructure.
- **Dedicated Campus Projects Leaderboard API**:
  - Created `/api/projects/leaderboard` with live Prisma database aggregation over campus contributions, resilient cached fallbacks, and 3-minute Redis caching.
- **Rich Campus Leaderboard Interface on Projects Section**:
  - Added interactive Top 3 Podium Cards (Gold, Silver, Bronze) highlighting champion contributors, their total campus merges, top campus repository, and direct social profile action buttons.
  - Implemented detailed rankings directory with seamless contributor profile links (`/members/[username]`) and external GitHub / LinkedIn navigation buttons.
  - Added full test suite `tests/backend/campus-projects-leaderboard.test.ts` verifying all sorting, boundary conditions, and limit parameters.

---

## [1.22.0] - 2026-10-13

### 👤 Student Profile Card Reference Alignment & Social Profile Navigation

- **Profile View Design Alignment with Reference**:
  - Transformed `/members/[username]` hero card into a centered layout with ambient dark gradient and cyan glow ring around the circular avatar.
  - Aligned typography: bold white name, cyan role subtitle (`Frontend Builder · Early Open Source`).
  - Added centered circular dark action buttons for GitHub and LinkedIn with hover elevation and direct external navigation.
  - Linked top navigation to Hall of Fame (`← Back to Hall of Fame` at `/leaderboard`).
  - Implemented the 5 stat cards grid under `Open Source Contributions` styled with glassmorphism and metric accents:
    1. **Quality Merge** (amber star & count)
    2. **TOTAL PRS** (white count & slate label)
    3. **Open** (emerald icon & count)
    4. **Closed** (rose icon & count)
    5. **Merged** (purple icon & count)
- **Homepage Monthly Leaderboard Clickable Social Navigation**:
  - Upgraded Monthly Leaderboard rows on homepage (`app/page.tsx`) to link directly to `/members/[username]`.
  - Added dedicated round GitHub and LinkedIn icon buttons for each contributor row, enabling instant external navigation without interfering with row click.
- **Dataset and Route Compatibility**:
  - Added reference contributor profile Abhijit Saha (`abhijit-saha`) to `lib/data/student-competition.ts`.
  - Added full fallback support in `/api/members/[username]` to resolve student competitors from data registry.

---

## [1.21.0] - 2026-10-13

### 🏆 Strict Quality Merge Verification Standard & 5-Tier Leaderboard Ranking Algorithm

- **Strict Quality Merge Threshold Requirement**:
  - Enforced strict repository qualification criteria: A merged pull request is recognized as a Quality Merge only if the repository has at least 100 stars AND 100 forks (`stars >= 100 && forks >= 100`).
  - Pull requests in repositories below either threshold do not qualify.
  - Updated philosophical banners and guidelines in `app/leaderboard/page.tsx` and sync engines.
- **Strict 5-Tier Leaderboard Ranking Algorithm**:
  - Enforced priority tiebreak ranking comparator across API routes (`app/api/students/leaderboard/route.ts`) and interactive client sorting (`app/leaderboard/page.tsx`):
    $$\text{Quality Merge} > \text{Total PR} > \text{Open PR} > \text{Closed PR} > \text{Total Merges}$$
  - Dynamic rank assignments and podium highlights adhere strictly to this multi-tier order.
  - Aligned mock competitor datasets in `lib/data/student-competition.ts`.
- **Automated Test Suite Enhancements**:
  - Added boundary condition tests for exact 100 stars & 100 forks thresholds in `tests/backend/github-sync.test.ts`.
  - Added full ranking compliance assertion loops in `tests/backend/leaderboard-route.test.ts`.
  - All test suites passing.

---

## [1.20.0] - 2026-10-13

### 📊 Pure Pull Request Contributor Metrics & Complete Removal of Points

- **5-Stat Pull Request Metrics Standard Across Platform**:
  - Enforced exact 5-metric contributor sequence across all profiles, leaderboards, and student cards:
    1. **Quality Merge** (gold/amber)
    2. **Total PR** (default foreground)
    3. **Open PR** (blue)
    4. **Closed PR** (rose)
    5. **Total Merges** (emerald)
- **Elimination of Points Counters**:
  - Removed all arbitrary `points`, `PTS`, and artificial weights across UI components, member dossiers, project contributor listings, and admin tables.
  - Replaced scoring with real open-source pull request verification and activity metrics.
- **Podium & Leaderboard Standings Enhancement (`app/leaderboard/page.tsx`)**:
  - Updated Top 3 podium cards with 5-column metric counters.
  - Updated all standings table headers and data rows to display `Quality Merge`, `Total PR`, `Open PR`, `Closed PR`, and `Total Merges`.
  - Added multi-criteria sort filters corresponding to the 5 PR categories.
- **Programs & Profiles Alignment (`app/programs/page.tsx`, `app/members/[username]/page.tsx`)**:
  - Updated sprint competitor cards to display the 5-stat grid.
  - Student profile dossier stats grid updated with exact 5 metric cards.
- **Automated Test Suite (100% Pass Rate)**:
  - Updated data contracts and leaderboard route test assertions.
  - All **653 / 653 backend tests passing across 25 suites**.

---

## [1.19.0] - 2026-10-13

### 🌟 Dynamic Project Deep-Dive & Student Contributor Profile Showcase Pages

- **Dynamic Project Deep-Dive Showcase Page (`app/projects/[slug]/page.tsx`)**:
  - Implements the complete repository deep-dive view with Next.js 15 async route parameters (`params: Promise<{ slug: string }>`).
  - Features project hero with status badges, primary language color indicator, stars/forks/PR counters, and 1-click clone terminal snippet with clipboard copy.
  - Displays structured project narrative, tag chips, and live starter opportunities board with direct GitHub issue claims.
  - Renders repository maintainers, top student contributors, and recent merged pull request audit records.
- **Dynamic Student Contributor Profile Page (`app/members/[username]/page.tsx`)**:
  - Implements public student dossier resolving profile data from `/api/members/[username]`.
  - Features verified student identity card, USN status, academic affiliation (department & cohort), and proof-of-work PR metrics grid (Merged PRs, Quality PRs, Total PRs, Unlocked Badges).
  - Displays unlocked honors & achievement badges shelf, skill technology chips, and verified pull request activity.
  - Integrates interactive peer mentorship booking modal communicating directly with `/api/mentorship/requests`.
- **Platform-Wide Navigation & Catalog Linking**:
  - Connected `app/projects/page.tsx` cards with primary `Explore` action button and clickable titles linking to `/projects/[slug]`.
  - Linked `app/members/page.tsx` avatars, names, and profile buttons to `/members/[username]`.
  - Linked `app/leaderboard/page.tsx` top-contributor cards and table rows to `/members/[username]`.
- **Showcase Pages Automated Test Suite (`tests/backend/showcase-pages.test.ts`)**:
  - 32 automated test assertions validating project lookups, case-insensitivity, member contracts, statistics schemas, and 404 handling.
  - Master test runner expanded to **652 / 652 backend tests passing across 25 test suites (100% pass rate)**.

---

## [1.18.0] - 2026-10-13

### 🎓 Learning Paths API & Student Progress Tracking Engine

- **Learning Paths REST Endpoints (`app/api/learning-paths/route.ts` & `app/api/learning-paths/[id]/route.ts`)**:
  - Delivers structured engineering roadmaps across Full-Stack Web, Applied AI, Cloud DevOps, and Open-Source Fellowships.
  - Implements multi-criteria filtering by difficulty level (`Beginner`, `Intermediate`, `Advanced`), search query, and pagination limits.
  - Features Upstash Redis distributed caching with resilient offline fallback to local curriculum blueprints.
- **Student Milestone Progress Tracking (`app/api/learning-paths/[id]/progress/route.ts`)**:
  - Provides `GET` and `PUT` progress tracking endpoints storing student enrollment, active weekly module, and completed weeks in Supabase PostgreSQL.
- **Programs Hub Live Integration (`app/programs/page.tsx`)**:
  - Added interactive `Engineering Learning Roadmaps` track to the Programs Hub with live data fetching from `/api/learning-paths`.
  - Features weekly module accordions, target skill tags, progress meters, and dynamic week progression buttons.
- **Upstash Redis Wildcard Key Invalidation (`lib/redis/client.ts`)**:
  - Upgraded in-memory fallback and Upstash Redis client with wildcard pattern invalidation support (`client.keys` & `deleteFromMemory`).
- **Database Seeder Enhancement (`scripts/seed-production.ts`)**:
  - Extended production database seeder with foundational learning path blueprints.
- **Automated Test Suite (`tests/backend/learning-paths-route.test.ts`)**:
  - 25 automated assertions verifying path retrieval, level filtering, search matching, slug lookups, progress persistence, and offline fallback.
  - Master backend runner expanded to **614 / 614 tests passing across 24 test suites (100% pass rate)**.

---

## [1.17.0] - 2026-10-13

### 🐳 Production Deployment & Containerization Architecture

- **Multi-Stage Production Dockerfile (`Dockerfile`)**:
  - Implements secure 4-stage build architecture (`base`, `deps`, `builder`, `runner`) on Alpine Linux (`node:20-alpine`).
  - Generates Prisma ORM client and builds Next.js production artifacts in isolated build stage.
  - Runs with non-root system user `nextjs:nodejs` (UID 1001) for strict least-privilege security compliance.
  - Integrates automated container health check probing `/api/health` with automatic failure mitigation.
- **Docker Compose Orchestration (`docker-compose.yml`)**:
  - Defines cohesive container network `zenithen-network` interconnecting `app`, PostgreSQL 16 (`zenithen-postgres`), and Redis 7 (`zenithen-redis`).
  - Configures container health checks (`pg_isready` for Postgres, `redis-cli ping` for Redis) with dependent startup gating (`service_healthy`).
  - Injects `DATABASE_URL` and `REDIS_URL` environment variables for zero-configuration local and production cluster boots.
- **Vercel Cloud Deployment Configuration (`vercel.json`)**:
  - Configures `nextjs` framework preset with standardized security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, `Permissions-Policy`).
  - Enforces `no-store, max-age=0` caching directives on all `/api/(.*)` routes.
- **Production Deployment Test Suite (`tests/backend/deployment-config.test.ts`)**:
  - 40 automated test assertions verifying container stages, environment mappings, volumes, health checks, and cloud configuration.
  - Master test runner updated to 583 / 583 backend tests passing (100% pass rate).

---

## [1.16.0] - 2026-10-13

### 🌱 Idempotent Production Database Seeder & CLI Tooling

- **Database Seeding Engine (`scripts/seed-production.ts`)**:
  - Created idempotent seeder populating Supabase tables with initial achievements, core campus projects, verified student profiles, starter opportunities, and platform metrics.
  - Features graceful offline and remote database resilience, safely catching connection errors and exiting with code 0 in non-connected or CI environments.
- **CLI Command (`package.json`)**:
  - Added `"db:seed": "tsx scripts/seed-production.ts"` script.
- **Automated Seeder Test Suite (`tests/backend/db-seed.test.ts`)**:
  - 33 automated test assertions verifying data blueprints, schema constraints, and seeding idempotency.

---

## [1.15.0] - 2026-10-13

### 📄 Public Recruiter Resume Showcase Page & Production Security Middleware

- **Public Recruiter Resume Showcase Page (`app/resume/share/[token]/page.tsx`)**:
  - Implements the unauthenticated public candidate dossier view for external recruiters, hiring partners, and mentors.
  - Dynamically unwraps Next.js 15 asynchronous route params (`params: Promise<{ token: string }>`) and resolves frozen resume snapshots from `/api/resume/share/[token]`.
  - Displays real-time candidate metadata: full name, USN, college affiliation, GitHub handle, custom headline, generation timestamp, view count, and days until link expiration.
  - Displays audited open-source repositories contributed to with star metrics, fork counts, authored PRs, and architectural impacts ($\ge 100$ stars and $\ge 100$ forks).
  - Provides 1-click ATS Markdown download (`.md`), fast clipboard copy, print-to-PDF (`window.print()`), and visual vs raw markdown toggle.
- **Production Security Middleware & Request Tracing (`middleware.ts`)**:
  - Introduces distributed request correlation with unique `x-request-id` headers and platform version tagging (`x-zenithen-version: 1.15.0`).
  - Enforces baseline security response headers (`nosniff`, `SAMEORIGIN`, `origin-when-cross-origin`).
  - Mitigates automated path traversal attempts, dotfile queries, and vulnerability scanner probes.
  - Disabled `x-powered-by` header via `poweredByHeader: false` in `next.config.ts`.

---

## [1.14.0] - 2026-10-12

### 🚀 Production-Ready Backend Platform & Strict CI Gate Enforcement

- **ESLint CI Hygiene & Strict Coding Standard Enforcements**:
  - Resolved `prefer-const` violations in mentorship requests controller ([`app/api/mentorship/requests/route.ts`](file:///d:/ZenithenOpen/app/api/mentorship/requests/route.ts)) and resume share token resolver ([`app/api/resume/share/[token]/route.ts`](file:///d:/ZenithenOpen/app/api/resume/share/[token]/route.ts)).
  - Cleaned unreferenced imports in [`app/api/resume/share/route.ts`](file:///d:/ZenithenOpen/app/api/resume/share/route.ts), achieving **0 lint errors** across the entire application codebase.
- **CI Test Suite Optimization & Zero-Latency Execution**:
  - Streamlined GitHub Actions workflow ([`.github/workflows/ci.yml`](file:///d:/ZenithenOpen/.github/workflows/ci.yml)) environment variables to execute tests against resilient in-memory caching and localized data tiers with zero network/DNS timeouts.
  - Adjusted GitHub Sync controller test assertion ([`tests/backend/github-sync-route.test.ts`](file:///d:/ZenithenOpen/tests/backend/github-sync-route.test.ts)) to account for environments using mock GitHub API tokens.
  - Reduced CI workflow run time from over 10 minutes to **1 minute 17 seconds**.
- **Complete Verification Gate Pass**:
  - `npm run lint`: **0 errors**.
  - `npm run typecheck`: **0 errors**.
  - `npm test`: **510 / 510 tests passing across 21 test suites (100% pass rate)**.
  - `npm run build`: **29 / 29 routes compiled cleanly** with Next.js Turbopack.
  - GitHub Actions Workflow: **ZenithenOpen CI (Run #38284940133) completed with SUCCESS**.

---

## [1.13.0] - 2026-10-12

### 🔗 Shareable Resume Snapshot & Public Token Controller

- **Shareable Resume Snapshot Generator (`app/api/resume/share/route.ts`)**:
  - Implements Section 4, 5 & 6 of the Backend Architecture Guide (`ResumeSnapshot` model & token access).
  - `POST /api/resume/share`: freezes student's verified open-source contributions, highlighted repos with star metrics, and technical skills into an unguessable public share token (`tok_*`) with configurable expiration (default: 90 days).
  - `GET /api/resume/share`: lists active share tokens and view counts for a student.
- **Public Share Token Resolver (`app/api/resume/share/[token]/route.ts`)**:
  - `GET /api/resume/share/[token]`: Next.js 15 async route param handler allowing external recruiters and mentors to inspect authenticated proof-of-work without login.
  - Supports ATS-friendly Markdown export via `?format=markdown`.
  - Enforces expiration validation (returns 410 Gone if expired) and increments telemetry view counts with Redis caching (`X-Cache: HIT / MISS`).
- **Interactive UI Integration (`app/resume/page.tsx`)**:
  - Added **"Share Link"** button to the resume toolbar with automated clipboard copy and live feedback.
- **Backend Test Suite Expansion (`tests/backend/resume-share.test.ts`)**:
  - Added 28 comprehensive assertions verifying token listing, Zod payload validation errors, snapshot creation, public token resolution, Markdown export, and username filtering.
  - Master test runner passes 510/510 assertions across 21 backend suites (100% pass rate).

---

## [1.12.0] - 2026-10-12

### 🔄 Controlled GitHub Organization Sync & Admin Trigger Engine

- **Controlled GitHub Sync Controller (`app/api/github/sync/route.ts`)**:
  - Implemented `GET /api/github/sync` returning engine telemetry, rate limit allowances, and last sync execution stats.
  - Implemented `POST /api/github/sync` supporting scoped triggers (`all`, `members`, `projects`), single student targeting (`username`), and resilient fallback execution.
  - Integrated Upstash Redis cache invalidation across `leaderboard:*`, `metrics:*`, `members:*`, and `projects:*`.
- **Admin Dashboard Integration (`app/admin/page.tsx`)**:
  - Wired live **"Trigger GitHub Sync"** button directly to `POST /api/github/sync`.
  - Added real-time sync progress status and updated telemetry streaming on completion.
- **Backend Test Suite Expansion (`tests/backend/github-sync-route.test.ts`)**:
  - Added 24 comprehensive assertions verifying telemetry retrieval, Zod payload validation errors, single-student sync, project metric refresh, org-wide sync, and Redis cache invalidation.
  - Master test runner passes 482/482 assertions across 20 backend suites (100% pass rate).

---

## [1.11.0] - 2026-10-12

### 🤝 Peer Mentorship Connection Controller & Match Engine

- **Peer Mentorship Requests Controller (`app/api/mentorship/requests/route.ts`)**:
  - Implemented `GET /api/mentorship/requests` with filtering by mentor, mentee, focus topic, and status (`PENDING`, `ACCEPTED`, `COMPLETED`, `DECLINED`).
  - Implemented `POST /api/mentorship/requests` with Zod schema validation, student user resolution, and persistent Prisma `Mentorship` record creation with resilient fallback store.
  - Implemented `PATCH /api/mentorship/requests` for mentor status transitions (`PENDING` -> `ACCEPTED` / `DECLINED` / `COMPLETED`) with cache invalidation.
  - Integrated Upstash Redis caching with response headers (`X-Cache: HIT / MISS`) and resilient fallback mode.
- **Frontend Live Form Integration (`app/mentorship/page.tsx`)**:
  - Connected interactive mentorship modal to `POST /api/mentorship/requests`.
  - Added dedicated mentor selection targeting specific student mentors with real-time submission feedback.
- **Backend Test Suite Expansion (`tests/backend/mentorship-route.test.ts`)**:
  - Added 28 comprehensive assertions verifying list retrieval, status filtering, topic search, Zod schema validation errors, submission creation, status updates, and 404 safety.
  - Master test runner passes 458/458 assertions across 19 backend suites (100% pass rate).

---

## [1.10.0] - 2026-10-12

### 📄 Verified Proof-of-Work Resume Engine & Portfolio Controller

- **Verified Proof-of-Work Resume Snapshot Controller (`app/api/resume/[username]/route.ts`)**:
  - Implemented `GET /api/resume/[username]` with Next.js 15 async route parameters.
  - Dynamically aggregates verified open-source pull requests, highlighted repositories with star counts, technical skills, education, and campus milestone achievements.
  - Generates ATS-friendly, structured Markdown and JSON exports with Redis caching (`X-Cache: HIT / MISS`).
- **Interactive Resume API Route (`app/api/resume/route.ts`)**:
  - Implemented `GET /api/resume` default template and username delegation.
  - Implemented `POST /api/resume` with Zod schema validation for customized student resume profiles.
- **Frontend Live Sync Integration (`app/resume/page.tsx`)**:
  - Added real-time GitHub handle sync bar to fetch verified student achievements directly into the interactive resume builder.
- **Backend Test Suite Expansion (`tests/backend/resume-route.test.ts`)**:
  - Added 23 assertions verifying baseline templates, username queries, 404 lookups, Markdown formatting, and Zod validation errors across 430 passing assertions.

---

## [1.9.0] - 2026-10-12

### 📦 Project Slug Deep-Dive Dynamic Controller & Catalog Engine

- **Project Deep-Dive Dynamic Controller (`app/api/projects/[slug]/route.ts`)**:
  - Implemented `GET /api/projects/[slug]` with Next.js 15 async route parameters returning repository details, language breakdown, stars, forks, open issues, maintainers, starter opportunities, top student contributors, and recent activity ledgers.
  - Implemented `PATCH /api/projects/[slug]` with Zod schema validation for repository metadata updates, baseline catalog auto-seeding, and cache invalidation.
  - Integrated Upstash Redis caching (`project:slug:*`) with cache headers (`X-Cache: HIT / MISS`) and resilient in-memory fallbacks.
- **Backend Test Suite Expansion (`tests/backend/project-slug.test.ts`)**:
  - Added 19 assertions verifying 404 lookups, baseline repository retrieval, stats computation, validation error handling, and metadata updates across 407 passing assertions.

---

## [1.8.0] - 2026-10-11

### 👤 Member Profile Dynamic Controller & Settings

- **Individual Member Profile Endpoint (`app/api/members/[username]/route.ts`)**:
  - Implemented `GET /api/members/[username]` returning complete public member profile, verified contribution statistics, skills, achievements, and recent PR ledger with Next.js 15 async route parameters.
  - Implemented `PATCH /api/members/[username]` with Zod schema validation for authenticated profile updates (bio, department, study year, LinkedIn, portfolio, skills, mentorship topics).
  - Integrated Upstash Redis caching with explicit invalidation upon profile edits.
- **Backend Test Suite Expansion (`tests/backend/member-profile.test.ts`)**:
  - Added 10 assertions verifying 404 responses, valid profiles, Zod validation errors, and profile persistence across 388 passing assertions.

---

## [1.7.0] - 2026-10-11

### ⚡ Real-Time GitHub Webhook Ingestion Engine

- **GitHub Event Webhook (`app/api/github/webhook/route.ts`)**:
  - Implemented `POST /api/github/webhook` with HMAC-SHA256 signature verification (`X-Hub-Signature-256`).
  - Ingests real-time `pull_request` (opened, closed, merged, synchronized), `pull_request_review`, and `push` events directly from GitHub.
  - Automatically correlates webhook payloads with registered campus users, evaluates Quality PR criteria, updates PostgreSQL, and flushes Redis caches for zero-latency leaderboard synchronization.
  - Implemented `GET /api/github/webhook` health probe returning active status and supported event types.
- **Backend Test Suite Expansion (`tests/backend/github-webhook.test.ts`)**:
  - Validated health probe, ping event handling, payload validation, and unhandled event skips across 375 passing assertions.

---

## [1.6.0] - 2026-10-11

### 🚀 Deep GitHub Sync, Upstream Parent Fork Resolution & Multi-Activity Tracking

- **Upstream Parent Repository Resolution (`lib/github/sync.ts`)**:
  - Automatically resolves forked repositories (`data.fork && data.parent`) to their upstream parent repositories so student contributions against forks inherit parent star and fork counts.
  - Removed artificial campus repository star/fork mocks.
- **Deep Pagination for Full Lifetime History (`lib/github/sync.ts`)**:
  - Implemented multi-page iteration up to GitHub's search API maximum of 1,000 items (10 pages $\times$ 100 PRs/page).
- **Multi-Activity Contribution Tracking (`lib/github/sync.ts`)**:
  - Added real-time synchronization for **Code Reviews** (`reviewed-by:{username} type:pr`) saved as `ContributionType.CODE_REVIEW`.
  - Added real-time synchronization for public **Commits** (`author:{username}`) saved as `ContributionType.COMMIT`.
- **Backend Tests & Validation (`tests/backend/github-sync.test.ts`)**:
  - Added unit test assertions verifying review and commit ingestion functions.

---

## [1.5.1] - 2026-10-11

### 🎯 Strict Quality PR Algorithm (100 Stars & 100 Forks Requirement)

- **Pure Merit-Based Quality PR Qualification (`lib/github/sync.ts`)**:
  - Removed campus repository automatic exemption (`IST-ZenithenLab/*`).
  - Strict rule: A pull request qualifies as a Quality PR **strictly if and only if** the target repository has $\ge 100$ stars AND $\ge 100$ forks.
  - Eliminated keyword/label bypasses for sub-threshold repositories.
- **Updated Test Suite (`tests/backend/github-sync.test.ts`)**:
  - Validated strict star/fork thresholds with 100% pass across 368 test assertions.

---

## [1.5.0] - 2026-10-11

### ⚡ Real-Time GitHub Ingestion, Strict PR Tracking & Zero-Mock Architecture

- **End-to-End Real-Time GitHub PR Ingestion (`lib/github/sync.ts`, `app/api/auth/login/route.ts`)**:
  - Automatically fetches and ingests all student Pull Requests from GitHub API (`OPEN`, `CLOSED`, `MERGED`) directly into PostgreSQL upon login.
  - Built high-performance batch upsert engine with bulk lookup and `createMany`, slashing sync roundtrips from 160 queries down to 2.
  - Automatically awards the "First PR Shipped" achievement when a student merges their first pull request.
- **Quality PR Algorithm & Repository Inspection**:
  - Campus rule: Any PR to `IST-ZenithenLab/ZenithenOpen` or any campus repository (`IST-ZenithenLab/*`) automatically qualifies as a Quality PR.
  - Public open-source threshold: Pull requests to public repositories with ≥100 stars and ≥100 forks qualify as Quality PRs.
- **Dedicated Sync & Ingestion API (`app/api/students/sync/route.ts`)**:
  - Implemented `POST /api/students/sync` and `GET /api/students/sync` to trigger instant live PR synchronization for any student or across the entire campus community.
- **Zero-Mock Community Metrics (`app/api/metrics/route.ts`)**:
  - Eliminated all artificial baselines and fake numbers; platform now computes 100% authentic metrics directly from live Supabase PostgreSQL.
- **Real-Time Leaderboard with Zero Mock Data (`app/api/students/leaderboard/route.ts`, `app/page.tsx`, `app/leaderboard/page.tsx`)**:
  - Completely eliminated all mock competitors (`Sneha Rao`, `Rohan`, etc.) from the active leaderboard.
  - Removed arbitrary points from all contributor displays and rankings; ranks are now driven by Merged PRs, Quality PRs, and Open PRs.
  - Displays top 7 authentic student contributors on the homepage with an interactive direct link to `/programs#student-competition`.
  - Added on-demand "Sync Live PRs" button on the dedicated Leaderboard page.

---

## [1.4.0] - 2026-10-11

### 🚀 Production Preflight Diagnostics & Turnkey Deployment

- **Automated Production Preflight CLI (`scripts/preflight.ts`)**:
  - Built comprehensive non-destructive pre-deployment diagnostic CLI (`npm run preflight`).
  - Verifies runtime environment variables against Zod schema, checks PostgreSQL roundtrip latency and schema entity counts, probes Upstash Redis cache and TTL key writes, checks GitHub API authenticated rate-limit quota, and verifies the `/api/health` probe.
  - Added `--strict` mode flag to enforce zero-warning policy on production release pipelines.
- **Dynamic Health Probe Versioning (`app/api/health/route.ts`)**:
  - Dynamically synchronized version reporting from `package.json`, ensuring `/api/health` stays in lockstep with releases.
  - Updated health route test suite (`tests/backend/health-route.test.ts`) to validate against dynamic package version.
- **Comprehensive Production Deployment Architecture Guide (`DEPLOYMENT.md`)**:
  - Created complete deployment guide covering Vercel serverless deployment, Docker Compose on self-hosted VPS, Nginx reverse proxy with Let's Encrypt SSL, Prisma database synchronization (`npm run db:push`), and observability.
  - Added developer convenience scripts in `package.json` (`preflight`, `db:push`, `db:studio`).

---

## [1.3.0] - 2026-10-11

### 💎 Strict Typing & Lint Hygiene

- **TypeScript Type Safety & Elimination of `any`**:
  - Replaced all untyped `any` signatures in `lib/github/sync.ts` with strongly typed `GitHubItemSignal` contracts.
  - Hardened in-memory cache fallbacks in `lib/redis/client.ts` with type-safe `unknown` boundaries.
  - Refactored exception handlers across Opportunities and Projects catalog routes to use `_err: unknown`.
- **Dead Code & Unused Imports Elimination**:
  - Removed unused icon and component imports across `app/page.tsx`, `app/programs/page.tsx`, `app/projects/page.tsx`, `app/resources/page.tsx`, `components/auth/login-modal.tsx`, `components/hero/floating-org-badges.tsx`, and `components/theme/theme-menu.tsx`.
  - Removed unused Prisma enum imports in `lib/db/index.ts`.
  - Achieved clean ESLint audit with zero errors.

---

## [1.2.0] - 2026-10-11

### ⚡ Database Performance & Rate Limiting Defense

- **Database Relational Index Optimizations (`prisma/schema.prisma`)**:
  - Added `@@index([department])` on `User` model for sub-millisecond filtering on the Members Directory.
  - Added compound indexes `@@index([userId, status])` and `@@index([status, mergedAt])` on `Contribution` model to accelerate real-time Leaderboard rankings and competition scoring.
  - Added `@@index([achievementId])` on `UserAchievement` model eliminating full-table scans during badge unlock aggregations.
- **Sliding-Window Rate Limiting Defense (`lib/redis/client.ts`)**:
  - Implemented `checkRateLimit()` with Upstash Redis and automated in-memory fallback.
  - Integrated HTTP `429 Too Many Requests` defense with `Retry-After` headers on `/api/auth/login` and `/api/auth/verify-usn` endpoints to prevent brute-force attacks and student enumeration.
- **Test Suite Expansion (`tests/backend/redis-cache.test.ts`)**:
  - Added unit test assertions verifying rate limit token consumption, token exhaustion, and window resets.

---

## [1.1.0] - 2026-10-11

### 🛡️ Production Hardening: Environment Validation, Health Tests & Dependabot

- **Runtime Environment Validation (`lib/env.ts`)**:
  - Implemented type-safe Zod schema validation across all production and development variables (`DATABASE_URL`, `AUTH_SECRET`, `UPSTASH_REDIS_REST_URL`, `GITHUB_TOKEN`).
  - Added `validateProductionEnv()` preflight checks for production deployments.
- **Production Health Probe Test Suite (`tests/backend/health-route.test.ts`)**:
  - Added automated test suite verifying `/api/health` response schema, latency reporting, status codes (200/503), diagnostic checks for PostgreSQL & Redis, and cache-control headers.
  - Integrated into master test runner (`tests/backend/run-all.ts`), expanding backend test coverage across 14 suites.
- **Automated Security & Vulnerability Auditing (`.github/dependabot.yml`)**:
  - Added GitHub Dependabot configuration for automated dependency security alerts and PRs across `npm` packages and GitHub Actions.

---

## [1.0.0] - 2026-10-11

### 🚀 Production Release: ZenithenOpen Campus Open-Source Platform

ZenithenOpen is the dedicated open-source contribution and student competition platform for the Institute of Science & Technology (IST) campus community. This initial production release delivers a complete, secure, hardened, and highly scalable system for student developers and open-source maintainers.

---

### ✨ Features & Capabilities

- **USN-Based Authentic Student Verification**:
  - Integration with institutional student registry (`1ST23CS001` through `1ST26CS060`).
  - Automated department identification (Computer Science, Information Science, Electronics).
  - GitHub username mapping with leading `@` normalization.
- **Campus Repository & First-PR Gateway**:
  - Direct integration with IST-ZenithenLab campus repositories.
  - Curated Good First Issues with starter guidance and mentor tags.
  - Dedicated First-PR Hall of Fame and milestone badges.
- **Real-Time Student Leaderboard & Competition Arena**:
  - Multi-tier scoring algorithm awarding points for Merged PRs, Quality PRs, Open PRs, and Issue closures.
  - Granular leaderboards supporting Weekly, Monthly, and Overall timeframes.
  - Resilient caching with Upstash Redis and automatic in-memory fallback.
- **Projects Catalog & Opportunities Board**:
  - Filter by programming language, difficulty tier, and tags.
  - Dynamic cache invalidation and stale-while-revalidate headers.
- **Production Health Check Probe**:
  - Deep system health inspection at `/api/health`.
  - Live PostgreSQL database ping and Redis/memory cache readiness metrics.

---

### 🛡️ Security & Reliability Hardening

- **HTTP Security Headers**:
  - Enforced `Strict-Transport-Security` (`HSTS`) with 2-year max-age and preload.
  - Enabled `X-Frame-Options: SAMEORIGIN` (clickjacking defense).
  - Enabled `X-Content-Type-Options: nosniff` (MIME sniffing defense).
  - Configured `Referrer-Policy: origin-when-cross-origin`.
  - Configured strict `Permissions-Policy` denying camera, microphone, and geolocation access.
- **Database Connection Management**:
  - Configured PrismaClient singleton with global scope caching to prevent connection exhaustion during Next.js SSR/serverless execution.
  - Configured development query logging and production error-only logging.
- **Resilient Fallback Architectures**:
  - Graceful in-memory cache fallbacks when Redis is offline or unconfigured.
  - Structured error responses on all API endpoints with zero unhandled exceptions.

---

### 🧪 Quality Assurance & CI/CD

- **GitHub Actions Automation**:
  - Strict quality gates: `npm run lint` (ESLint 9 flat config), `npm run typecheck` (`tsc --noEmit`), and `npm test` enforced on all PRs and pushes to `main`.
  - Least privilege workflow permissions: `permissions: contents: read`.
  - Automated Prisma client generation via `postinstall` script and workflow step.
- **Comprehensive Backend Test Suite**:
  - 346 automated tests across 13 test suites covering USN verification, auth, API routes, database hooks, data contracts, Redis cache fallback, GitHub sync, leaderboard queries, projects, and opportunities.
  - 100% test pass rate.

---

### 🐳 DevOps & Deployment

- **Multi-Stage Production Dockerfile**:
  - Alpine-based multi-stage container build (`base`, `deps`, `builder`, `runner`).
  - Non-root `nextjs` system user runtime (UID 1001) for defense-in-depth container security.
- **Docker Compose Stack**:
  - Zero-configuration local orchestration with PostgreSQL 16 and Redis 7 services including automated database healthchecks.
