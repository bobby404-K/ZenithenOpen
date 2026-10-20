export type UserRole = "ADMIN" | "MENTOR" | "MEMBER" | "GUEST";

export interface GitHubAccount {
  id: string;
  username: string;
  avatarUrl: string;
  bio?: string;
  publicRepos: number;
  totalFollowers: number;
  totalStars: number;
  totalPrsMerged: number;
  contributionsThisYear: number;
  topLanguages: { name: string; percentage: number; color: string }[];
}

export interface Skill {
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  category: "Frontend" | "Backend" | "DevOps" | "AI/ML" | "Systems" | "Design";
}

export interface Member {
  id: string;
  name: string;
  username: string;
  email?: string;
  role: UserRole;
  avatarUrl: string;
  bio: string;
  department: string;
  year: string;
  github: GitHubAccount;
  linkedinUrl?: string;
  portfolioUrl?: string;
  skills: Skill[];
  interests: string[];
  joinedAt: string;
  isAvailableForMentorship?: boolean;
  mentorshipTopics?: string[];
  spotlightQuote?: string;
  featured?: boolean;
  totalContributions: number;
  mergedPrCount: number;
  rank?: number;
  badge?: "New Contributor" | "Consistent Contributor" | "Top Reviewer" | "Project Maintainer" | "GSoC Scholar";
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  repositoryUrl: string;
  demoUrl?: string;
  stars: number;
  forks: number;
  openIssuesCount: number;
  goodFirstIssuesCount: number;
  primaryLanguage: string;
  languageColor: string;
  tags: string[];
  featured: boolean;
  status: "Active" | "Incubating" | "Maintained";
  maintainers: {
    name: string;
    username: string;
    avatarUrl: string;
  }[];
  latestRelease?: string;
  updatedAt: string;
}

export interface Opportunity {
  id: string;
  title: string;
  repository: string;
  repoFullName: string;
  issueNumber: number;
  issueUrl: string;
  language: string;
  labels: { name: string; color: string }[];
  difficulty: "beginner" | "intermediate" | "advanced";
  createdAt: string;
  commentsCount: number;
  mentorAssigned?: {
    name: string;
    avatarUrl: string;
    username: string;
  };
}

export interface FirstPrStory {
  id: string;
  memberName: string;
  memberUsername: string;
  memberAvatar: string;
  repoName: string;
  repoUrl: string;
  prNumber: number;
  prTitle: string;
  prUrl: string;
  mergedDate: string;
  category: "Bug Fix" | "Feature" | "Documentation" | "Refactoring" | "Test";
  quote: string;
  linesAdded: number;
  linesRemoved: number;
}

export interface LearningTopic {
  title: string;
  description: string;
  duration: string;
  resources: { title: string; url: string; type: "video" | "doc" | "practice" }[];
  suggestedIssues?: string[];
}

export interface LearningWeek {
  weekNumber: number;
  title: string;
  summary: string;
  topics: LearningTopic[];
  milestoneProject: string;
}

export interface LearningPath {
  id: string;
  slug: string;
  title: string;
  description: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  estimatedWeeks: number;
  iconName: string;
  color: string;
  enrolledCount: number;
  curriculum: LearningWeek[];
  targetSkills: string[];
}

export interface MentorshipRequest {
  id: string;
  menteeName: string;
  menteeUsername: string;
  mentorName: string;
  mentorUsername: string;
  topic: string;
  message: string;
  status: "Pending" | "Accepted" | "Completed" | "Declined";
  createdAt: string;
}

export interface CommunityMetrics {
  totalMembers: number;
  totalContributors: number;
  prsMerged: number;
  openPrs?: number;
  closedPrs?: number;
  qualityPrsMerged?: number;
  activeRepositories: number;
  openSourceProjects: number;
  firstPrsMerged: number;
  contributionsThisMonth: number;
  codeReviewsCount: number;
  lastUpdated: string;
}

export interface ContributorLeaderboardEntry {
  rank: number;
  member: Member;
  prsMerged: number;
  codeReviews: number;
  commitsCount: number;
  points: number;
  badge: "New Contributor" | "Consistent Contributor" | "Top Reviewer" | "Project Maintainer";
  streakDays: number;
}

export interface ResumeProfileData {
  fullName: string;
  headline: string;
  email: string;
  phone?: string;
  location: string;
  githubUsername: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  summary: string;
  skills: {
    languages: string[];
    frameworks: string[];
    tools: string[];
    databases: string[];
  };
  highlightedRepos: {
    name: string;
    description: string;
    stars: number;
    language: string;
    prsAuthored: number;
    impactDescription: string;
  }[];
  education: {
    institution: string;
    degree: string;
    field: string;
    graduationYear: string;
    gpa?: string;
  };
  achievements: string[];
}

export interface EventAttendee {
  username: string;
  name: string;
  email?: string;
  department?: string;
  avatarUrl?: string;
  rsvpAt: string;
}

export interface CampusEvent {
  id: string;
  title: string;
  category: "workshop" | "office-hours" | "fellowship" | "hackathon";
  categoryLabel: string;
  date: string;
  time: string;
  location: string;
  description: string;
  tags: string[];
  rsvpLink: string;
  capacity: number;
  rsvpCount: number;
  attendees: EventAttendee[];
  status: "upcoming" | "live" | "completed";
  speakers: {
    name: string;
    role: string;
    avatarUrl?: string;
    github?: string;
  }[];
  calendarLinks?: {
    google: string;
    ics: string;
  };
}

export interface SwagTier {
  id: string;
  name: string;
  badge: string;
  minPrs: number;
  rewards: string[];
  itemTitle: string;
  hasPhysicalSwag: boolean;
}

export interface SwagClaimVoucher {
  voucherCode: string;
  username: string;
  name: string;
  tierId: string;
  tierName: string;
  swagItem: string;
  size?: string;
  pickupLocation: string;
  status: "CONFIRMED" | "FULFILLED";
  claimedAt: string;
}

export interface ActivityEvent {
  id: string;
  type: "pr_merged" | "quality_pr" | "swag_claimed" | "event_rsvp" | "first_pr" | "member_joined";
  typeLabel: string;
  title: string;
  description: string;
  username: string;
  userAvatarUrl?: string;
  projectSlug?: string;
  projectName?: string;
  url?: string;
  timestamp: string;
  relativeTime: string;
  badgeColor?: string;
  isQuality?: boolean;
}

export interface ActivityPulseResponse {
  success: boolean;
  activeCountLast24h: number;
  recentMergesCount: number;
  events: ActivityEvent[];
}

export interface ResourceArticle {
  slug: string;
  title: string;
  category: "Career & Fellowships" | "Engineering Deep Dive" | "Web Architecture" | "Community Insights" | "Git Architecture";
  categorySlug: "career" | "git" | "architecture" | "community";
  author: string;
  authorRole: string;
  authorAvatar?: string;
  date: string;
  readTime: string;
  readTimeMinutes: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  excerpt: string;
  keyTakeaways: string[];
  markdownContent: string;
  tags: string[];
  featured?: boolean;
}

export interface ResourceArticlesResponse {
  success: boolean;
  count: number;
  categories: { slug: string; label: string; count: number }[];
  articles: ResourceArticle[];
}
