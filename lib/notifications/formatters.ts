/**
 * Notification Payload Formatters for Discord & Telegram
 * Location: lib/notifications/formatters.ts
 *
 * Transforms internal notification payloads into rich Discord Webhook embeds
 * and HTML-formatted Telegram messages.
 */

import {
  NotificationPayload,
  NotificationEventType,
  DiscordWebhookPayload,
  DiscordEmbed,
  DiscordEmbedField,
} from "./types";

/**
 * Standard brand colors for Discord embeds
 */
const EVENT_COLORS: Record<NotificationEventType, number> = {
  CAMPUS_PR_MERGED: 0x10b981, // Emerald Green
  QUALITY_PR_MERGED: 0x6366f1, // Indigo / Purple
  MILESTONE_UNLOCKED: 0xf59e0b, // Amber Gold
  SWAG_CLAIMED: 0xec4899, // Pink / Rose
  MENTORSHIP_REQUEST: 0x3b82f6, // Ocean Blue
  CAMPUS_BROADCAST: 0x8b5cf6, // Violet
};

/**
 * Emojis corresponding to notification events
 */
const EVENT_EMOJIS: Record<NotificationEventType, string> = {
  CAMPUS_PR_MERGED: "🏛️",
  QUALITY_PR_MERGED: "⭐",
  MILESTONE_UNLOCKED: "🏆",
  SWAG_CLAIMED: "🎁",
  MENTORSHIP_REQUEST: "🤝",
  CAMPUS_BROADCAST: "📢",
};

/**
 * Escape HTML special characters for Telegram HTML mode
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Formats notification into a rich Discord Webhook payload
 */
export function formatDiscordPayload(payload: NotificationPayload): DiscordWebhookPayload {
  const color = payload.color || EVENT_COLORS[payload.event] || 0x10b981;
  const emoji = EVENT_EMOJIS[payload.event] || "🔔";

  const fields: DiscordEmbedField[] = [];

  if (payload.studentHandle) {
    const studentValue = payload.studentName
      ? `**${payload.studentName}** ([@${payload.studentHandle}](https://github.com/${payload.studentHandle}))`
      : `[@${payload.studentHandle}](https://github.com/${payload.studentHandle})`;
    fields.push({
      name: "👤 Contributor",
      value: payload.studentUsn ? `${studentValue}\n\`${payload.studentUsn}\`` : studentValue,
      inline: true,
    });
  }

  if (payload.repository) {
    fields.push({
      name: "📦 Repository",
      value: `\`${payload.repository}\``,
      inline: true,
    });
  }

  if (payload.prNumber) {
    fields.push({
      name: "🔀 Pull Request",
      value: payload.url ? `[#${payload.prNumber}](${payload.url})` : `#${payload.prNumber}`,
      inline: true,
    });
  }

  if (payload.tierTitle) {
    fields.push({
      name: "🎖️ Swag Tier",
      value: `**${payload.tierTitle}**`,
      inline: true,
    });
  }

  if (payload.voucherCode) {
    fields.push({
      name: "🎟️ Voucher",
      value: `\`${payload.voucherCode}\``,
      inline: true,
    });
  }

  const tags: string[] = [];
  if (payload.isCampusRepo) tags.push("🏛️ Official Campus Project");
  if (payload.isQualityPr) tags.push("⭐ Verified Quality PR (>=100★)");

  if (tags.length > 0) {
    fields.push({
      name: "🏷️ Badges",
      value: tags.join("\n"),
      inline: false,
    });
  }

  const timestampIso = payload.timestamp
    ? new Date(payload.timestamp).toISOString()
    : new Date().toISOString();

  const embed: DiscordEmbed = {
    title: `${emoji} ${payload.title}`,
    description: payload.description,
    url: payload.url,
    color,
    fields: fields.length > 0 ? fields : undefined,
    footer: {
      text: "IST-ZenithenLab Telemetry • IST Bengaluru",
    },
    timestamp: timestampIso,
  };

  if (payload.studentHandle) {
    embed.author = {
      name: payload.studentName || payload.studentHandle,
      icon_url: `https://github.com/${payload.studentHandle}.png?size=64`,
      url: `https://github.com/${payload.studentHandle}`,
    };
  }

  return {
    username: "ZenithenOpen Bot",
    avatar_url: "https://github.com/IST-ZenithenLab.png",
    embeds: [embed],
  };
}

/**
 * Formats notification into an HTML-formatted Telegram message string
 */
export function formatTelegramMessage(payload: NotificationPayload): string {
  const emoji = EVENT_EMOJIS[payload.event] || "🔔";
  const lines: string[] = [];

  lines.push(`<b>${emoji} [ZenithenOpen] ${escapeHtml(payload.title)}</b>`);
  lines.push("");
  lines.push(escapeHtml(payload.description));
  lines.push("");

  if (payload.studentHandle) {
    const namePart = payload.studentName ? ` (${escapeHtml(payload.studentName)})` : "";
    const usnPart = payload.studentUsn ? ` • <code>${escapeHtml(payload.studentUsn)}</code>` : "";
    lines.push(`👤 <b>Contributor:</b> <a href="https://github.com/${escapeHtml(payload.studentHandle)}">@${escapeHtml(payload.studentHandle)}</a>${namePart}${usnPart}`);
  }

  if (payload.repository) {
    lines.push(`📦 <b>Repository:</b> <code>${escapeHtml(payload.repository)}</code>`);
  }

  if (payload.prNumber) {
    const prLink = payload.url
      ? `<a href="${escapeHtml(payload.url)}">#${payload.prNumber}</a>`
      : `#${payload.prNumber}`;
    lines.push(`🔀 <b>Pull Request:</b> ${prLink}`);
  }

  if (payload.tierTitle) {
    lines.push(`🎖️ <b>Tier:</b> ${escapeHtml(payload.tierTitle)}`);
  }

  if (payload.voucherCode) {
    lines.push(`🎟️ <b>Voucher:</b> <code>${escapeHtml(payload.voucherCode)}</code>`);
  }

  if (payload.isCampusRepo) {
    lines.push(`🏛️ <b>Badge:</b> Official Campus Project`);
  }
  if (payload.isQualityPr) {
    lines.push(`⭐ <b>Badge:</b> Verified Quality PR (>=100★ / >=100🍴)`);
  }

  lines.push("");
  lines.push(`<i>IST Bengaluru Open Source Telemetry</i>`);

  return lines.join("\n");
}
