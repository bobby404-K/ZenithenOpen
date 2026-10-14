import { prisma } from "../lib/db/prisma";
import { deleteCached } from "../lib/redis/client";

async function main() {
  console.log("Cleaning fake mock projects from database...");

  // 1. Delete fake projects from DB
  const deleted = await prisma.project.deleteMany({
    where: {
      slug: {
        in: ["code-vault", "campus-connect", "algo-visualizer", "zenithencore"],
      },
    },
  });
  console.log(`Deleted ${deleted.count} fake projects.`);

  // 2. Ensure only the 2 official repositories exist:
  // Repo 1: ZenithenOpen
  await prisma.project.upsert({
    where: { slug: "zenithen-open" },
    update: {
      name: "ZenithenOpen",
      tagline: "Official campus open source developer platform",
      description: "The primary campus platform empowering students to discover open-source opportunities, track authentic pull requests, build verified resumes, and connect with mentors.",
      repositoryUrl: "https://github.com/IST-ZenithenLab/ZenithenOpen",
      demoUrl: "https://zenithen.ist.edu.in",
      primaryLanguage: "TypeScript",
      status: "Active",
      isFeatured: true,
      tags: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Open Source"],
    },
    create: {
      slug: "zenithen-open",
      name: "ZenithenOpen",
      tagline: "Official campus open source developer platform",
      description: "The primary campus platform empowering students to discover open-source opportunities, track authentic pull requests, build verified resumes, and connect with mentors.",
      repositoryUrl: "https://github.com/IST-ZenithenLab/ZenithenOpen",
      demoUrl: "https://zenithen.ist.edu.in",
      primaryLanguage: "TypeScript",
      status: "Active",
      isFeatured: true,
      tags: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Open Source"],
    },
  });

  // Repo 2: First-PR
  await prisma.project.upsert({
    where: { slug: "first-pr" },
    update: {
      name: "First-PR",
      tagline: "First-time open-source contributor onboarding repository",
      description: "Starter repository for IST developers to practice Git branching, markdown authoring, and land their very first pull request.",
      repositoryUrl: "https://github.com/IST-ZenithenLab/First-PR",
      primaryLanguage: "Markdown",
      status: "Active",
      isFeatured: true,
      tags: ["First PR", "Onboarding", "Git", "Beginner Friendly", "Open Source"],
    },
    create: {
      slug: "first-pr",
      name: "First-PR",
      tagline: "First-time open-source contributor onboarding repository",
      description: "Starter repository for IST developers to practice Git branching, markdown authoring, and land their very first pull request.",
      repositoryUrl: "https://github.com/IST-ZenithenLab/First-PR",
      primaryLanguage: "Markdown",
      status: "Active",
      isFeatured: true,
      tags: ["First PR", "Onboarding", "Git", "Beginner Friendly", "Open Source"],
    },
  });

  const activeProjects = await prisma.project.findMany();
  console.log("Current active projects in DB:", activeProjects.map((p) => `${p.name} (${p.repositoryUrl})`));

  // 3. Invalidate Redis caches
  console.log("Flushing projects cache...");
  await deleteCached("projects:v2:list:all:all:all:4");
  await deleteCached("projects:v2:list:all:all:all:50");
  await deleteCached("projects:v2:list:all:all:all:100");
  await deleteCached("projects:leaderboard:week");
  await deleteCached("projects:leaderboard:month");
  await deleteCached("projects:leaderboard:overall");
  console.log("Projects cache flushed successfully!");
}

main()
  .catch((err) => {
    console.error("Error cleaning projects:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
