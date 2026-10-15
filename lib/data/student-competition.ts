export interface TopContributionInfo {
  title: string;
  repo: string;
  prUrl: string;
  mergedDate: string;
}

export interface ContributorTimeframeStats {
  rank: number;
  qualityPrs: number;        // Tier 1: Quality Merges (>=100 stars && >=100 forks, merged)
  qualityOpenPrs?: number;   // Tier 2: Quality Open PRs (>=100 stars && >=100 forks, open)
  qualityClosedPrs?: number; // Tier 3: Quality Closed PRs (>=100 stars && >=100 forks, closed)
  mergedPrs: number;         // Tier 4: Total Merges (all merged PRs on user's account)
  prs: number;               // Total PRs (informational)
  openPrs: number;           // Total Open PRs (informational)
  closedPrs: number;         // Total Closed PRs (informational)
  reviews?: number;
  commits?: number;
  points?: number;           // Deprecated, kept optional for backwards compat
  topContribution: TopContributionInfo;
}

export interface StudentStory {
  journey: string;
  keyLearnings: string[];
  milestones: string[];
  advice: string;
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
  roleSubtitle?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  story?: StudentStory;
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
    roleSubtitle: "Full-Stack Engineer · Systems Architect",
    githubUrl: "https://github.com/adityasharma-dev",
    linkedinUrl: "https://linkedin.com/in/adityasharma-dev",
    story: {
      journey: "My journey began with curiosity about how complex web applications scale. Starting from building simple interactive widgets, I moved towards systems architecture, real-time particle physics, and building scalable full-stack applications for our campus developer community.",
      keyLearnings: [
        "Architecture decisions early on determine whether a codebase scales or collapses.",
        "Type-safety with TypeScript eliminates whole categories of runtime bugs before deployment.",
        "Open source feedback is the fastest mechanism to level up engineering standards.",
        "Performance optimization requires profiling before guessing.",
        "Clear documentation is just as valuable as writing clean code.",
      ],
      milestones: [
        "Engineered 3D particle nodes & repulsion physics engine for campus web hero.",
        "Built the responsive layout architecture & Theme Engine switcher.",
        "Architected modular monolith structure and Docker stack for campus platform.",
        "Reached Rank #1 on the Contributor Leaderboard with 48 Quality Merges.",
      ],
      advice: "Focus on solving real problems with your code. Don't just follow tutorials — build full systems, read others' pull requests, and contribute to production repositories early on.",
    },
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
    roleSubtitle: "Algorithm Architect · AI/ML Researcher",
    githubUrl: "https://github.com/sneharao-ist",
    linkedinUrl: "https://linkedin.com/in/sneharao-ist",
    story: {
      journey: "I entered programming through competitive coding and algorithms. Analyzing data structures and complexity made me realize that optimized code makes a profound difference in real-world software. I love bridging algorithmic thinking with machine learning and open-source tooling.",
      keyLearnings: [
        "Optimal asymptotic complexity is essential when working with large-scale datasets.",
        "Writing rigorous unit tests saves countless hours of debugging.",
        "Collaboration in open source teaches humility and code clarity.",
        "Break every large, intimidating problem into smaller, solvable sub-problems.",
      ],
      milestones: [
        "Implemented Dijkstra & Segment Tree optimized templates in C++.",
        "Added competitive programming contest runner and memory benchmark harness.",
        "Curated 100+ problem set solutions with asymptotic complexity proofs.",
        "Maintained 42 Quality Merges and guided junior algorithmic problem-solvers.",
      ],
      advice: "Never skip the mathematical fundamentals. Master core data structures and algorithmic paradigms first — every framework you learn later will be easy to pick up.",
    },
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
    roleSubtitle: "Auth & Security Specialist · Open Source Builder",
    githubUrl: "https://github.com/rohank-coder",
    linkedinUrl: "https://linkedin.com/in/rohank-coder",
    story: {
      journey: "I became interested in web security and identity systems during my first year. Working on open-source auth flows, OAuth integrations, and session security showed me the beauty of engineering secure, resilient user experiences.",
      keyLearnings: [
        "Security cannot be an afterthought — build with least-privilege principles from day one.",
        "Small, focused PRs get reviewed and merged 5x faster than massive monolithic diffs.",
        "Peer code reviews are the best classroom in computer science.",
      ],
      milestones: [
        "Integrated GitHub OAuth login session flow and Auth.js provider.",
        "Implemented dynamic search and real-time tag filtering in Project Catalog.",
        "Built verified student USN linkage and GitHub account verification system.",
      ],
      advice: "Always keep your pull requests focused on a single responsibility. Learn Git branching deeply — clean commit histories reflect clear engineering thinking.",
    },
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
    roleSubtitle: "Code Quality Lead · Accessibility Advocate",
    githubUrl: "https://github.com/priyanair-oss",
    linkedinUrl: "https://linkedin.com/in/priyanair-oss",
    story: {
      journey: "I believe that software should be inclusive, accessible, and thoroughly tested. My focus has been on improving code quality across student repositories, performing insightful code reviews, and creating a supportive culture for junior contributors.",
      keyLearnings: [
        "A constructive code review elevates the author rather than merely critiquing the code.",
        "Accessibility is not a feature — it is a core quality requirement.",
        "Clear communication matters as much as technical capability.",
      ],
      milestones: [
        "Reviewed 90+ student pull requests with constructive feedback on accessibility.",
        "Triaged and resolved good-first-issues for 15 first-year student contributors.",
        "Established peer review guidelines and open-source code quality standards.",
      ],
      advice: "Don't be afraid to submit your first PR even if it's just fixing a typo or adding a test. Every seasoned maintainer started with a single small contribution.",
    },
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
    roleSubtitle: "Data Platform Engineer · DevOps Enthusiast",
    githubUrl: "https://github.com/karthikbhat-dev",
    linkedinUrl: "https://linkedin.com/in/karthikbhat-dev",
    story: {
      journey: "Automating repetitive developer tasks and writing rock-solid CI/CD pipelines is my passion. Open-source development taught me how automation and automated linting keep teams productive and codebases clean.",
      keyLearnings: [
        "If you have to do a manual check more than twice, write a GitHub Action for it.",
        "Fast feedback loops in CI make developers significantly more productive.",
        "Understand data flow before writing transformation logic.",
      ],
      milestones: [
        "Added automated linting and PR validation GitHub Actions workflow.",
        "Created competitive programming starter kit and fast I/O headers in C++.",
        "Formulated campus coding challenges with automated unit test verification.",
      ],
      advice: "Automate early, test continuously, and invest time in learning developer tooling. Good tooling multiplies your team's velocity.",
    },
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
    roleSubtitle: "Frontend Developer · UI/UX Craftsman",
    githubUrl: "https://github.com/ananyag-ist",
    linkedinUrl: "https://linkedin.com/in/ananyag-ist",
    story: {
      journey: "Joining the campus open-source community in my first semester was the best decision of my college journey. Starting with documentation fixes, I quickly moved into frontend component design and responsive mobile drawer development.",
      keyLearnings: [
        "You don't need years of experience to make impactful contributions.",
        "Asking good questions demonstrates dedication, not weakness.",
        "Paying attention to subtle visual details makes an interface feel truly premium.",
      ],
      milestones: [
        "Merged 21 pull requests within first semester of campus open-source participation.",
        "Polished mobile bottom navigation drawer and high-contrast color tokens.",
        "Shipped documentation guides for Git hygiene and GitHub pull requests.",
      ],
      advice: "Just start! You don't have to know everything before contributing. Pick an issue marked 'good first issue', ask for guidance, and ship your first commit.",
    },
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
  {
    id: "std-7",
    name: "Abhijit Saha",
    username: "abhijit-saha",
    avatarUrl: "https://github.com/AbhijitSaha-coder.png",
    department: "Frontend Builder · Early Open Source",
    year: "3rd Year",
    badge: "Frontend Builder 🚀",
    badgeColor: "bg-cyan-500/10 text-cyan-600 border-cyan-500/30",
    roleSubtitle: "Frontend Builder · Early Open Source",
    githubUrl: "https://github.com/AbhijitSaha-coder",
    linkedinUrl: "https://www.linkedin.com/in/abhijit-saha-211621379",
    story: {
      journey: "My development journey started after joining the Institute of Science and Technology (IST). Before college, I had very limited exposure to programming, but once I started learning Python and web development, I became curious about how real applications are built. Joining the Open Source Club and interacting with seniors inspired me to explore open source, build projects, and continuously improve my skills. What motivates me the most is the idea of creating things that people can actually use while constantly learning something new.",
      keyLearnings: [
        "Failure is simply feedback — not every pull request gets merged, and each setback highlights what to improve.",
        "Consistency matters more than perfection.",
        "Asking questions or seeking guidance is much better than staying stuck.",
        "Master the fundamentals instead of trying to learn too many technologies at once.",
        "Focus on your own progress instead of comparing yourself with others.",
      ],
      milestones: [
        "Built multiple frontend projects, including a Netflix clone and RedMart, an Instamart-inspired website.",
        "Developed an Automatic Pill Dispenser prototype as part of a robotics project.",
        "Made my first open-source contributions and raised pull requests on public GitHub repositories.",
        "Became an active member of the Open Source Club and started contributing to club initiatives.",
        "Progressed from having little development experience to confidently working with Git, GitHub, HTML, CSS, JavaScript, and Python.",
      ],
      advice: "Don't compare your beginning with someone else's years of experience. Focus on building strong fundamentals, create projects instead of only watching tutorials, and don't hesitate to ask for help. Join communities like the Open Source Club, participate in open source early, and stay consistent. Progress may seem slow at first, but every small project, bug fix, and contribution adds up over time. The most important thing is to keep learning and never stop building. 🚀",
    },
    week: {
      rank: 7,
      qualityPrs: 0,
      prs: 0,
      openPrs: 0,
      closedPrs: 0,
      mergedPrs: 0,
      reviews: 0,
      commits: 0,
      topContribution: {
        title: "Early Open Source Contributions & Frontend Architecture",
        repo: "IST-ZenithenLab/ZenithenOpen",
        prUrl: "https://github.com/IST-ZenithenLab/ZenithenOpen",
        mergedDate: "Today",
      },
    },
    month: {
      rank: 7,
      qualityPrs: 0,
      prs: 0,
      openPrs: 0,
      closedPrs: 0,
      mergedPrs: 0,
      reviews: 0,
      commits: 0,
      topContribution: {
        title: "Early Open Source Contributions & Frontend Architecture",
        repo: "IST-ZenithenLab/ZenithenOpen",
        prUrl: "https://github.com/IST-ZenithenLab/ZenithenOpen",
        mergedDate: "This Month",
      },
    },
    overall: {
      rank: 7,
      qualityPrs: 0,
      prs: 0,
      openPrs: 0,
      closedPrs: 0,
      mergedPrs: 0,
      reviews: 0,
      commits: 0,
      topContribution: {
        title: "Early Open Source Contributions & Frontend Architecture",
        repo: "IST-ZenithenLab/ZenithenOpen",
        prUrl: "https://github.com/IST-ZenithenLab/ZenithenOpen",
        mergedDate: "Oct 2026",
      },
    },
  },
];
