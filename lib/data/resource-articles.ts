import { ResourceArticle } from "@/types";

export const RESOURCE_ARTICLES: ResourceArticle[] = [
  {
    slug: "cracking-gsoc-sophomore",
    title: "How I Cracked My First GSoC as a Sophomore Developer",
    category: "Career & Fellowships",
    categorySlug: "career",
    author: "IST Alumni Scholar",
    authorRole: "GSoC '25 Scholar & Contributor",
    authorAvatar: "https://avatars.githubusercontent.com/u/142999485?v=4",
    date: "October 2026",
    readTime: "6 min read",
    readTimeMinutes: 6,
    difficulty: "Beginner",
    featured: true,
    excerpt:
      "A tactical breakdown of proposal writing, communicating with maintainers, and turning small documentation pull requests into an accepted Google Summer of Code project.",
    keyTakeaways: [
      "Start 3-4 months early by understanding the codebase architecture before organization announcements.",
      "Make 2-3 quality merged pull requests before submitting your final proposal.",
      "Engage authentically in public community channels rather than sending private DMs to maintainers.",
      "Structure your proposal with explicit milestone deliverables, risk assessments, and weekly schedules.",
    ],
    markdownContent: `
# How I Cracked My First GSoC as a Sophomore Developer

Landing an accepted proposal for Google Summer of Code (GSoC) as a 2nd-year engineering student was one of the most transformative milestones of my engineering journey. 

Many students mistakenly believe that GSoC is reserved exclusively for competitive programming champions or final-year computer science seniors. In reality, **open source maintainers care about reliability, communication, and proof-of-work** far more than pedigree.

---

## 1. The Timeline Strategy: Start Early
Most applicants wait until Google officially announces the accepted open-source organizations in February or March. By then, hundreds of prospective contributors flood the issue trackers.

To stand out:
1. **Target Evergreen Organizations**: Look at organizations that have participated for 5+ consecutive years (e.g., Apache, CNCF, Julia, Mozilla, SymPy, Chromium).
2. **Setup the Local Dev Environment in November/December**: Getting the project compiling locally, running the test suite, and reproducing issues gives you a 60-day head start.

\`\`\`bash
# Clone and verify test suites early
git clone https://github.com/organization/target-repo.git
cd target-repo
npm install && npm test
\`\`\`

---

## 2. The Pull Request Escalation Ladder
Do not attempt to rewrite core subsystems on Day 1. Instead, follow this 3-tier contribution ladder:

1. **Tier 1 (Week 1-2): Documentation & Typo Fixes**
   - Fix broken README links, clarify onboarding scripts, and add missing docstrings.
   - Shows you can follow the contributing guidelines and PR templates.

2. **Tier 2 (Week 3-4): Flaky Tests & Minor Bug Fixes**
   - Pick \`good-first-issue\` labels or fix test flakiness in CI pipelines.
   - Proves you understand the test runner and build systems.

3. **Tier 3 (Week 5+): Architectural Starter Features**
   - Propose an optimization or small feature aligned with the organization's public roadmap.
   - Demonstrates domain competence and self-sufficiency.

---

## 3. Proposal Blueprint that Wins Maintainers
A winning GSoC proposal is not an academic paper—it is an **executable project management document**.

Maintainers look for:
- **Architecture Diagrams**: High-level component interactions and state flow.
- **Weekly Milestones**: Exact breakdown across the 12-week or 22-week commitment.
- **Risk Mitigation Plan**: What will you do if an upstream dependency introduces breaking changes?
- **Proof of Prior Contributions**: Hyperlinks to your merged pull requests in the repository.

---

## Summary
Open source is an open playing field. Start early, listen attentively to feedback during code reviews, and treat maintainers' time with deep respect.
    `,
    tags: ["GSoC", "Open Source", "Career", "Proposal Writing", "Fellowship"],
  },
  {
    slug: "git-internals-dag-blobs",
    title: "Understanding Git Under the Hood: Blobs, Trees, and Commits",
    category: "Engineering Deep Dive",
    categorySlug: "git",
    author: "ZenithenOpen Core Team",
    authorRole: "Lead Architecture Maintainer",
    authorAvatar: "https://avatars.githubusercontent.com/u/148720732?v=4",
    date: "September 2026",
    readTime: "8 min read",
    readTimeMinutes: 8,
    difficulty: "Intermediate",
    featured: true,
    excerpt:
      "Demystifying the internal object database of Git. Learn how directed acyclic graphs (DAGs) and SHA hashes power modern distributed version control.",
    keyTakeaways: [
      "Every commit in Git points to a root tree object, parent commits, and an author timestamp.",
      "Blobs store pure file content without metadata or filenames (which are stored inside tree nodes).",
      "Git history is an immutable Directed Acyclic Graph (DAG) verified by cryptographic hashes.",
      "Commands like rebase replay commit diffs onto new base nodes, generating fresh commit hashes.",
    ],
    markdownContent: `
# Understanding Git Under the Hood: Blobs, Trees, and Commits

Most developers interact with Git through surface-level commands like \`git add\`, \`git commit\`, and \`git push\`. But behind these commands lies an elegant, content-addressable key-value store.

Understanding Git's internal architecture transforms you from someone who panics during a detached HEAD state into an engineer who can reconstruct lost commits with ease.

---

## The Four Fundamental Object Types
Everything inside the \`.git/objects/\` directory is one of four core primitives:

1. **Blob (Binary Large Object)**: Stores raw file contents. A blob does not know its filename, directory location, or file permissions.
2. **Tree**: Represents a directory. It lists filenames, file modes (e.g. 100644 for regular files), and maps each entry to a blob SHA or sub-tree SHA.
3. **Commit**: Contains a pointer to top-level tree object, parent commit SHAs, author identity, timestamp, and the commit message.
4. **Tag**: An annotated pointer to a specific commit hash.

\`\`\`bash
# Inspect any object in Git's internal database
git cat-file -t <object-hash>   # Prints: blob, tree, or commit
git cat-file -p <object-hash>   # Pretty-prints the internal content
\`\`\`

---

## The Directed Acyclic Graph (DAG)
Git commits form a Directed Acyclic Graph. Each commit knows only who its parents are:

\`\`\`
[Commit C3] ---> [Commit C2] ---> [Commit C1] (Initial Commit)
     |
     +--> Points to [Tree T3]
              |
              +--> [Blob: app/page.tsx]
              +--> [Blob: package.json]
\`\`\`

Because commit hashes are cryptographic digests of their tree, parents, author, and timestamp, **you can never modify a commit without altering every subsequent commit hash down the line**.

---

## What Actually Happens During \`git rebase\`?
When you run \`git rebase upstream/main\`:
1. Git identifies the common ancestor between your branch and \`upstream/main\`.
2. It generates diffs for each of your feature branch commits.
3. It resets your branch pointer to the tip of \`upstream/main\`.
4. It applies each diff sequentially, generating brand new commit objects with updated parent pointers and hashes!

Mastering these fundamentals ensures you will never be afraid of resolving merge conflicts or manipulating git history again.
    `,
    tags: ["Git", "Data Structures", "DAG", "Internals", "CLI"],
  },
  {
    slug: "realtime-multitheme-css-engine",
    title: "Building Real-Time Multi-Theme Engines with CSS Variables",
    category: "Web Architecture",
    categorySlug: "architecture",
    author: "Lead Frontend Maintainer",
    authorRole: "Design Systems Engineer",
    authorAvatar: "https://avatars.githubusercontent.com/u/108932448?v=4",
    date: "August 2026",
    readTime: "5 min read",
    readTimeMinutes: 5,
    difficulty: "Intermediate",
    featured: false,
    excerpt:
      "A case study on architecting ZenithenOpen's 7-preset instant theme system using HSL color variables, localStorage persistence, and zero page reloads.",
    keyTakeaways: [
      "Separate color perception (HSL) from layout semantics for effortless dark/light/custom palette scaling.",
      "Use data-theme attributes on document root to bypass React re-renders for instantaneous switches.",
      "Prevent hydration flash by injecting an inline blocking script before the first DOM paint.",
      "Ensure WCAG 2.1 AA compliance across all contrast ratios dynamically.",
    ],
    markdownContent: `
# Building Real-Time Multi-Theme Engines with CSS Variables

When building the ZenithenOpen platform, we wanted students to have an extraordinary developer experience with 7 distinct theme environments (e.g. Modern Dark, Deep Obsidian, Cyberpunk Neon, Solarized Light, Forest Emerald, Aurora Nordic, and Velvet Sunset).

Standard CSS-in-JS solutions cause severe re-render cascades across the entire component tree whenever the theme changes. Here is how we engineered an instant, zero-re-render theme system.

---

## 1. Defining HSL Tokens Without Channel Wrappers
Instead of hardcoding hex colors like \`#1e293b\`, we declare color channels in HSL format inside CSS custom properties:

\`\`\`css
/* globals.css */
:root[data-theme="obsidian"] {
  --background: 222 47% 6%;
  --foreground: 210 40% 98%;
  --primary: 217 91% 60%;
  --card: 222 47% 9%;
  --border: 217 33% 17%;
}

:root[data-theme="cyberpunk"] {
  --background: 280 60% 4%;
  --foreground: 180 100% 95%;
  --primary: 320 100% 60%;
  --card: 280 50% 8%;
  --border: 320 80% 30%;
}
\`\`\`

By declaring colors as \`H S L\`, Tailwind can seamlessly generate arbitrary opacity utilities:
\`\`\`tsx
<div className="bg-primary/20 border border-primary/40 text-foreground" />
\`\`\`

---

## 2. Instant Switching Without Component Re-rendering
Instead of passing theme states down through 15 levels of React Context, theme switching simply mutates the HTML root attribute:

\`\`\`typescript
export function setTheme(themeName: string) {
  document.documentElement.setAttribute("data-theme", themeName);
  localStorage.setItem("zenithen_theme", themeName);
}
\`\`\`

Because CSS custom properties are dynamically evaluated by the browser's GPU rendering engine, every element updates immediately in < 1 millisecond.

---

## 3. Eliminating the Flash of Unstyled Content (FOUC)
In Next.js App Router, SSR renders the HTML server-side before client hydration completes. To prevent the screen from flashing white before switching to dark mode:

\`\`\`html
<head>
  <script dangerouslySetInnerHTML={{ __html: \`
    try {
      const savedTheme = localStorage.getItem('zenithen_theme') || 'obsidian';
      document.documentElement.setAttribute('data-theme', savedTheme);
    } catch (e) {}
  \` }} />
</head>
\`\`\`

This inline snippet executes synchronously before the browser paints the first frame, guaranteeing 100% flicker-free rendering.
    `,
    tags: ["Next.js", "CSS Variables", "Theme Engine", "Tailwind CSS", "Architecture"],
  },
  {
    slug: "campus-oss-career-acceleration",
    title: "Why Campus Open-Source Matters for Your Engineering Career",
    category: "Community Insights",
    categorySlug: "community",
    author: "Community Maintainers",
    authorRole: "Technical Advisory Guild",
    authorAvatar: "https://avatars.githubusercontent.com/u/108932448?v=4",
    date: "July 2026",
    readTime: "4 min read",
    readTimeMinutes: 4,
    difficulty: "Beginner",
    featured: false,
    excerpt:
      "How shipping verified pull requests into production repositories accelerates technical interviews and outshines generic classroom resume projects.",
    keyTakeaways: [
      "Public git commit histories provide indisputable, verified proof of technical execution.",
      "Peer code reviews teach real-world team collaboration that cannot be simulated in solo assignments.",
      "Recruiters and hiring managers spend 3x more time reviewing verified pull requests than static bullet points.",
      "Open-source community alumni networks open warm referral pathways at premier engineering firms.",
    ],
    markdownContent: `
# Why Campus Open-Source Matters for Your Engineering Career

Every year, millions of computer science students graduate with virtually identical resumes: a Todo list app, a Netflix clone, and a generic weather forecast dashboard.

When tech recruiters review 500 applicants for an entry-level software engineering position, portfolio differentiation is everything.

---

## The Power of Verifiable Proof-of-Work
A bullet point that reads:
> "Built an e-commerce website using MERN stack"

offers zero assurance that the candidate actually wrote the code, handled edge cases, or wrote automated tests.

In contrast, consider:
> "Merged 14 pull requests in ZenithenOpen open-source platform, including real-time WebSocket activity pulse and Redis cache invalidation pipelines verified by CI test suites."

This links directly to public GitHub commits, diffs, code review discussions, and passing test runs. **It cannot be faked or plagiarized.**

---

## What Tech Leads Look For During Interviews
During technical interviews at top engineering organizations, interviewers look for:
1. **Handling Constructive Feedback**: Can you gracefully accept code review comments, discuss trade-offs, and revise your pull request?
2. **Reading Foreign Codebases**: Can you jump into an existing 20,000-line repository, understand its conventions, and write idiomatic code without breaking existing features?
3. **Automated Testing Discipline**: Do you write test assertions to verify your changes, or do you merely test manually in the browser?

Open source gives you practice in all three disciplines before you ever set foot in your first corporate job.
    `,
    tags: ["Career", "Proof of Work", "Resume", "Interviews", "Campus Culture"],
  },
  {
    slug: "mastering-merge-conflicts-rebase",
    title: "Mastering Merge Conflicts and Interactive Git Rebase",
    category: "Git Architecture",
    categorySlug: "git",
    author: "ZenithenOpen Core Team",
    authorRole: "DevOps & Release Engineer",
    authorAvatar: "https://avatars.githubusercontent.com/u/148720732?v=4",
    date: "June 2026",
    readTime: "7 min read",
    readTimeMinutes: 7,
    difficulty: "Advanced",
    featured: false,
    excerpt:
      "Step-by-step masterclass on rebasing feature branches, squashing redundant fixup commits, and resolving gnarly multi-file merge conflicts cleanly.",
    keyTakeaways: [
      "Always rebase your branch on upstream/main to maintain a clean linear commit graph.",
      "Use `git rebase -i HEAD~N` to squash intermediate typo fixes into cohesive atomic features.",
      "Never rebase commits that have already been merged into production main branches.",
      "Leverage git rerere (reuse recorded resolution) to automate repetitive merge conflict resolution.",
    ],
    markdownContent: `
# Mastering Merge Conflicts and Interactive Git Rebase

Merge conflicts are not software failures—they are Git's safety mechanism stopping you from accidentally overwriting a teammate's changes.

When multiple contributors work on a shared repository, your feature branch will inevitably fall behind the main branch. Here is the definitive protocol for resolving conflicts professionally.

---

## The Standard Rebase Flow
Never click the "Update branch" button on GitHub if your organization prefers a clean linear history. Instead, run:

\`\`\`bash
# 1. Fetch latest changes from the upstream remote
git fetch upstream main

# 2. Rebase your current feature branch on top of upstream main
git rebase upstream/main
\`\`\`

If Git encounters conflicting changes, it pauses and tells you which files need attention:

\`\`\`
CONFLICT (content): Merge conflict in app/api/activity/route.ts
error: could not apply a1b2c3d... feat: add activity filter
Resolve all conflicts manually, mark them as resolved with
"git add <conflicted-files>", then run "git rebase --continue".
\`\`\`

---

## Resolving Conflict Markers
Open the conflicted file in your IDE. You will see markers:

\`\`\`typescript
<<<<<<< HEAD (upstream changes)
const CACHE_TTL_SECONDS = 60;
=======
const CACHE_TTL_SECONDS = 30; // updated for live streaming
>>>>>>> feat: add activity filter
\`\`\`

Decide on the correct logical combination, delete the conflict markers (\`<<<<<<<\`, \`=======\`, \`>>>>>>>\`), and continue:

\`\`\`bash
git add app/api/activity/route.ts
git rebase --continue
\`\`\`

---

## Squashing Fixup Commits Before PR Review
Nobody needs to see commits like "fix typo", "fix typo 2", "actually works now" in a production git log.
Use interactive rebase to squash:

\`\`\`bash
git rebase -i HEAD~4
\`\`\`

In the editor, change \`pick\` to \`squash\` (or \`s\`) for the intermediate commits:

\`\`\`
pick e4a1b2c feat(auth): add student USN validation
squash 9f8e7d6 fix: regex boundary check
squash 2c3d4e5 fix: typo in error message
\`\`\`

Save and exit. Your 3 commits are now merged into 1 pristine, atomic commit ready for production review!
    `,
    tags: ["Git", "Rebase", "Merge Conflicts", "Workflow", "Best Practices"],
  },
];
