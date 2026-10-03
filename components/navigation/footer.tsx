import Link from "next/link";
import { Code2, ShieldCheck } from "lucide-react";
import { GithubIcon } from "@/components/ui/icons";

export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-slate-50/80 text-slate-600">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 p-0.5">
                <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-white">
                  <Code2 className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Zenithen<span className="text-blue-600">Open</span>
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
              The premier open-source engineering community at{" "}
              <span className="text-slate-800 font-medium">
                S-VYASA Deemed to be University, Bengaluru
              </span>
              . Building production software, empowering first-time contributors, and shipping to millions.
            </p>
            <div className="flex items-center space-x-3 text-xs text-slate-500">
              <span className="flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Open to All Students</span>
              </span>
              <span>•</span>
              <span className="text-slate-600">Bengaluru, Karnataka</span>
            </div>
          </div>

          {/* Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Ecosystem
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/projects" className="hover:text-blue-600 transition-colors">
                  Open Source Projects
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-blue-600 transition-colors">
                  Contributor Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/opportunities" className="hover:text-blue-600 transition-colors">
                  Good First Issues
                </Link>
              </li>
              <li>
                <Link href="/learning" className="hover:text-blue-600 transition-colors">
                  Learning Roadmaps
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Community
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/mentorship" className="hover:text-blue-600 transition-colors">
                  Mentorship Matching
                </Link>
              </li>
              <li>
                <Link href="/achievements" className="hover:text-blue-600 transition-colors">
                  First PR Hall of Fame
                </Link>
              </li>
              <li>
                <Link href="/members" className="hover:text-blue-600 transition-colors">
                  Member Directory
                </Link>
              </li>
              <li>
                <Link href="/resume" className="hover:text-blue-600 transition-colors">
                  GitHub Resume Builder
                </Link>
              </li>
            </ul>
          </div>

          {/* Governance & Open Source */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Open Source
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://github.com/IST-ZenithenLab"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 hover:text-blue-600 transition-colors"
                >
                  <GithubIcon className="h-3.5 w-3.5" />
                  <span>GitHub Organization</span>
                </a>
              </li>
              <li>
                <Link href="/admin" className="flex items-center space-x-1.5 hover:text-blue-600 transition-colors">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                  <span>Admin Governance</span>
                </Link>
              </li>
              <li>
                <span className="text-slate-500 hover:text-slate-700">
                  MIT License
                </span>
              </li>
              <li>
                <span className="text-slate-500 hover:text-slate-700">
                  Contributor Covenant Code of Conduct
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between border-t border-slate-200/80 pt-6 sm:flex-row text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ZenithenOpen • S-VYASA Deemed to be University, Bengaluru.</p>
          <div className="mt-4 flex items-center space-x-4 sm:mt-0">
            <span className="flex items-center space-x-1">
              <span>Architected for</span>
              <span className="text-blue-600 font-semibold">Students Who Ship</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
