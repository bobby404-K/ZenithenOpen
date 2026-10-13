export interface TopContributionInfo {
  title: string;
  repo: string;
  prUrl: string;
  mergedDate: string;
}

export interface ContributorTimeframeStats {
  rank: number;
  qualityPrs: number; // 1. Quality Merge
  prs: number;        // 2. Total PR
  openPrs: number;    // 3. Open PR
  closedPrs: number;  // 4. Closed PR
  mergedPrs: number;  // 5. Total Merges
  reviews?: number;
  commits?: number;
  points?: number;    // Deprecated, kept optional for backwards compat
  topContribution: TopContributionInfo;
}

export interface StudentContributor {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  department: string;
  year: string;
  badge: string;
  badgeColor: string;
  linkedinUrl?: string;
  // Stats per timeframe
  week: ContributorTimeframeStats;
  month: ContributorTimeframeStats;
  overall: ContributorTimeframeStats;
}

export type CompetitionTimeframe = "week" | "month" | "overall";

export const STUDENT_COMPETITORS: StudentContributor[] = [
  {
    id: "std-1",
    name: "Aditya Sharma",
    username: "adityasharma-dev",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Aditya",
    department: "CSE",
    year: "3rd Year",
    badge: "Sprint Champion 🏆",
    badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    linkedinUrl: "https://linkedin.com/in/adityasharma-dev",
    week: {
      rank: 1,
      qualityPrs: 3,
      prs: 4,
      openPrs: 0,
      closedPrs: 0,
      mergedPrs: 4,
      reviews: 7,
      commits: 18,
      topContribution: {
        title: "Engineered 3D particle nodes & repulsion physics for ZenithenOpen hero",
        repo: "IST-ZenithenLab/ZenithenOpen",
        prUrl: "https://github.com/IST-ZenithenLab/ZenithenOpen",
        mergedDate: "Yesterday",
      },
    },
    month: {
      rank: 1,
      qualityPrs: 14,
      prs: 16,
      openPrs: 1,
      closedPrs: 1,
      mergedPrs: 14,
      reviews: 28,
      commits: 64,
      topContribution: {
        title: "Built full responsive layout architecture & Theme Engine switcher",
        repo: "IST-ZenithenLab/ZenithenOpen",
        prUrl: "https://github.com/IST-ZenithenLab/ZenithenOpen",
        mergedDate: "2 weeks ago",
      },
    },
    overall: {
      rank: 1,
      qualityPrs: 48,
      prs: 54,
      openPrs: 3,
      closedPrs: 3,
      mergedPrs: 48,
      reviews: 92,
      commits: 210,
      topContribution: {
        title: "Architected modular monolith structure and Docker stack for campus platform",
        repo: "IST-ZenithenLab/ZenithenOpen",
        prUrl: "https://github.com/IST-ZenithenLab/ZenithenOpen",
        mergedDate: "Aug 2026",
      },
    },
  },
  {
    id: "std-2",
    name: "Sneha Rao",
    username: "sneharao-ist",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Sneha",
    department: "AIML",
    year: "3rd Year",
    badge: "Algorithm Master ⚡",
    badgeColor: "bg-blue-500/10 text-blue-600 border-blue-500/30",
    linkedinUrl: "https://linkedin.com/in/sneharao-ist",
    week: {
      rank: 2,
      qualityPrs: 3,
      prs: 3,
      openPrs: 0,
      closedPrs: 0,
      mergedPrs: 3,
      reviews: 5,
      commits: 14,
      topContribution: {
        title: "Implemented Dijkstra & Segment Tree optimized templates in C++",
        repo: "IST-ZenithenLab/ZenithenLab",
        prUrl: "https://github.com/IST-ZenithenLab/ZenithenLab",
        mergedDate: "2 days ago",
      },
    },
    month: {
      rank: 2,
      qualityPrs: 12,
      prs: 14,
      openPrs: 1,
      closedPrs: 1,
      mergedPrs: 12,
      reviews: 22,
      commits: 58,
      topContribution: {
        title: "Added competitive programming contest runner and memory benchmark harness",
        repo: "IST-ZenithenLab/ZenithenLab",
        prUrl: "https://github.com/IST-ZenithenLab/ZenithenLab",
        mergedDate: "1 week ago",
      },
    },
    overall: {
      rank: 2,
      qualityPrs: 42,
      prs: 48,
      openPrs: 3,
      closedPrs: 3,
      mergedPrs: 42,
      reviews: 76,
      commits: 185,
      topContribution: {
        title: "Curated 100+ problem set solutions with asymptotic complexity proofs",
        repo: "IST-ZenithenLab/ZenithenLab",
        prUrl: "https://github.com/IST-ZenithenLab/ZenithenLab",
        mergedDate: "Jul 2026",
      },
    },
  },
  {
    id: "std-3",
    name: "Rohan Kulkarni",
    username: "rohank-coder",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Rohan",
    department: "CSE",
    year: "2nd Year",
    badge: "Fastest PR Merger 🚀",
    badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
    linkedinUrl: "https://linkedin.com/in/rohank-coder",
    week: {
      rank: 3,
      qualityPrs: 2,
      prs: 3,
      openPrs: 1,
      closedPrs: 0,
      mergedPrs: 2,
      reviews: 4,
      commits: 12,
      topContribution: {
        title: "Integrated GitHub OAuth login session flow and Auth.js provider",
        repo: "IST-ZenithenLab/ZenithenOpen",
        prUrl: "https://github.com/IST-ZenithenLab/ZenithenOpen",
        mergedDate: "3 days ago",
      },
    },
    month: {
      rank: 3,
      qualityPrs: 10,
      prs: 12,
      openPrs: 1,
      closedPrs: 1,
      mergedPrs: 10,
      reviews: 17,
      commits: 45,
      topContribution: {
        title: "Implemented dynamic search and real-time tag filtering in Project Catalog",
        repo: "IST-ZenithenLab/ZenithenOpen",
        prUrl: "https://github.com/IST-ZenithenLab/ZenithenOpen",
        mergedDate: "3 weeks ago",
      },
    },
    overall: {
      rank: 3,
      qualityPrs: 34,
      prs: 39,
      openPrs: 2,
      closedPrs: 3,
      mergedPrs: 34,
      reviews: 52,
      commits: 140,
      topContribution: {
        title: "Built student verified USN linkage and GitHub account verification system",
        repo: "IST-ZenithenLab/ZenithenOpen",
        prUrl: "https://github.com/IST-ZenithenLab/ZenithenOpen",
        mergedDate: "Sep 2026",
      },
    },
  },
  {
    id: "std-4",
    name: "Priya Nair",
    username: "priyanair-oss",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Priya",
    department: "ECE",
    year: "3rd Year",
    badge: "Top Code Reviewer 🔍",
    badgeColor: "bg-purple-500/10 text-purple-600 border-purple-500/30",
    linkedinUrl: "https://linkedin.com/in/priyanair-oss",
    week: {
      rank: 4,
      qualityPrs: 2,
      prs: 2,
      openPrs: 0,
      closedPrs: 0,
      mergedPrs: 2,
      reviews: 8,
      commits: 9,
      topContribution: {
        title: "Reviewed 8 student PRs with constructive suggestions on accessibility",
        repo: "IST-ZenithenLab/ZenithenOpen",
        prUrl: "https://github.com/IST-ZenithenLab/ZenithenOpen",
        mergedDate: "4 days ago",
      },
    },
    month: {
      rank: 4,
      qualityPrs: 8,
      prs: 9,
      openPrs: 1,
      closedPrs: 0,
      mergedPrs: 8,
      reviews: 31,
      commits: 34,
      topContribution: {
        title: "Triaged and resolved good-first-issues for 15 first-year student contributors",
        repo: "IST-ZenithenLab/ZenithenOpen",
        prUrl: "https://github.com/IST-ZenithenLab/ZenithenOpen",
        mergedDate: "2 weeks ago",
      },
    },
    overall: {
      rank: 4,
      qualityPrs: 32,
      prs: 36,
      openPrs: 2,
      closedPrs: 2,
      mergedPrs: 32,
      reviews: 98,
      commits: 115,
      topContribution: {
        title: "Maintained peer review guidelines and open-source code quality standards",
        repo: "IST-ZenithenLab/ZenithenOpen",
        prUrl: "https://github.com/IST-ZenithenLab/ZenithenOpen",
        mergedDate: "Jul 2026",
      },
    },
  },
  {
    id: "std-5",
    name: "Karthik Bhat",
    username: "karthikbhat-dev",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Karthik",
    department: "Data Science",
    year: "2nd Year",
    badge: "Rising Star ⭐",
    badgeColor: "bg-indigo-500/10 text-indigo-600 border-indigo-500/30",
    linkedinUrl: "https://linkedin.com/in/karthikbhat-dev",
    week: {
      rank: 5,
      qualityPrs: 2,
      prs: 2,
      openPrs: 0,
      closedPrs: 0,
      mergedPrs: 2,
      reviews: 3,
      commits: 8,
      topContribution: {
        title: "Added automated linting and PR validation GitHub Actions workflow",
        repo: "IST-ZenithenLab/ZenithenOpen",
        prUrl: "https://github.com/IST-ZenithenLab/ZenithenOpen",
        mergedDate: "5 days ago",
      },
    },
    month: {
      rank: 5,
      qualityPrs: 7,
      prs: 8,
      openPrs: 1,
      closedPrs: 0,
      mergedPrs: 7,
      reviews: 14,
      commits: 29,
      topContribution: {
        title: "Created competitive programming starter kit and fast I/O headers in C++",
        repo: "IST-ZenithenLab/ZenithenLab",
        prUrl: "https://github.com/IST-ZenithenLab/ZenithenLab",
        mergedDate: "3 weeks ago",
      },
    },
    overall: {
      rank: 5,
      qualityPrs: 24,
      prs: 28,
      openPrs: 2,
      closedPrs: 2,
      mergedPrs: 24,
      reviews: 41,
      commits: 95,
      topContribution: {
        title: "Formulated campus coding challenges with automated unit test verification",
        repo: "IST-ZenithenLab/ZenithenLab",
        prUrl: "https://github.com/IST-ZenithenLab/ZenithenLab",
        mergedDate: "Aug 2026",
      },
    },
  },
  {
    id: "std-6",
    name: "Ananya Gupta",
    username: "ananyag-ist",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Ananya",
    department: "CSE",
    year: "1st Year",
    badge: "First PR Prodigy 🌟",
    badgeColor: "bg-rose-500/10 text-rose-600 border-rose-500/30",
    linkedinUrl: "https://linkedin.com/in/ananyag-ist",
    week: {
      rank: 6,
      qualityPrs: 1,
      prs: 2,
      openPrs: 1,
      closedPrs: 0,
      mergedPrs: 1,
      reviews: 2,
      commits: 6,
      topContribution: {
        title: "Polished mobile bottom navigation drawer and high-contrast color tokens",
        repo: "IST-ZenithenLab/ZenithenOpen",
        prUrl: "https://github.com/IST-ZenithenLab/ZenithenOpen",
        mergedDate: "6 days ago",
      },
    },
    month: {
      rank: 6,
      qualityPrs: 5,
      prs: 7,
      openPrs: 1,
      closedPrs: 1,
      mergedPrs: 5,
      reviews: 9,
      commits: 22,
      topContribution: {
        title: "Shipped documentation guides for Git hygiene and GitHub pull requests",
        repo: "IST-ZenithenLab/ZenithenOpen",
        prUrl: "https://github.com/IST-ZenithenLab/ZenithenOpen",
        mergedDate: "3 weeks ago",
      },
    },
    overall: {
      rank: 6,
      qualityPrs: 17,
      prs: 21,
      openPrs: 2,
      closedPrs: 2,
      mergedPrs: 17,
      reviews: 27,
      commits: 72,
      topContribution: {
        title: "Merged 21 pull requests within first semester of campus open-source participation",
        repo: "IST-ZenithenLab/ZenithenOpen",
        prUrl: "https://github.com/IST-ZenithenLab/ZenithenOpen",
        mergedDate: "Sep 2026",
      },
    },
  },
];
