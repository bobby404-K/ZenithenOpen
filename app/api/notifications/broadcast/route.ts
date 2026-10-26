/**
 * Campus Notification Broadcast API Route
 * Location: app/api/notifications/broadcast/route.ts
 *
 * GET: Returns channel configuration health and supported event types
 * POST: Dispatches notification to Discord and Telegram with schema validation
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { dispatchNotification, isNotificationsConfigured } from "@/lib/notifications/dispatcher";
import { NotificationEventType, NotificationPayload } from "@/lib/notifications/types";

const broadcastSchema = z.object({
  event: z.enum([
    "CAMPUS_PR_MERGED",
    "QUALITY_PR_MERGED",
    "MILESTONE_UNLOCKED",
    "SWAG_CLAIMED",
    "CAMPUS_BROADCAST",
  ] as [NotificationEventType, ...NotificationEventType[]]),
  title: z.string().min(3, "Title must be at least 3 characters").max(120),
  description: z.string().min(5, "Description must be at least 5 characters").max(1000),
  url: z.string().url().optional(),
  studentHandle: z.string().optional(),
  studentName: z.string().optional(),
  studentUsn: z.string().optional(),
  repository: z.string().optional(),
  isQualityPr: z.boolean().optional(),
  isCampusRepo: z.boolean().optional(),
  prNumber: z.number().int().positive().optional(),
  tierTitle: z.string().optional(),
  voucherCode: z.string().optional(),
  color: z.number().int().optional(),
});

/**
 * GET /api/notifications/broadcast - Probe configuration status
 */
export async function GET() {
  const config = isNotificationsConfigured();

  return NextResponse.json({
    status: "active",
    channels: {
      discord: {
        configured: config.discord,
        provider: "Discord Webhook (Rich Embeds)",
      },
      telegram: {
        configured: config.telegram,
        provider: "Telegram Bot API (HTML)",
      },
    },
    notificationsEnabled: config.enabled,
    supportedEvents: [
      "CAMPUS_PR_MERGED",
      "QUALITY_PR_MERGED",
      "MILESTONE_UNLOCKED",
      "SWAG_CLAIMED",
      "CAMPUS_BROADCAST",
    ],
    timestamp: new Date().toISOString(),
  });
}

/**
 * POST /api/notifications/broadcast - Dispatch notification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = broadcastSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: parseResult.error.format(),
        },
        { status: 400 }
      );
    }

    const payload: NotificationPayload = parseResult.data;
    const result = await dispatchNotification(payload);

    return NextResponse.json(
      {
        success: result.success,
        skipped: result.skipped,
        delivery: {
          discord: result.discord,
          telegram: result.telegram,
        },
        event: payload.event,
        title: payload.title,
        timestamp: result.timestamp,
      },
      { status: result.success ? 200 : 502 }
    );
  } catch (error: any) {
    console.error("[Notifications Broadcast API] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal server error during broadcast",
      },
      { status: 500 }
    );
  }
}
