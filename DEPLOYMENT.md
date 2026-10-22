# ZenithenOpen — Production Deployment Guide

Welcome to the production deployment guide for **ZenithenOpen**, the open-source contribution and competition tracking platform built for the **Institute of Science & Technology (IST)** campus community.

This document details environment requirements, pre-deployment diagnostic checks, cloud platform provisioning, database migrations, security hardening, and operational observability.

---

## 🏗️ 1. Architecture Blueprint

```
                      ┌─────────────────────────────────────────┐
                      │          Campus Developers / Users      │
                      └────────────────────┬────────────────────┘
                                           │  HTTPS (Port 443)
                                           ▼
                      ┌─────────────────────────────────────────┐
                      │         Edge CDN / Reverse Proxy        │
                      │       (Vercel Edge / Cloudflare / Nginx)│
                      └────────────────────┬────────────────────┘
                                           │
                                           ▼
                      ┌─────────────────────────────────────────┐
                      │       ZenithenOpen Next.js App Router   │
                      │          (Node.js 20+ Runtime)          │
                      └───────┬─────────────────────────┬───────┘
                              │                         │
            ┌─────────────────┴────────┐       ┌────────┴────────────────┐
            ▼                          ▼       ▼                         ▼
 ┌─────────────────────┐   ┌───────────────────────┐   ┌───────────────────────┐
 │ Supabase PostgreSQL │   │ Upstash Serverless    │   │  GitHub REST API v3   │
 │ Relational Storage  │   │ Redis (KV & Rate-Lim) │   │ (Student Commits/PRs) │
 └─────────────────────┘   └───────────────────────┘   └───────────────────────┘
```

---

## 📋 2. Production Environment Variables

Ensure the following environment variables are supplied to your hosting runtime. Never commit `.env` or secrets to version control.

| Environment Variable | Required | Description | Example / Format |
|---|---|---|---|
| `NODE_ENV` | **Yes** | Execution mode | `production` |
| `DATABASE_URL` | **Yes** | PostgreSQL connection pooler URI | `postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Optional | Direct connection for Prisma migrations | `postgresql://postgres:[pass]@db.[ref].supabase.co:5432/postgres` |
| `AUTH_SECRET` | **Yes** | 32+ character entropy string for JWT & session encryption | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | **Yes** | Public root URL of your deployment | `https://open.zenithen.ist` |
| `UPSTASH_REDIS_REST_URL` | Recommended | Upstash Redis REST endpoint for rate-limiting | `https://[instance].upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Recommended | Upstash Redis authorization token | `AX...` |
| `GITHUB_TOKEN` | Recommended | GitHub Personal Access Token (PAT) for API rate headroom (5,000 req/hr) | `ghp_...` |
| `NEXT_PUBLIC_APP_URL` | Optional | Frontend application URL | `https://open.zenithen.ist` |

---

## 🔍 3. Preflight Diagnostics CLI

ZenithenOpen includes a preflight verification tool. Run this command prior to cutting a release or triggering production traffic:

```bash
# Standard Preflight Diagnostic
npm run preflight

# Strict Mode (fails build if any warnings are detected)
npx tsx scripts/preflight.ts --strict
```

The preflight tool validates:
1. **Runtime Environment Variables** against the Zod schema (`lib/env.ts`).
2. **PostgreSQL Relational Connectivity** (`SELECT 1`) and entity counts.
3. **Upstash Redis Cache & Rate-Limiting Engine** (ping and TTL write test).
4. **GitHub API Ingestion Headroom** (quota remaining out of 5,000).
5. **Self-Check Probe** (`GET /api/health` HTTP 200 validation).

---

## 🚀 4. Deployment Option A: Vercel (Recommended)

Vercel provides native zero-configuration hosting for Next.js App Router applications with edge routing and automatic HTTPS.

### 4.1 Deployment Steps via Vercel Dashboard

1. Push your repository to GitHub (`IST-ZenithenLab/ZenithenOpen`).
2. Navigate to [Vercel Dashboard](https://vercel.com/new) and click **Import Project**.
3. Select `ZenithenOpen`.
4. Configure Build & Development Settings:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `./`
   - **Build Command**: `next build` (Prisma generation is handled via `postinstall` in `package.json`)
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`
5. In **Environment Variables**, paste all keys from Section 2 (`DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `GITHUB_TOKEN`).
6. Click **Deploy**.

### 4.2 Deployment via Vercel CLI

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Link repository to Vercel team/project
vercel link

# 3. Pull production environment variables
vercel env pull .env.production.local

# 4. Trigger production build & deployment
vercel deploy --prod
```

---

## 🐳 5. Deployment Option B: Docker Compose (Self-Hosted VPS)

For self-hosted deployments on AWS EC2, DigitalOcean Droplet, Hetzner, or on-premise campus hardware (Ubuntu 22.04 / 24.04 LTS).

### 5.1 Host Prerequisites
```bash
# Update package index and install Docker Engine & Compose plugin
sudo apt-get update && sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

### 5.2 Repository Setup & Environment Configuration
```bash
# Clone the repository
git clone https://github.com/IST-ZenithenLab/ZenithenOpen.git /opt/zenithen-open
cd /opt/zenithen-open

# Create production environment file
cp .env.example .env
nano .env  # Enter your production credentials
```

### 5.3 Launch Multi-Stage Production Container
```bash
# Build and launch in detached mode
docker compose up -d --build

# Verify container status
docker compose ps

# View real-time container logs
docker compose logs -f app
```

### 5.4 Nginx Reverse Proxy with Let's Encrypt SSL

Create `/etc/nginx/sites-available/zenithen-open`:
```nginx
server {
    server_name open.zenithen.ist;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site and provision SSL certificate:
```bash
sudo ln -s /etc/nginx/sites-available/zenithen-open /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d open.zenithen.ist
```

---

## 🚂 6. Deployment Option C: Railway / Render

1. Connect the GitHub repository `IST-ZenithenLab/ZenithenOpen`.
2. Add a **PostgreSQL** service or link an external Supabase instance.
3. Configure the start command:
   ```bash
   npm start
   ```
4. Configure health check path: `/api/health`.

---

## 🗄️ 7. Database Provisioning & Migrations

ZenithenOpen uses Prisma ORM with relational PostgreSQL.

### 7.1 Syncing Schema to Production
To synchronize schema indices and tables without creating conflicting migration drift:
```bash
npm run db:push
```

### 7.2 Inspecting Live Data via Prisma Studio
To inspect user records, contributions, or manage badges:
```bash
npm run db:studio
```
Prisma Studio runs locally on `http://localhost:5555`.

---

## 🛡️ 8. Security & Rate-Limiting Architecture

ZenithenOpen enforces several production security layers:
- **HTTP Security Headers**: Configured in `next.config.ts` (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, strict `Permissions-Policy`).
- **Distributed Sliding-Window Rate Limiting**: Built into `lib/redis/client.ts`. Rate limits apply to sensitive endpoints (`/api/auth/login`, `/api/auth/verify-usn`) returning `HTTP 429 Too Many Requests` with `Retry-After` headers.
- **Fail-Safe In-Memory Fallback**: If Redis becomes temporarily unreachable, the platform automatically switches to local memory caching without interrupting user sessions.

---

## 📊 9. Production Observability & Health Monitoring

### 9.1 Health Probe Endpoint
ZenithenOpen exposes a lightweight monitoring probe:
```
GET /api/health
```

**Healthy Response (`HTTP 200 OK`):**
```json
{
  "status": "healthy",
  "version": "1.4.0",
  "uptimeSeconds": 1420,
  "timestamp": "2026-10-11T20:30:00.000Z",
  "latencyMs": 14,
  "environment": "production",
  "checks": {
    "database": {
      "status": "up",
      "latencyMs": 11
    },
    "cache": {
      "status": "up",
      "latencyMs": 3
    }
  }
}
```

**Degraded Response (`HTTP 503 Service Unavailable`):**
```json
{
  "status": "degraded",
  "version": "1.4.0",
  "checks": {
    "database": {
      "status": "degraded",
      "error": "Connection timeout"
    }
  }
}
```

Configure your uptime monitoring service (e.g., Better Stack, Datadog, Uptime Kuma) to ping `/api/health` at 60-second intervals.

---

## 🔄 10. Rollback & Maintenance Procedures

If a deployment exhibits regressions:
1. **Instant Vercel Rollback**: Navigate to Vercel Dashboard -> Deployments -> locate the previous release (e.g. `v1.3.0`) -> click **Promote to Production**.
2. **Docker VPS Rollback**:
   ```bash
   git checkout v1.3.0
   docker compose up -d --build
   ```
3. **Database Safeguard**: Because migrations use non-destructive additive indexing (`@@index([department])`, `@@index([userId, status])`), rolling back application code versions does not necessitate dropping or altering database tables.
