import { NextRequest, NextResponse } from "next/server";

export interface GitHubOAuthResponse {
  success: boolean;
  user?: {
    githubId: string;
    username: string;
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
 * GET /api/auth/oauth/github
 * Returns the official GitHub OAuth initiation URL or sandbox status.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const callbackUrl = searchParams.get("callbackUrl") || `${req.nextUrl.origin}/login`;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const scope = "read:user,user:email";

  if (clientId && clientId !== "your_github_oauth_client_id") {
    const encodedScope = encodeURIComponent("read:user user:email");
    const state = encodeURIComponent(Buffer.from(JSON.stringify({ callbackUrl, timestamp: Date.now() })).toString("base64"));
    
    // Check if redirect URI is explicitly configured in environment variables.
    // When omitted, GitHub automatically uses the application's registered callback URL,
    // avoiding the scary "The redirect_uri is not associated with this application" screen.
    const configuredRedirect = process.env.GITHUB_REDIRECT_URI;
    const redirectParam = configuredRedirect ? `&redirect_uri=${encodeURIComponent(configuredRedirect)}` : "";
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}${redirectParam}&scope=${encodedScope}&state=${state}`;

    return NextResponse.json({
      success: true,
      mode: "live",
      scope,
      authUrl,
    });
  }

  const sandboxAuthUrl = `https://github.com/login/oauth/authorize?client_id=sandbox&scope=${encodeURIComponent("read:user user:email")}`;

  return NextResponse.json({
    success: true,
    mode: "sandbox",
    scope,
    authUrl: sandboxAuthUrl,
    message: "Live GitHub OAuth credentials not configured; developer sandbox mode active.",
  });
}

/**
 * POST /api/auth/oauth/github
 * Exchanges an OAuth authorization code for an authentic GitHub user profile,
 * or completes sandbox authorization for campus developers.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, username, simulate, studentName } = body || {};

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    // Validate request parameters: require either code or explicit simulation/username
    if (!code && !simulate && !username) {
      return NextResponse.json(
        { success: false, error: "Missing authorization code or developer sandbox parameters." },
        { status: 400 }
      );
    }

    // 1. Live GitHub OAuth Code Exchange
    if (code && clientId && clientSecret && clientId !== "your_github_oauth_client_id") {
      const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
        }),
      });

      const tokenData = await tokenRes.json();
      if (tokenData.access_token) {
        const userRes = await fetch("https://api.github.com/user", {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
            "User-Agent": "ZenithenOpen-Auth-Service",
            Accept: "application/vnd.github.v3+json",
          },
        });

        if (userRes.ok) {
          const ghUser = await userRes.json();
          return NextResponse.json({
            success: true,
            mode: "live",
            user: {
              githubId: String(ghUser.id),
              username: ghUser.login,
              name: ghUser.name || ghUser.login,
              avatarUrl: ghUser.avatar_url || `https://github.com/${ghUser.login}.png`,
              profileUrl: ghUser.html_url || `https://github.com/${ghUser.login}`,
              email: ghUser.email || undefined,
            },
          });
        }
      }
    }

    // 2. Developer Sandbox / Simulated Authorization for Testing & Campus Demos
    if (simulate || !clientId || clientId === "your_github_oauth_client_id" || !code) {
      const rawUser = (username || "ist-student-dev").trim().replace(/^@/, "");
      const cleanUsername = rawUser
        .replace(/[^a-zA-Z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "") || "ist-student-dev";

      return NextResponse.json({
        success: true,
        mode: "sandbox",
        user: {
          githubId: `gh_sim_${cleanUsername.toLowerCase()}`,
          username: cleanUsername,
          name: studentName || cleanUsername,
          avatarUrl: `https://github.com/${cleanUsername}.png`,
          profileUrl: `https://github.com/${cleanUsername}`,
          email: `${cleanUsername.toLowerCase()}@users.noreply.github.com`,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "Failed to exchange GitHub authorization code." },
      { status: 400 }
    );
  } catch (err) {
    console.error("[GitHub OAuth API Error]:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error during GitHub authorization." },
      { status: 500 }
    );
  }
}
