/**
 * Dynamic Campus Events & Workshop Hub API
 * Location: app/api/events/route.ts
 *
 * Serves real-time workshops, weekly Open Source Saturday PR office hours,
 * hackathons, and fellowship talks with dynamic RSVP registration and calendar integration.
 */

import { NextRequest, NextResponse } from "next/server";
import { CampusEvent, EventAttendee } from "@/types";
import { getCached, setCached } from "@/lib/redis/client";

export const INITIAL_EVENTS: CampusEvent[] = [
  {
    id: "evt-git-masterclass",
    title: "Git & GitHub Masterclass: From Clone to First PR",
    category: "workshop",
    categoryLabel: "Workshop",
    date: "Saturday, Oct 24, 2026",
    time: "10:00 AM - 1:00 PM IST",
    location: "IST Computer Lab 3 & Online Discord",
    description:
      "Hands-on terminal workshop covering git branches, forks, conventional commits, and submitting pull requests with zero fear.",
    tags: ["Beginner Friendly", "Git", "Hands-on"],
    rsvpLink: "/events?rsvp=evt-git-masterclass",
    capacity: 60,
    rsvpCount: 42,
    status: "upcoming",
    attendees: [
      {
        username: "bobby404-k",
        name: "Bobby Kumar",
        department: "Computer Science",
        avatarUrl: "https://avatars.githubusercontent.com/u/1010101?v=4",
        rsvpAt: "2026-10-14T08:30:00.000Z",
      },
      {
        username: "tanmay-lead",
        name: "Tanmay Sharma",
        department: "Information Science",
        avatarUrl: "https://avatars.githubusercontent.com/u/2020202?v=4",
        rsvpAt: "2026-10-14T09:15:00.000Z",
      },
      {
        username: "ananya-dev",
        name: "Ananya Rao",
        department: "AI & Machine Learning",
        avatarUrl: "https://avatars.githubusercontent.com/u/3030303?v=4",
        rsvpAt: "2026-10-14T11:00:00.000Z",
      },
    ],
    speakers: [
      {
        name: "Bobby Kumar",
        role: "Core Maintainer & Campus Lead",
        github: "bobby404-k",
      },
      {
        name: "Tanmay Sharma",
        role: "Full Stack Engineer",
        github: "tanmay-lead",
      },
    ],
    calendarLinks: {
      google:
        "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Git+%26+GitHub+Masterclass%3A+From+Clone+to+First+PR&dates=20261024T043000Z/20261024T073000Z&details=Hands-on+terminal+workshop+covering+git+branches%2C+forks%2C+conventional+commits%2C+and+submitting+PRs.&location=IST+Computer+Lab+3+%26+Online+Discord",
      ics: "/api/events/evt-git-masterclass/calendar?format=ics",
    },
  },
  {
    id: "evt-open-source-saturday",
    title: "Open Source Saturday: Weekly Live PR Reviews",
    category: "office-hours",
    categoryLabel: "Community Office Hours",
    date: "Every Saturday",
    time: "4:00 PM - 6:30 PM IST",
    location: "ZenithenOpen Discord #code-review",
    description:
      "Join campus maintainers to review open pull requests, debug merge conflicts, and collaborate on production issues in real-time.",
    tags: ["Weekly", "Code Review", "Collaboration"],
    rsvpLink: "/events?rsvp=evt-open-source-saturday",
    capacity: 100,
    rsvpCount: 68,
    status: "upcoming",
    attendees: [
      {
        username: "priya-patel",
        name: "Priya Patel",
        department: "Computer Science",
        avatarUrl: "https://avatars.githubusercontent.com/u/4040404?v=4",
        rsvpAt: "2026-10-15T14:20:00.000Z",
      },
      {
        username: "vikram-dev",
        name: "Vikram Sengupta",
        department: "Electronics & Communication",
        avatarUrl: "https://avatars.githubusercontent.com/u/5050505?v=4",
        rsvpAt: "2026-10-15T16:00:00.000Z",
      },
    ],
    speakers: [
      {
        name: "Zenithen Maintainers Guild",
        role: "Campus Architecture Team",
        github: "IST-ZenithenLab",
      },
    ],
    calendarLinks: {
      google:
        "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Open+Source+Saturday%3A+Weekly+Live+PR+Reviews&dates=20261024T103000Z/20261024T130000Z&details=Live+PR+review+office+hours+with+core+maintainers.&location=ZenithenOpen+Discord+%23code-review",
      ics: "/api/events/evt-open-source-saturday/calendar?format=ics",
    },
  },
  {
    id: "evt-gsoc-roadmap",
    title: "GSoC 2027 Proposal Drafting & Architecture Session",
    category: "fellowship",
    categoryLabel: "Fellowship Talk",
    date: "Wednesday, Oct 28, 2026",
    time: "6:00 PM - 8:00 PM IST",
    location: "IST Seminar Hall B",
    description:
      "Past Google Summer of Code scholars break down proposal templates, organization selection strategies, and timeline roadmaps.",
    tags: ["GSoC", "Fellowship", "Global"],
    rsvpLink: "/events?rsvp=evt-gsoc-roadmap",
    capacity: 80,
    rsvpCount: 54,
    status: "upcoming",
    attendees: [
      {
        username: "rahul-ml",
        name: "Rahul Verma",
        department: "Data Science",
        avatarUrl: "https://avatars.githubusercontent.com/u/6060606?v=4",
        rsvpAt: "2026-10-16T10:10:00.000Z",
      },
    ],
    speakers: [
      {
        name: "Aditya Nair",
        role: "GSoC '25 Alum & CNCF Contributor",
        github: "aditya-nair",
      },
    ],
    calendarLinks: {
      google:
        "https://calendar.google.com/calendar/render?action=TEMPLATE&text=GSoC+2027+Proposal+Drafting+%26+Architecture+Session&dates=20261028T123000Z/20261028T143000Z&details=Proposal+templates+and+organization+selection+strategies+from+GSoC+scholars.&location=IST+Seminar+Hall+B",
      ics: "/api/events/evt-gsoc-roadmap/calendar?format=ics",
    },
  },
  {
    id: "evt-zenithhacks-2026",
    title: "ZenithHacks 2026: Campus Flagship Hackathon",
    category: "hackathon",
    categoryLabel: "Flagship Hackathon",
    date: "Nov 14 - 15, 2026",
    time: "36 Hours Sprint (Starts 9:00 AM IST)",
    location: "IST Bengaluru Main Auditorium",
    description:
      "Our marquee student hackathon bringing together cross-disciplinary engineers to build production open-source tools with maintainer support.",
    tags: ["36 Hours", "Hardware & Software", "₹1,00,000+ Prize Pool"],
    rsvpLink: "/events?rsvp=evt-zenithhacks-2026",
    capacity: 250,
    rsvpCount: 184,
    status: "upcoming",
    attendees: [],
    speakers: [
      {
        name: "Campus Hackathon Committee",
        role: "Organizers & Technical Leads",
        github: "IST-ZenithenLab",
      },
    ],
    calendarLinks: {
      google:
        "https://calendar.google.com/calendar/render?action=TEMPLATE&text=ZenithHacks+2026%3A+Campus+Flagship+Hackathon&dates=20261114T033000Z/20261115T153000Z&details=36-hour+flagship+campus+open-source+hackathon.&location=IST+Bengaluru+Main+Auditorium",
      ics: "/api/events/evt-zenithhacks-2026/calendar?format=ics",
    },
  },
  {
    id: "evt-rust-systems-intro",
    title: "Building High-Throughput Microservices with Rust & WebSockets",
    category: "workshop",
    categoryLabel: "Tech Deep Dive",
    date: "Saturday, Nov 21, 2026",
    time: "2:00 PM - 5:00 PM IST",
    location: "IST Computer Lab 4 & Virtual Stream",
    description:
      "Deep dive into zero-cost abstractions, asynchronous Tokio runtimes, and building lightning-fast real-time protocols.",
    tags: ["Rust", "Systems", "WebSockets"],
    rsvpLink: "/events?rsvp=evt-rust-systems-intro",
    capacity: 50,
    rsvpCount: 38,
    status: "upcoming",
    attendees: [],
    speakers: [
      {
        name: "Siddharth K.",
        role: "Systems SIG Lead",
        github: "siddharth-rust",
      },
    ],
    calendarLinks: {
      google:
        "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Building+High-Throughput+Microservices+with+Rust+%26+WebSockets&dates=20261121T083000Z/20261121T113000Z&details=Deep+dive+into+Tokio%2C+Rust%2C+and+real-time+networking.&location=IST+Computer+Lab+4",
      ics: "/api/events/evt-rust-systems-intro/calendar?format=ics",
    },
  },
];

// In-memory events store to persist RSVPs across runtime requests
let eventsStore: CampusEvent[] = JSON.parse(JSON.stringify(INITIAL_EVENTS));

export function getEventsStore(): CampusEvent[] {
  return eventsStore;
}

export function setEventsStore(events: CampusEvent[]): void {
  eventsStore = events;
}

export function resetEventsStore(): void {
  eventsStore = JSON.parse(JSON.stringify(INITIAL_EVENTS));
}

/**
 * GET /api/events
 * Query params:
 *  - category: "all" | "workshop" | "office-hours" | "fellowship" | "hackathon"
 *  - status: "all" | "upcoming" | "live" | "completed"
 *  - search: string
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category")?.toLowerCase() || "all";
    const status = searchParams.get("status")?.toLowerCase() || "all";
    const search = searchParams.get("search")?.toLowerCase().trim() || "";

    const cacheKey = `events:list:${category}:${status}:${search || "all"}`;
    const cached = await getCached<CampusEvent[]>(cacheKey);

    let filtered = eventsStore;

    if (category !== "all") {
      filtered = filtered.filter((evt) => evt.category === category);
    }

    if (status !== "all") {
      filtered = filtered.filter((evt) => evt.status === status);
    }

    if (search) {
      filtered = filtered.filter(
        (evt) =>
          evt.title.toLowerCase().includes(search) ||
          evt.description.toLowerCase().includes(search) ||
          evt.location.toLowerCase().includes(search) ||
          evt.tags.some((t) => t.toLowerCase().includes(search))
      );
    }

    // Cache results for 30 seconds
    await setCached(cacheKey, filtered, 30);

    return NextResponse.json({
      success: true,
      count: filtered.length,
      events: filtered,
      cached: Boolean(cached),
    });
  } catch (error) {
    console.error("[GET /api/events] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch campus events" },
      { status: 500 }
    );
  }
}
