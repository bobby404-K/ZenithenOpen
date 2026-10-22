"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  GitPullRequest,
  CheckCircle2,
  Newspaper,
  Calendar,
  ChevronRight,
  Search,
  Sparkles,
  Tag,
  Clock,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigation } from "@/components/navigation/navigation-context";
import { InteractiveFirstPrGuide } from "@/components/resources/interactive-first-pr-guide";
import { ArticleReaderModal } from "@/components/resources/article-reader-modal";
import { RESOURCE_ARTICLES } from "@/lib/data/resource-articles";
import { ResourceArticle } from "@/types";

const VALID_RESOURCE_TABS = ["learn-to-pr", "make-first-pr", "blog"] as const;
type ResourceTab = (typeof VALID_RESOURCE_TABS)[number];

export default function ResourcesPage() {
  const { activeSection } = useNavigation();
  // Robust algorithm matching Programs: safely falls back to default if activeSection is invalid or null
  const defaultTab: ResourceTab = "learn-to-pr";
  const currentTab: ResourceTab = VALID_RESOURCE_TABS.includes(
    activeSection as ResourceTab
  )
    ? (activeSection as ResourceTab)
    : defaultTab;

  const [articles, setArticles] = React.useState<ResourceArticle[]>(RESOURCE_ARTICLES);
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedArticle, setSelectedArticle] = React.useState<ResourceArticle | null>(null);
  const [isArticleModalOpen, setIsArticleModalOpen] = React.useState<boolean>(false);

  // Fetch from API or fallback to bundled articles
  React.useEffect(() => {
    async function loadArticles() {
      try {
        const res = await fetch("/api/resources/articles");
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.articles)) {
            setArticles(data.articles);
          }
        }
      } catch {
        // graceful offline fallback
      }
    }
    loadArticles();
  }, []);

  // Check URL query parameters for deep-linked article
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const slugParam = params.get("slug");
      if (slugParam) {
        const found = articles.find(
          (a) => a.slug.toLowerCase() === slugParam.toLowerCase()
        );
        if (found) {
          setSelectedArticle(found);
          setIsArticleModalOpen(true);
        }
      }
    }
  }, [articles]);

  const handleOpenArticle = (article: ResourceArticle) => {
    setSelectedArticle(article);
    setIsArticleModalOpen(true);
  };

  const handleCloseArticle = () => {
    setIsArticleModalOpen(false);
  };

  const filteredArticles = React.useMemo(() => {
    return articles.filter((article) => {
      const matchesCategory =
        selectedCategory === "all" ||
        article.categorySlug.toLowerCase() === selectedCategory.toLowerCase() ||
        article.category.toLowerCase().includes(selectedCategory.toLowerCase());

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        article.title.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query) ||
        article.author.toLowerCase().includes(query) ||
        article.tags.some((t) => t.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [articles, selectedCategory, searchQuery]);

  const learnConcepts = [
    {
      title: "Understanding the Pull Request Lifecycle",
      category: "Git Architecture",
      description:
        "A pull request (PR) is a formal proposal to merge changes from your independent branch or fork into an upstream codebase. It provides a collaborative forum for peer code reviews, automated CI checks, and architectural validation before code hits production.",
      keyTakeaways: [
        "Origin vs. Upstream: Maintain a synchronized link with the main campus repository",
        "Feature Branches: Always isolate your work onto dedicated branch names",
        "Atomic Commits: Keep each commit focused on one cohesive logical change",
      ],
    },
    {
      title: "Conventional Commit Standards",
      category: "Engineering Etiquette",
      description:
        "ZenithenOpen projects enforce the Conventional Commits specification to generate automated release changelogs and maintain clean git histories.",
      keyTakeaways: [
        "feat: Introduces a new user-facing feature (e.g., feat: add dark theme switcher)",
        "fix: Patches an existing software defect (e.g., fix: resolve sidebar overflow on mobile)",
        "docs: Updates documentation, markdown files, or guides",
        "refactor: Restructures existing code without altering external behavior",
      ],
    },
    {
      title: "Resolving Git Merge Conflicts",
      category: "Advanced Workflow",
      description:
        "Merge conflicts happen when two branches modify the same lines of code. Resolving them cleanly is a critical skill for any professional open-source software engineer.",
      keyTakeaways: [
        "Pull latest changes from upstream main before opening or updating a PR",
        "Use git rebase upstream/main to replay your commits cleanly on top",
        "Resolve conflicts in your IDE, verify builds, and push with confidence",
      ],
    },
  ];

  const categories = [
    { slug: "all", label: "All Topics" },
    { slug: "career", label: "Career & Fellowships" },
    { slug: "git", label: "Git Architecture" },
    { slug: "architecture", label: "Web Architecture" },
    { slug: "community", label: "Community Insights" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="mx-auto max-w-5xl">
        {/* Top Breadcrumb */}
        <Link
          href="/"
          className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-8 transition-colors group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Home</span>
        </Link>

        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary font-mono">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Developer Enablement & Knowledge</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Developer Resources
          </h1>

          <div className="p-4 rounded-xl border border-border bg-card/60">
            <p className="text-base font-semibold text-primary">
              &ldquo;Learn to make first PR&rdquo;
            </p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Step-by-step guidance, git fundamentals, interactive pull request checklists, and in-depth technical blogs. Switch between resources using the top navbar options.
            </p>
          </div>
        </div>

        {/* Selected Resource Section */}
        <div className="mt-10">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {/* Section: Learn to PR */}
            {currentTab === "learn-to-pr" && (
              <section className="space-y-6 rounded-2xl border-2 border-primary/30 bg-card p-6 sm:p-10 shadow-lg shadow-primary/5">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/25 text-primary">
                    <GitPullRequest className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-primary px-2.5 py-0.5 rounded-md bg-muted border border-border">
                      Foundational Knowledge
                    </span>
                    <h2 className="text-2xl font-bold text-foreground mt-1">
                      Learn Pull Requests (Learn to PR)
                    </h2>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  {learnConcepts.map((concept, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-border bg-card p-6 shadow-xs hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-primary px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                          {concept.category}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-foreground">
                        {concept.title}
                      </h3>

                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                        {concept.description}
                      </p>

                      <div className="mt-4 pt-3 border-t border-border/80 space-y-2">
                        {concept.keyTakeaways.map((point, pIdx) => (
                          <div
                            key={pIdx}
                            className="flex items-start space-x-2 text-xs text-foreground"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                            <span className="leading-snug text-muted-foreground">
                              {point}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Section: Make First PR */}
            {currentTab === "make-first-pr" && (
              <section className="space-y-6">
                <InteractiveFirstPrGuide />
              </section>
            )}

            {/* Section: Blog */}
            {currentTab === "blog" && (
              <section className="space-y-6 rounded-2xl border-2 border-primary/30 bg-card p-6 sm:p-10 shadow-lg shadow-primary/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/25 text-primary">
                      <Newspaper className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-primary px-2.5 py-0.5 rounded-md bg-muted border border-border">
                        Engineering Articles
                      </span>
                      <h2 className="text-2xl font-bold text-foreground mt-1">
                        Technical Blog & Engineering Stories
                      </h2>
                    </div>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search articles or tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-3 h-9 text-xs rounded-xl bg-card border-border"
                    />
                  </div>
                </div>

                {/* Category Filters */}
                <div className="flex flex-wrap gap-2 pt-2 border-b border-border/80 pb-4">
                  {categories.map((cat) => {
                    const isActive = selectedCategory === cat.slug;
                    return (
                      <button
                        key={cat.slug}
                        type="button"
                        onClick={() => setSelectedCategory(cat.slug)}
                        className={`text-xs font-mono px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                          isActive
                            ? "bg-primary text-primary-foreground border-primary font-semibold shadow-xs"
                            : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>

                {/* Articles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  {filteredArticles.map((post) => (
                    <div
                      key={post.slug}
                      className="rounded-2xl border border-border bg-card p-6 shadow-xs hover:border-primary/40 transition-colors flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-primary px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                            {post.category}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground flex items-center">
                            <Clock className="h-3 w-3 mr-1 text-primary" />
                            {post.readTime}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-foreground leading-snug">
                          {post.title}
                        </h3>

                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                          {post.excerpt}
                        </p>

                        {/* Tag Pills */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {post.tags.slice(0, 3).map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-5 pt-4 border-t border-border/80 flex items-center justify-between text-xs">
                        <div className="flex items-center text-muted-foreground font-mono text-[11px]">
                          <Calendar className="h-3 w-3 mr-1 text-primary" />
                          <span>
                            {post.date} &bull; {post.author}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenArticle(post)}
                          className="h-7 px-2.5 text-xs text-primary hover:text-primary hover:bg-primary/10 cursor-pointer"
                        >
                          <span>Read Article</span>
                          <ChevronRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredArticles.length === 0 && (
                  <div className="text-center py-12 border border-dashed border-border rounded-xl">
                    <p className="text-sm font-semibold text-muted-foreground">
                      No technical articles match your filter criteria.
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => {
                        setSelectedCategory("all");
                        setSearchQuery("");
                      }}
                      className="text-xs text-primary mt-1"
                    >
                      Reset filters
                    </Button>
                  </div>
                )}
              </section>
            )}
          </motion.div>
        </div>
      </div>

      {/* Interactive Article Reader Modal */}
      <ArticleReaderModal
        article={selectedArticle}
        isOpen={isArticleModalOpen}
        onClose={handleCloseArticle}
      />
    </div>
  );
}
