"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Trophy,
  Flame,
  Award,
  Users,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Download,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigation } from "@/components/navigation/navigation-context";
import { CampusEvent } from "@/types";
import { EventRsvpModal } from "@/components/events/event-rsvp-modal";

const VALID_EVENT_TABS = ["upcoming", "hackathons", "achievements"] as const;
type EventTab = (typeof VALID_EVENT_TABS)[number];

const FALLBACK_EVENTS: CampusEvent[] = [
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
    ],
    speakers: [
      {
        name: "Bobby Kumar",
        role: "Core Maintainer & Campus Lead",
        github: "bobby404-k",
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
      "Join core maintainers to review open campus pull requests, debug merge conflicts, and collaborate on production issues in real-time.",
    tags: ["Weekly", "Code Review", "Mentorship"],
    rsvpLink: "/events?rsvp=evt-open-source-saturday",
    capacity: 100,
    rsvpCount: 68,
    status: "upcoming",
    attendees: [],
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
    title: "GSoC 2027 Proposal Drafting & Mentorship Session",
    category: "fellowship",
    categoryLabel: "Fellowship Talk",
    date: "Wednesday, Oct 28, 2026",
    time: "6:00 PM - 8:00 PM IST",
    location: "IST Seminar Hall B",
    description:
      "Past Google Summer of Code scholars break down proposal templates, organization selection strategies, and timeline roadmaps.",
    tags: ["GSoC", "Mentorship", "Global"],
    rsvpLink: "/events?rsvp=evt-gsoc-roadmap",
    capacity: 80,
    rsvpCount: 54,
    status: "upcoming",
    attendees: [],
    speakers: [
      {
        name: "Aditya Nair",
        role: "GSoC '25 Alum & CNCF Contributor",
        github: "aditya-nair",
      },
    ],
    calendarLinks: {
      google:
        "https://calendar.google.com/calendar/render?action=TEMPLATE&text=GSoC+2027+Proposal+Drafting+%26+Mentorship+Session&dates=20261028T123000Z/20261028T143000Z&details=Proposal+templates+and+organization+selection+strategies+from+GSoC+scholars.&location=IST+Seminar+Hall+B",
      ics: "/api/events/evt-gsoc-roadmap/calendar?format=ics",
    },
  },
];

export default function EventsPage() {
  const { activeSection } = useNavigation();

  // Robust algorithm matching Programs: safely falls back to default if activeSection is invalid or null
  const defaultTab: EventTab = "upcoming";
  const currentTab: EventTab = VALID_EVENT_TABS.includes(activeSection as EventTab)
    ? (activeSection as EventTab)
    : defaultTab;

  const [events, setEvents] = React.useState<CampusEvent[]>(FALLBACK_EVENTS);
  const [selectedEventForRsvp, setSelectedEventForRsvp] = React.useState<CampusEvent | null>(null);
  const [isRsvpModalOpen, setIsRsvpModalOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  // Fetch live events from /api/events
  React.useEffect(() => {
    let isMounted = true;
    async function loadEvents() {
      try {
        setLoading(true);
        const res = await fetch("/api/events");
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.events) && data.events.length > 0) {
            if (isMounted) setEvents(data.events);
          }
        }
      } catch (err) {
        console.warn("[EventsPage] Using fallback events due to error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadEvents();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenRsvp = (evt: CampusEvent) => {
    setSelectedEventForRsvp(evt);
    setIsRsvpModalOpen(true);
  };

  const handleRsvpSuccess = (updatedEvent: CampusEvent) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e))
    );
  };

  const hackathons = [
    {
      id: "evt-zenithhacks-2026",
      name: "ZenithHacks 2026: Campus Flagship Hackathon",
      status: "Registration Open",
      duration: "36 Hours Sprint",
      focus: "Open Source for Campus & Social Impact",
      description:
        "Our marquee student hackathon bringing together cross-disciplinary engineers to build production open-source tools with mentor support.",
      prizes: "₹1,00,000+ Prize Pool + Swag & Cloud Credits",
      highlights: ["36 Hours In-Person", "Hardware & Software Tracks", "Industry Judges"],
    },
    {
      id: "sih-selection",
      name: "Smart India Hackathon (SIH) Internal Selection",
      status: "Annual Track",
      duration: "Internal Evaluation",
      focus: "Government & Enterprise Problem Statements",
      description:
        "Rigorous campus ideation, prototype vetting, and team mentoring to represent IST at the national Smart India Hackathon.",
      prizes: "National Stage Nomination + Incubation Support",
      highlights: ["Idea Review Panels", "Faculty Mentorship", "Prototype Staging"],
    },
    {
      id: "hacktoberfest",
      name: "Hacktoberfest Campus Sprint",
      status: "October Annual",
      duration: "Month-long Sprint",
      focus: "Global Open-Source Pull Requests",
      description:
        "Month-long open-source celebration with dedicated campus issue boards, automated PR verification, and contributor swag.",
      prizes: "Official Hacktoberfest Digital Badges + ZenithenOpen Swag",
      highlights: ["4+ Merged PRs Goal", "Dedicated Mentor Helpdesk", "Swag Tiers"],
    },
  ];

  const achievements = [
    {
      title: "Smart India Hackathon (SIH) National Finalists",
      year: "2025",
      award: "National Finalist",
      description:
        "3 student teams from ZenithenOpen advanced to the national grand finale solving critical healthcare and logistics challenges.",
      icon: Trophy,
    },
    {
      title: "Hacktoberfest 100% Milestone Completion Cohort",
      year: "2025",
      award: "120+ Verified Completers",
      description:
        "Over 120 IST students successfully authored and merged four or more high-quality pull requests during the global sprint.",
      icon: Award,
    },
    {
      title: "Inter-College Code Sprint Podium Champions",
      year: "2025",
      award: "1st Place Winner",
      description:
        "IST developers clinched 1st position in regional algorithmic hackathons utilizing modern distributed architectures.",
      icon: Flame,
    },
    {
      title: "Campus Open-Source Repository Adoption",
      year: "2026",
      award: "1,500+ Campus Daily Users",
      description:
        "Campus projects developed by community members now power course evaluation and automated student notification systems.",
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="mx-auto max-w-5xl">
        {/* Top Breadcrumb */}
        <Link
          href="/"
          className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-8 transition-colors group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Home</span>
        </Link>

        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary font-mono">
            <Calendar className="h-3.5 w-3.5" />
            <span>Sessions & Hackathons</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            ZenithenOpen Events
          </h1>

          <div className="p-4 rounded-xl border border-border bg-card/60">
            <p className="text-base font-semibold text-primary">
              &ldquo;upcoming events&rdquo;
            </p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Explore upcoming coding workshops, weekly hack hours, and celebrate student achievements. Switch between events using the top navbar options.
            </p>
          </div>
        </div>

        {/* ONLY THE SELECTED EVENT SECTION - NO OTHER THINGS */}
        <div className="mt-10">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {/* Section: Upcoming */}
            {currentTab === "upcoming" && (
              <section className="space-y-6 rounded-2xl border-2 border-primary/30 bg-card p-6 sm:p-10 shadow-lg shadow-primary/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/25 text-primary">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-primary px-2.5 py-0.5 rounded-md bg-muted border border-border">
                        Schedule & Workshops
                      </span>
                      <h2 className="text-2xl font-bold text-foreground mt-1">
                        Upcoming Events
                      </h2>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground hidden sm:inline-block">
                    {events.length} Events Scheduled
                  </span>
                </div>

                <div className="space-y-4 pt-2">
                  {events.map((evt) => (
                    <div
                      key={evt.id}
                      className="rounded-2xl border border-border bg-card p-6 shadow-xs hover:border-primary/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-primary px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                            {evt.categoryLabel || evt.category}
                          </span>
                          {evt.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-[10px] font-mono text-muted-foreground px-2 py-0.5 rounded-md bg-muted border border-border/80"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <h3 className="text-lg font-bold text-foreground">
                          {evt.title}
                        </h3>

                        <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                          {evt.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1 font-mono">
                          <span className="flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1 text-primary" />
                            {evt.date}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1 text-primary" />
                            {evt.time}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="h-3.5 w-3.5 mr-1 text-primary" />
                            {evt.location}
                          </span>
                          <span className="flex items-center text-primary font-semibold">
                            <Users className="h-3.5 w-3.5 mr-1" />
                            {evt.rsvpCount} / {evt.capacity} seats reserved
                          </span>
                        </div>

                        {/* Registered Attendees Preview */}
                        {evt.attendees && evt.attendees.length > 0 && (
                          <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground">
                            <span className="font-mono text-[10px] uppercase font-semibold text-muted-foreground">
                              Recent RSVPs:
                            </span>
                            <div className="flex items-center -space-x-1.5 overflow-hidden">
                              {evt.attendees.slice(0, 5).map((att, aIdx) => (
                                <img
                                  key={aIdx}
                                  src={
                                    att.avatarUrl ||
                                    `https://avatars.githubusercontent.com/${encodeURIComponent(att.username)}`
                                  }
                                  alt={att.name || att.username}
                                  title={`@${att.username} (${att.name || ""})`}
                                  className="inline-block h-5 w-5 rounded-full ring-2 ring-card bg-muted object-cover"
                                />
                              ))}
                            </div>
                            <span className="text-[10px] font-mono text-muted-foreground">
                              {evt.attendees.map((a) => `@${a.username}`).slice(0, 2).join(", ")}
                              {evt.attendees.length > 2 && ` +${evt.attendees.length - 2} more`}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2 self-start md:self-center">
                        <Button
                          size="sm"
                          onClick={() => handleOpenRsvp(evt)}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold cursor-pointer shadow-xs"
                        >
                          <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                          <span>RSVP Now</span>
                        </Button>

                        <div className="flex items-center gap-1.5">
                          {evt.calendarLinks?.google && (
                            <a
                              href={evt.calendarLinks.google}
                              target="_blank"
                              rel="noreferrer"
                              title="Add to Google Calendar"
                              className="inline-flex items-center justify-center h-8 px-2.5 rounded-lg border border-border bg-muted/40 hover:bg-muted text-[11px] text-foreground font-medium transition-colors"
                            >
                              <Calendar className="mr-1 h-3 w-3 text-primary" />
                              <span>Google Cal</span>
                            </a>
                          )}
                          <a
                            href={`/api/events/${encodeURIComponent(evt.id)}/calendar?format=ics`}
                            download={`${evt.id}.ics`}
                            title="Download iCal (.ics) file"
                            className="inline-flex items-center justify-center h-8 px-2 rounded-lg border border-border bg-muted/40 hover:bg-muted text-[11px] text-foreground font-medium transition-colors"
                          >
                            <Download className="h-3 w-3 text-muted-foreground" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Section: Hackathons */}
            {currentTab === "hackathons" && (
              <section className="space-y-6 rounded-2xl border-2 border-primary/30 bg-card p-6 sm:p-10 shadow-lg shadow-primary/5">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/25 text-primary">
                    <Flame className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-primary px-2.5 py-0.5 rounded-md bg-muted border border-border">
                      Competitions & Sprints
                    </span>
                    <h2 className="text-2xl font-bold text-foreground mt-1">
                      Hackathons & Sprints
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                  {hackathons.map((hack) => (
                    <div
                      key={hack.id}
                      className="rounded-2xl border border-border bg-card p-6 shadow-xs hover:border-primary/40 transition-colors flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-primary px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                            {hack.status}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {hack.duration}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-foreground leading-snug">
                          {hack.name}
                        </h3>

                        <p className="text-xs font-medium text-primary mt-1">
                          {hack.focus}
                        </p>

                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                          {hack.description}
                        </p>

                        <div className="mt-4 pt-3 border-t border-border/80 space-y-1.5">
                          <p className="text-[11px] font-semibold text-foreground font-mono">
                            {hack.prizes}
                          </p>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {hack.highlights.map((h, hIdx) => (
                              <span
                                key={hIdx}
                                className="text-[10px] font-mono text-muted-foreground px-2 py-0.5 rounded bg-muted/60"
                              >
                                {h}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 space-y-2">
                        {hack.id === "evt-zenithhacks-2026" ? (
                          <Button
                            size="sm"
                            onClick={() => {
                              const match = events.find((e) => e.id === "evt-zenithhacks-2026");
                              if (match) handleOpenRsvp(match);
                            }}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold cursor-pointer"
                          >
                            <Sparkles className="mr-1 h-3.5 w-3.5" />
                            <span>RSVP for ZenithHacks</span>
                          </Button>
                        ) : (
                          <Link
                            href="https://github.com/IST-ZenithenLab/ZenithenOpen"
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full border-border text-xs text-foreground hover:bg-muted cursor-pointer"
                            >
                              <span>View Hackathon Track</span>
                              <ChevronRight className="ml-1 h-3.5 w-3.5" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Section: Achievements */}
            {currentTab === "achievements" && (
              <section className="space-y-6 rounded-2xl border-2 border-primary/30 bg-card p-6 sm:p-10 shadow-lg shadow-primary/5">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/25 text-primary">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-primary px-2.5 py-0.5 rounded-md bg-muted border border-border">
                      Podiums & Awards
                    </span>
                    <h2 className="text-2xl font-bold text-foreground mt-1">
                      Event Achievements
                    </h2>
                  </div>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl border border-border bg-card/60">
                  <div className="text-center p-2">
                    <span className="text-2xl font-extrabold text-foreground font-mono">
                      15+
                    </span>
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground font-mono mt-0.5">
                      Hackathons Competed
                    </p>
                  </div>
                  <div className="text-center p-2">
                    <span className="text-2xl font-extrabold text-primary font-mono">
                      8
                    </span>
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground font-mono mt-0.5">
                      Podium Finishes
                    </p>
                  </div>
                  <div className="text-center p-2">
                    <span className="text-2xl font-extrabold text-foreground font-mono">
                      ₹2.5L+
                    </span>
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground font-mono mt-0.5">
                      Bounties Won
                    </p>
                  </div>
                  <div className="text-center p-2">
                    <span className="text-2xl font-extrabold text-accent font-mono">
                      350+
                    </span>
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground font-mono mt-0.5">
                      Hackathon PRs
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {achievements.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={idx}
                        className="rounded-2xl border border-border bg-card p-5 shadow-xs hover:border-primary/40 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                            <Icon className="h-4.5 w-4.5" />
                          </div>
                          <span className="text-xs font-bold text-primary font-mono px-2 py-0.5 rounded-md bg-muted border border-border">
                            {item.award}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-foreground mt-3">
                          {item.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </motion.div>
        </div>
      </div>

      {/* Interactive Event RSVP Modal */}
      <EventRsvpModal
        event={selectedEventForRsvp}
        isOpen={isRsvpModalOpen}
        onClose={() => setIsRsvpModalOpen(false)}
        onRsvpSuccess={handleRsvpSuccess}
      />
    </div>
  );
}
