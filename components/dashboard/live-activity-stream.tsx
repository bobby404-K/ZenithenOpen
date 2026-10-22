"use client";

import * as React from "react";
import Link from "next/link";
import {
  Activity,
  GitPullRequest,
  Award,
  Sparkles,
  Gift,
  Calendar,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { ActivityEvent } from "@/types";

export function LiveActivityStream() {
  const [events, setEvents] = React.useState<ActivityEvent[]>([]);
  const [filter, setFilter] = React.useState<string>("all");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;
    async function fetchStream() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (filter !== "all") params.append("type", filter);
        params.append("limit", "8");

        const res = await fetch(`/api/activity?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.events)) {
            setEvents(data.events);
          }
        }
      } catch (err) {
        console.warn("[LiveActivityStream] Notice:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchStream();
    return () => {
      isMounted = false;
    };
  }, [filter]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case "quality_pr":
        return <Award className="h-3.5 w-3.5 text-amber-400" />;
      case "pr_merged":
        return <GitPullRequest className="h-3.5 w-3.5 text-primary" />;
      case "swag_claimed":
        return <Gift className="h-3.5 w-3.5 text-purple-400" />;
      case "first_pr":
        return <Sparkles className="h-3.5 w-3.5 text-emerald-400" />;
      case "event_rsvp":
        return <Calendar className="h-3.5 w-3.5 text-cyan-400" />;
      default:
        return <Activity className="h-3.5 w-3.5 text-primary" />;
    }
  };

  return (
    <div className="mt-8 pt-8 border-t border-border">
      {/* Stream Header & Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center space-x-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
            Live Campus Contribution Pulse
          </span>
          <span className="text-[10px] font-mono text-muted-foreground hidden sm:inline">
            (Last 24 Hours)
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
          {[
            { id: "all", label: "All Pulse" },
            { id: "pr", label: "PR Merges" },
            { id: "quality", label: "Quality Merges" },
            { id: "swag", label: "Swag Unlocks" },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`px-2.5 py-0.5 rounded-full border transition-colors cursor-pointer ${
                filter === f.id
                  ? "bg-primary text-primary-foreground border-primary font-semibold"
                  : "bg-muted/50 text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {events.map((evt) => (
          <div
            key={evt.id}
            className="p-3.5 rounded-xl border border-border bg-card/60 hover:bg-card hover:border-primary/40 transition-all flex items-start justify-between gap-3 group"
          >
            <div className="flex items-start space-x-3 min-w-0 flex-1">
              {/* User Avatar */}
              <Link href={`/members/${encodeURIComponent(evt.username)}`} className="shrink-0 mt-0.5">
                <img
                  src={
                    evt.userAvatarUrl ||
                    `https://avatars.githubusercontent.com/${encodeURIComponent(evt.username)}`
                  }
                  alt={evt.username}
                  className="h-8 w-8 rounded-full border border-border object-cover group-hover:scale-105 transition-transform"
                />
              </Link>

              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded border text-[9px] font-mono font-bold uppercase tracking-wider ${
                      evt.badgeColor || "text-primary bg-primary/10 border-primary/20"
                    }`}
                  >
                    {getEventIcon(evt.type)}
                    <span>{evt.typeLabel}</span>
                  </span>

                  <span className="text-[10px] font-mono text-muted-foreground">
                    {evt.relativeTime}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-foreground leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                  {evt.url ? (
                    <a href={evt.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {evt.title}
                    </a>
                  ) : (
                    evt.title
                  )}
                </h4>

                <p className="text-[11px] text-muted-foreground line-clamp-1 leading-normal">
                  <span className="font-semibold text-foreground">@{evt.username}</span> • {evt.description}
                </p>
              </div>
            </div>

            {/* Link Action */}
            {evt.url && (
              <a
                href={evt.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-muted-foreground hover:text-primary p-1 transition-colors"
                title="View on GitHub"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
