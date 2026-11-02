import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/auth/oauth/github/callback
 * Handles the redirect from GitHub OAuth authorization.
 * Posts the authorization code to the parent window (if opened as a popup)
 * or redirects cleanly back to /login.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const isSuccess = Boolean(code && !error);
  const safeCode = (code || "").replace(/[^a-zA-Z0-9_\-\.]/g, "");
  const safeState = (state || "").replace(/[^a-zA-Z0-9_\-\.=]/g, "");
  const safeError = (error || errorDescription || "").replace(/[<>"']/g, "");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GitHub Authorization - ZenithenOpen</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background: #090d16;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .card {
      background: #0f172a;
      border: 1px solid #1e293b;
      padding: 2.5rem;
      border-radius: 16px;
      text-align: center;
      max-width: 420px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-top-color: #38bdf8;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1.25rem;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    h2 { font-size: 1.15rem; margin: 0 0 0.5rem; }
    p { font-size: 0.85rem; color: #94a3b8; margin: 0; line-height: 1.4; }
  </style>
</head>
<body>
  <div class="card">
    <div class="spinner"></div>
    <h2>${isSuccess ? "GitHub Authorization Complete" : "GitHub Authorization Notice"}</h2>
    <p>${
      isSuccess
        ? "Connecting your verified GitHub developer profile back to ZenithenOpen..."
        : safeError || "Authorization was cancelled or encountered an error."
    }</p>
  </div>
  <script>
    (function() {
      var payload = {
        type: "${isSuccess ? "ZENITHEN_GITHUB_OAUTH_SUCCESS" : "ZENITHEN_GITHUB_OAUTH_ERROR"}",
        code: "${safeCode}",
        state: "${safeState}",
        error: "${safeError}"
      };

      if (window.opener && !window.opener.closed) {
        window.opener.postMessage(payload, "*");
        setTimeout(function() {
          try { window.close(); } catch(e) {}
        }, 1000);
      } else {
        setTimeout(function() {
          if ("${isSuccess}" === "true") {
            window.location.href = "/login?github_code=" + encodeURIComponent("${safeCode}");
          } else {
            window.location.href = "/login?oauth_error=" + encodeURIComponent("${safeError}");
          }
        }, 1500);
      }
    })();
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
