/**
 * GitHub Webhook Route Test Suite
 * Location: tests/backend/github-webhook.test.ts
 */

import { TestSuite, SuiteResult } from "./test-utils";
import { GET, POST } from "../../app/api/github/webhook/route";
import { NextRequest } from "next/server";

export async function runGitHubWebhookTests(): Promise<SuiteResult> {
  const suite = new TestSuite("GitHub Real-Time Webhook Endpoint");
  suite.start();

  // --- 1. GET Health Probe ---
  const getRes = await GET();
  suite.assertEqual(getRes.status, 200, "GET /api/github/webhook returns 200 OK");
  const getData = await getRes.json();
  suite.assertEqual(getData.status, "active", "Webhook probe reports status 'active'");
  suite.assert(Array.isArray(getData.supportedEvents), "Reports supported webhook events list");

  // --- 2. POST Ping Event ---
  const pingReq = new NextRequest("http://localhost:3000/api/github/webhook", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-github-event": "ping",
    },
    body: JSON.stringify({ zen: "Keep it logically awesome." }),
  });

  const pingRes = await POST(pingReq);
  suite.assertEqual(pingRes.status, 200, "POST ping event returns 200 OK");
  const pingData = await pingRes.json();
  suite.assertEqual(pingData.pong, true, "Ping response includes pong: true");

  // --- 3. POST Malformed JSON Handling ---
  const malformedReq = new NextRequest("http://localhost:3000/api/github/webhook", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-github-event": "pull_request",
    },
    body: "{ malformed json",
  });

  const malformedRes = await POST(malformedReq);
  suite.assertEqual(malformedRes.status, 400, "POST malformed payload returns 400 Bad Request");

  // --- 4. POST Unhandled Event Graceful Skip ---
  const unhandledReq = new NextRequest("http://localhost:3000/api/github/webhook", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-github-event": "star",
    },
    body: JSON.stringify({ action: "created" }),
  });

  const unhandledRes = await POST(unhandledReq);
  suite.assertEqual(unhandledRes.status, 200, "Unhandled event returns 200 OK with processed: false");
  const unhandledData = await unhandledRes.json();
  suite.assertEqual(unhandledData.processed, false, "Response confirms unhandled event was skipped safely");

  // --- 5. POST Campus Repository Pull Request Invalidation ---
  const campusPrReq = new NextRequest("http://localhost:3000/api/github/webhook", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-github-event": "pull_request",
    },
    body: JSON.stringify({
      action: "closed",
      repository: {
        full_name: "IST-ZenithenLab/ZenithenOpen",
      },
      pull_request: {
        number: 42,
        title: "feat: add real-time campus merges trigger",
        state: "closed",
        merged_at: new Date().toISOString(),
        user: {
          login: "rohank-coder",
        },
        html_url: "https://github.com/IST-ZenithenLab/ZenithenOpen/pull/42",
      },
    }),
  });

  const campusPrRes = await POST(campusPrReq);
  suite.assertEqual(campusPrRes.status, 200, "POST campus PR event returns 200 OK");
  const campusPrData = await campusPrRes.json();
  suite.assertEqual(campusPrData.isCampusRepo, true, "Webhook flags PR as campus repository contribution");
  suite.assert(campusPrData.success !== undefined || campusPrData.message !== undefined, "Webhook completed processing campus PR");

  return suite.summary();
}

if (process.argv[1]?.endsWith("github-webhook.test.ts")) {
  runGitHubWebhookTests().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
