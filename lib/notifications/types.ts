/**
 * Campus Notification System Types & Contracts
 * Location: lib/notifications/types.ts
 *
 * Defines notification event types, dispatch payloads, and provider responses
 * for Discord and Telegram campus broadcasts.
 */

export type NotificationEventType =
  | "CAMPUS_PR_MERGED"
  | "QUALITY_PR_MERGED"
  | "MILESTONE_UNLOCKED"
  | "SWAG_CLAIMED"
  | "CAMPUS_BROADCAST";

export interface NotificationPayload {
  event: NotificationEventType;
  title: string;
  description: string;
  url?: string;
  studentHandle?: string;
  studentName?: string;
  studentUsn?: string;
  repository?: string;
  isQualityPr?: boolean;
  isCampusRepo?: boolean;
  prNumber?: number;
  tierTitle?: string;
  voucherCode?: string;
  timestamp?: string | Date;
  color?: number;
}

export interface ProviderDeliveryStatus {
  sent: boolean;
  status?: number;
  error?: string;
}

export interface DispatchResult {
  success: boolean;
  skipped: boolean;
  discord: ProviderDeliveryStatus;
  telegram: ProviderDeliveryStatus;
  timestamp: string;
}

export interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordEmbed {
  title: string;
  description: string;
  url?: string;
  color: number;
  fields?: DiscordEmbedField[];
  footer?: {
    text: string;
    icon_url?: string;
  };
  timestamp?: string;
  author?: {
    name: string;
    icon_url?: string;
    url?: string;
  };
}

export interface DiscordWebhookPayload {
  username?: string;
  avatar_url?: string;
  content?: string;
  embeds: DiscordEmbed[];
}

export interface TelegramSendMessagePayload {
  chat_id: string;
  text: string;
  parse_mode: "HTML" | "MarkdownV2";
  disable_web_page_preview?: boolean;
}
