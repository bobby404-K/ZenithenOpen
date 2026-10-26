/**
 * Campus Notification Dispatcher for Discord & Telegram
 * Location: lib/notifications/dispatcher.ts
 *
 * Orchestrates multi-channel alert delivery for PR merges, quality contributions,
 * achievements, and swag redemptions.
 */

import {
  NotificationPayload,
  DispatchResult,
  ProviderDeliveryStatus,
  TelegramSendMessagePayload,
} from "./types";
import { formatDiscordPayload, formatTelegramMessage } from "./formatters";

/**
 * Check configuration status of notification channels
 */
export function isNotificationsConfigured(): {
  discord: boolean;
  telegram: boolean;
  enabled: boolean;
} {
  const discordUrl = (process.env.DISCORD_WEBHOOK_URL || "").trim();
  const telegramToken = (process.env.TELEGRAM_BOT_TOKEN || "").trim();
  const telegramChatId = (process.env.TELEGRAM_CHAT_ID || "").trim();
  const enabledFlag = (process.env.NOTIFICATIONS_ENABLED || "true").trim().toLowerCase();

  const enabled = enabledFlag !== "false" && enabledFlag !== "0";
  const discord = Boolean(discordUrl && discordUrl.startsWith("https://discord.com/api/webhooks"));
  const telegram = Boolean(telegramToken && telegramChatId);

  return { discord, telegram, enabled };
}

/**
 * Deliver alert to Discord webhook
 */
async function sendDiscordNotification(
  payload: NotificationPayload,
  webhookUrl: string
): Promise<ProviderDeliveryStatus> {
  try {
    const discordPayload = formatDiscordPayload(payload);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(discordPayload),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (response.ok || response.status === 204) {
      return { sent: true, status: response.status };
    }

    const errorText = await response.text().catch(() => "Unknown Discord response");
    console.warn(`[Notifications] Discord returned error status ${response.status}: ${errorText}`);
    return { sent: false, status: response.status, error: errorText };
  } catch (error: any) {
    const errorMsg = error?.name === "AbortError" ? "Request timeout after 5000ms" : error?.message || "Unknown error";
    console.warn(`[Notifications] Failed to send Discord webhook: ${errorMsg}`);
    return { sent: false, error: errorMsg };
  }
}

/**
 * Deliver alert to Telegram channel or chat
 */
async function sendTelegramNotification(
  payload: NotificationPayload,
  botToken: string,
  chatId: string
): Promise<ProviderDeliveryStatus> {
  try {
    const messageText = formatTelegramMessage(payload);
    const telegramPayload: TelegramSendMessagePayload = {
      chat_id: chatId,
      text: messageText,
      parse_mode: "HTML",
      disable_web_page_preview: false,
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const endpoint = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(telegramPayload),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (response.ok) {
      return { sent: true, status: response.status };
    }

    const errorJson = await response.json().catch(() => ({ description: "Unknown Telegram error" }));
    console.warn(`[Notifications] Telegram returned error ${response.status}: ${errorJson.description}`);
    return { sent: false, status: response.status, error: errorJson.description };
  } catch (error: any) {
    const errorMsg = error?.name === "AbortError" ? "Request timeout after 5000ms" : error?.message || "Unknown error";
    console.warn(`[Notifications] Failed to send Telegram message: ${errorMsg}`);
    return { sent: false, error: errorMsg };
  }
}

/**
 * Primary dispatch entrypoint: broadcasts to Discord & Telegram concurrently
 */
export async function dispatchNotification(payload: NotificationPayload): Promise<DispatchResult> {
  const timestamp = new Date().toISOString();
  const config = isNotificationsConfigured();

  // If notifications are disabled globally or no channels configured
  if (!config.enabled || (!config.discord && !config.telegram)) {
    return {
      success: true,
      skipped: true,
      discord: { sent: false, error: !config.enabled ? "Notifications disabled" : "Webhook URL not configured" },
      telegram: { sent: false, error: !config.enabled ? "Notifications disabled" : "Bot credentials not configured" },
      timestamp,
    };
  }

  const discordUrl = process.env.DISCORD_WEBHOOK_URL?.trim() || "";
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN?.trim() || "";
  const telegramChatId = process.env.TELEGRAM_CHAT_ID?.trim() || "";

  const [discordResult, telegramResult] = await Promise.all([
    config.discord
      ? sendDiscordNotification(payload, discordUrl)
      : Promise.resolve({ sent: false, error: "Not configured" }),
    config.telegram
      ? sendTelegramNotification(payload, telegramToken, telegramChatId)
      : Promise.resolve({ sent: false, error: "Not configured" }),
  ]);

  const success = (config.discord ? discordResult.sent : true) && (config.telegram ? telegramResult.sent : true);

  return {
    success,
    skipped: false,
    discord: discordResult,
    telegram: telegramResult,
    timestamp,
  };
}
