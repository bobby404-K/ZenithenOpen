/**
 * Backend Unit Tests: Dual GitHub & LinkedIn OAuth Authentication
 * Location: tests/backend/oauth-login.test.ts
 *
 * Verifies:
 * 1. GET /api/auth/oauth/github - Returns live/sandbox OAuth authorization URLs and scopes
 * 2. POST /api/auth/oauth/github - Simulated & live GitHub profile resolution
 * 3. GET /api/auth/oauth/linkedin - Returns live/sandbox OAuth authorization URLs and scopes
 * 4. POST /api/auth/oauth/linkedin - Simulated & live LinkedIn profile resolution
 * 5. POST /api/auth/login - Full 3-step onboarding payload (USN + GitHub + LinkedIn)
 * 6. POST /api/auth/login - Fast 1-click login for returning contributors
 * 7. Error handling for missing credentials and invalid formats
 */

import { NextRequest } from "next/server";
import { GET as githubOauthGet, POST as githubOauthPost } from "../../app/api/auth/oauth/github/route";
import { GET as githubCallbackGet } from "../../app/api/auth/oauth/github/callback/route";
import { GET as linkedinOauthGet, POST as linkedinOauthPost } from "../../app/api/auth/oauth/linkedin/route";
import { GET as linkedinCallbackGet } from "../../app/api/auth/oauth/linkedin/callback/route";
import { POST as loginHandler } from "../../app/api/auth/login/route";
import { TestSuite, SuiteResult } from "./test-utils";

export async function runOAuthLoginTests(): Promise<SuiteResult> {
  const suite = new TestSuite("Dual GitHub & LinkedIn OAuth Engine");
  suite.start();

  // =========================================================================
  // 1. GitHub OAuth Route (/api/auth/oauth/github)
  // =========================================================================

  // GET: Introspection & Auth URL
  const ghGetReq = new NextRequest("http://localhost:3000/api/auth/oauth/github");
  const ghGetRes = await githubOauthGet(ghGetReq);
  suite.assertEqual(ghGetRes.status, 200, "GET /api/auth/oauth/github returns 200 OK");
  const ghGetData = await ghGetRes.json();
  suite.assertEqual(ghGetData.success, true, "Response reports success: true");
  suite.assert(typeof ghGetData.mode === "string", "Reports OAuth mode ('live' or 'sandbox')");
  suite.assertEqual(ghGetData.scope, "read:user,user:email", "Requests required scopes: read:user,user:email");
  suite.assert(typeof ghGetData.authUrl === "string", "Provides valid GitHub authorization URL");

  // POST: Missing parameters
  const ghEmptyPostReq = new NextRequest("http://localhost:3000/api/auth/oauth/github", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const ghEmptyPostRes = await githubOauthPost(ghEmptyPostReq);
  suite.assertEqual(ghEmptyPostRes.status, 400, "POST missing params returns 400 Bad Request");
  const ghEmptyPostData = await ghEmptyPostRes.json();
  suite.assertEqual(ghEmptyPostData.success, false, "Response reports success: false on missing params");

  // POST: Developer Sandbox / Simulation Exchange
  const ghSimReq = new NextRequest("http://localhost:3000/api/auth/oauth/github", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      simulate: true,
      username: "alex-chen",
      studentName: "Alex Chen",
    }),
  });
  const ghSimRes = await githubOauthPost(ghSimReq);
  suite.assertEqual(ghSimRes.status, 200, "POST simulated exchange returns 200 OK");
  const ghSimData = await ghSimRes.json();
  suite.assertEqual(ghSimData.success, true, "Simulated exchange reports success: true");
  suite.assert(Boolean(ghSimData.user), "Returns user identity object");
  suite.assertEqual(ghSimData.user?.username, "alex-chen", "Username matches requested handle");
  suite.assertEqual(ghSimData.user?.profileUrl, "https://github.com/alex-chen", "Sets valid GitHub profile URL");
  suite.assertEqual(ghSimData.user?.avatarUrl, "https://github.com/alex-chen.png", "Sets valid GitHub avatar URL");

  // =========================================================================
  // 2. LinkedIn OAuth Route (/api/auth/oauth/linkedin)
  // =========================================================================

  // GET: Introspection & Auth URL
  const liGetReq = new NextRequest("http://localhost:3000/api/auth/oauth/linkedin");
  const liGetRes = await linkedinOauthGet(liGetReq);
  suite.assertEqual(liGetRes.status, 200, "GET /api/auth/oauth/linkedin returns 200 OK");
  const liGetData = await liGetRes.json();
  suite.assertEqual(liGetData.success, true, "Response reports success: true");
  suite.assert(typeof liGetData.mode === "string", "Reports OAuth mode ('live' or 'sandbox')");
  suite.assertEqual(liGetData.scope, "openid profile email", "Requests required scopes: openid profile email");
  suite.assert(typeof liGetData.authUrl === "string", "Provides valid LinkedIn authorization URL");

  // POST: Missing parameters
  const liEmptyPostReq = new NextRequest("http://localhost:3000/api/auth/oauth/linkedin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const liEmptyPostRes = await linkedinOauthPost(liEmptyPostReq);
  suite.assertEqual(liEmptyPostRes.status, 400, "POST missing params returns 400 Bad Request");
  const liEmptyPostData = await liEmptyPostRes.json();
  suite.assertEqual(liEmptyPostData.success, false, "Response reports success: false on missing params");

  // POST: Developer Sandbox / Simulation Exchange
  const liSimReq = new NextRequest("http://localhost:3000/api/auth/oauth/linkedin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      simulate: true,
      vanityName: "alex-chen-dev",
      studentName: "Alex Chen",
      githubUsername: "alex-chen",
    }),
  });
  const liSimRes = await linkedinOauthPost(liSimReq);
  suite.assertEqual(liSimRes.status, 200, "POST simulated LinkedIn exchange returns 200 OK");
  const liSimData = await liSimRes.json();
  suite.assertEqual(liSimData.success, true, "Simulated exchange reports success: true");
  suite.assert(Boolean(liSimData.user), "Returns LinkedIn profile identity object");
  suite.assertEqual(liSimData.user?.vanityName, "alex-chen-dev", "Vanity name matches requested handle");
  suite.assertEqual(liSimData.user?.profileUrl, "https://www.linkedin.com/in/alex-chen-dev", "Sets valid LinkedIn profile URL");

  // =========================================================================
  // 3. Full 3-Step Dual OAuth Login (/api/auth/login)
  // =========================================================================
  const fullLoginReq = new NextRequest("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      usn: "1SV23CS001",
      githubUsername: "alex-chen",
      githubAccount: {
        githubId: "gh_alex_123",
        username: "alex-chen",
        name: "Alex Chen",
        avatarUrl: "https://github.com/alex-chen.png",
        profileUrl: "https://github.com/alex-chen",
      },
      linkedinAccount: {
        linkedinId: "li_alex_456",
        vanityName: "alex-chen-dev",
        name: "Alex Chen",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        profileUrl: "https://www.linkedin.com/in/alex-chen-dev",
      },
    }),
  });

  const fullLoginRes = await loginHandler(fullLoginReq);
  suite.assertEqual(fullLoginRes.status, 200, "Full dual-OAuth login returns 200 OK");
  const fullLoginData = await fullLoginRes.json();
  suite.assertEqual(fullLoginData.success, true, "Dual login payload reports success: true");
  suite.assertEqual(fullLoginData.user?.usn, "1SV23CS001", "USN matches student record");
  suite.assertEqual(fullLoginData.user?.githubUsername, "alex-chen", "GitHub username linked");
  suite.assertEqual(fullLoginData.user?.githubProfileUrl, "https://github.com/alex-chen", "GitHub profile URL attached");
  suite.assertEqual(fullLoginData.user?.linkedinUsername, "alex-chen-dev", "LinkedIn vanity handle attached");
  suite.assertEqual(fullLoginData.user?.linkedinUrl, "https://www.linkedin.com/in/alex-chen-dev", "LinkedIn URL attached");

  // =========================================================================
  // 4. Fast 1-Click Login (/api/auth/login with fastLogin: true)
  // =========================================================================
  const fastLoginNotFoundReq = new NextRequest("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fastLogin: true,
      provider: "github",
      identifier: "unknown-student-handle-999",
      usn: "1SV23CS999",
    }),
  });
  const fastLoginNotFoundRes = await loginHandler(fastLoginNotFoundReq);
  suite.assertEqual(fastLoginNotFoundRes.status, 404, "Fast login for unlinked student prompts for onboarding (404)");
  const fastLoginNotFoundData = await fastLoginNotFoundRes.json();
  suite.assertEqual(fastLoginNotFoundData.needsEnrollment, true, "Reports needsEnrollment: true");

  // =========================================================================
  // 5. Normalization of Synthetic Handles with Parentheses
  // =========================================================================
  const syntheticLoginReq = new NextRequest("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      usn: "1SV23CS001",
      githubUsername: "student-(1sv23cs001)",
      githubAccount: {
        githubId: "gh_sim_student-1sv23cs001",
        username: "student-(1sv23cs001)",
        name: "Student (1SV23CS001)",
        avatarUrl: "https://github.com/student-1sv23cs001.png",
        profileUrl: "https://github.com/student-1sv23cs001",
      },
      linkedinAccount: {
        linkedinId: "li_sim_student-1sv23cs001",
        vanityName: "in/student-(1sv23cs001)",
        name: "Student 1SV23CS001",
        avatarUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=student-1sv23cs001",
        profileUrl: "https://www.linkedin.com/in/student-1sv23cs001",
      },
    }),
  });
  const syntheticLoginRes = await loginHandler(syntheticLoginReq);
  suite.assertEqual(syntheticLoginRes.status, 200, "Synthetic handle with parentheses auto-normalizes and returns 200 OK");
  const syntheticLoginData = await syntheticLoginRes.json();
  suite.assertEqual(syntheticLoginData.success, true, "Synthetic login reports success: true");
  suite.assertEqual(syntheticLoginData.user?.githubUsername, "student-1sv23cs001", "GitHub username sanitized without parentheses");
  suite.assert(!syntheticLoginData.user?.linkedinUsername.includes("("), "LinkedIn vanity name sanitized without parentheses");

  // =========================================================================
  // 6. OAuth Callback Routes Introspection
  // =========================================================================
  const ghCallbackReq = new NextRequest("http://localhost:3000/api/auth/oauth/github/callback?code=mock_gh_code_123&state=abc");
  const ghCallbackRes = await githubCallbackGet(ghCallbackReq);
  suite.assertEqual(ghCallbackRes.status, 200, "GET /api/auth/oauth/github/callback returns 200 OK");
  const ghCallbackHtml = await ghCallbackRes.text();
  suite.assert(ghCallbackHtml.includes("ZENITHEN_GITHUB_OAUTH_SUCCESS"), "Callback HTML contains postMessage payload for parent window");

  const liCallbackReq = new NextRequest("http://localhost:3000/api/auth/oauth/linkedin/callback?code=mock_li_code_123&state=xyz");
  const liCallbackRes = await linkedinCallbackGet(liCallbackReq);
  suite.assertEqual(liCallbackRes.status, 200, "GET /api/auth/oauth/linkedin/callback returns 200 OK");
  const liCallbackHtml = await liCallbackRes.text();
  suite.assert(liCallbackHtml.includes("ZENITHEN_LINKEDIN_OAUTH_SUCCESS"), "Callback HTML contains postMessage payload for parent window");

  return suite.summary();
}

if (process.argv[1]?.endsWith("oauth-login.test.ts")) {
  runOAuthLoginTests().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
