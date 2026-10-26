/**
 * Campus Notification Service & Broadcast API Route Test Suite
 * Location: tests/backend/notifications-service.test.ts
 *
 * Verifies Discord Webhook rich embed formatting, Telegram HTML message generation,
 * multi-channel dispatcher resilience, and the broadcast API route handler.
 */

import { TestSuite, SuiteResult } from "./test-utils";
import {
  formatDiscordPayload,
  formatTelegramMessage,
  escapeHtml,
} from "../../lib/notifications/formatters";
import {
  dispatchNotification,
  isNotificationsConfigured,
} from "../../lib/notifications/dispatcher";
import { NotificationPayload } from "../../lib/notifications/types";
import { GET as getBroadcast, POST as postBroadcast } from "../../app/api/notifications/broadcast/route";
import { NextRequest } from "next/server";

export async function runNotificationsServiceTests(): Promise<SuiteResult> {
  const suite = new TestSuite("Discord & Telegram Notifications Dispatcher Engine");
  suite.start();

  // --- 1. HTML Escaping Utility Tests ---
  const rawHtml = `<script>alert("hack & test's");</script>`;
  const escaped = escapeHtml(rawHtml);
  suite.assert(!escaped.includes("<script>"), "escapeHtml strips unescaped opening script tags");
  suite.assert(escaped.includes("&lt;script&gt;"), "escapeHtml escapes tags to &lt; and &gt;");
  suite.assert(escaped.includes("&amp;"), "escapeHtml escapes ampersands to &amp;");
  suite.assert(escaped.includes("&quot;"), "escapeHtml escapes double quotes to &quot;");
  suite.assert(escaped.includes("&#039;"), "escapeHtml escapes single quotes to &#039;");

  // --- 2. Discord Webhook Embed Formatting Tests ---
  const campusPrPayload: NotificationPayload = {
    event: "CAMPUS_PR_MERGED",
    title: "Official Campus PR: Add Search Filter",
    description: "Merged PR #104 into IST-ZenithenLab/ZenithenOpen",
    url: "https://github.com/IST-ZenithenLab/ZenithenOpen/pull/104",
    studentHandle: "bobby404-k",
    studentName: "Bobby Kumar",
    studentUsn: "1SV23CS042",
    repository: "IST-ZenithenLab/ZenithenOpen",
    isCampusRepo: true,
    isQualityPr: true,
    prNumber: 104,
  };

  const discordPayload = formatDiscordPayload(campusPrPayload);
  suite.assert(discordPayload.username === "ZenithenOpen Bot", "Discord payload specifies bot username");
  suite.assert(Array.isArray(discordPayload.embeds) && discordPayload.embeds.length === 1, "Discord payload contains exactly 1 embed");

  const embed = discordPayload.embeds[0];
  suite.assert(embed.title.includes("Official Campus PR"), "Embed title contains notification title");
  suite.assert(embed.description === campusPrPayload.description, "Embed description matches payload");
  suite.assert(embed.url === campusPrPayload.url, "Embed url links to pull request");
  suite.assert(embed.color === 0x10b981, "Campus PR embed uses Emerald Green brand color (0x10b981)");
  suite.assert(Boolean(embed.footer?.text.includes("IST-ZenithenLab")), "Embed footer identifies IST-ZenithenLab Telemetry");
  suite.assert(Boolean(embed.author?.name?.includes("Bobby")), "Embed author indicates contributor name");
  suite.assert(Boolean(embed.author?.icon_url?.includes("bobby404-k")), "Embed author icon links to GitHub avatar");

  const fields = embed.fields || [];
  suite.assert(fields.some((f) => f.name.includes("Contributor") && f.value.includes("1SV23CS042")), "Fields include Contributor USN and handle");
  suite.assert(fields.some((f) => f.name.includes("Repository") && f.value.includes("ZenithenOpen")), "Fields include target repository");
  suite.assert(fields.some((f) => f.name.includes("Pull Request") && f.value.includes("104")), "Fields include pull request number");
  suite.assert(fields.some((f) => f.name.includes("Badges") && f.value.includes("Official Campus Project")), "Fields include Campus Project badge");
  suite.assert(fields.some((f) => f.name.includes("Badges") && f.value.includes("Verified Quality PR")), "Fields include Quality PR badge");

  // --- 3. Swag Reward Discord Formatting ---
  const swagPayload: NotificationPayload = {
    event: "SWAG_CLAIMED",
    title: "Swag Reward: Tier 3 T-Shirt",
    description: "Claimed ZenithenOpen Champion T-Shirt",
    studentHandle: "tanmay-lead",
    studentName: "Tanmay Sharma",
    tierTitle: "Tier 3 Contributor",
    voucherCode: "SWAG-2026-IST-4821",
  };
  const swagEmbed = formatDiscordPayload(swagPayload).embeds[0];
  suite.assert(swagEmbed.color === 0xec4899, "Swag claim embed uses Rose Pink color (0xec4899)");
  suite.assert(Boolean(swagEmbed.fields?.some((f) => f.name.includes("Swag Tier") && f.value.includes("Tier 3"))), "Swag embed includes tier name");
  suite.assert(Boolean(swagEmbed.fields?.some((f) => f.name.includes("Voucher") && f.value.includes("SWAG-2026-IST-4821"))), "Swag embed includes voucher code");

  // --- 4. Telegram HTML Message Formatting Tests ---
  const tgHtml = formatTelegramMessage(campusPrPayload);
  suite.assert(tgHtml.includes("<b>🏛️ [ZenithenOpen]"), "Telegram message includes bold bracketed header");
  suite.assert(tgHtml.includes("Bobby Kumar"), "Telegram message includes student name");
  suite.assert(tgHtml.includes("1SV23CS042"), "Telegram message includes student USN");
  suite.assert(tgHtml.includes("<code>IST-ZenithenLab/ZenithenOpen</code>"), "Telegram message formats repo in <code> tags");
  suite.assert(tgHtml.includes('<a href="https://github.com/IST-ZenithenLab/ZenithenOpen/pull/104">#104</a>'), "Telegram message formats PR as clickable HTML anchor");
  suite.assert(tgHtml.includes("Official Campus Project"), "Telegram message mentions official campus badge");
  suite.assert(tgHtml.includes("Verified Quality PR"), "Telegram message mentions verified quality PR");
  suite.assert(tgHtml.includes("<i>IST Bengaluru Open Source Telemetry</i>"), "Telegram message contains footer tagline");

  // --- 5. Dispatcher Configuration & Resilience Tests ---
  const config = isNotificationsConfigured();
  suite.assert(typeof config.discord === "boolean", "isNotificationsConfigured returns boolean for discord");
  suite.assert(typeof config.telegram === "boolean", "isNotificationsConfigured returns boolean for telegram");
  suite.assert(typeof config.enabled === "boolean", "isNotificationsConfigured returns boolean for enabled");

  // Test graceful skip when unconfigured or offline
  const dispatchRes = await dispatchNotification({
    event: "CAMPUS_BROADCAST",
    title: "Test Broadcast",
    description: "Testing notification delivery resilience",
  });
  suite.assert(dispatchRes.success === true, "dispatchNotification succeeds without throwing when unconfigured");
  suite.assert(typeof dispatchRes.timestamp === "string", "dispatchNotification returns ISO timestamp");
  suite.assert(typeof dispatchRes.discord === "object", "dispatchNotification returns discord delivery report");
  suite.assert(typeof dispatchRes.telegram === "object", "dispatchNotification returns telegram delivery report");

  // --- 6. Broadcast API Route (GET Probe) ---
  const probeResponse = await getBroadcast();
  suite.assertEqual(probeResponse.status, 200, "GET /api/notifications/broadcast returns HTTP 200 OK");
  const probeData = await probeResponse.json();
  suite.assertEqual(probeData.status, "active", "Broadcast probe reports status 'active'");
  suite.assert(typeof probeData.channels === "object", "Probe returns channels status object");
  suite.assert(Array.isArray(probeData.supportedEvents), "Probe returns supportedEvents array");
  suite.assert(probeData.supportedEvents.includes("CAMPUS_PR_MERGED"), "Supported events includes CAMPUS_PR_MERGED");
  suite.assert(probeData.supportedEvents.includes("QUALITY_PR_MERGED"), "Supported events includes QUALITY_PR_MERGED");
  suite.assert(probeData.supportedEvents.includes("SWAG_CLAIMED"), "Supported events includes SWAG_CLAIMED");

  // --- 7. Broadcast API Route (POST Validation & Dispatch) ---
  // Missing required fields
  const invalidReq = new NextRequest("http://localhost:3000/api/notifications/broadcast", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const invalidRes = await postBroadcast(invalidReq);
  suite.assertEqual(invalidRes.status, 400, "POST missing fields returns HTTP 400 Bad Request");
  const invalidData = await invalidRes.json();
  suite.assertEqual(invalidData.success, false, "Response reports success: false on validation error");

  // Invalid event type
  const badEventReq = new NextRequest("http://localhost:3000/api/notifications/broadcast", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: "INVALID_EVENT",
      title: "Title Here",
      description: "Description Here",
    }),
  });
  const badEventRes = await postBroadcast(badEventReq);
  suite.assertEqual(badEventRes.status, 400, "POST invalid event enum returns HTTP 400 Bad Request");

  // Valid broadcast dispatch
  const validReq = new NextRequest("http://localhost:3000/api/notifications/broadcast", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: "CAMPUS_PR_MERGED",
      title: "Campus PR Merged: Test Action",
      description: "Automated test notification dispatch",
      studentHandle: "bobby404-k",
      repository: "IST-ZenithenLab/ZenithenOpen",
      prNumber: 99,
      isCampusRepo: true,
    }),
  });
  const validRes = await postBroadcast(validReq);
  suite.assertEqual(validRes.status, 200, "POST valid broadcast returns HTTP 200 OK");
  const validData = await validRes.json();
  suite.assertEqual(validData.success, true, "Response reports success: true");
  suite.assertEqual(validData.event, "CAMPUS_PR_MERGED", "Echoes event name accurately");
  suite.assert(Boolean(validData.delivery), "Response includes delivery details for Discord and Telegram");

  return suite.summary();
}

if (process.argv[1]?.endsWith("notifications-service.test.ts")) {
  runNotificationsServiceTests().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
