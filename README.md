# ZenithenOpen 🌐🚀

[![Version](https://img.shields.io/badge/version-1.48.0-cyan.svg)](https://github.com/IST-ZenithenLab/ZenithenOpen)
[![Next.js](https://img.shields.io/badge/Next.js-16_App_Router-black.svg?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.1-61dafb.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748.svg?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-32_Suites_%7C_962+_Passed-emerald.svg)](tests/backend)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

> **The premier open-source contribution and competition tracking platform for student software engineers at the Institute of Science & Technology (IST Bengaluru).**  
> Maintained under [`IST-ZenithenLab`](https://github.com/IST-ZenithenLab).

---

## 📖 Table of Contents

- [About The Project](#-about-the-project)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [What We Accomplished (Recent Work)](#-what-we-accomplished-recent-work)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started & Local Setup](#-getting-started--local-setup)
- [Quality Assurance & Automated Testing](#-quality-assurance--automated-testing)
- [What Should We Do Next (Roadmap)](#-what-should-we-do-next-roadmap)
- [Contributing & Community](#-contributing--community)
- [License](#-license)

---

## 🎯 About The Project

**ZenithenOpen** was built to solve the real-world gap between academic computer science coursework and authentic production software engineering. Rather than writing duplicate classroom assignments or generic tutorial clones, ZenithenOpen guides students into shipping **verified, production-grade pull requests** to campus and global open-source ecosystems.

### Core Philosophy

1. **Proof of Work Over Fabricated Credentials**: Student reputations are established purely through authentic git commits, verified pull request reviews, and merged production code.
2. **Zero Fake Data Policy**: No simulated student rosters or inflated counters. Metrics operate on an authentic baseline and scale organically as real students link their GitHub accounts.
3. **Low Barrier, High Ceiling**: Complete beginner onboarding starting from good-first-issues (`IST-ZenithenLab/First-PR`), escalating to enterprise distributed architectures and Google Summer of Code (GSoC) readiness.
4. **Campus First, Globally Connected**: Built specifically for IST Bengaluru, yet architected around open industry standards (GitHub REST/GraphQL APIs, OAuth 2.0, PostgreSQL, Redis).

---

## ✨ Key Features

### 🏆 1. Student Contributor Leaderboard & Competition Arena (`/leaderboard`)
- **Strict 5-Tier Sorting Hierarchy**:
  - `Tier 1`: Verified Quality Merged PRs (repositories with $\ge$ 100 stars and $\ge$ 100 forks).
  - `Tier 2`: Total Pull Requests authored across all repositories.
  - `Tier 3`: Active Open Pull Requests currently undergoing review.
  - `Tier 4`: Closed / Iterated Pull Requests.
  - `Tier 5`: Total Merges on Campus Repositories.
- **Multi-Timeframe Filtering**: Real-time aggregation across `Week` (sprint), `Month` (milestone), and `Overall` (all-time hall of fame).
- **Dynamic Rank Badges**: Sprint Champion 🏆, Code Artisan ⚡, Rising Contributor 🚀, and Campus Pioneer 🌟.

### 📁 2. Campus Repositories Catalog & Deep-Dive (`/projects`, `/projects/[slug]`)
- Directory of verified campus projects maintained under `IST-ZenithenLab`.
- Dynamic project deep-dives featuring live stars, forks, commit frequency, primary languages, open opportunities, maintainer rosters, and top contributors.
- Automated GitHub metadata synchronization via `/api/projects/sync`.

### 🎯 3. Opportunities & Good First Issues Board (`/opportunities`)
- Real-time catalog of beginner, intermediate, and advanced open issues.
- Direct synchronization with GitHub Issues tagged `good-first-issue`, `help-wanted`, or `beginner`.
- Filterable by tech stack (TypeScript, Python, Go, Rust, C++) and estimated difficulty.

### 📚 4. Structured Engineering Roadmaps (`/learning-paths`)
- 4 curated multi-week curriculums:
  - *Full-Stack Web with Next.js & TypeScript* (6 Weeks)
  - *Applied AI & Open Data Science* (8 Weeks)
  - *DevOps, Containers & Cloud Engineering* (6 Weeks)
  - *Google Summer of Code (GSoC) Playbook* (8 Weeks)
- Interactive student progress persistence and milestone checklist tracking.

### 🎓 5. University USN Verification & GitHub Linking
- Algorithmic IST enrollment validation (`1SV23CS042`, `SV24AI015`).
- Automatic academic department decoding (CS, AI, DS, IS, IT, EC, CY, BT).
- Dynamic year-of-study inference based on enrollment batch digits.
- Resilient fallback: Operates standalone without requiring private database rosters in version control.

### 🤝 6. Peer Mentorship Network (`/mentorship`)
- Matchmaking connecting junior contributors with senior student mentors and accepted fellowship scholars.
- Request submission, topic selection, review workflows, and status tracking (`Pending`, `Accepted`, `Completed`).

### 🛠️ 7. Interactive First Campus PR Guide (`/resources`)
- Step-by-step interactive terminal walkthrough guiding students through:
  1. Forking official repositories under `IST-ZenithenLab`.
  2. Local cloning with personalized git configurations.
  3. Feature branch creation, commit conventions, and rebase hygiene.
  4. Pre-flight quality verification (`lint`, `typecheck`, `test`).
  5. Pull request drafting with peer reviewer tagging.

### 🔍 8. Global Command Palette (`Cmd+K` / `Ctrl+K`)
- Omnipresent keyboard-driven search modal with fuzzy matching across students, projects, documentation, and platform routes.
- Category pills (`All`, `Pages`, `Projects`, `Contributors`) with arrow key navigation.

### 📅 9. Campus Workshops & Open Source Saturdays (`/events`)
- Campus event discovery with RSVP capacity tracking.
- One-click Google Calendar integration and `.ics` calendar file downloads.

### 👕 10. Contributor Swag & Rewards Engine (`/community/swag`)
- Automated tier-based merchandise unlocking based on verified merged PR counts:
  - **Tier 1 (1 PR)**: Digital Campus Contributor Badge & Hall of Fame spotlight.
  - **Tier 2 (5 PRs)**: Official Vinyl Sticker Pack & Git cheat sheet poster.
  - **Tier 3 (15 PRs)**: Custom ZenithenOpen Enamel Pin & Contributor T-Shirt.
  - **Tier 4 (30 PRs)**: Heavyweight Embroidered Community Hoodie.
- Secure, unguessable voucher code generation (`SWAG-2026-IST-XXXX`).

---

## 🏛️ System Architecture

ZenithenOpen is engineered as a **Modular Monolith** using **Next.js App Router**, prioritizing single-deploy simplicity, end-to-end type safety, and zero network serialization overhead.

```
                             [ Browser / Mobile Client ]
                                         │
                                         ▼ HTTPS
                        [ Next.js 16 App Router Gateway ]
                                         │
        ┌────────────────────────────────┴────────────────────────────────┐
        ▼                                                                 ▼
[ Server Components / SSR ]                                     [ API Route Handlers (/api/*) ]
        │                                                                 │
        └────────────────────────────────┬────────────────────────────────┘
                                         ▼
                             [ Business Domain Logic ]
             (Members, Leaderboard, Opportunities, Swag, Mentorship, Events)
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
     [ PostgreSQL Database ]                           [ Upstash Redis Cache ]
       - 16 Prisma Models                               - API Rate Limiting
       - Supabase Managed Connection                    - Hot Leaderboard Cache
       - Connection Pooling                             - GitHub Quota Protection
                 │                                               │
                 └───────────────────────┬───────────────────────┘
                                         ▼
                             [ GitHub REST & GraphQL API ]
                               - Organization Sync Engine
                               - Real-Time Webhook Consumer
```

---

## 💻 Technology Stack

| Layer | Technology | Purpose |
|:---|:---|:---|
| **Framework** | Next.js 16 (App Router) | Turbopack compilation, React Server Components, Route Handlers. |
| **UI Runtime** | React 19.3.1 & React DOM 19.3.1 | Latest React ecosystem with unified peer dependencies. |
| **Language** | TypeScript 5 | Strict type-safety, 0 compilation errors across 100% of routes. |
| **Styling** | Tailwind CSS v4 & PostCSS | GPU-accelerated utility styling, chromatic dark-mode palette. |
| **Icons & Design** | Lucide React + Custom SVG Brand Kit | Centralized vendor brand assets (GitHub, LinkedIn). |
| **Database** | PostgreSQL 16 (Supabase) | Relational persistence, JSONB support, foreign key cascades. |
| **ORM** | Prisma 6 | Type-safe query building, declarative schema migrations. |
| **Cache & KV** | Redis 7 / Upstash Serverless | Distributed caching, request rate-limiting, instant fallback. |
| **Deployment** | Docker & Vercel | Multi-stage Docker containerization and edge hosting. |

---

## 🚀 What We Accomplished (Recent Work)

Through our latest engineering milestones culminating in **v1.48.0**, the platform underwent comprehensive architectural hardening and refinement:

### 1. Complete Deprecation & Removal of Resume Module (v1.48.0)
- **Frontend Removal**: Deleted `/resume` interactive resume editor and `/resume/share/[token]` public shared candidate dossier pages.
- **Backend Removal**: Deprecated and deleted all resume API endpoints (`/api/resume`, `/api/resume/[username]`, `/api/resume/share`, `/api/resume/share/[token]`, `/api/resume/badge/[username]`).
- **Component & UI Removal**: Removed proof-of-work badge modals (`components/resume/proof-of-work-badge-card.tsx`).
- **Navigation & Search Cleanups**:
  - Removed `CREDENTIALS & RESUME` section and `FileText` icon from the sliding drawer sidebar (`components/navigation/sidebar-menu.tsx`).
  - Removed "GitHub Resume Builder" from the platform footer (`components/navigation/footer.tsx`).
  - Removed `page-resume` from the global command search index (`app/api/search/route.ts`).
  - Removed resume link buttons from the student preview modal (`components/members/student-preview-modal.tsx`) and member profiles (`app/members/[username]/page.tsx`).
- **Types & Mock Data Cleanups**: Purged unreferenced `ResumeProfileData` and `MOCK_RESUME_DATA` from `types/index.ts` and `lib/data/mock-data.ts`.

### 2. Strict 5-Tier Leaderboard Hierarchy Alignment
- Aligned `app/api/students/leaderboard/route.ts` with the test specification: Quality Merged PRs $\to$ Total PRs $\to$ Open PRs $\to$ Closed PRs $\to$ Campus Merges.

### 3. TypeScript Type-Checking & Compiler Hygiene
- Resolved implicit `any` parameter types in `lib/github/sync.ts`.
- Purged stale `.next` type artifacts from deleted routes.
- Achieved **0 TypeScript errors** with `tsc --noEmit`.

### 4. Comprehensive 32-Suite Backend Automated Test Architecture
- Expanded backend verification to **32 dedicated suites** with **962+ assertions**.
- Automated test runner verifies auth validation, database models, caching, sync logic, and all public API routes with resilient offline fallbacks.

### 5. Atomic React 19.3.1 Ecosystem Upgrade (v1.47.0)
- Upgraded `react` and `react-dom` to `19.3.1` concurrently, resolving peer dependency splits.

---

## 📂 Project Directory Structure

```
ZenithenOpen/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Public exploration pages
│   ├── achievements/             # Hall of Fame and milestone badges
│   ├── admin/                    # Platform administration console
│   ├── api/                      # Full-stack backend API Route Handlers
│   │   ├── achievements/         # Badges and first PR stories
│   │   ├── activity/             # Real-time campus contribution pulse
│   │   ├── auth/verify-usn/      # IST USN enrollment validator
│   │   ├── community/swag/       # Contributor tier merchandise claims
│   │   ├── events/               # Campus workshops and calendar feeds
│   │   ├── github/               # Sync engine and live webhook handler
│   │   ├── health/               # Production uptime and environment probe
│   │   ├── learning-paths/       # Curriculum progression endpoints
│   │   ├── members/              # Contributor profiles directory
│   │   ├── mentorship/           # Peer matching connection routes
│   │   ├── metrics/              # Community telemetry analytics
│   │   ├── opportunities/        # Good-first-issue exploration
│   │   ├── projects/             # Repository directory and deep-dives
│   │   ├── search/               # Global fuzzy search command palette
│   │   └── students/leaderboard/ # 5-tier ranked contributor competition
│   ├── community/                # Community showcase and swag store
│   ├── events/                   # Workshop calendar & RSVP hub
│   ├── leaderboard/              # Contributor competition standings
│   ├── learning-paths/           # Structured engineering tracks
│   ├── members/                  # Contributor directory and [username] profiles
│   ├── mentorship/               # Student-to-mentor matching application
│   ├── opportunities/            # Filterable good-first-issue board
│   ├── programs/                 # Campus open-source movement & tracks
│   ├── projects/                 # Campus repository showcases and [slug] views
│   ├── resources/                # Interactive First PR Guide and technical articles
│   ├── globals.css               # Linear-grade design tokens & animations
│   ├── layout.tsx                # Root layout with providers & navigation
│   └── page.tsx                  # Interactive homepage with 3D canvas
├── components/                   # Reusable React UI Components
│   ├── 3d/                       # 3D interactive floating canvas & physics
│   ├── dashboard/                # Hero section, live counters, terminal preview
│   ├── members/                  # Student preview modals & badges
│   ├── navigation/               # Navbar, sliding sidebar drawer, footer
│   └── ui/                       # Headless primitives (Button, Card, Badge, Input, Icons)
├── docs/                         # Engineering Documentation
│   ├── architecture.md           # Modular Monolith specification
│   ├── development-log.md        # Living milestone changelog
│   ├── open-source-and-database-guide.md # University USN & DB guide
│   └── roadmap-next-steps.md     # Detailed future engineering roadmap
├── lib/                          # Core Libraries & Shared Infrastructure
│   ├── auth/                     # USN validation and role authorization
│   ├── data/                     # Mock data, baseline datasets, technical articles
│   ├── db/                       # Prisma client singleton and database abstraction
│   ├── github/                   # Octokit REST client, sync engine, webhooks
│   ├── redis/                    # Upstash Redis client with resilient in-memory fallback
│   ├── env.ts                    # Zod-validated environment schema
│   └── utils.ts                  # Tailwind class merger and formatting helpers
├── prisma/                       # Database Schema & Migrations
│   └── schema.prisma             # 16 relational models & enums
├── scripts/                      # Operational & Diagnostic CLI Tools
│   ├── preflight.ts              # Strict pre-deployment environment & probe audit
│   ├── seed-production.ts        # Database seed runner with baseline data
│   └── clean-projects.ts         # Repository sanitizer utility
├── tests/                        # Automated Quality Assurance Suites
│   ├── backend/                  # 32 backend test suites (962+ assertions)
│   │   ├── run-all.ts            # Master test runner CLI
│   │   └── *.test.ts             # Dedicated route, schema, and domain tests
│   └── theme-system.test.ts      # CSS and theme token integrity tests
├── CHANGELOG.md                  # Semantic Versioning history (v1.0.0 to v1.48.0)
├── DEPLOYMENT.md                 # Production deployment and cloud operations guide
├── Dockerfile                    # Multi-stage container definition
├── docker-compose.yml            # Multi-container orchestration (App, PG 16, Redis 7)
└── package.json                  # Dependencies and scripts (v1.48.0)
```

---

## 💻 Getting Started & Local Setup

### Prerequisites

- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **npm**: `v10.x` or higher
- **Git**: Installed and configured
- **Docker** *(Optional)*: If running local PostgreSQL and Redis containers

### 1. Clone the Repository

```bash
git clone https://github.com/IST-ZenithenLab/ZenithenOpen.git
cd ZenithenOpen
```

### 2. Install Dependencies

```bash
npm install
```
*(This automatically triggers `prisma generate` via the `postinstall` hook).*

### 3. Configure Environment Variables

Create your local environment file:

```bash
cp .env.example .env.local
```

Default standalone development works immediately with zero configuration (using resilient in-memory and mock data fallbacks). For live cloud features, populate:

```env
NODE_ENV="development"
DATABASE_URL="postgresql://postgres:[pass]@db.[ref].supabase.co:5432/postgres"
AUTH_SECRET="development-secret-entropy-32-chars-minimum"
NEXTAUTH_URL="http://localhost:3000"
UPSTASH_REDIS_REST_URL="https://[instance].upstash.io"
UPSTASH_REDIS_REST_TOKEN="[token]"
GITHUB_TOKEN="ghp_[token]"
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Running with Docker Compose (Alternative)

```bash
# Starts Next.js app, PostgreSQL (port 5433), and Redis (port 6379)
docker compose up -d
```

---

## 🧪 Quality Assurance & Automated Testing

ZenithenOpen maintains an extensive automated test suite covering all route handlers, authentication algorithms, data contracts, and schema relations.

### 1. TypeScript Strict Type-Check

```bash
npm run typecheck
```
*Expected output: Exit code 0, 0 compilation errors.*

### 2. Run All 32 Backend Test Suites

```bash
npm test
```

### 3. Run Pre-flight Health & Environment Audit

```bash
npm run preflight
```

---

## 🗺️ What Should We Do Next (Roadmap)

For our comprehensive, multi-phase technical roadmap, see [**`docs/roadmap-next-steps.md`**](docs/roadmap-next-steps.md). Key immediate priorities include:

| Priority | Track | Action Item |
|:---:|:---|:---|
| 🟢 **P0** | **Deployment** | Cut official GitHub Release `v1.48.0` on `main` and deploy latest build to production (Vercel). |
| 🟢 **P0** | **Cloud DB** | Verify live Supabase PostgreSQL connection pooling (`pgbouncer=true`) and seed production tables (`npm run db:seed`). |
| 🟡 **P1** | **Webhooks** | Connect real-time GitHub organization webhook on `IST-ZenithenLab` to `/api/github/webhook`. |
| 🟡 **P1** | **Onboarding** | Host the inaugural **Open Source Saturday** workshop utilizing the Interactive First PR Guide (`/resources`). |
| 🔵 **P2** | **Mentorship** | Launch mentor assignment workflows for senior students and fellowship alumni on `/mentorship`. |
| 🔵 **P2** | **Swag Fulfillment** | Connect automated email notifications for Tier 1–4 contributor swag voucher redemptions. |
| 🟣 **P3** | **AI Mentor** | Integrate Google Gemini API for automated PR review guidance and contextual code hints. |

---

## 🤝 Contributing & Community

ZenithenOpen is built by students, for students. We welcome contributions of all sizes!

1. Explore open beginner tasks on the [Good First Issues Board](https://open.zenithen.ist/opportunities).
2. Read the interactive walkthrough on [Shipping Your First Campus PR](https://open.zenithen.ist/resources).
3. Ensure all code passes `npm run typecheck` and `npm test` before opening a pull request.
4. Follow conventional commit messages (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`).

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

<p align="center">
  Engineered with pride by <b>IST-ZenithenLab</b> & the <b>IST Bengaluru Open-Source Community</b>.<br/>
  <i>Ship code, earn respect, shape campus culture.</i>
</p>
