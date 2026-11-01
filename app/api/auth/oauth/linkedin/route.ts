import { NextRequest, NextResponse } from "next/server";

export interface LinkedInOAuthResponse {
  success: boolean;
  user?: {
    linkedinId: string;
    vanityName: string;
    name: string;
    avatarUrl: string;
    profileUrl: string;
    email?: string;
  };
  authUrl?: string;
  scope?: string;
  error?: string;
  mode?: "live" | "sandbox";
}

/**
 * GET /api/auth/oauth/linkedin
 * Returns the official LinkedIn OAuth 2.0 authorization URL or sandbox status.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const callbackUrl = searchParams.get("callbackUrl") || `${req.nextUrl.origin}/login`;
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const scope = "openid profile email";

  if (clientId && clientId !== "your_linkedin_client_id") {
    const encodedScope = encodeURIComponent(scope);
    const state = encodeURIComponent(Buffer.from(JSON.stringify({ callbackUrl, timestamp: Date.now() })).toString("base64"));
    const redirectUri = encodeURIComponent(`${req.nextUrl.origin}/api/auth/oauth/linkedin/callback`);
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${encodedScope}&state=${state}`;

    return NextResponse.json({
      success: true,
      mode: "live",
      scope,
      authUrl,
    });
  }

  const sandboxAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=sandbox&scope=${encodeURIComponent(scope)}`;

  return NextResponse.json({
    success: true,
    mode: "sandbox",
    scope,
    authUrl: sandboxAuthUrl,
    message: "Live LinkedIn OAuth credentials not configured; developer sandbox mode active.",
  });
}

/**
 * POST /api/auth/oauth/linkedin
 * Exchanges an OAuth authorization code for an authentic LinkedIn user profile,
 * or completes sandbox authorization for campus developers.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, vanityName, simulate, studentName, githubUsername } = body || {};

    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

    // Validate request parameters: require either code or explicit simulation/vanity/github handle
    if (!code && !simulate && !vanityName && !githubUsername) {
      return NextResponse.json(
        { success: false, error: "Missing authorization code or developer sandbox parameters." },
        { status: 400 }
      );
    }

    // 1. Live LinkedIn OAuth 2.0 (OpenID Connect) Code Exchange
    if (code && clientId && clientSecret && clientId !== "your_linkedin_client_id") {
      const redirectUri = `${req.nextUrl.origin}/api/auth/oauth/linkedin/callback`;
      const tokenParams = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      });

      const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: tokenParams.toString(),
      });

      const tokenData = await tokenRes.json();
      if (tokenData.access_token) {
        const userRes = await fetch("https://api.linkedin.com/v2/userinfo", {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        });

        if (userRes.ok) {
          const liUser = await userRes.json();
          const resolvedVanity = vanityName || liUser.sub || "linkedin-student";
          return NextResponse.json({
            success: true,
            mode: "live",
            user: {
              linkedinId: liUser.sub,
              name: liUser.name || studentName || "IST Student",
              vanityName: resolvedVanity,
              avatarUrl: liUser.picture || `https://api.dicebear.com/7.x/identicon/svg?seed=${resolvedVanity}`,
              profileUrl: `https://www.linkedin.com/in/${resolvedVanity}`,
              email: liUser.email || undefined,
            },
          });
        }
      }
    }

    // 2. Developer Sandbox / Simulated Authorization for Testing & Campus Demos
    if (simulate || !clientId || clientId === "your_linkedin_client_id" || !code) {
      const resolvedHandle = (vanityName || githubUsername || "student-engineer").trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
      const displayName = studentName || (vanityName ? vanityName.replace("-", " ") : "IST Engineer");

      return NextResponse.json({
        success: true,
        mode: "sandbox",
        user: {
          linkedinId: `li_sim_${resolvedHandle}`,
          name: displayName,
          vanityName: resolvedHandle,
          avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${resolvedHandle}`,
          profileUrl: `https://www.linkedin.com/in/${resolvedHandle}`,
          email: `${resolvedHandle}@alumni.ist.edu.in`,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "Failed to exchange LinkedIn authorization code." },
      { status: 400 }
    );
  } catch (err) {
    console.error("[LinkedIn OAuth API Error]:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error during LinkedIn authorization." },
      { status: 500 }
    );
  }
}
