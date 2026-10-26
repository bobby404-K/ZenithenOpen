# Changelog

All notable changes to **ZenithenOpen** are documented in this file.
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.50.0] - 2026-10-26

### 🧹 Complete Removal of Mentorship & Admin Modules

- **Full Deprecation of Admin Governance Module**:
  - Deleted frontend admin dashboard page (`app/admin/page.tsx`).
  - Removed "Admin Governance" link from platform footer (`components/navigation/footer.tsx`).
- **Complete Purge of Peer Mentorship System Across All Pages**:
  - Deleted frontend mentorship hub (`app/mentorship/page.tsx`).
  - Deleted backend mentorship API route (`app/api/mentorship/requests/route.ts`).
  - Removed "Peer Mentorship" link from sidebar navigation drawer (`components/navigation/sidebar-menu.tsx`) and renamed section to `COMMUNITY`.
  - Removed "Mentorship Matching" link from footer (`components/navigation/footer.tsx`) and added direct Contributor Swag Rewards navigation.
  - Removed `page-mentorship` search indexing from Global Command Palette (`app/api/search/route.ts`).
  - Cleaned `isMentor` and `mentorshipTopics` from member profile types and dynamic page (`app/members/[username]/page.tsx`, `types/index.ts`).
  - Refined campus evolution, hero subtitle, and event workshop wording to focus on hands-on student engineering collaboration.
  - Removed `MENTORSHIP_REQUEST` event from multi-channel notification engine (`lib/notifications/types.ts`, `lib/notifications/formatters.ts`, `app/api/notifications/broadcast/route.ts`).
- **Test Suite Harmonization**:
  - Deleted obsolete backend test suite (`tests/backend/mentorship-route.test.ts`).
  - Updated master test runner to 32 active suites and 985+ automated assertions.
  - 0 TypeScript compilation errors (`tsc --noEmit`).

## [1.49.0] - 2026-10-26

### 📢 Multi-Channel Campus Notification Engine (Discord & Telegram)

- **Discord Webhook Rich Embeds (`lib/notifications/formatters.ts`)**:
  - Implemented rich embed formatter with distinct hex brand colors per event (`CAMPUS_PR_MERGED`: 0x10B981, `QUALITY_PR_MERGED`: 0x6366F1, `MILESTONE_UNLOCKED`: 0xF59E0B, `SWAG_CLAIMED`: 0xEC4899, `MENTORSHIP_REQUEST`: 0x3B82F6, `CAMPUS_BROADCAST`: 0x8B5CF6).
  - Embeds feature contributor name, GitHub avatar, USN badge, repository tag, pull request link, and verified badges.
- **Telegram Bot Integration (`lib/notifications/dispatcher.ts`)**:
  - HTML-formatted message dispatch with clean entity escaping via `escapeHtml()`.
  - Clickable markdown/HTML links and code formatting for USN and repository names.
- **Resilient Multi-Channel Dispatcher (`lib/notifications/dispatcher.ts`)**:
  - Non-blocking asynchronous delivery via `Promise.allSettled`.
  - Configurable via `DISCORD_WEBHOOK_URL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, and `NOTIFICATIONS_ENABLED`.
  - Automatic graceful fallback when webhooks are unconfigured or offline (never throws unhandled exceptions to callers).
  - 5-second timeout guard using `AbortController`.
- **Event Dispatch Ingestion Hooks**:
  - `app/api/github/webhook/route.ts`: Instant real-time alerts when PRs are merged into campus repos or external quality repos.
  - `app/api/community/swag/route.ts`: Celebratory dispatch when a student claims a swag tier reward voucher.
  - `app/api/mentorship/requests/route.ts`: Guidance alert when a student submits a mentorship pairing request.
- **Broadcast API Endpoint (`app/api/notifications/broadcast/route.ts`)**:
  - `GET`: Health probe returning provider statuses (`discord`, `telegram`) and supported events.
  - `POST`: Validated broadcast endpoint for test alerts or administrative campus announcements.
- **Automated Quality Assurance**:
  - `tests/backend/notifications-service.test.ts`: Created 33rd backend automated test suite with 51 checks.
  - Master test runner expanded to 33 suites and 1,013+ total checks.

## [1.48.0] - 2026-10-23

### 🧹 Streamlined Platform Architecture & Resume Module Deprecation

- **Complete Resume & Credentials Module Removal**:
  - Removed frontend resume builder and recruiter candidate pages (`app/resume/page.tsx`, `app/resume/share/[token]/page.tsx`).
  - Removed backend resume API endpoints (`app/api/resume/route.ts`, `app/api/resume/[username]/route.ts`, `app/api/resume/share/route.ts`, `app/api/resume/share/[token]/route.ts`, `app/api/resume/badge/[username]/route.ts`).
  - Removed proof-of-work badge component modal (`components/resume/proof-of-work-badge-card.tsx`).
  - Removed obsolete resume backend test suites (`tests/backend/resume-route.test.ts`, `tests/backend/resume-share.test.ts`, `tests/backend/resume-badge.test.ts`).
- **Navigation & Contributor Profile Cleanups**:
  - `components/navigation/sidebar-menu.tsx`: Removed `CREDENTIALS & RESUME` section and `FileText` icon import.
  - `components/navigation/footer.tsx`: Removed the "GitHub Resume Builder" link (`/resume`).
  - `app/api/search/route.ts`: Removed `page-resume` search index item from `PLATFORM_PAGES`.
  - `components/members/student-preview-modal.tsx`: Expanded "Full Profile" CTA button across modal footer.
  - `app/members/[username]/page.tsx`: Removed modal triggers and resume links, streamlining member profile actions to direct profile sharing and verified contributor status.
- **Type Definitions & Data Integrity**:
  - Cleaned unreferenced `ResumeProfileData` and `MOCK_RESUME_DATA` from `types/index.ts` and `lib/data/mock-data.ts`.
  - Typecheck passing with 0 errors across entire workspace.

## [1.47.0] - 2026-10-22

### ⚛️ Unified React 19.3.1 & React DOM Peer Alignment

- **Atomic React Ecosystem Upgrade (`package.json`, `package-lock.json`)**:
  - Upgraded `react` and `react-dom` from `19.2.8` to `19.3.1` concurrently.
  - Automatically resolved peer dependency constraints with `scheduler@^0.28.0`.
  - Harmonizes conflicting split Dependabot updates (#117 and #118) into a unified, reproducible build lockfile.
- **Continuous Quality & Test Integrity**:
  - Full backend test suite passing across all 1,038 assertions with 0 TypeScript compilation errors.

## [1.46.0] - 2026-10-22

### 🔄 Campus GitHub Sync & Good First Issues Automation

- **Automated Issue Synchronizer (`lib/github/sync.ts`)**:
  - Implemented `fetchRepositoryIssues(repoFullName, targetLabels)`:
    - Real-time GitHub REST API integration for open issues from campus repositories (`IST-ZenithenLab/ZenithenOpen` and `IST-ZenithenLab/First-PR`).
    - Smart difficulty mapping (label-based heuristics for `beginner`, `intermediate`, `advanced`).
    - Strict filter to isolate genuine issues and exclude pull requests.
  - Implemented `syncCampusRepositoryIssues()`:
    - Multi-repository campus aggregation with Upstash Redis cache invalidation (`opportunities:list:*`) and persistent caching (`opportunities:synced:all`).
- **Sync Route Expansion (`app/api/github/sync/route.ts`)**:
  - Expanded `availableScopes` and Zod validation schema to include `"issues"`.
  - Added real-time telemetry metrics tracking `issuesSyncedCount` in `lastSyncStats`.
- **Live Dynamic Opportunities Integration (`app/api/opportunities/route.ts`)**:
  - Automatically queries freshly synced GitHub opportunities before falling back to baseline static starters.
- **Backend Test Coverage & Route Verification (`tests/backend/github-sync-route.test.ts`)**:
  - Added assertions validating `issues` scope presence and POST execution metrics.
  - All 1,036 backend tests passing with 0 TypeScript compilation errors.

## [1.45.0] - 2026-10-22

### 🧭 Campus Navigation & Unified Discoverability Enhancements

- **Comprehensive Sidebar Navigation (`components/navigation/sidebar-menu.tsx`)**:
  - Expanded drawer menu to index key platform destinations:
    - **Good First Issues (`/opportunities`)**: Direct access to curated beginner-friendly campus issues with `Briefcase` icon.
    - **Peer Mentorship (`/mentorship`)**: Connect with senior student mentors & alumni leads with `HeartHandshake` icon.
    - **Proof-of-Work Resume (`/resume`)**: Recruiter-ready verified contributor snapshot & badge with `FileText` icon.
    - Grouped into organized, accessible sections: `PROJECTS & OPPORTUNITIES`, `COMMUNITY & MENTORSHIP`, and `CREDENTIALS & RESUME`.
- **Global Command Search Index (`app/api/search/route.ts`)**:
  - Added dedicated search index entries for `/community` (Community Stories & Contributor Swag) and `/mentorship` (Peer Mentorship & Senior Guidance).
  - Enhanced command palette search category filtering to effortlessly surface both pages.
- **Backend Test Coverage & Contract Verification (`tests/backend/command-search.test.ts`)**:
  - Added explicit test assertions validating that both `/community` and `/mentorship` are indexed and discoverable under `category=page`.
  - All 1,034 test assertions passing with 0 TypeScript compilation errors.

## [1.44.0] - 2026-10-22

### 📇 Social-Media Style Student Profile Cards with Dual GitHub & LinkedIn Actions

- **Dual Social Profile Actions (`app/programs/page.tsx`)**:
  - Enhanced student competitor profile cards (Top 3 Podium and Ranks 4+) with dual dedicated action buttons:
    - **GitHub Profile**: External link with official GitHub brand icon.
    - **LinkedIn Profile**: External link with official LinkedIn brand icon and styled theme hover state.
  - Added external target attributes (`target='_blank' rel='noopener noreferrer'`) for safe navigation.
- **Backend Data Contracts Verification (`tests/backend/data-contracts.test.ts`)**:
  - Added assertions validating `githubUrl` and `linkedinUrl` format for student competitors.
  - Enforced valid non-negative metrics for Merged, Open, and Closed PR breakdowns across all timeframes.
- **Quality & Test Integrity**:
  - Full backend test suite passing with 1000/1000 assertions and 0 TypeScript compilation errors.

## [1.43.0] - 2026-10-21

### 🏛️ Official Campus Repositories Copy & Placeholder Harmonization

- **Campus Programs & Leaderboards Copy (`app/programs/page.tsx`)**:
  - Aligned campus repositories leaderboard notice to explicitly highlight the official campus repositories: `(ZenithenOpen & First-PR)`.
- **Campus Repository Registration Modal (`app/projects/page.tsx`)**:
  - Updated registration placeholder to `e.g. ZenithenOpen`, removing obsolete placeholder references.
- **Continuous Quality & Test Integrity**:
  - Verified TypeScript compilation (`tsc --noEmit`) and full test suite passing across all 1000/1000 backend assertions.

## [1.42.0] - 2026-10-21

### 🔐 Student Authentication & Persistent Contributor Session Management

- **Interactive 2-Step Campus Authentication Portal (`app/login/page.tsx`)**:
  - Implemented a dedicated in-page student login portal replacing modal dependency with a streamlined 2-step verification workflow:
    - **Step 1: USN Verification**: Instant validation of university enrollment serial numbers (`1SV...` / `SV...`) against `/api/auth/verify-usn` with quick-fill presets for CS and AI departments.
    - **Step 2: GitHub Authorization**: Links verified student identity to authentic GitHub profiles with real-time PR ingestion via `/api/auth/login`.
- **Authenticated Contributor Dashboard & Session View**:
  - Displays rich student identity badge (name, verified USN, department, year of study, college).
  - Synchronizes verified PR metrics (Merged PRs, Quality PRs, Open PRs, Total Contributions).
  - Provides quick platform navigation to Campus Repositories (`/projects`), Hall of Fame (`/leaderboard`), and Contributor Profiles (`/members/[username]`).
  - Added "Switch Contributor Account" action with clean session reset.
- **Cross-Tab & LocalStorage Session Persistence (`components/auth/auth-context.tsx`)**:
  - Extended `AuthenticatedStudentUser` model with optional synced contribution stats.
  - Added real-time cross-tab synchronization via `window.addEventListener("storage", ...)` ensuring multi-window session consistency.
  - Enhanced `LoginModal` to propagate synchronized PR metrics directly to global auth state.
- **Automated Test Suite Verification**:
  - All 1000/1000 backend test assertions across 35 test suites verified passing with zero regressions.

## [1.41.0] - 2026-10-20

### 🎯 Official Campus Repositories Alignment: Pure ZenithenOpen & First-PR Catalog

- **Catalog & Campus Repository Streamlining**:
  - Removed deprecated and extra repositories (`CampusConnect`, `ZenithenCore`) across all databases, seeds, search indices, and test harnesses.
  - Aligned official campus open-source projects to strictly the 2 core verified repositories:
    1. **ZenithenOpen** (`/projects/zenithen-open`) — Flagship campus developer platform.
    2. **First-PR** (`/projects/first-pr`) — Official onboarding repository for first-time campus pull requests.
- **Database Seeder & Search Index Alignment (`scripts/seed-production.ts`, `app/api/search/route.ts`)**:
  - Cleaned seed definitions to enforce exactly 2 official campus projects.
  - Re-anchored triaged starter opportunities strictly to `IST-ZenithenLab/ZenithenOpen` and `IST-ZenithenLab/First-PR`.
  - Updated global unified search quick-jump items to only feature the 2 official repositories.
- **Automated Test Suite Hardening**:
  - Updated `tests/backend/projects-route.test.ts` to utilize ephemeral sandbox registration with automatic test cleanup, ensuring no residual mock projects linger in production database.
  - Updated `tests/backend/projects-lookup.test.ts` and `tests/backend/db-seed.test.ts` to assert the streamlined 2-repository blueprint.
  - Verified 1001 / 1001 backend test assertions passing across all 35 suites.

## [1.40.0] - 2026-10-20

### 📚 Developer Resources & Technical Articles API + Interactive Markdown Article Reader

- **Developer Resources & Technical Articles API (`/api/resources/articles`)**:
  - Implemented RESTful article retrieval endpoint supporting single article slug lookup (`?slug=...`), multi-category filtering (`?category=career|git|architecture|community`), keyword search across titles/tags/excerpts, difficulty filtering, and featured flags.
  - Curated high-impact campus engineering articles:
    - *How I Cracked My First GSoC as a Sophomore Developer* (proposal timeline, escalation ladder, mentorship blueprint).
    - *Understanding Git Under the Hood: Blobs, Trees, and Commits* (internals, DAG architecture, objects database, rebase mechanics).
    - *Building Real-Time Multi-Theme Engines with CSS Variables* (zero-rerender token mapping, FOUC elimination, HSL color system).
    - *Why Campus Open-Source Matters for Your Engineering Career* (verifiable proof-of-work, technical interview leverage).
    - *Mastering Merge Conflicts and Interactive Git Rebase* (conflict markers, squashing commits, linear histories).
  - Integrated Upstash Redis edge caching (`resources:articles:...`) with resilient in-memory fallback.
- **Interactive Markdown Article Reader Modal (`components/resources/article-reader-modal.tsx`)**:
  - Engineered modal reader with markdown rendering, syntax-styled copyable code snippets with visual copy feedback, key takeaways callout, reading time badge, and tag pills.
  - Added URL query parameter deep-linking (`?slug=...`) and instant link sharing.
- **Developer Resources UI Elevation (`app/resources/page.tsx`)**:
  - Enhanced Technical Blog section with real-time keyword search and category filter tabs (`All Topics`, `Career & Fellowships`, `Git Architecture`, `Web Architecture`, `Community Insights`).
  - Seamlessly bound "Read Article" to launch the interactive modal reader while preserving layout skeleton.
- **Backend Test Suite #35**:
  - Created `tests/backend/resources-articles.test.ts` (47 assertions) validating article retrieval, schema integrity, category queries, search, difficulty filters, and 404 responses.
  - Integrated into `tests/backend/run-all.ts` (Suite #35).

## [1.39.0] - 2026-10-20

### ⚡ Live Campus Activity Pulse & Real-Time Contribution Stream

- **Real-Time Campus Contribution Pulse API (`/api/activity`)**:
  - Engineered event aggregation pipeline synthesizing verified campus engineering activity in real-time.
  - Indexes 6 core activity categories: `quality_pr`, `pr_merged`, `swag_claimed`, `first_pr`, `event_rsvp`, and `member_joined`.
  - Added query filtering (`?type=all|pr|quality|swag|event|first_pr`) and pagination limit controls with Upstash Redis edge caching.
  - Computes telemetry metrics including active contributors in the last 24 hours and total recent campus merges.
- **Interactive Live Activity Stream Component (`components/dashboard/live-activity-stream.tsx`)**:
  - Integrated dynamic real-time contribution feed within the Live Metrics Dashboard on the homepage (`app/page.tsx`).
  - Added animated green liveness pulse indicator, category filter chips, contributor avatars, and relative time stamps.
  - Linked directly to student member profiles and GitHub pull requests.
- **Automated Backend Test Verification**:
  - Added comprehensive test suite `tests/backend/activity-pulse.test.ts` (30 assertions) validating default stream hydration, schema integrity, category filtering, and telemetry metrics.
  - Integrated into test runner `tests/backend/run-all.ts` (Suite #34).

## [1.38.0] - 2026-10-19

### 🎁 Community Contributor Swag & Physical/Digital Rewards Engine

- **Contributor Tier Qualification & Swag API (`/api/community/swag`)**:
  - Engineered tier evaluation engine assessing verified student pull requests across 4 standardized recognition levels:
    - **Tier 1 (1 PR)**: First PR Digital Verification Badge & Directory Listing
    - **Tier 2 (5+ PRs)**: Holographic Contributor Sticker Pack & Certificate
    - **Tier 3 (15+ PRs)**: Developer Performance T-Shirt & Priority Code Reviews
    - **Tier 4 (30+ PRs)**: Heavyweight Embroidered Community Hoodie & Leadership Grant
  - Built student eligibility checker evaluating real merged PR counts, unlock status, and past claim records.
  - Implemented secure claim processing with physical apparel size verification (`S` to `2XL`), collection point validation, and duplicate claim rejection (`409 Conflict`).
- **Interactive Swag Claim Modal (`components/community/swag-claim-modal.tsx`)**:
  - Implemented modal with auto-detection of authenticated student handle, real-time metrics inspection, and tier status badges (Locked / Eligible / Claimed).
  - Integrated holographic voucher generator creating verifiable vouchers with format `SWAG-2026-IST-XXXX` and instant one-click code copy.
- **Community Rewards Tab Upgrade (`app/community/page.tsx`)**:
  - Added interactive "Check Swag Eligibility & Claim Voucher" callout banner with ambient glow lighting.
  - Preserved 100% of community page structure and navigation context across all 5 community sections.
- **Automated Backend Test Verification**:
  - Created test suite `tests/backend/community-swag.test.ts` (38 assertions) verifying tier definitions, top contributor unlocks, claim submissions, duplicate blocks, and size validations.
  - Integrated into test runner `tests/backend/run-all.ts` (Suite #33).

## [1.37.0] - 2026-10-18

### 🗓️ Dynamic Campus Events & Interactive Workshop RSVP Hub

- **Campus Events Discovery & Scheduling Engine (`/api/events`)**:
  - Engineered dynamic events API serving real-time campus workshops, weekly Open Source Saturday PR review office hours, hackathons, and GSoC fellowship talks.
  - Added query filtering by category (`workshop`, `office-hours`, `fellowship`, `hackathon`), status (`upcoming`, `live`, `completed`), and search keywords.
  - Integrated Upstash Redis caching with fallback to in-memory store.
- **Interactive One-Click RSVP Registration (`/api/events/rsvp` & `components/events/event-rsvp-modal.tsx`)**:
  - Implemented sleek dark-glass RSVP modal with auto-detection of authenticated student handles, department capture, and live capacity enforcement.
  - Added robust duplicate registration prevention returning `409 Conflict` if already registered.
  - Rendered live attendee avatars preview, real-time seat reservation progress counters, and instant confirmation notifications.
- **Standard iCalendar (.ics) & Google Calendar Integration (`/api/events/[id]/calendar`)**:
  - Added RFC 5545 standard `.ics` generation allowing direct calendar imports into Apple Calendar, Outlook, and mobile calendar apps.
  - Implemented direct 1-click Google Calendar web event rendering with pre-formatted titles, dates, session agendas, and campus location links.
- **Automated Backend Test Verification**:
  - Added comprehensive test suite `tests/backend/events-hub.test.ts` (50 assertions) verifying events discovery, category filtering, search queries, RSVP registration, capacity constraints, duplicate handling, and calendar generation.
  - Integrated into test runner `tests/backend/run-all.ts` (Suite #32).

## [1.36.0] - 2026-10-16

### 🔍 Unified Global Command Palette & Instant Search Engine

- **Global Quick Jump & Command Palette (`Cmd+K` / `Ctrl+K`)**:
  - Implemented keyboard-driven command palette modal (`components/navigation/command-palette.tsx`) with instant fuzzy filtering across contributors, campus repositories, good first issues, and navigation hubs.
  - Added global keyboard shortcut listeners for `Cmd+K` (macOS), `Ctrl+K` (Windows/Linux), and `Escape` for dismissal.
  - Added full keyboard accessibility with arrow key navigation (`↑`/`↓`), `Enter` to jump, category filters ("All", "Contributors", "Repositories", "Pages"), and responsive mobile triggers.
- **Top Navigation Integration**:
  - Integrated high-speed search trigger in the sticky header (`components/navigation/navbar.tsx`) displaying search icon, responsive text, and `⌘K` keyboard badge.
- **Unified Search API Endpoint (`/api/search`)**:
  - Created high-performance search API endpoint indexing verified student contributors, core campus repositories, starter opportunities, and platform routes.
  - Supports query parameter `q`, category filtering (`category=contributor|project|opportunity|page`), and custom result limits with resilient edge caching.
- **Automated Backend Test Verification**:
  - Added comprehensive test suite `tests/backend/command-search.test.ts` (50 assertions) verifying keyword matching, category filtering, limit constraints, and edge fallbacks.
  - Full backend test suite passing with 31 / 31 test suites.

## [1.35.0] - 2026-10-16

### 💎 Holographic Contributor Badge Card & Social Proof-of-Work Export

- **Interactive 3D Holographic Contributor Pass**:
  - Implemented 3D perspective tilt physics (`perspective: 1000px`, dynamic `rotateX`/`rotateY`) with pointer-tracking iridescent chromatic sheen reflection on `/components/resume/proof-of-work-badge-card.tsx`.
  - Displayed student contributor avatar, verified checkmark badge, academic department, and 3 key metrics:
    - **Quality Merges** (&ge;100&star; and &ge;100 forks)
    - **Campus Merges** (IST campus repositories)
    - **Total Merged PRs** (across all verified open-source repositories).
- **Client-Side High-Res PNG & Vector SVG Export**:
  - Engineered client-side HTML5 `<canvas>` high-DPI rasterizer generating downloadable 1200x630 social preview PNG images for LinkedIn and X (Twitter).
  - Added vector SVG download action fetching crisp scalable badges directly from `/api/resume/badge/[username]`.
- **Social Sharing & Profile README Embeds**:
  - Integrated one-click LinkedIn offsite sharing and X / Twitter intent pre-filled with verified contribution stats and verification link.
  - Added one-click copy buttons for GitHub profile `README.md` Markdown badges, HTML website embed snippets, and direct verification URLs.
- **Member Profile Seamless Connectivity**:
  - Added prominent **Contributor Badge** action in the floating navigation header on `/members/[username]`.
  - Added clickable **VERIFIED CONTRIBUTOR CARD** badge chip in the hero section to instantly trigger the holographic pass.
  - Connected the **Share** button to simultaneously copy the link and launch the badge modal.
- **Backend Quality Verification & Seed Alignment**:
  - Aligned database seeder blueprint in `scripts/seed-production.ts` to satisfy all project star/fork thresholds and foundational campus repositories.
  - Verified 100% pass across all 30 backend test suites (786 tests).

## [1.34.0] - 2026-10-15

### 🌟 Bespoke Student Contributor Profiles & Platform-Wide Navigation Connectivity

- **Bespoke Contributor Profile Experience**:
  - Re-engineered student profile pages (`/members/[username]` and `/students/[username]`) with immersive dark-glass aesthetics, ambient chromatic glow lighting, and circular avatar badges.
  - Implemented the 4 foundational narrative sections:
    - **The Journey**: Authentic reflections on learning programming and joining the campus open-source movement.
    - **Key Learnings**: Grid cards detailing hard-won lessons on code reviews, consistency, and architecture.
    - **Proudest Milestones**: Bullet lists celebrating shipped production features and verified open-source contributions.
    - **Advice to Juniors**: Styled pull-quotes providing mentorship to aspiring first-year campus developers.
  - Added full contributions grid detailing Total PRs, Merged, Open, Closed, and Quality Merges (&ge;100&star; and &ge;100 forks).
  - Preserved verified pull request lists with live GitHub repository links and skills tags.
- **End-to-End Navigation Connectivity**:
  - Linked student cards and contributor standings across the Homepage, Contributor Leaderboard, Programs Arena, and Members Directory.
  - Expanded the global slide-out navigation menu with direct links to **Hall of Fame** (`/leaderboard`), **Campus Repositories** (`/projects`), and **Members Directory** (`/members`).
  - Integrated student profile querying in `app/api/members/route.ts` and `app/api/members/[username]/route.ts` with graceful fallback handling.

## [1.33.0] - 2026-10-14

### 🏆 Strict 4-Tier Leaderboard Ranking Algorithm

- **Deterministic 4-Tier Sorting Hierarchy**:
  - Implemented strict 4-tier ranking algorithm in `app/api/students/leaderboard/route.ts` and `app/leaderboard/page.tsx`:
    - **Tier 1 (Primary)**: Quality Merged PRs (repositories with >=100 stars and >=100 forks, status = MERGED).
    - **Tier 2 (First Tie-breaker)**: Quality Open PRs (repositories with >=100 stars and >=100 forks, status = OPEN).
    - **Tier 3 (Second Tie-breaker)**: Quality Closed PRs (repositories with >=100 stars and >=100 forks, status = CLOSED unmerged).
    - **Tier 4 (Third Tie-breaker)**: Total Merges (all merged pull requests across the student's entire GitHub account).
  - Added deterministic alphabetical tie-breaker by student username for identical records.
- **Granular Quality Pull Request Metrics**:
  - Extended `ContributorTimeframeStats` in `lib/data/student-competition.ts` with `qualityOpenPrs` and `qualityClosedPrs`.
  - Updated `computeTimeframeStats` to compute quality open PRs and quality closed PRs directly from authentic PostgreSQL contribution records.

## [1.32.0] - 2026-10-14

### 🚀 Interactive Step-by-Step "First Campus PR" Guide for IST Contributors

- **Personalized First PR Walkthrough Engine**:
  - Implemented `<InteractiveFirstPrGuide />` in `@/components/resources/interactive-first-pr-guide`:
    - Real-time command personalizer taking the student's GitHub username and feature/branch slug and updating all 7 terminal commands dynamically.
    - Persistent step tracking with `localStorage` persistence so students can track progress across study sessions.
    - Live progress bar indicator tracking PR readiness from 0% to 100%.
    - One-click terminal command copy with visual feedback.
    - Direct links to IST-ZenithenLab/ZenithenOpen issues and pull request compare views.
- **Pre-flight Quality Checklist**:
  - Added interactive pre-flight verification covering TypeScript builds (`npm run typecheck`), atomic commit scoping, Conventional Commits formatting, and GitHub issue linkage.
- **Milestone Celebration Banner**:
  - Displays celebratory banner upon completion of all 7 steps with a direct link to submit their pull request to earn their verified campus badge.
- **Resources Page Integration**:
  - Upgraded `/resources` "Make First PR" tab with the interactive workflow component.

## [1.31.0] - 2026-10-14

### 🎖️ Student Proof-of-Work Resume & Shareable Badge Card Export

- **Dynamic Proof-of-Work Badge Card Generator API**:
  - Implemented `GET /api/resume/badge/[username]` route producing official verifiable credentials:
    - Default SVG format generating high-resolution vector badge card with dark gradient, neon cyan border glow, IST Bengaluru verified shield, student avatar initials, verified name, and 3 key metrics (Quality Merges, Campus Merges, Total Merges).
    - JSON format (`?format=json`) providing structured metadata and instant embed code snippets.
    - Public edge-cached headers (`s-maxage=1800, stale-while-revalidate=3600`).
- **One-Click Share and Embed Modal**:
  - Built `<ProofOfWorkBadgeModal />` component in `@/components/resume/proof-of-work-badge-card`:
    - Real-time interactive preview of candidate's verified proof-of-work credential.
    - One-click LinkedIn direct post share (`https://www.linkedin.com/sharing/share-offsite/...`).
    - One-click copy for Markdown embed snippet (`[![ZenithenOpen Proof of Work]...]`) for GitHub profile READMEs.
    - One-click copy for HTML embed code for personal websites.
    - Direct share link copy.
- **Cross-Platform Integration**:
  - Integrated into `/resume` interactive resume editor toolbar (`Shareable Badge` button).
  - Integrated into `/resume/share/[token]` public shared candidate dossier (`Export Badge Card` button).
- **Automated Backend Test Coverage**:
  - Added `tests/backend/resume-badge.test.ts` verifying JSON schema, Markdown embed snippets, HTML markup, SVG vector structure, and fallback generation.

---

## [1.30.0] - 2026-10-14

### 🚀 GitHub Repository Metadata Auto-Sync for Campus Projects

- **Automated Repository Metadata Ingestion**:
  - Implemented `GET` and `POST /api/projects/lookup` route for automatic inspection of GitHub repository metadata:
    - Normalizes GitHub repository identifiers across HTTPS URLs, git SSH formats, and `owner/repo` direct notation.
    - Synchronizes repository name, tagline, description, primary language, topics/tags, stars count, and forks count.
    - Intelligent campus repository detection (`IST-ZenithenLab/*`).
    - Redis-cached with 1-hour TTL (`github:lookup:{owner}:{repo}`).
- **Interactive Auto-Fill Registration Flow**:
  - Enhanced the "Register Campus Repository" modal on `/projects`:
    - Positioned GitHub repository URL input with instant "Auto-Fill from GitHub" action.
    - Automatic lookup on input blur to eliminate manual typing friction for student creators.
    - Added verified live GitHub metadata pill displaying stars, forks, and detected primary language.
    - Passes authentic stars and forks count during project creation into Supabase PostgreSQL.
- **Automated Backend Test Suite**:
  - Added `tests/backend/projects-lookup.test.ts` validating URL parsing permutations, error responses, metadata extraction, and caching behavior.

---

## [1.29.0] - 2026-10-14

### 🪪 Contributor Quick-Preview Student Card Modal

- **Cross-Platform Quick Preview Modal**:
  - Introduced reusable, high-fidelity `<StudentPreviewModal />` component in `@/components/members/student-preview-modal`.
  - Built strictly to reference aesthetic standards:
    - Ambient dark radial backdrop gradient and circular avatar with radiant cyan glow ring.
    - Verified IST Student badge, student department and academic year subtitle.
    - Direct external GitHub and LinkedIn social navigation action buttons.
    - 5 PR metric stat cards (Quality Merge, Total PR, Open, Closed, Merged).
    - Campus repository merges callout when student has official campus contributions.
    - Quick actions: Direct link to student's Proof-of-Work Resume and Full Profile page.
- **Ubiquitous Contributor Integration**:
  - Integrated quick-preview modal triggers on the Leaderboard page (`/leaderboard`):
    - Top 3 podium cards with dedicated Preview button.
    - Contributor table rows with instant-access user preview trigger.
  - Integrated on Campus Repositories Projects Leaderboard (`/projects`):
    - Podium cards and rank 4+ list standings.
  - Integrated on Homepage (`/`):
    - Monthly top contributors ranking list.
- **Automated Backend Test Suite**:
  - Added `tests/backend/student-preview-modal.test.ts` validating data contract, mapping, URL fallbacks, and metric calculations across all contributor sources.

---

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
