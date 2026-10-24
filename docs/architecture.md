# ZenithenOpen Architecture Specification

**Version:** 1.48.0 (October 2026)  
**Organization:** IST-ZenithenLab / IST Bengaluru  
**Target Scale:** 2,000+ active students, contributors, and alumni

---

## 1. Architectural Philosophy: The Modular Monolith

ZenithenOpen is built as a **Modular Monolith** using **Next.js App Router**. We explicitly avoid premature microservices decomposition. A single deployable codebase provides:
* Unified TypeScript type safety across frontend and backend.
* Zero network serialization overhead between internal modules.
* Atomic database transactions via Prisma ORM.
* Clear internal domain boundaries (`modules/*`) enabling extraction into isolated services only when real scale or team topology demands it.

```
Browser / Client (React 19 Server & Client Components)
       │
       ▼
Next.js 16 App Router (SSR, Streaming, Server Actions, Route Handlers)
       │
       ▼
Business Domain Modules (/modules/*)
 ├── Members & Profiles
 ├── Contributions & Metrics
 ├── Opportunities & Good-First-Issues
 ├── Learning Paths & Roadmaps
 ├── Mentorship Matching
 ├── Campus Events & Workshops
 ├── Contributor Swag Rewards
 └── Achievements & Hall of Fame
       │
 ┌─────┴──────────────────┐
 ▼                        ▼
PostgreSQL (Prisma ORM)  Redis / Upstash Cache
 Relational Data          API Cache & Hot Metrics
 │
 └─────────► GitHub API / Octokit (REST + GraphQL)
```

---

## 2. Directory Structure & Domain Isolation

```
ZenithenOpen/
├── app/                  # Next.js App Router (Pages, Layouts, API Routes)
│   ├── (public)/         # Public discovery pages
│   ├── achievements/     # Hall of Fame and badges
│   ├── admin/            # Administrative management dashboard
│   ├── api/              # Full-stack API Route Handlers (32 test-covered endpoints)
│   ├── community/        # Community stories and swag rewards
│   ├── events/           # Campus workshops, office hours, and calendar feeds
│   ├── leaderboard/      # 5-tier ranked contributor competition arena
│   ├── learning-paths/   # Structured curriculum and roadmaps
│   ├── members/          # Member directory and profiles
│   ├── mentorship/       # Student-to-mentor matchmaking
│   ├── opportunities/    # Filterable good-first-issue board
│   ├── projects/         # Featured open-source project showcases
│   └── resources/        # Interactive First Campus PR Guide and articles
├── components/           # Reusable UI & Layout Components
│   ├── 3d/               # 3D interactive floating canvas & physics
│   ├── dashboard/        # Hero section, live counters, metric cards
│   ├── navigation/       # Navbar, sliding sidebar drawer, and footer
│   └── ui/               # Design primitives (button, badge, card, input, icons)
├── docs/                 # Engineering Documentation & Logs
│   ├── architecture.md   # Architectural blueprint
│   ├── development-log.md # Living milestone log
│   ├── open-source-and-database-guide.md # University USN & DB guide
│   └── roadmap-next-steps.md # Engineering roadmap & future phases
├── lib/                  # Shared Utilities, Database & Clients
│   ├── auth/             # USN validation and role authorization
│   ├── data/             # Seed and mock datasets
│   ├── db/               # Prisma client singleton
│   ├── github/           # Octokit client, sync helpers, and webhook handler
│   └── redis/            # Upstash Redis client with resilient in-memory fallback
├── prisma/               # Database Schema and Migrations
│   └── schema.prisma     # 16 relational models & enums
├── tests/                # Automated Quality Assurance
│   └── backend/          # 32 backend test suites (962+ assertions)
└── types/                # Strict TypeScript Contracts
    └── index.ts          # Core domain models
```

---

## 3. Technology Stack Breakdown

| Layer | Technology | Justification |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | Native React 19 support, Turbopack, Server Components for fast initial loads, SEO optimization. |
| **Language** | TypeScript 5 | End-to-end type safety, strict compile checks, automated refactoring. |
| **Styling** | Tailwind CSS v4 | High performance utility classes with zero runtime overhead via PostCSS. |
| **UI Primitives** | shadcn/ui inspired | Accessible, customizable headless components with full code ownership. |
| **Icons & Media** | Lucide React + Custom SVGs | Consistent iconography with custom brand SVGs for GitHub and LinkedIn. |
| **Database** | PostgreSQL 16 | Relational reliability, foreign keys, JSONB support for flexible curriculum structures. |
| **ORM** | Prisma | Type-safe migrations, auto-generated TypeScript query client. |
| **Caching** | Redis (Upstash) | Protects against GitHub API rate-limits (5,000 req/hr) and caches hot leaderboard metrics. |
| **Containerization** | Docker & Compose | Reproducible environments across development and production deployments. |

---

## 4. Frontend Data Flow & Isolation Pattern

To enable rapid frontend development without blocking on database provisioning:
1. **Mock Data Layer (`lib/data/mock-data.ts`)**: Represents the exact Prisma schema contracts.
2. **Interactive Client State**: Filtering, search, pagination, and tabs execute client-side with zero latency.
3. **Pluggable API Handoff**: Each page can seamlessly transition from local state to Server Actions or Route Handlers (`/api/*`) without rewriting page components.

---

## 5. Security & Secret Management

* **No Hardcoded Secrets**: Secrets are injected strictly through environment variables.
* **Least Privilege Roles**: RBAC defined across `ADMIN`, `MENTOR`, `MEMBER`, and `GUEST`.
* **Zero Client Leakage**: Sensitive API tokens (`GITHUB_TOKEN`, `AUTH_SECRET`, `DATABASE_URL`) are isolated to server runtimes.
