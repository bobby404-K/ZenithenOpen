"use client";

import * as React from "react";
import Link from "next/link";
import { GithubIcon, LinkedinIcon } from "@/components/ui/icons";

export interface LeaderboardContributorItem {
  id?: string;
  name: string;
  username: string;
  avatarUrl: string;
  mergedPrs: number;
  issuesOpened: number;
  openPrs: number;
  closedPrs: number;
  rank?: number;
  linkedinUrl?: string;
  linkedinUsername?: string;
  githubUrl?: string;
}

export interface ContributorRankingsTableProps {
  contributors: LeaderboardContributorItem[];
  title?: string;
  subtitle?: string;
  developerCountLabel?: string;
  limit?: number;
  showCardHeader?: boolean;
  className?: string;
}

export function ContributorRankingsTable({
  contributors,
  title = "All Contributor Rankings",
  subtitle = "Real-time verified pull requests for this month.",
  developerCountLabel,
  limit,
  showCardHeader = true,
  className = "",
}: ContributorRankingsTableProps) {
  const displayed = limit ? contributors.slice(0, limit) : contributors;

  return (
    <div className={`rounded-2xl border border-border bg-card overflow-hidden shadow-xs ${className}`}>
      {showCardHeader && (
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-bold text-foreground text-base">{title}</h3>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {developerCountLabel || `${contributors.length} active developers`}
          </span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/40 text-muted-foreground border-b border-border uppercase font-mono text-[11px]">
            <tr>
              <th className="py-3 px-4 w-16">Rank</th>
              <th className="py-3 px-4">Contributor</th>
              <th className="py-3 px-4 text-center">Merged</th>
              <th className="py-3 px-4 text-center">Issues Opened</th>
              <th className="py-3 px-4 text-center">PR Open</th>
              <th className="py-3 px-4 text-center">Closed PR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {displayed.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground text-xs">
                  No contributions recorded yet. Contributions sync automatically.
                </td>
              </tr>
            ) : (
              displayed.map((contributor, idx) => {
                const rank = contributor.rank ?? idx + 1;
                const linkedinDestination =
                  contributor.linkedinUrl ||
                  `https://www.linkedin.com/in/${contributor.linkedinUsername || contributor.username}`;
                const githubDestination =
                  contributor.githubUrl || `https://github.com/${contributor.username}`;

                return (
                  <tr
                    key={contributor.id || contributor.username || idx}
                    className="hover:bg-muted/30 transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-muted-foreground">
                      #{rank}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <Link
                          href={`/members/${encodeURIComponent(contributor.username)}`}
                          className="shrink-0 relative group/avatar"
                        >
                          <img
                            src={contributor.avatarUrl || `https://github.com/${contributor.username}.png`}
                            alt={contributor.name}
                            className="h-8 w-8 sm:h-9 sm:w-9 rounded-full border border-border object-cover group-hover/avatar:scale-105 transition-transform"
                          />
                        </Link>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <Link
                              href={`/members/${encodeURIComponent(contributor.username)}`}
                              className="font-bold text-foreground hover:text-primary transition-colors block truncate text-xs sm:text-sm"
                            >
                              {contributor.name}
                            </Link>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Link
                              href={`/members/${encodeURIComponent(contributor.username)}`}
                              className="text-[11px] text-muted-foreground hover:text-primary font-mono inline-flex items-center gap-0.5 truncate"
                            >
                              @{contributor.username}
                            </Link>

                            {/* Verified GitHub Quick Badge */}
                            <a
                              href={githubDestination}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={`Verified GitHub: @${contributor.username}`}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded hover:bg-muted cursor-pointer"
                              aria-label={`GitHub profile for ${contributor.username}`}
                            >
                              <GithubIcon className="h-3 w-3" />
                            </a>

                            {/* Verified LinkedIn Quick Badge */}
                            <a
                              href={linkedinDestination}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={`Verified LinkedIn: ${contributor.name}`}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-mono font-medium text-[#0A66C2] bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 border border-[#0A66C2]/30 transition-all hover:scale-105 cursor-pointer"
                              aria-label={`LinkedIn profile for ${contributor.name}`}
                            >
                              <LinkedinIcon className="h-2.5 w-2.5" />
                              <span className="hidden sm:inline">in</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-emerald-600 dark:text-emerald-500 text-sm">
                      {contributor.mergedPrs ?? 0}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-amber-500 text-sm">
                      {contributor.issuesOpened ?? 0}
                    </td>
                    <td className="py-3.5 px-4 text-center text-blue-500 font-semibold">
                      {contributor.openPrs ?? 0}
                    </td>
                    <td className="py-3.5 px-4 text-center text-rose-500 font-semibold">
                      {contributor.closedPrs ?? 0}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
