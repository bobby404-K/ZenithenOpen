import { z } from "zod";

/**
 * Production Environment Variables Schema & Runtime Validator
 * Location: lib/env.ts
 *
 * Ensures all sensitive secrets and infrastructure endpoints are
 * typed, validated, and safely accessed across the Next.js stack.
 */

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  DATABASE_URL: z.string().optional(),
  AUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GITHUB_TOKEN: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  POSTHOG_KEY: z.string().optional(),
  POSTHOG_HOST: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let parsedEnv: Env | null = null;

/**
 * Returns validated environment variables singleton
 */
export function getEnv(): Env {
  if (parsedEnv) return parsedEnv;

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error(
      "[Environment] Invalid environment variables configuration:",
      result.error.format()
    );
    throw new Error("Invalid application environment configuration.");
  }

  parsedEnv = result.data;
  return parsedEnv;
}

/**
 * Check whether required production variables are satisfied
 */
export function validateProductionEnv(): {
  isValid: boolean;
  missingVariables: string[];
} {
  const missingVariables: string[] = [];
  if (process.env.NODE_ENV === "production") {
    if (!process.env.DATABASE_URL) missingVariables.push("DATABASE_URL");
    if (!process.env.AUTH_SECRET) missingVariables.push("AUTH_SECRET");
  }
  return {
    isValid: missingVariables.length === 0,
    missingVariables,
  };
}
