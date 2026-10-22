import {
  CommunityMetrics,
  Member,
  Project,
  Opportunity,
  FirstPrStory,
  LearningPath,
  ContributorLeaderboardEntry,
  ResumeProfileData,
} from "@/types";

/**
 * Authentic baseline community metrics initialized to zero.
 * Real numbers will be populated via GitHub Organization sync and user registrations.
 */
export const COMMUNITY_METRICS: CommunityMetrics = {
  totalMembers: 0,
  totalContributors: 0,
  qualityPrsMerged: 0,
  prsMerged: 0,
  openPrs: 0,
  closedPrs: 0,
  activeRepositories: 2,
  openSourceProjects: 2,
  firstPrsMerged: 0,
  contributionsThisMonth: 0,
  codeReviewsCount: 0,
  lastUpdated: new Date().toISOString(),
};

/**
 * Clean member list - zero fake profiles.
 * Populated dynamically when real students link their GitHub accounts.
 */
export const MOCK_MEMBERS: Member[] = [];

/**
 * Projects catalog with verified IST-ZenithenLab repositories.
 */
export const MOCK_PROJECTS: Project[] = [
  {
    id: "proj-zenithen-open",
    slug: "zenithen-open",
    name: "ZenithenOpen",
    tagline: "Official campus open source developer platform",
    description: "Collaborative developer workspace powering campus contributions, peer code reviews, and student portfolios.",
    repositoryUrl: "https://github.com/IST-ZenithenLab/ZenithenOpen",
    stars: 12,
    forks: 4,
    openIssuesCount: 2,
    goodFirstIssuesCount: 1,
    primaryLanguage: "TypeScript",
    languageColor: "#3178c6",
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "Open Source", "Platform"],
    featured: true,
    status: "Active",
    maintainers: [
      {
        name: "IST-ZenithenLab",
        username: "IST-ZenithenLab",
        avatarUrl: "https://github.com/IST-ZenithenLab.png?size=200",
      },
    ],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "proj-first-pr",
    slug: "first-pr",
    name: "First-PR",
    tagline: "First-time open-source contributor onboarding repository",
    description: "Starter repository for IST developers to practice Git branching, markdown authoring, and land their very first pull request.",
    repositoryUrl: "https://github.com/IST-ZenithenLab/First-PR",
    stars: 10,
    forks: 8,
    openIssuesCount: 4,
    goodFirstIssuesCount: 3,
    primaryLanguage: "Markdown",
    languageColor: "#083fa1",
    tags: ["First PR", "Onboarding", "Git", "Beginner Friendly", "Open Source"],
    featured: true,
    status: "Active",
    maintainers: [
      {
        name: "IST-ZenithenLab",
        username: "IST-ZenithenLab",
        avatarUrl: "https://github.com/IST-ZenithenLab.png?size=200",
      },
    ],
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Curated open-source starter opportunities for IST-ZenithenLab repositories.
 */
export const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: "opp-zenithen-open",
    title: "ZenithenOpen — Good First Issues",
    repository: "ZenithenOpen",
    repoFullName: "IST-ZenithenLab/ZenithenOpen",
    issueNumber: 1,
    issueUrl: "https://github.com/IST-ZenithenLab/ZenithenOpen/issues?q=is%3Aissue+is%3Aopen+label%3Agood-first-issue",
    language: "TypeScript",
    labels: [
      { name: "good-first-issue", color: "#7057ff" },
      { name: "frontend", color: "#0075ca" },
      { name: "backend", color: "#e4e669" },
    ],
    difficulty: "beginner",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    commentsCount: 3,
    mentorAssigned: {
      name: "IST-ZenithenLab",
      username: "IST-ZenithenLab",
      avatarUrl: "https://github.com/IST-ZenithenLab.png?size=200",
    },
  },
  {
    id: "opp-first-pr",
    title: "First-PR — Practice Your First Pull Request",
    repository: "First-PR",
    repoFullName: "IST-ZenithenLab/First-PR",
    issueNumber: 1,
    issueUrl: "https://github.com/IST-ZenithenLab/First-PR",
    language: "Markdown",
    labels: [
      { name: "first-pr", color: "#7057ff" },
      { name: "onboarding", color: "#008672" },
      { name: "good-first-issue", color: "#d93f0b" },
    ],
    difficulty: "beginner",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    commentsCount: 4,
    mentorAssigned: {
      name: "IST-ZenithenLab",
      username: "IST-ZenithenLab",
      avatarUrl: "https://github.com/IST-ZenithenLab.png?size=200",
    },
  },
];

/**
 * First PR Hall of Fame - awaits real merged contributions from students.
 */
export const MOCK_FIRST_PR_STORIES: FirstPrStory[] = [];

/**
 * Contributor Leaderboard - calculated dynamically from real GitHub commits and reviews.
 */
export const MOCK_LEADERBOARD: ContributorLeaderboardEntry[] = [];

/**
 * Verified engineering learning roadmaps authored for IST students.
 * Provides authentic, high-value structured curriculums with 0 fake enrollment counts.
 */
export const MOCK_LEARNING_PATHS: LearningPath[] = [
  {
    id: "lp-fullstack",
    slug: "modern-fullstack-oss",
    title: "Full-Stack Web with Next.js & TypeScript",
    description:
      "Master modern web engineering: App Router, Server Components, TypeScript type-safety, accessible design systems, and Prisma ORM.",
    level: "Beginner",
    estimatedWeeks: 6,
    iconName: "Code2",
    color: "#3b82f6",
    enrolledCount: 0,
    targetSkills: ["Next.js", "TypeScript", "Tailwind CSS", "Prisma", "PostgreSQL"],
    curriculum: [
      {
        weekNumber: 1,
        title: "TypeScript Essentials & Git Architecture",
        summary: "Strict type models, generics, Git hygiene, and branching workflows.",
        milestoneProject: "Build a typed CLI task tracker with automated GitHub Actions CI.",
        topics: [
          {
            title: "Strict Type Modeling",
            description: "Discriminated unions, utility types, and runtime validation with Zod.",
            duration: "4 hours",
            resources: [
              { title: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/", type: "doc" },
              { title: "Git Workflow Standards", url: "https://git-scm.com/book/en/v2", type: "doc" },
            ],
          },
        ],
      },
      {
        weekNumber: 2,
        title: "Next.js App Router Architecture",
        summary: "Server components, streaming with Suspense, and Turbopack internals.",
        milestoneProject: "Deploy a static docsite with dynamic route handlers on Vercel.",
        topics: [
          {
            title: "React Server Components (RSC)",
            description: "Mental model of RSCs vs Client Components, boundary placement.",
            duration: "5 hours",
            resources: [
              { title: "Next.js App Router Docs", url: "https://nextjs.org/docs", type: "doc" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "lp-ai-ml",
    slug: "ai-applied-systems",
    title: "Applied AI & Open Data Science",
    description:
      "Build production machine learning pipelines, fine-tune open models, and deploy bio-signal and LLM tooling.",
    level: "Intermediate",
    estimatedWeeks: 8,
    iconName: "Sparkles",
    color: "#a855f7",
    enrolledCount: 0,
    targetSkills: ["Python", "PyTorch", "Hugging Face", "FastAPI", "Vector DBs"],
    curriculum: [
      {
        weekNumber: 1,
        title: "PyTorch Tensors & GPU Acceleration",
        summary: "Fundamental tensor operations, autograd engine, and CUDA acceleration.",
        milestoneProject: "Implement a custom convolutional model for signal classification.",
        topics: [
          {
            title: "Deep Learning Foundations",
            description: "Forward/backward propagation, loss functions, and optimization loops.",
            duration: "6 hours",
            resources: [
              { title: "PyTorch Official Tutorials", url: "https://pytorch.org/tutorials/", type: "doc" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "lp-devops",
    slug: "cloud-devops-tooling",
    title: "DevOps, Containers & Cloud Engineering",
    description:
      "Multi-stage Docker builds, Kubernetes cluster management, monitoring, and automated CI/CD pipelines.",
    level: "Intermediate",
    estimatedWeeks: 6,
    iconName: "FolderGit2",
    color: "#10b981",
    enrolledCount: 0,
    targetSkills: ["Docker", "Docker Compose", "GitHub Actions", "Linux", "Kubernetes"],
    curriculum: [
      {
        weekNumber: 1,
        title: "Linux Systems & Container Internals",
        summary: "cgroups, namespaces, multi-stage Dockerfiles, and Alpine base layers.",
        milestoneProject: "Containerize a multi-service stack with health checks and volumes.",
        topics: [
          {
            title: "Production Docker Mastery",
            description: "Layer caching, security hardening, and dropping root privileges.",
            duration: "5 hours",
            resources: [
              { title: "Docker Documentation", url: "https://docs.docker.com/", type: "doc" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "lp-gsoc",
    slug: "gsoc-contributor-playbook",
    title: "Google Summer of Code (GSoC) Playbook",
    description:
      "Navigating open-source organizations, interacting with maintainers, drafting winning proposals, and submitting qualifying PRs.",
    level: "Advanced",
    estimatedWeeks: 8,
    iconName: "Award",
    color: "#f59e0b",
    enrolledCount: 0,
    targetSkills: ["Proposal Writing", "Open Source Etiquette", "Code Review", "Architecture Design"],
    curriculum: [
      {
        weekNumber: 1,
        title: "Organization Scouting & First Contact",
        summary: "Selecting mentorship organizations, joining developer mailing lists/Slack.",
        milestoneProject: "Submit your first triaged bug fix to a target GSoC organization.",
        topics: [
          {
            title: "GSoC Student Guide",
            description: "Evaluating project ideas, scoping realistic 175h vs 350h milestones.",
            duration: "4 hours",
            resources: [
              { title: "GSoC Official Guide", url: "https://google.github.io/gsocguides/student/", type: "doc" },
            ],
          },
        ],
      },
    ],
  },
];

/**
 * Starter template for the interactive resume generator.
 */
export const MOCK_RESUME_DATA: ResumeProfileData = {
  fullName: "Your Name",
  headline: "Open-Source Software Engineer",
  email: "your.email@ist.edu.in",
  location: "Bengaluru, India",
  githubUsername: "yourusername",
  linkedinUrl: "https://linkedin.com",
  portfolioUrl: "https://yourportfolio.dev",
  summary:
    "Passionate student developer contributing to production open-source systems. Specializing in scalable web architecture, systems programming, and modern cloud deployment.",
  skills: {
    languages: ["TypeScript", "Python", "Go", "SQL"],
    frameworks: ["Next.js", "React 19", "Node.js", "Tailwind CSS"],
    tools: ["Docker", "Git / GitHub", "Linux", "GitHub Actions"],
    databases: ["PostgreSQL", "Redis", "Prisma ORM"],
  },
  highlightedRepos: [
    {
      name: "ZenithenOpen",
      description: "Open-source community engineering platform for IST.",
      stars: 0,
      language: "TypeScript",
      prsAuthored: 1,
      impactDescription: "Engineered responsive full-stack modules and Docker containerization pipeline.",
    },
  ],
  education: {
    institution: "IST Bengaluru",
    degree: "Bachelor of Technology",
    field: "Computer Science & Engineering",
    graduationYear: "2027",
    gpa: "8.8 / 10",
  },
  achievements: [
    "Active contributor to ZenithenOpen open-source ecosystem",
    "Completed Foundations of Modern Full-Stack Web Development",
  ],
};
