import Link from "next/link";
import { Code2 } from "lucide-react";
import { GithubIcon } from "@/components/ui/icons";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/40 text-muted-foreground transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary p-0.5 shadow-xs">
                <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-card">
                  <Code2 className="h-4 w-4 text-primary" />
                </div>
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground">
                Zenithen<span className="text-primary">Open</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
              The premier open-source engineering community at{" "}
              <span className="text-foreground font-medium">
                IST Bengaluru
              </span>
              . Building production software, empowering first-time contributors, and shipping to millions.
            </p>
            <div className="flex items-center space-x-3 text-xs text-muted-foreground/80">
              <span className="flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                <span>Open to All Students</span>
              </span>
              <span>•</span>
              <span className="text-muted-foreground">Bengaluru, Karnataka</span>
            </div>
          </div>

          {/* Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Ecosystem
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/projects" className="hover:text-primary transition-colors">
                  Open Source Projects
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-primary transition-colors">
                  Contributor Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/opportunities" className="hover:text-primary transition-colors">
                  Good First Issues
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-primary transition-colors">
                  Resources & Guides
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Community
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/community/swag" className="hover:text-primary transition-colors">
                  Contributor Swag Rewards
                </Link>
              </li>
              <li>
                <Link href="/achievements" className="hover:text-primary transition-colors">
                  First PR Hall of Fame
                </Link>
              </li>
              <li>
                <Link href="/members" className="hover:text-primary transition-colors">
                  Member Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* Governance & Open Source */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Open Source
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://github.com/IST-ZenithenLab"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 hover:text-primary transition-colors"
                >
                  <GithubIcon className="h-3.5 w-3.5" />
                  <span>GitHub Organization</span>
                </a>
              </li>
              <li>
                <span className="text-muted-foreground hover:text-foreground">
                  MIT License
                </span>
              </li>
              <li>
                <span className="text-muted-foreground hover:text-foreground">
                  Contributor Covenant Code of Conduct
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between border-t border-border pt-6 sm:flex-row text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} ZenithenOpen • IST Bengaluru.</p>
          <div className="mt-4 flex items-center space-x-4 sm:mt-0">
            <span className="flex items-center space-x-1">
              <span>Architected for</span>
              <span className="text-primary font-semibold">Students Who Ship</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
