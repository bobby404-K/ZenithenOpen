# ZenithenOpen — Engineering Roadmap & Future Milestones

**Document Version:** 1.0.0 (October 2026)  
**Maintained By:** IST-ZenithenLab / IST Bengaluru  
**Target Platform Release:** v1.48.0 $\to$ v2.0.0

---

## 🎯 Executive Summary

**ZenithenOpen** is the primary open-source contribution and competition tracking platform built for the student engineering community at the **Institute of Science & Technology (IST Bengaluru)**. 

This document defines the strategic roadmap for the platform: documenting **what was built**, **current baseline architecture**, and **what we should do next** organized into four actionable engineering phases.

---

## 📊 Current Architecture Baseline (v1.48.0)

As of version `v1.48.0`, the platform includes:
- **Next.js 16 (App Router)** with **React 19.3.1** and **TypeScript 5**.
- **Authentic Contributor Standings**: 5-tier ranked leaderboard across Week, Month, and Overall timeframes (Quality Merges, Total PRs, Open PRs, Closed PRs, Campus Merges).
- **Projects & Opportunities**: Repository catalog with live GitHub metrics and filterable good-first-issues board.
- **Learning Roadmaps**: 4 curated engineering curriculums (Full-Stack Web, Applied AI, DevOps/Containers, GSoC Playbook).
- **University Authentication**: Algorithmic IST enrollment verification (`1SV23CS042`, `SV24AI015`) with department and year inference.
- **Mentorship & Community**: Student-to-mentor matchmaking, campus workshop calendar (`/events`) with Google Calendar/.ics exports, and Contributor Swag Rewards (`/community/swag`) with automated voucher generation.
- **Global Command Palette**: `Cmd+K` / `Ctrl+K` omni-search with live indexing across students, projects, and platform pages.
- **Cleaned Architecture**: Completely deprecated and removed all legacy resume builder routes, badge cards, and test files.
- **Comprehensive Quality Assurance**: 32 backend automated test suites with 962+ assertions and 0 TypeScript compilation errors.

---

## 🗺️ What Should We Do Next: Four-Phase Roadmap

```
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 1: Production Deployment & Live Infrastructure (Immediate)       │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 2: Campus Pilot & Student Onboarding (Short-Term: 1-4 Weeks)     │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 3: Mentorship Cohorts & Swag Fulfillment (Mid-Term: 1-3 Months) │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 4: AI Mentorship & Multi-Campus Federation (Long-Term: 6+ Months)│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🟢 Phase 1: Production Deployment & Cloud Infrastructure (Immediate)

### 1.1 Release & Deployment Execution
- [ ] **Merge `feature/remove-resume-functionality` to `main`**:
  - Request user confirmation via `ask_question`.
  - Create Git tag `v1.48.0` and publish GitHub Release notes.
  - Preserve `feature/remove-resume-functionality` locally and remotely.
- [ ] **Vercel / Cloudflare Production Deployment**:
  - Connect `IST-ZenithenLab/ZenithenOpen` repository to Vercel.
  - Set production environment variables: `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `GITHUB_TOKEN`.
  - Verify edge routing and custom domain DNS records (`open.zenithen.ist` / `zenithen.ist`).

### 1.2 Database & Cache Provisioning
- [ ] **Supabase PostgreSQL Production Pooler**:
  - Run `prisma db push` or `prisma migrate deploy` against production Supabase instance.
  - Verify connection pooling via PgBouncer port 6543 (`?pgbouncer=true`).
  - Run database seeder (`npm run db:seed`) to populate baseline curriculum tracks and campus project metadata.
- [ ] **Upstash Redis Caching Layer**:
  - Verify key expiration policies and distributed rate limits (100 requests per minute per IP for public routes).
  - Test automatic fallback to in-memory cache when Redis credentials are not present.

### 1.3 Real-Time GitHub Ingestion Webhooks
- [ ] **Configure Organization Webhook**:
  - In `IST-ZenithenLab` GitHub Organization settings $\to$ Webhooks $\to$ Add Webhook:
    - Payload URL: `https://[production-domain]/api/github/webhook`
    - Content type: `application/json`
    - Events: `Pull requests`, `Issues`, `Push`, `Member`
    - Secret: Configured via `GITHUB_WEBHOOK_SECRET`
- [ ] **Automated Telemetry**:
  - Verify webhook triggers instant cache invalidation on `/api/students/leaderboard` and `/api/activity`.

---

## 🟡 Phase 2: Campus Pilot & Student Onboarding (Short-Term: 1–4 Weeks)

### 2.1 Departmental Outreach & Student Verification
- [ ] **GitHub Student Linking Campaign**:
  - Host the inaugural **"Open Source Saturday"** workshop at IST Bengaluru.
  - Onboard student developers across CSE, AI & DS, ISE, ECE, and Cyber Security departments.
  - Guide students through linking their GitHub handle with their institutional USN (`1SV23CS...`).
- [ ] **Interactive First Campus PR Drive**:
  - Direct all attendees to `/resources` (Interactive First PR Guide).
  - Target: 100+ verified campus pull requests merged into `IST-ZenithenLab/First-PR` and `IST-ZenithenLab/ZenithenOpen` in Month 1.

### 2.2 Live Activity Pulse & Leaderboard Sprints
- [ ] **Launch Sprint 1 Competition**:
  - Set weekly contest window on `/leaderboard?timeframe=week`.
  - Display real-time merge feed on `/api/activity`.
  - Highlight top contributors during weekly campus standups.

---

## 🔵 Phase 3: Mentorship Cohorts & Swag Fulfillment (Mid-Term: 1–3 Months)

### 3.1 Structured Mentorship Program
- [ ] **Mentor Onboarding**:
  - Invite senior student contributors, alumni engineers, and accepted GSoC scholars to register as mentors on `/mentorship`.
  - Enable mentors to define specialty areas: *Systems Programming*, *Next.js/React*, *Cloud Native/Kubernetes*, *Machine Learning*.
- [ ] **Application & Matching Engine**:
  - Allow mentees to request guidance on specific pull requests or fellowship proposals.
  - In-app email or Discord/Telegram webhook dispatch when a mentor accepts a request.

### 3.2 Automated Swag Claim & Distribution
- [ ] **Physical Fulfillment Workflow**:
  - Partner with IST campus administration or student council for distribution.
  - Implement an admin dashboard tab (`/admin/swag`) to verify voucher codes (`SWAG-2026-IST-XXXX`) and mark items as "Dispatched" or "Collected".
  - Automated celebratory confetti animations when students unlock a new milestone tier.

---

## 🟣 Phase 4: AI Mentorship & Multi-Campus Expansion (Long-Term: 6+ Months)

### 4.1 AI Code Review Mentor (Powered by Gemini)
- [ ] **Automated PR Diagnostic Bot**:
  - Integrate Google Gemini via Server Actions / Webhook to review open pull requests on `IST-ZenithenLab` repositories.
  - Analyze code diffs against campus coding standards: TypeScript types, test coverage, git commit conventions, and security best practices.
  - Provide constructive, pedagogical feedback in the PR comments to help first-time contributors fix errors before human maintainer review.

### 4.2 Fellowship Proposal Incubator
- [ ] **GSoC / SOB Proposal Drafting Workspace**:
  - Private collaborative markdown workspace for student fellowship applicants.
  - Rubric-based peer reviews scored by accepted past scholars.
  - Milestone timeline planning and stipend budget estimators.

### 4.3 Multi-Campus Open-Source Federation
- [ ] **Federated Campus Leaderboards**:
  - Extend student USN validation to support partner engineering colleges in Bengaluru.
  - Inter-collegiate open-source hackathons and multi-campus repository showcases.

---

## 📋 Engineering Task Matrix

| Feature / Task | Complexity | Impact | Dependencies | Target Release |
|:---|:---:|:---:|:---|:---:|
| Vercel Deployment & SSL Domain | Low | Critical | GitHub Release v1.48.0 | `v1.48.0` |
| Supabase Production DB Push | Low | Critical | Cloud PostgreSQL | `v1.48.0` |
| GitHub Org Webhook Automation | Medium | High | Production Domain | `v1.48.1` |
| Campus Sprint 1 Tournament | Low | High | Student Onboarding | `v1.49.0` |
| Admin Swag Voucher Validator | Medium | Medium | Swag API | `v1.50.0` |
| Email / Discord Webhook Notifications | Medium | High | Mentorship API | `v1.51.0` |
| AI Code Review Bot (Gemini) | High | High | GitHub App / API | `v2.0.0` |
| Federated Multi-Campus Support | High | High | Auth Expansion | `v2.1.0` |

---

<p align="center">
  <b>IST-ZenithenLab Engineering</b><br/>
  <i>Building the benchmark open-source ecosystem for university engineering education.</i>
</p>
