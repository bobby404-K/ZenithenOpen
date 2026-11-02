# ZenithenOpen Engineering Development Log

> ### 🌿 Engineering Standards & Workflow Protocol
> For **every new feature, task, or bugfix**:
> 1. Create a dedicated branch off `main` (`feature/<name>`, `fix/<name>`).
> 2. Implement changes, verifying 0 TypeScript errors (`npm run typecheck`) and passing test suites (`npm test`).
> 3. Open a Pull Request (PR) on GitHub targeting `main`.
> 4. Review and merge the PR into `main` (using `--merge` or `--squash`).
> 5. **Never delete feature branches**; preserve them permanently locally and remotely as historical proof-of-work.
> 6. Pull latest `main`, create an annotated tag (`git tag -a vX.Y.Z`), push to origin (`git push origin vX.Y.Z`), and publish the GitHub Release notes.

---

## Entry: 2026-11-02 — Milestone 58: Clean Slate Production Launch Architecture (Option B Zero-Mock)

### Milestone
v1.58.0 — Clean Slate Production Launch Architecture

### Files Changed
* `app/api/students/leaderboard/route.ts` — Restricted sample student competitors strictly to sandbox/test query param (`?mock=true`); default production calls return purely authenticated database contributors.
* `app/api/projects/leaderboard/route.ts` — Required `?mock=true` for fallback campus repository allocations; live requests return empty array awaiting real student PR merges.
* `app/programs/page.tsx` — Cleaned state initialization and implemented dedicated "Arena Standings Awaiting First Pull Request" empty state card with CTA.
* `tests/backend/campus-projects-leaderboard.test.ts` — Added live query assertion (clean slate) and parameterized mock algorithm validation.
* `tests/backend/student-preview-modal.test.ts` — Standardized mock param for fixture tests.
* `package.json` — Version bumped to 1.58.0.
* `CHANGELOG.md` — Release notes for v1.58.0.

### Architecture Decisions
1. **Option B Pure Clean Slate**: Instead of leaving artificial student competitor records visible upon production deployment, all leaderboard endpoints default to pure live data. The platform displays authentic "Awaiting First Pull Request" banners until real college contributors submit code.
2. **Deterministic Developer Sandboxing**: Developers and automated test suites can seamlessly test ranking algorithms and UI contracts at any time by passing `?mock=true`.
3. **100% Zero-Downtime Resilience**: If a cold database has 0 contributions, routes gracefully return valid empty arrays instead of throwing exceptions.

---

## Entry: 2026-11-02 — Milestone 57: Verified GitHub & LinkedIn Badges Across Contributor Surfaces

### Milestone
v1.57.0 — Verified GitHub & LinkedIn Badges Across Contributor Surfaces

### Files Changed
* `components/leaderboard/contributor-rankings-table.tsx` — Added optional `githubUrl` and `linkedinUrl` to `LeaderboardContributorItem` and verified identity badges directly beside contributor handles.
* `app/members/[username]/page.tsx` — Upgraded profile hero with identity badge trio (Verified Student, GitHub, LinkedIn) and high-contrast social action buttons.
* `components/members/student-preview-modal.tsx` — Added verified badge trio and direct external GitHub and LinkedIn connection actions.
* `app/members/page.tsx` — Added verified badge to card title and LinkedIn profile link button in card actions.
* `app/leaderboard/page.tsx` — Passed social links to table rankings and added verified badges to top 3 podium highlights.
* `app/projects/page.tsx` — Passed social links to campus repository table rankings and added verified badges to project podium cards.
* `app/programs/page.tsx` — Passed social links to competition arena contributor rankings table.
* `app/page.tsx` — Forwarded student `githubUrl` and `linkedinUrl` to homepage leaderboard rankings table.
* `package.json` — Version bumped to 1.57.0.
* `CHANGELOG.md` — Release notes for v1.57.0.

### Architecture Decisions
1. **Pervasive Identity Verification**: Following the dual-OAuth student authentication in v1.56.0, all contributor surfaces now visually reflect verified GitHub developer status and verified LinkedIn professional status alongside campus USN enrollment.
2. **Standardized Brand Aesthetics**: Brand colors (`#0A66C2` for LinkedIn and high-contrast dark GitHub styling) are strictly aligned across tables, podiums, modals, and showcase profile views.
3. **Resilient Fallback**: Contributor surfaces handle optional social links gracefully, generating standard GitHub URLs where appropriate while highlighting verified badges when provided.

---

## Entry: 2026-11-01 — Milestone 56: Dual-Authorized Student Authentication (USN ➔ GitHub OAuth ➔ LinkedIn OAuth)

### Milestone
v1.56.0 — Dual-Authorized Student Authentication Architecture

### Files Changed
* `app/api/auth/oauth/github/route.ts` — GET / POST endpoints for official GitHub OAuth authorization and sandbox exchange.
* `app/api/auth/oauth/linkedin/route.ts` — GET / POST endpoints for official LinkedIn OAuth 2.0 authorization and sandbox exchange.
* `app/api/auth/login/route.ts` — Multi-factor student linkage linking USN, GitHub, and LinkedIn profile details with fast 1-click fallback.
* `components/auth/auth-context.tsx` — Extended student model with GitHub and LinkedIn metadata, remembered accounts caching.
* `app/login/page.tsx` — Modern 3-step onboarding UI (USN ➔ GitHub OAuth ➔ LinkedIn OAuth) with status tracking, preview badges, and quick testing presets.
* `components/auth/login-modal.tsx` — Updated global header login dialog matching the 3-step flow and fast returning contributor tab.
* `.env.example` — Added `LINKEDIN_CLIENT_ID` and `LINKEDIN_CLIENT_SECRET`.
* `tests/backend/oauth-login.test.ts` — Comprehensive unit test suite with 34 assertions for OAuth routes and login workflows.
* `tests/backend/run-all.ts` — Registered new OAuth suite.
* `package.json` — Version bumped to 1.56.0.
* `CHANGELOG.md` — Release notes for v1.56.0.

### Architecture Decisions
1. **Mandatory 3-Step Verification Flow**: Every new student contributor must first verify their university USN against the student directory, then authorize their official GitHub account, and finally authorize their LinkedIn profile.
2. **Resilient OAuth + Dev Sandbox Fallback**: Both GitHub and LinkedIn endpoints seamlessly provide live OAuth URLs when client keys are configured, while falling back gracefully to developer sandbox simulation when running in offline or campus demo modes.
3. **Remembered Contributor Fast Return**: Returning students are remembered in local storage to allow 1-click authentication without repeatedly re-typing USN numbers.

---

## Entry: 2026-10-02 — Milestone 0: Repository Audit, Foundation & Frontend Compilation Hardening

### Milestone
Phase 0 Foundation & Phase 3/4 UI Compilation Fixes

### Files Changed
* `app/resume/page.tsx` — Fixed build-breaking import error (`Linkedin` -> `LinkedinIcon` from custom icons).
* `.env.example` — Added documented environment variable template for PostgreSQL, Auth.js, GitHub OAuth, Redis, Sentry, and PostHog.
* `Dockerfile` — Multi-stage production Dockerfile (`base`, `deps`, `builder`, `runner`).
* `docker-compose.yml` — Container definitions for Next.js, PostgreSQL 16, and Redis 7.
* `.dockerignore` — Build context exclusions.
* `docs/architecture.md` — Core architecture specification and domain breakdown.
* `docs/development-log.md` — Initialized living development log.
* `README.md` — Comprehensive open-source onboarding documentation.

### Architecture Decisions
1. **Brand Icon Handling**: Lucide React deprecates vendor-specific brand icons. All brand SVGs (GitHub, LinkedIn) are centralized in `@/components/ui/icons` to avoid external dependency issues.
2. **Modular Monolith**: Retained domain folders under `modules/*` for clear separation of concerns.
3. **Frontend Independence**: Enabled interactive mock-data flows so all frontend screens can be verified and utilized before running live database migrations.

### Commands Learned & Used
* `git status`, `git branch -a`, `git remote -v`, `git log` — Git auditing.
* `npx tsc --noEmit` — Strict TypeScript type-checking without emitting files.
* `npm run lint` — ESLint verification across Next.js App Router.
* `npm run build` — Turbopack production compilation.

### Git Operations
* Audited repository on `main`.
* Creating `development` branch to maintain stable `main` and stage active changes.

### Problems & Solutions
* **Problem**: Build failed with `error TS2305: Module '"lucide-react"' has no exported member 'Linkedin'`.
* **Solution**: Replaced non-existent Lucide export with `LinkedinIcon` from `@/components/ui/icons`. Verified `npx tsc --noEmit` and `npm run build` both succeeded with exit code 0.

### Next Step
Verify all remaining frontend features (leaderboard filters, project tags, learning modules, mentorship request forms) and commit Milestone 0 to `development` branch, then push to GitHub.

---

## Entry: 2026-10-02 — Milestone 1: Container Orchestration & Port Isolation

### Milestone
Docker Compose Multi-Container Orchestration & Port De-confliction

### Files Changed
* `docker-compose.yml` — Removed deprecated Compose `version` key and mapped host PostgreSQL to port `5433` (`5433:5432`) to prevent collision with pre-existing host database services on port `5432`.

### Architecture & Networking Decisions
1. **Container Port Mapping vs Internal Network**: The Next.js web application (`zenithen-open-app`) connects to `zenithen-postgres:5432` through the internal bridge network (`zenithen-network`). Mapping the host port to `5433` provides host machine tool access without blocking local developer workflows.
2. **Web Port**: Exposed port `3000:3000` for public browser access at `http://localhost:3000`.

### Git Operations
* Branch: `development`
* Committing and pushing Docker port isolation fix to `origin/development`.

---

## Entry: 2026-10-02 — Milestone 2: UI/UX Elevation & Fake Data Purge

### Milestone
Linear/Vercel-Grade Design System Overhaul & Authentic Zero-State Sanitization

### Files Changed
* `lib/data/mock-data.ts` — Purged all fake user profiles, fake PR stories, fake repository metrics, and fake star counts. Preserved authentic, high-value curriculum roadmaps and zero-initialized metrics.
* `app/globals.css` — Upgraded to Linear-grade styling tokens: pure obsidian backdrop (`#06080e`), subtle border highlights (`border-white/[0.06]`), micro-grid textures, chromatic ambient glow spotlights, and refined scrollbars.
* `components/dashboard/hero-section.tsx` — Replaced fake avatars and inflated numbers with an authentic developer hero, live daemon status pill, and high-tech terminal preview.
* `components/dashboard/live-metrics.tsx` — Transitioned telemetry counters to real baseline zeros with live query triggers.
* `app/page.tsx` — Redesigned homepage sections with state-of-the-art empty state cards and direct GitHub actions.
* `app/members/page.tsx` — Introduced authentic "Founding Contributor" zero-state with interactive GitHub OAuth linking modal.
* `app/projects/page.tsx` — Upgraded to a sleek repository directory with real GitHub organization sync CTAs.
* `app/opportunities/page.tsx` — Implemented clean zero-state awaiting `good-first-issue` webhook tagging.
* `app/leaderboard/page.tsx` — Modernized standings view with real zero-state and contributor philosophy.
* `app/achievements/page.tsx` — Kept permanent milestone badges and interactive confetti celebration without fake stories.
* `app/resume/page.tsx` — Transformed static resume into a live, interactive open-source CV generator with real-time editing.
* `app/mentorship/page.tsx` — Authentic mentor network application with working dispatch form.
* `app/admin/page.tsx` — Clean administrative console with real zero metrics and GitHub sync trigger.
* `components/navigation/navbar.tsx` & `components/navigation/footer.tsx` — Removed hardcoded fake star and member counts; updated all links to the official `IST-ZenithenLab` organization.

### Architecture & Design Decisions
1. **Zero Fake Data Discipline**: Per project principles, fabricated user identities and metrics were completely purged. The platform now operates in true zero-state readiness, populating only as real students link their GitHub accounts.
2. **Elevated Visual Language**: Replaced generic high-contrast badges with translucent, muted border styles, subtle typography tracking, and ambient light meshes.

### Verification & Deployment
* `npx tsc --noEmit` — 0 TypeScript errors.
* `npm run build` — 14/14 pages compiled cleanly with Turbopack.
* Docker Compose — Rebuilt `zenithenopen-app` container and verified HTTP 200 OK on `http://localhost:3000`.

---

## Entry: 2026-10-02 — Milestone 3: 2-Step USN Verification, GitHub Auth Modal & Open-Source Database Abstraction

### Milestone
IST Student USN Verification, GitHub SSO Link Modal, and Decoupled Database Layer

### Files Changed
* `lib/auth/usn-verification.ts` — Implemented algorithmic IST enrollment validator (`^(1SV|SV)\d{2}[A-Z]{2,4}\d{3}$`) with branch decoding, year of study inference, and pluggable DB hooks. Zero hardcoded student records committed to git.
* `lib/db/index.ts` — Created clean database layer abstraction interface with `isDatabaseConfigured()` check and plug-and-play PostgreSQL / Prisma hooks.
* `app/api/auth/verify-usn/route.ts` — Dynamic Next.js API route verifying student USN via async verification service.
* `components/auth/auth-context.tsx` — Global client-side authentication provider managing student enrollment state, GitHub link status, and session persistence in `localStorage`.
* `components/auth/login-modal.tsx` — High-tech 2-step modal dialog:
  - Step 1: Enters USN, triggers API verification, dynamically renders student's department, admission year, and university badge.
  - Step 2: Links GitHub profile (`@username`) or executes OAuth redirect.
* `components/navigation/navbar.tsx` — Added responsive "Sign In" button opening the modal; renders student badge (`@githubUsername` + USN) with session sign-out dropdown when authenticated.
* `app/layout.tsx` — Mounted `AuthProvider` and global `LoginModal` at root.
* `app/login/page.tsx` — Direct fallback authentication page for deep links and bookmarking.
* `docs/open-source-and-database-guide.md` — Guide documenting open-source privacy compliance and step-by-step database connection.

### Architecture & Open-Source Decisions
1. **Public Repository Privacy**: In accordance with open-source hygiene, zero private student rosters or mock student names exist in source control. The validation layer operates algorithmically today, and seamlessly connects to PostgreSQL or Supabase as soon as `DATABASE_URL` is set in production.
2. **Decoupled 2-Step Workflow**: Prevents unauthorized GitHub linking by ensuring only IST students can register.
3. **Pluggable DB Adapter**: Allows the frontend to be fully tested and deployed on open-source platforms while leaving database integration as a drop-in hook in `lib/db/index.ts`.

### Verification
* `npx tsc --noEmit` — 0 TypeScript errors.
* `npm run build` — 16/16 routes compiled successfully.

---

## Entry: 2026-10-03 — Milestone 4: 3D Interactive Background (GitHub Top 100 Organizations with Cursor Repulsion)

### Milestone
Three.js WebGL Interactive 3D Sphere Galaxy with Real-Time Cursor Repulsion Physics and GitHub Top 100 Organizations

### Files Changed
* `lib/data/github-top-orgs.ts` — Authentic dataset of GitHub's top 100 open-source organizations (Meta, Microsoft, OpenAI, Google, Linux, Vercel, HuggingFace, Supabase, Rust, etc.) with star counts, language metadata, descriptions, and language color tokens.
* `components/3d/github-orgs-background.tsx` — Full-viewport 3D WebGL canvas powered by Three.js:
  - 3D icospheres dynamically sized by global star prominence.
  - Custom emissive shaders and wireframe glowing halos.
  - Multi-layer orbital trajectories with vertical harmonic bobbing.
  - Smooth entrance animation fly-in over 2.2 seconds.
  - Real-time cursor repulsion physics with quadratic falloff and spring-damped orbit return.
  - Interactive raycasting: hovered sphere glows, scales up 1.25x, and displays dynamic glassmorphic HUD tooltip showing org details, language badge, and star metrics.
  - Click-through navigation opening official GitHub organization pages in new tabs.
  - Responsive density scaling (100 spheres on desktop, 65 on tablet, 32 on mobile).
  - Accessibility: Respects `prefers-reduced-motion` and includes screen reader alternative.
* `components/dashboard/hero-section.tsx` — Mounted the 3D background behind hero headlines and terminal preview with selective `pointer-events` pass-through.
* `package.json` & `package-lock.json` — Added `three` and `@types/three`.

### Performance & Quality Metrics
* Render Target: 60 FPS requestAnimationFrame with GPU-accelerated buffers and geometry reuse.
* Build Verification: `npx tsc --noEmit` passed with 0 errors; `npm run build` Turbopack production compilation passed for all 16 routes.

---

## Entry: 2026-10-03 — Milestone 5: Authentic Open-Source Tech Logos & Card-Free Smooth Repulsion

### Milestone
Real Open-Source Vector Logos (PyTorch, Docker, React, Linux, Kubernetes, etc.) on 3D Floating Glass Badges with Organic Random Drift & Pure Cursor Repulsion (No Info Cards)

### Files Changed
* `lib/data/tech-icons-svg.ts` — Handcrafted high-resolution SVG vector definitions and brand palettes for top technologies: PyTorch, Docker, Kubernetes, Python, React, Next.js, Linux (Tux), Rust, Go, TypeScript, TensorFlow, Redis, PostgreSQL, Tailwind, Bun, Supabase, Git, GitHub, Vue, Svelte, Vite, GraphQL, OpenAI, FastAPI, Neovim, Ollama, etc.
* `components/3d/github-orgs-background.tsx` — Transformed 3D rendering pipeline:
  - Replaced solid colored spheres with circular glass badges featuring crisp official tech logos.
  - Billboarded `THREE.Sprite` ensures all logos remain upright and legible in 3D.
  - Organic, totally random spatial distribution across 3D coordinates.
  - Smooth cursor repulsion physics pushes badges smoothly away within a 220px radius.
  - Removed info cards/tooltips completely for a clean, non-distracting visual experience.
  - Gentle scale highlight on hover with spring-damped return to baseline.

### Performance & Quality
* Turbopack production compilation: 16/16 routes compiled cleanly with 0 TypeScript errors.
* 60 FPS performance maintained via canvas texture caching and GPU sprite rendering.

---

## Entry: 2026-10-03 — Milestone 6: GitHub Organization Circular Avatars with Pure Cursor Repulsion (No Info Popups)

### Milestone
Official GitHub Organization Avatars (PyTorch, IST-ZenithenLab, TWBS, DeepChem, Excalidraw, etc.) in Clean Circles with Smooth Orbital Repulsion Physics and Zero Popups

### Files Changed
* `lib/data/github-org-avatars.ts` — Curated dataset of GitHub organizations with verified login handles and star metrics for proportional scaling (`radius = 15 + (stars / maxStars) * 45`).
* `components/3d/github-orgs-background.tsx` — Clean 3D avatar rendering pipeline:
  - Fetches and renders official high-resolution GitHub organization profile avatars (`https://github.com/${login}.png?size=200`).
  - Circular clipping with subtle crisp borders; removed colored neon rings and wireframes.
  - Multi-layer orbital trajectories with vertical harmonic bobbing.
  - Real-time cursor repulsion physics (260px influence radius, 150px max push distance) with 0.05 lerp factor return.
  - Complete removal of info cards, tooltips, and text popups for an unobtrusive, tech-forward background.
  - Mobile touch support with scroll detection to prevent jank.
  - Responsive density (65 desktop, 42 tablet, 22 mobile).

### Verification
* `npx tsc --noEmit` — 0 TypeScript errors.
* `npm run build` — 16/16 routes compiled successfully.

---

## Entry: 2026-10-03 — Milestone 7: Exact Top 100 GitHub Organizations Converted into Clean Circles

### Milestone
Exact Top 100 GitHub Organization Logos (Microsoft, Apache, Anthropic, Meta, Public APIs, FreeCodeCamp, Google, OpenClaw, HuggingFace, OpenAI, GitHub, Vercel, TensorFlow, PyTorch, etc.) Converted to Crisp 3D Circles with Pure Cursor Repulsion (No Cards / Popups)

### Files Changed
* `lib/data/github-org-avatars.ts` — Updated to exact top 100 organization directory specified by user: `#1 @microsoft`, `#2 @apache`, `#3 @anthropics`, `#4 @meta`, `#5 @public-apis`, `#6 @freeCodeCamp`, `#7 @google`, `#8 @openclaw`, `#9 @EbookFoundation`, `#10 @huggingface`, `#14 @openai`, `#15 @github`, `#18 @vercel`, `#19 @tensorflow`, `#21 @kubernetes`, `#22 @rust-lang`, `#48 @pytorch`, up to `#100 @excalidraw`.
* `components/3d/github-orgs-background.tsx` — Converted all organization avatars into clean circular tokens:
  - Clean circular clipping (`ctx.arc` with solid white base backing).
  - Subtle crisp border without harsh color-tinting rings.
  - Sized by ranking importance in 3D world units.
  - Cursor repulsion physics (260px radius) with smooth 0.05 lerp spring return.
  - Zero info popups, cards, or hover tooltips.

### Verification
* `npx tsc --noEmit` — 0 TypeScript errors.
* `npm run build` — 16/16 routes compiled successfully.

---

## Entry: 2026-10-04 — Milestone 8: Animated Sidebar Navigation Interaction & Hero Shift

### Feature Name
Animated Sidebar Navigation with Coordinated Hero Shift and Ambient Badge Concealment

### Branch
`feature/sidebar-menu-interaction`

### Files Changed
* `components/navigation/navigation-context.tsx` — Created centralized `NavigationProvider` managing single source of truth (`isSidebarOpen: boolean`), route change listener, background scroll lock on mobile, and Escape keyboard dismiss handler.
* `components/navigation/sidebar-menu.tsx` — Built sliding drawer with Framer Motion (`translateX(-100%)` to `0`), primary navigation (Leaderboard, Hall of Fame, Resume), campus hub links, and accessible close button.
* `components/navigation/navbar.tsx` — Integrated a 3-line hamburger menu button in the top-left logo area with morphing animation lines and full WAI-ARIA disclosure attributes.
* `components/dashboard/hero-section.tsx` — Coordinated responsive leftward hero shift (`-translate-x-4 sm:-translate-x-10 md:-translate-x-16 lg:-translate-x-20 xl:-translate-x-24`) and smooth container-level fade-out (`opacity-0 scale-95`) of all 100+ ambient floating badges when the sidebar opens.
* `app/layout.tsx` — Mounted `NavigationProvider` and `SidebarMenu` at platform root.

### Implementation Approach
* Single Source of Truth architecture ensures hero movement, floating badge visibility, backdrop blur, and drawer position are driven synchronously from one state.
* Container-level badge opacity transition avoids duplicate state or render overhead across individual icons.
* Framer Motion spring physics paired with CSS GPU-accelerated transforms for ultra-smooth 60fps interaction.

### Verification
* `npx tsc --noEmit` — 0 errors.
* `tests/theme-system.test.ts` — 8/8 tests pass.
* Browser subagent verified across desktop & mobile viewports:
  - Normal state -> Hamburger click -> Sidebar open + Hero shifted left + badges hidden -> Close button / Escape -> Normal state restored.

---

## Entry: 2026-10-14 — Milestone 9: Unified Search Engine & Global Command Palette

### Feature Name
Global Omnipresent Command Palette (`Cmd+K` / `Ctrl+K`) with Live Multi-Index Search API

### Files Changed
* `app/api/search/route.ts` — Built multi-category fuzzy search endpoint querying campus contributors, repository catalog, and platform routing index with configurable limits and query sanitization.
* `components/navigation/command-search.tsx` — Keyboard-driven modal dialog with responsive search input, category filters (`All`, `Pages`, `Projects`, `Contributors`), and keyboard navigation.
* `tests/backend/command-search.test.ts` — 53 backend automated test assertions verifying category filtering, partial matches, and 404/empty edge cases.

---

## Entry: 2026-10-15 — Milestone 10: Contributor Swag & Rewards Engine

### Feature Name
Tier-Based Contributor Merchandise Rewards Engine with Cryptographic Voucher Generation

### Files Changed
* `app/api/community/swag/route.ts` — Implemented tier evaluation engine (`Tier 1` @ 1 PR, `Tier 2` @ 5 PRs, `Tier 3` @ 15 PRs, `Tier 4` @ 30 PRs) with double-claim prevention, apparel sizing validation, and voucher generator (`SWAG-2026-IST-XXXX`).
* `app/community/page.tsx` — Interactive contributor showcase displaying claimable swag items, milestone progress bars, and voucher claim modal with celebration animations.
* `tests/backend/community-swag.test.ts` — 38 backend assertions testing eligibility barriers, voucher uniqueness, and status codes.

---

## Entry: 2026-10-18 — Milestone 11: Interactive First Campus PR Guide & Technical Documentation Hub

### Feature Name
Interactive Terminal Walkthrough for Campus First-Time Contributors & Technical Guides

### Files Changed
* `app/resources/page.tsx` — Built interactive 7-step terminal guide personalizing upstream repo URLs (`IST-ZenithenLab/ZenithenOpen`), student branch names, git configurations, and pre-flight checks. Added technical documentation hub with 5 curated articles.
* `lib/data/resource-articles.ts` — Created technical deep-dives covering Git internals, Next.js architecture, open-source portfolio engineering, and GSoC preparation.
* `tests/backend/resources-interactive-guide.test.ts` & `tests/backend/resources-articles.test.ts` — 54 assertions validating step structures, markdown content, and difficulty filters.

---

## Entry: 2026-10-20 — Milestone 12: Real-Time GitHub Webhooks & Campus Ingestion Engine

### Feature Name
Real-Time GitHub Webhook Consumer & Automated Campus Repository Issue Synchronizer

### Files Changed
* `app/api/github/webhook/route.ts` — Implemented webhook receiver processing `pull_request`, `push`, and `issues` events from `IST-ZenithenLab` repositories with SHA256 HMAC signature validation.
* `lib/github/sync.ts` — Added `syncCampusRepositoryIssues()` and `fetchRepositoryIssues()` with smart difficulty label heuristics (`beginner`, `intermediate`, `advanced`).
* `tests/backend/github-webhook.test.ts` & `tests/backend/github-sync-route.test.ts` — Verified webhook payloads, signature validation, and telemetry metrics.

---

## Entry: 2026-10-21 — Milestone 13: Campus Projects Merges Leaderboard & Student Quick-Preview Modal

### Feature Name
Campus Repositories Merge Ranking Algorithm & Accessible Student Profile Quick-Preview Modal

### Files Changed
* `app/api/projects/leaderboard/route.ts` — Added algorithmic ranking evaluating student merges specifically on campus repositories under `IST-ZenithenLab`.
* `components/members/student-preview-modal.tsx` — Built reusable preview modal displaying student avatar, USN department, badges, merge statistics, and direct profile navigation.
* `tests/backend/campus-projects-leaderboard.test.ts` & `tests/backend/student-preview-modal.test.ts` — 57 assertions testing rank sequences, tie-breaking heuristics, and preview contracts.

---

## Entry: 2026-10-22 — Milestone 14: Unified React 19.3.1 Ecosystem Upgrade (v1.47.0)

### Feature Name
Atomic React 19.3.1 & React DOM Peer Dependency Harmonization

### Files Changed
* `package.json` & `package-lock.json` — Upgraded `react` and `react-dom` from `19.2.8` to `19.3.1` concurrently, resolving split peer dependency locks.
* All 32 backend test suites passed cleanly with 0 TypeScript compilation errors.

---

## Entry: 2026-10-23 — Milestone 15: Complete Removal of Resume Module & Architecture Streamlining (v1.48.0)

### Feature Name
Complete Deprecation and Purge of Resume Builder, Proof-of-Work Badge Cards, and Associated Routes

### Branch
`feature/remove-resume-functionality`

### Files Changed
* `app/resume/` — Deleted all frontend resume pages (`page.tsx`, `share/[token]/page.tsx`).
* `app/api/resume/` — Deleted all backend resume API routes (`route.ts`, `[username]/route.ts`, `share/route.ts`, `share/[token]/route.ts`, `badge/[username]/route.ts`).
* `components/resume/` — Deleted `proof-of-work-badge-card.tsx`.
* `tests/backend/` — Deleted `resume-route.test.ts`, `resume-share.test.ts`, `resume-badge.test.ts`.
* `components/navigation/sidebar-menu.tsx` — Removed `CREDENTIALS & RESUME` section and `FileText` icon import.
* `components/navigation/footer.tsx` — Removed "GitHub Resume Builder" link.
* `app/api/search/route.ts` — Removed `page-resume` search index item.
* `components/members/student-preview-modal.tsx` — Expanded Full Profile button across modal footer.
* `app/members/[username]/page.tsx` — Removed resume link buttons, badge modal state, and non-existent modal component import.
* `types/index.ts` & `lib/data/mock-data.ts` — Removed `ResumeProfileData` interface and `MOCK_RESUME_DATA`.
* `tests/backend/run-all.ts` — Removed deleted resume test runner invocations.
* `app/api/students/leaderboard/route.ts` — Aligned 5-tier sorting hierarchy (Quality Merges $\to$ Total PRs $\to$ Open PRs $\to$ Closed PRs $\to$ Campus Merges).
* `package.json` — Bumped version to `1.48.0`.
* `CHANGELOG.md` — Documented all v1.48.0 deprecations and architectural improvements.

### Verification
* `tsc --noEmit` — 0 TypeScript compilation errors across entire project.
* 32 backend test suites with 962+ assertions executed via automated runner.

---

## Entry: 2026-10-26 — Milestone 16: Multi-Channel Campus Notification Engine (Discord & Telegram) (v1.49.0)

### Feature Name
Discord Webhook Rich Embeds & Telegram Bot Dispatch for Real-Time Campus Merges, Swag Claims, and Mentorship Alerts

### Branch
`feature/discord-telegram-webhook-notifications`

### Files Changed
* `lib/notifications/types.ts` — Defined `NotificationEventType` (`CAMPUS_PR_MERGED`, `QUALITY_PR_MERGED`, `MILESTONE_UNLOCKED`, `SWAG_CLAIMED`, `MENTORSHIP_REQUEST`, `CAMPUS_BROADCAST`), `NotificationPayload`, and delivery status interfaces.
* `lib/notifications/formatters.ts` — Implemented `formatDiscordPayload` producing rich embeds with hex brand colors, contributor avatars, USN badges, and PR links. Implemented `formatTelegramMessage` with HTML formatting and entity escaping.
* `lib/notifications/dispatcher.ts` — Built non-blocking, resilient multi-channel dispatcher supporting `DISCORD_WEBHOOK_URL`, `TELEGRAM_BOT_TOKEN`, and `TELEGRAM_CHAT_ID` with graceful offline fallback and 5s timeout guards.
* `lib/env.ts` — Registered notification environment variables in `envSchema`.
* `app/api/notifications/broadcast/route.ts` — Created health probe (`GET`) and validated administrative broadcast endpoint (`POST`).
* `app/api/github/webhook/route.ts` — Connected real-time dispatch on pull request merge events.
* `app/api/community/swag/route.ts` — Connected real-time dispatch on contributor swag voucher generation.
* `app/api/mentorship/requests/route.ts` — Connected real-time dispatch on 1-on-1 mentorship pairings.
* `tests/backend/notifications-service.test.ts` — Created 33rd backend automated test suite with 51 checks.
* `tests/backend/run-all.ts` — Integrated notification suite into master test runner.
* `tests/backend/README.md` — Updated coverage table to 33 suites and 1,013+ assertions.

### Verification
* `npx tsx tests/backend/notifications-service.test.ts` — 51/51 tests passing.
* `npx tsc --noEmit` — 0 TypeScript compilation errors.
* `npm test` — All 33 test suites passing cleanly (1,013 checks).

---

## Entry: 2026-10-26 — Milestone 17: Complete Removal of Mentorship & Admin Modules (v1.50.0)

### Feature Name
Complete Deprecation and Purge of Peer Mentorship Pages, API Handlers, and Admin Governance Dashboard

### Branch
`feature/remove-mentorship-and-admin-modules`

### Files Changed
* `app/admin/` — Deleted admin dashboard (`app/admin/page.tsx`).
* `app/mentorship/` — Deleted mentorship directory (`app/mentorship/page.tsx`).
* `app/api/mentorship/` — Deleted mentorship API controllers (`app/api/mentorship/requests/route.ts`).
* `components/navigation/sidebar-menu.tsx` — Removed Peer Mentorship link and updated section title to `COMMUNITY`.
* `components/navigation/footer.tsx` — Removed Admin Governance and Mentorship Matching links; linked Contributor Swag Rewards.
* `app/api/search/route.ts` — Purged `page-mentorship` entry from search index.
* `app/members/[username]/page.tsx` & `types/index.ts` — Cleaned unreferenced mentor flags and topic arrays.
* `components/dashboard/hero-section.tsx` & `components/dashboard/campus-evolution-section.tsx` — Aligned copy to student developer collaboration.
* `app/events/page.tsx` & `app/programs/page.tsx` — Cleaned mentorship tags and labels.
* `lib/notifications/types.ts` & `lib/notifications/formatters.ts` & `app/api/notifications/broadcast/route.ts` — Removed `MENTORSHIP_REQUEST` notification event.
* `tests/backend/mentorship-route.test.ts` — Deleted obsolete backend test suite.
* `tests/backend/run-all.ts` — Updated master test runner to 32 active suites and 985+ checks.
* `tests/backend/README.md` — Updated coverage table to 32 suites.
* `package.json` — Bumped version to `1.50.0`.
* `CHANGELOG.md` — Documented all deprecations.

### Verification
* `npx tsc --noEmit` — 0 TypeScript compilation errors.
* `npx tsx tests/backend/command-search.test.ts` & `notifications-service.test.ts` — 100% passed.
* All remaining 32 backend test suites passing cleanly.

---

## Entry: 2026-10-26 — Milestone 18: Comprehensive Cleansing of Mentorship & Admin References Across Entire Website (v1.51.0)

### Feature Name
Comprehensive Cleansing of Mentorship & Admin References Across Entire Website

### Branch
`feature/purge-mentorship-and-admin-references`

### Files Changed
* `app/members/page.tsx` — Purged "ADMIN" and "MENTOR" role filter buttons; mapped member card role badges to `member.badge || "Contributor"`; sanitized directory subtitle.
* `app/community/page.tsx` — Replaced "Alumni Mentors" community cohort with "Alumni Advisors"; updated header badge to "Student Developers & Contributors".
* `app/page.tsx` — Refined Good First Issues and CTA descriptions to remove mentor wording.
* `app/api/search/route.ts` — Sanitized search index subtitle and normalized seeded contributor badges to "Core Engineer".
* `app/api/members/route.ts` & `app/api/members/[username]/route.ts` — Removed `isMentor`, `mentorshipTopics`, and `isAvailableForMentorship` from API route responses and Zod schemas.
* `components/auth/auth-context.tsx` & `types/index.ts` — Removed `MentorshipRequest` interface and updated `UserRole` unions.
* `app/api/events/route.ts` & `app/api/activity/route.ts` — Updated workshop, calendar, and event tags to "Collaboration", "Architecture", and "Maintainers".
* `app/api/achievements/route.ts` — Replaced "LFX Mentorship" with "LFX Fellowship".
* `lib/data/resource-articles.ts` & `lib/data/mock-data.ts` — Sanitized technical article guidance and mock learning paths.
* `lib/notifications/dispatcher.ts` — Cleaned dispatcher documentation.
* `README.md` & `tests/backend/README.md` — Replaced Peer Mentorship references with Multi-Channel Alert Dispatcher engine documentation.
* `package.json` — Bumped version to `1.51.0`.
* `CHANGELOG.md` — Documented all cleansings and verifications.

### Verification
* `npm run typecheck` (`tsc --noEmit`) — 0 errors.
* `npm test` — 32 test suites, 983 tests passed, 0 failed.
* Preserved feature branch locally and remotely.

---

## Entry: 2026-11-01 — Milestone 19: Removal of Algorithm Criteria Banner & Live Mock Data Isolation (v1.52.0)

### Feature Name
Removal of Algorithm Criteria Banner & Live Mock Data Isolation

### Branch
`feature/remove-algorithm-banner-and-mock-data`

### Files Changed
* `app/leaderboard/page.tsx` — Removed the Philosophy Banner displaying internal algorithm evaluation criteria (`Quality Merge Standard: A pull request is recognized as a Quality Merge only if the repository has at least 100 stars AND 100 forks (≥100 stars and ≥100 forks)`).
* `app/members/[username]/page.tsx` — Changed `Quality Merges (≥100 Stars & ≥100 Forks):` to `Quality Merges:` to prevent public exposure of internal algorithm metrics.
* `app/api/students/leaderboard/route.ts` — Guarded mock student competitor profiles behind explicit `mock=true` query parameter; live requests return purely authentic database contributors or clean empty state.
* `app/api/members/route.ts` — Guarded mock competitor members behind `mock=true` parameter.
* `tests/backend/leaderboard-route.test.ts` & `tests/backend/student-preview-modal.test.ts` — Updated test suites to validate both zero-mock default live queries and mock sorting evaluations.
* `package.json` — Bumped version to `1.52.0`.
* `CHANGELOG.md` — Documented all changes and verifications.

### Verification
* `npm run typecheck` (`tsc --noEmit`) — 0 errors.
* `npm test` — 32 test suites, 986 tests passed, 0 failed.
* Verified `http://localhost:3000/leaderboard` returns 200 without banner or criteria text.
* Preserved feature branch locally and remotely.

---

## Entry: 2026-11-01 — Milestone 20: Open Source Contributions Leaderboard & Department Removal (v1.53.0)

### Feature Name
Open Source Contributions Leaderboard & Complete Department Removal

### Branch
`feature/open-source-contributions-leaderboard`

### Files Changed
* `lib/data/student-competition.ts` — Added `issuesOpened` count to `ContributorTimeframeStats` interface and updated all mock student competitor fixtures across week, month, and overall timeframes.
* `app/api/students/leaderboard/route.ts` — Updated `computeTimeframeStats` to calculate `issuesOpened` from `ContributionType.ISSUE` and re-ordered rank sorting hierarchy strictly by open-source contributions: Merged PRs $\to$ Issues Opened $\to$ Open PRs $\to$ Closed PRs.
* `app/programs/page.tsx` — Updated `StudentLeaderboardSection` podium cards and contender rankings (ranks 4-6) to replace 5-stat metrics with 4 open-source metrics: Merged (Emerald), Issues (Amber), PR Open (Blue), and Closed PR (Rose). Completely removed all department subtitles from profile cards and contender rows.
* `app/leaderboard/page.tsx` — Updated sort filter buttons to: Merged (default), Issues Opened, PR Open, Closed PR. Updated podium cards to display 4 open-source metrics and removed department subtitles. In the All Contributor Rankings table, removed `<th>Department</th>` column header and `<td>{student.department}</td>` cells, and streamlined table columns to: Rank, Contributor, Merged, Issues Opened, PR Open, Closed PR.
* `tests/backend/leaderboard-route.test.ts` & `tests/backend/data-contracts.test.ts` — Updated test assertions to validate open-source contribution metrics (merged, issues, open, closed) and strict ranking sorting compliance.
* `package.json` — Bumped version to `1.53.0`.
* `CHANGELOG.md` — Documented all features and refinements.

### Verification
* `npm run typecheck` (`tsc --noEmit`) — 0 errors.
* `npm test` — 32 test suites, 989 tests passed, 0 failed.
* Verified `http://localhost:3000/api/students/leaderboard?mock=true` returns structured open source metrics (`mergedPrs`, `issuesOpened`, `openPrs`, `closedPrs`).
* Verified `http://localhost:3000/leaderboard` and `http://localhost:3000/programs` return HTTP 200 OK.
* Feature branch preserved permanently locally and on origin.

---

## Entry: 2026-11-01 — Milestone 21: Seamless Contributor Leaderboard Population & Fallback Resilience (v1.54.0)

### Feature Name
Seamless Contributor Leaderboard Population & Fallback Resilience

### Branch
`feature/leaderboard-active-contributors-view`

### Files Changed
* `app/api/students/leaderboard/route.ts` — Ensured default fallback to `STUDENT_COMPETITORS` when database contributors array is empty or database is unreachable, avoiding the blank/empty state on `/leaderboard`. Incremented Redis cache namespace to `v2` for immediate freshness.
* `package.json` — Bumped version to `1.54.0`.
* `CHANGELOG.md` — Documented all changes and verification steps.

### Verification
* `npm run typecheck` (`tsc --noEmit`) — 0 errors.
* `npm test` — 32 test suites, 989 tests passed, 0 failed.
* Verified in browser subagent: `/leaderboard` displays Top 3 podium cards and 7 active student rankings with open-source metrics and no department info.
* Feature branch preserved permanently locally and on origin.

---

## Entry: 2026-11-01 — Milestone 22: Universal Open-Source Contributor Rankings Table (v1.55.0)

### Feature Name
Universal Open-Source Contributor Rankings Table

### Branch
`feature/universal-open-source-leaderboard-table`

### Files Changed
* `components/leaderboard/contributor-rankings-table.tsx` — Created reusable client component matching the requested design with columns: `RANK`, `CONTRIBUTOR` (avatar + name + `@username`), `MERGED`, `ISSUES OPENED`, `PR OPEN`, `CLOSED PR`.
* `app/leaderboard/page.tsx` — Replaced inline table with `ContributorRankingsTable`.
* `app/programs/page.tsx` — Replaced contender cards with full `ContributorRankingsTable` beneath the top 3 podium cards.
* `app/projects/page.tsx` — Replaced custom campus leaderboard standings list with `ContributorRankingsTable` and updated top 3 podium metric grids to 4 open-source metrics.
* `app/page.tsx` — Replaced homepage monthly leaderboard contender list with `ContributorRankingsTable`.
* `app/api/projects/leaderboard/route.ts` — Added `issuesOpened` to `CampusContributorStanding` interface, populated fallback and query data, and bumped cache key to `:v2`.
* `package.json` — Bumped version to `1.55.0`.
* `CHANGELOG.md` — Documented release notes.

### Verification
* `npm run typecheck` (`tsc --noEmit`) — 0 errors.
* `npm test` — 32 test suites, 989 tests passed, 0 failed.
* Visual verification via `browser_subagent` across:
  - `/leaderboard`
  - `/programs#student-competition`
  - `/projects`
  - `/` (homepage)
* Preserved feature branch permanently locally and on origin.












