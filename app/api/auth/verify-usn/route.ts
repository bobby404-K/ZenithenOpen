import { NextRequest, NextResponse } from "next/server";
import { verifyStudentUSN } from "@/lib/auth/usn-verification";
import { checkRateLimit } from "@/lib/redis/client";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
    const rateLimit = await checkRateLimit(`verify_usn:${ip}`, 60, 60);

    if (!rateLimit.success) {
      return NextResponse.json(
        { valid: false, error: "Too many verification attempts. Please try again shortly." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.resetSeconds),
            "X-RateLimit-Limit": String(rateLimit.limit),
            "X-RateLimit-Remaining": String(rateLimit.remaining),
          },
        }
      );
    }

    const body = await req.json();
    const { usn } = body;

    if (!usn) {
      return NextResponse.json(
        { valid: false, error: "USN is required" },
        { status: 400 }
      );
    }

    const result = await verifyStudentUSN(usn);

    if (!result.valid) {
      return NextResponse.json(
        { valid: false, error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json({
      valid: true,
      student: result.student,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { valid: false, error: "Internal server error during verification" },
      { status: 500 }
    );
  }
}
