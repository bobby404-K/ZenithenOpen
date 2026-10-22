"use client";

import * as React from "react";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Award,
  PartyPopper,
  ArrowRight,
  GitPullRequest,
  Quote,
  ExternalLink,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { FirstPrStory } from "@/types";
import type { CommunityBadge } from "@/app/api/achievements/route";

export default function AchievementsPage() {
  const [badges, setBadges] = React.useState<CommunityBadge[]>([]);
  const [stories, setStories] = React.useState<FirstPrStory[]>([]);
  const [totalUnlocked, setTotalUnlocked] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadAchievements() {
      try {
        const res = await fetch("/api/achievements", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.badges)) {
            setBadges(json.badges);
          }
          if (Array.isArray(json.stories)) {
            setStories(json.stories);
          }
          if (typeof json.totalUnlocked === "number") {
            setTotalUnlocked(json.totalUnlocked);
          }
        }
      } catch (err) {
        console.error("[AchievementsPage] Error loading achievements data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAchievements();
  }, []);

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="py-16 bg-background text-foreground min-h-screen transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="border-b border-border pb-8">
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-accent font-mono">
            <Sparkles className="h-4 w-4" />
            <span>Community Milestones</span>
          </div>
          <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                First PR Hall of Fame
              </h1>
              <p className="mt-1 text-sm text-muted-foreground max-w-2xl leading-relaxed">
                Celebrating the courage it takes to open your first pull request. Every contributor started with a single commit.
              </p>
            </div>
            <div className="flex items-center space-x-3 shrink-0 self-start sm:self-auto">
              {totalUnlocked > 0 && (
                <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-xs font-mono text-accent">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{totalUnlocked} Milestones Unlocked</span>
                </span>
              )}
              <Button
                onClick={triggerConfetti}
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md text-xs cursor-pointer"
              >
                <PartyPopper className="h-4 w-4" />
                <span>Celebrate!</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Stories Grid or Zero State */}
        {loading ? (
          <div className="py-16 text-center text-xs font-mono text-muted-foreground">
            Streaming Hall of Fame from database...
          </div>
        ) : stories.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-border bg-card p-16 text-center shadow-xs">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/15 border border-accent/30 text-accent mb-4">
              <Sparkles className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Awaiting First Pull Request Story</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              When your first pull request is merged, you will be invited to submit your quote and take your place in the Hall of Fame.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/resources">
                <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-xs cursor-pointer">
                  <span>Explore Resources & Guides</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <Card
                key={story.id}
                className="p-6 border border-border bg-card shadow-xs flex flex-col justify-between hover:border-primary/40 transition-all"
              >
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <img
                      src={story.memberAvatar}
                      alt={story.memberName}
                      className="h-10 w-10 rounded-full border border-border bg-muted object-cover"
                    />
                    <div>
                      <p className="text-sm font-bold text-foreground">{story.memberName}</p>
                      <p className="text-xs text-muted-foreground font-mono">@{story.memberUsername}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mb-3">
                    <Badge variant="outline" className="text-[10px] font-mono border-accent/30 text-accent">
                      {story.category}
                    </Badge>
                    <span className="text-xs font-mono text-muted-foreground flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {story.mergedDate}
                    </span>
                  </div>

                  <div className="relative pl-6 py-2 italic text-xs text-muted-foreground leading-relaxed border-l-2 border-primary/40">
                    <Quote className="h-3 w-3 text-primary absolute left-1 top-2" />
                    &ldquo;{story.quote}&rdquo;
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs font-mono text-muted-foreground">
                  <div className="flex items-center space-x-1.5">
                    <GitPullRequest className="h-3.5 w-3.5 text-primary" />
                    <span>#{story.prNumber}</span>
                    <span className="truncate max-w-[120px]">{story.repoName}</span>
                  </div>
                  <a
                    href={story.prUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1 text-primary hover:underline"
                  >
                    <span>View PR</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Community Badges Showcase */}
        <div className="mt-16">
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono mb-4">
            <Award className="h-4 w-4 text-primary" />
            <span>Available Achievement Badges</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {badges.map((b) => (
              <Card
                key={b.code || b.name}
                className="p-6 border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{b.icon}</span>
                    <Badge variant="outline" className="text-[10px] font-mono border-border">
                      {b.criteria}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-foreground text-base mt-4">{b.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{b.desc}</p>
                </div>
                {b.unlockedCount !== undefined && (
                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                    <span>Category: {b.category}</span>
                    <span className="text-primary font-bold">
                      {b.unlockedCount} {b.unlockedCount === 1 ? "student" : "students"}
                    </span>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
