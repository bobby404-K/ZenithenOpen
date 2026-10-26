/**
 * GitHub Real-Time Webhook Handler
 * Location: app/api/github/webhook/route.ts
 * 
 * Ingests live pull_request, pull_request_review, and push events
 * directly from GitHub, updating PostgreSQL and invalidating Redis caches.
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";
import { deleteCached } from "@/lib/redis/client";
import { fetchRepositoryStats, evaluateQualityPr } from "@/lib/github/sync";
import { ContributionStatus, ContributionType } from "@prisma/client";
import { dispatchNotification } from "@/lib/notifications/dispatcher";

/**
 * Verify HMAC-SHA256 signature from GitHub webhook payload
 */
function verifySignature(payloadText: string, signatureHeader: string | null, secret?: string): boolean {
  if (!secret) return true; // Optional if secret is not set in environment
  if (!signatureHeader) return false;

  const expectedSignature = `sha256=${crypto
    .createHmac("sha256", secret)
    .update(payloadText)
    .digest("hex")}`;

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signatureHeader),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

/**
 * GET /api/github/webhook - Webhook status and health probe
 */
export async function GET() {
  return NextResponse.json({
    status: "active",
    endpoint: "/api/github/webhook",
    supportedEvents: ["pull_request", "pull_request_review", "push", "ping"],
    timestamp: new Date().toISOString(),
  });
}

/**
 * POST /api/github/webhook - GitHub event ingestion handler
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-hub-signature-256");
    const event = request.headers.get("x-github-event") || "ping";
    const secret = process.env.GITHUB_WEBHOOK_SECRET?.trim();

    // Verify signature if secret is configured
    if (secret && !verifySignature(rawBody, signature, secret)) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    if (event === "ping") {
      return NextResponse.json({
        message: "ZenithenOpen webhook received ping successfully",
        pong: true,
      });
    }

    let payload: Record<string, any>;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    // 1. Handle Pull Request events
    if (event === "pull_request") {
      const pr = payload.pull_request;
      if (!pr) {
        return NextResponse.json({ error: "Missing pull_request object" }, { status: 400 });
      }

      const repoFullName = payload.repository?.full_name || "unknown-repo";
      const authorUsername = (pr.user?.login || "").trim().toLowerCase();
      if (!authorUsername) {
        return NextResponse.json({ message: "Ignored: Missing author username" });
      }

      // Check if author is a registered student
      let user: any = null;
      try {
        user = await prisma.user.findFirst({
          where: {
            OR: [
              { githubAccount: { username: { equals: authorUsername, mode: "insensitive" } } },
              { email: { startsWith: authorUsername, mode: "insensitive" } },
            ],
          },
          include: { githubAccount: true },
        });
      } catch (dbErr) {
        console.warn("[GitHub Webhook] Prisma user lookup notice:", dbErr);
      }

      if (!user) {
        if (repoFullName.toLowerCase().includes("ist-zenithenlab")) {
          await deleteCached("projects:campus-leaderboard:*");
        }
        return NextResponse.json({
          message: `Ignored: Author '${authorUsername}' is not a registered student`,
          isCampusRepo: repoFullName.toLowerCase().includes("ist-zenithenlab"),
        });
      }

      // Determine status
      let status: ContributionStatus = ContributionStatus.OPEN;
      if (pr.merged_at) {
        status = ContributionStatus.MERGED;
      } else if (pr.state === "closed") {
        status = ContributionStatus.CLOSED;
      }

      // Extract repository and evaluate quality criteria (with upstream fork resolution)
      const repoStats = await fetchRepositoryStats(repoFullName);
      const isQualityPr = evaluateQualityPr(
        {
          labels: pr.labels,
          comments: pr.comments,
          body: pr.body,
          state: pr.state,
          pull_request: { merged_at: pr.merged_at },
        },
        repoFullName,
        repoStats
      );

      const prUrl = pr.html_url;
      try {
        const existing = await prisma.contribution.findFirst({
          where: { url: prUrl },
        });

        if (existing) {
          await prisma.contribution.update({
            where: { id: existing.id },
            data: {
              title: pr.title || existing.title,
              status,
              isQualityPr,
              mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
              closedAt: pr.closed_at ? new Date(pr.closed_at) : null,
            },
          });
        } else {
          await prisma.contribution.create({
            data: {
              userId: user.id,
              title: pr.title || "Pull Request",
              url: prUrl,
              prNumber: Number(pr.number || 0),
              type: ContributionType.PULL_REQUEST,
              status,
              isQualityPr,
              mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
              closedAt: pr.closed_at ? new Date(pr.closed_at) : null,
              createdAt: new Date(pr.created_at || Date.now()),
            },
          });
        }
      } catch (dbErr) {
        console.warn("[GitHub Webhook] Prisma contribution update notice:", dbErr);
      }

      // Invalidate aggregate caches so leaderboards update instantly
      const isCampusRepo = repoFullName.toLowerCase().includes("ist-zenithenlab");
      const cacheInvalidationPromises = [
        deleteCached("metrics:community"),
        deleteCached("leaderboard:week"),
        deleteCached("leaderboard:month"),
        deleteCached("leaderboard:overall"),
        deleteCached(`github:prs:${authorUsername}`),
      ];

      if (isCampusRepo) {
        cacheInvalidationPromises.push(
          deleteCached("projects:campus-leaderboard:*"),
          deleteCached("projects:campus-leaderboard:timeframe:week:limit:20"),
          deleteCached("projects:campus-leaderboard:timeframe:month:limit:20"),
          deleteCached("projects:campus-leaderboard:timeframe:overall:limit:20")
        );
      }

      await Promise.all(cacheInvalidationPromises);

      // Trigger real-time Discord & Telegram alerts for merged PRs
      if (status === ContributionStatus.MERGED) {
        const eventType = isCampusRepo
          ? "CAMPUS_PR_MERGED"
          : isQualityPr
          ? "QUALITY_PR_MERGED"
          : "CAMPUS_PR_MERGED";

        const badgeLabel = isCampusRepo
          ? "Official Campus Repository PR"
          : isQualityPr
          ? "Verified Quality PR"
          : "Merged Pull Request";

        dispatchNotification({
          event: eventType,
          title: `${badgeLabel}: ${pr.title || "Pull Request"}`,
          description: `Student **${user.name || authorUsername}** merged Pull Request #${pr.number} into \`${repoFullName}\`!`,
          url: prUrl,
          studentHandle: authorUsername,
          studentName: user.name || authorUsername,
          studentUsn: user.usn,
          repository: repoFullName,
          isQualityPr,
          isCampusRepo,
          prNumber: Number(pr.number || 0),
          timestamp: pr.merged_at ? new Date(pr.merged_at) : new Date(),
        }).catch((notifErr) =>
          console.warn("[GitHub Webhook] Notification dispatch notice:", notifErr)
        );
      }

      return NextResponse.json({
        success: true,
        action: payload.action,
        user: authorUsername,
        prNumber: pr.number,
        status,
        isQualityPr,
        isCampusRepo,
      });
    }

    // 2. Handle Pull Request Reviews
    if (event === "pull_request_review") {
      const review = payload.review;
      const pr = payload.pull_request;
      if (!review || !pr) {
        return NextResponse.json({ error: "Missing review or pr payload" }, { status: 400 });
      }

      const reviewerUsername = (review.user?.login || "").trim().toLowerCase();
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { githubAccount: { username: { equals: reviewerUsername, mode: "insensitive" } } },
            { email: { startsWith: reviewerUsername, mode: "insensitive" } },
          ],
        },
      });

      if (user && review.html_url) {
        const existing = await prisma.contribution.findFirst({
          where: { url: review.html_url },
        });

        if (!existing) {
          await prisma.contribution.create({
            data: {
              userId: user.id,
              title: `Code Review: ${pr.title || "Pull Request"}`,
              url: review.html_url,
              prNumber: Number(pr.number || 0),
              type: ContributionType.CODE_REVIEW,
              status: ContributionStatus.MERGED,
              isQualityPr: false,
              mergedAt: new Date(review.submitted_at || Date.now()),
              createdAt: new Date(review.submitted_at || Date.now()),
            },
          });

          await Promise.all([
            deleteCached("metrics:community"),
            deleteCached(`github:reviews:${reviewerUsername}`),
          ]);
        }
      }

      return NextResponse.json({ success: true, event: "pull_request_review" });
    }

    // 3. Handle Push Events
    if (event === "push") {
      const pusherName = (payload.pusher?.name || payload.sender?.login || "").trim().toLowerCase();
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { githubAccount: { username: { equals: pusherName, mode: "insensitive" } } },
            { email: { startsWith: pusherName, mode: "insensitive" } },
          ],
        },
      });

      if (user && Array.isArray(payload.commits) && payload.commits.length > 0) {
        const toCreate = [];
        for (const c of payload.commits) {
          if (c.url) {
            toCreate.push({
              userId: user.id,
              title: (c.message || "Commit").split("\n")[0].substring(0, 150),
              url: c.url,
              prNumber: null,
              type: ContributionType.COMMIT,
              status: ContributionStatus.MERGED,
              isQualityPr: false,
              mergedAt: new Date(c.timestamp || Date.now()),
              createdAt: new Date(c.timestamp || Date.now()),
            });
          }
        }

        if (toCreate.length > 0) {
          await prisma.contribution.createMany({
            data: toCreate,
            skipDuplicates: true,
          });

          const isCampusRepo = (payload.repository?.full_name || "").toLowerCase().includes("ist-zenithenlab");
          const pushInvalidations = [
            deleteCached("metrics:community"),
            deleteCached(`github:commits:${pusherName}`),
          ];
          if (isCampusRepo) {
            pushInvalidations.push(deleteCached("projects:campus-leaderboard:*"));
          }
          await Promise.all(pushInvalidations);
        }
      }

      return NextResponse.json({ success: true, event: "push", commitsCount: payload.commits?.length || 0 });
    }

    return NextResponse.json({ success: true, event, processed: false, reason: "Unhandled event type" });
  } catch (error) {
    console.error("[GitHub Webhook] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error handling webhook" },
      { status: 500 }
    );
  }
}
