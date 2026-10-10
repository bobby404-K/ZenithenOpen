export interface TopContributionInfo {
  title: string;
  repo: string;
  prUrl: string;
  mergedDate: string;
}

export interface TimeframeStats {
  rank: number;
  points: number;
  prs: number;
  mergedPrs: number;
  qualityPrs: number;
  openPrs: number;
  closedPrs: number;
  reviews: number;
  commits: number;
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
  githubUrl: string;
  linkedinUrl: string;
  // Stats per timeframe
  week: TimeframeStats;
  month: TimeframeStats;
  overall: TimeframeStats;
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
    githubUrl: "https://github.com/adityasharma-dev",
    linkedinUrl: "https://www.linkedin.com/in/adityasharma-dev",
    week: {
      rank: 1,
      points: 340,
      prs: 4,
      mergedPrs: 4,
      qualityPrs: 3,
      openPrs: 1,
      closedPrs: 5,
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
      points: 1480,
      prs: 16,
      mergedPrs: 16,
      qualityPrs: 14,
      openPrs: 2,
      closedPrs: 18,
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
      points: 5120,
      prs: 54,
      mergedPrs: 54,
      qualityPrs: 48,
      openPrs: 3,
      closedPrs: 58,
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
    githubUrl: "https://github.com/sneharao-ist",
    linkedinUrl: "https://www.linkedin.com/in/sneharao-ist",
    week: {
      rank: 2,
      points: 290,
      prs: 3,
      mergedPrs: 3,
      qualityPrs: 3,
      openPrs: 1,
      closedPrs: 4,
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
      points: 1290,
      prs: 14,
      mergedPrs: 14,
      qualityPrs: 12,
      openPrs: 2,
      closedPrs: 16,
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
      points: 4450,
      prs: 48,
      mergedPrs: 48,
      qualityPrs: 42,
      openPrs: 3,
      closedPrs: 52,
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
    githubUrl: "https://github.com/rohank-coder",
    linkedinUrl: "https://www.linkedin.com/in/rohan-kulkarni-coder",
    week: {
      rank: 3,
      points: 250,
      prs: 3,
      mergedPrs: 3,
      qualityPrs: 2,
      openPrs: 1,
      closedPrs: 4,
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
      points: 1120,
      prs: 12,
      mergedPrs: 12,
      qualityPrs: 10,
      openPrs: 2,
      closedPrs: 14,
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
      rank: 4,
      points: 3820,
      prs: 39,
      mergedPrs: 39,
      qualityPrs: 34,
      openPrs: 4,
      closedPrs: 44,
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
    githubUrl: "https://github.com/priyanair-oss",
    linkedinUrl: "https://www.linkedin.com/in/priya-nair-oss",
    week: {
      rank: 4,
      points: 210,
      prs: 2,
      mergedPrs: 2,
      qualityPrs: 2,
      openPrs: 1,
      closedPrs: 3,
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
      points: 980,
      prs: 9,
      mergedPrs: 9,
      qualityPrs: 8,
      openPrs: 1,
      closedPrs: 10,
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
      rank: 3,
      points: 3950,
      prs: 36,
      mergedPrs: 36,
      qualityPrs: 32,
      openPrs: 3,
      closedPrs: 40,
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
    githubUrl: "https://github.com/karthikbhat-dev",
    linkedinUrl: "https://www.linkedin.com/in/karthik-bhat-dev",
    week: {
      rank: 5,
      points: 170,
      prs: 2,
      mergedPrs: 2,
      qualityPrs: 2,
      openPrs: 1,
      closedPrs: 3,
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
      points: 840,
      prs: 8,
      mergedPrs: 8,
      qualityPrs: 7,
      openPrs: 2,
      closedPrs: 10,
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
      points: 2890,
      prs: 28,
      mergedPrs: 28,
      qualityPrs: 24,
      openPrs: 3,
      closedPrs: 32,
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
    githubUrl: "https://github.com/ananyag-ist",
    linkedinUrl: "https://www.linkedin.com/in/ananya-gupta-ist",
    week: {
      rank: 6,
      points: 140,
      prs: 2,
      mergedPrs: 2,
      qualityPrs: 1,
      openPrs: 1,
      closedPrs: 3,
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
      points: 680,
      prs: 7,
      mergedPrs: 7,
      qualityPrs: 5,
      openPrs: 1,
      closedPrs: 8,
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
      points: 2120,
      prs: 21,
      mergedPrs: 21,
      qualityPrs: 17,
      openPrs: 2,
      closedPrs: 24,
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
