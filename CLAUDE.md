# ZenithenOpen — Developer & Agent Instructions

This repository is **ZenithenOpen** (`IST-ZenithenLab/ZenithenOpen`), built with **Next.js 16 (App Router)**, **React 19.3.1**, and **TypeScript 5**.

## 🌿 Mandatory Feature Development & Release Protocol

For **every new feature, task, enhancement, or bugfix**:
1. **Branch**: Always create a new branch off the latest `main`:
   ```bash
   git checkout main && git pull origin main
   git checkout -b feature/<feature-name>
   ```
2. **Quality Gates**: Ensure full verification:
   ```bash
   npm run typecheck    # 0 TypeScript compilation errors
   npm test             # All 32 backend test suites passing
   ```
3. **Pull Request (PR)**: Push the branch and open a PR targeting `main`:
   ```bash
   git push -u origin feature/<feature-name>
   gh pr create --title "feat: <description>" --body "<summary>"
   ```
4. **Merge**: Once verified, merge the PR into `main` (`gh pr merge <PR> --merge`).
5. **Preserve Branches**: **NEVER delete feature branches**. All branches must remain permanently preserved locally and on `origin`.
6. **Tag & Release**: Pull `main`, bump version in `package.json`, document in `CHANGELOG.md`, cut tag, push, and publish GitHub Release:
   ```bash
   git tag -a vX.Y.Z -m "Release vX.Y.Z: <details>"
   git push origin vX.Y.Z
   gh release create vX.Y.Z --generate-notes
   ```

## 🛠️ Key Commands

- `npm run dev` — Start local Next.js development server
- `npm run typecheck` — TypeScript type-check (`tsc --noEmit`)
- `npm test` — Run all 32 backend automated test suites (`tsx tests/backend/run-all.ts`)
- `npm run test:themes` — Run theme system tests
- `npm run preflight` — Strict pre-deployment environment & probe audit
- `docker compose up -d` — Start multi-container stack (App, PostgreSQL 16 on 5433, Redis 7 on 6379)
