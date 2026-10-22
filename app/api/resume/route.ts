/**
 * Resume Profile API Route
 * Location: app/api/resume/route.ts
 * 
 * Provides base endpoint for retrieving default template (GET)
 * and persisting student resume customizations (POST).
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { MOCK_RESUME_DATA } from "@/lib/data/mock-data";
import { deleteCached } from "@/lib/redis/client";
import { GET as getByUsername } from "./[username]/route";

const UpdateResumeSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  headline: z.string().min(3).max(150),
  email: z.string().email("Valid email required"),
  location: z.string().min(2).max(100),
  githubUsername: z.string().min(1).max(50),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
  summary: z.string().min(10, "Summary must be at least 10 characters"),
  skills: z.object({
    languages: z.array(z.string()).default([]),
    frameworks: z.array(z.string()).default([]),
    tools: z.array(z.string()).default([]),
    databases: z.array(z.string()).default([]),
  }),
  education: z.object({
    institution: z.string().min(2),
    degree: z.string().min(2),
    field: z.string().min(2),
    graduationYear: z.string().min(4),
    gpa: z.string().optional(),
  }),
  achievements: z.array(z.string()).default([]),
});

/**
 * GET /api/resume
 * Query params:
 *  - username: optional GitHub username to look up
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (username) {
    return getByUsername(request, {
      params: Promise.resolve({ username }),
    });
  }

  return NextResponse.json({
    success: true,
    profile: MOCK_RESUME_DATA,
    cached: false,
  });
}

/**
 * POST /api/resume
 * Validates and stores custom resume settings for student
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = UpdateResumeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validation.data;
    const cleanUsername = data.githubUsername.toLowerCase().trim();

    // Invalidate cached resume snapshots
    await Promise.all([
      deleteCached(`resume:v1:${cleanUsername}:json`),
      deleteCached(`resume:v1:${cleanUsername}:markdown`),
    ]);

    return NextResponse.json({
      success: true,
      message: "Resume customized profile saved successfully",
      profile: data,
    });
  } catch (error) {
    console.error("[Resume API] POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save resume profile" },
      { status: 500 }
    );
  }
}
