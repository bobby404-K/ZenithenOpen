"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Clock,
  Calendar,
  BookOpen,
  CheckCircle2,
  Copy,
  Check,
  Share2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Tag,
} from "lucide-react";
import { ResourceArticle } from "@/types";
import { Button } from "@/components/ui/button";

interface ArticleReaderModalProps {
  article: ResourceArticle | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ArticleReaderModal({
  article,
  isOpen,
  onClose,
}: ArticleReaderModalProps) {
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);
  const [copiedLink, setCopiedLink] = React.useState(false);
  const modalRef = React.useRef<HTMLDivElement>(null);

  // Close on Escape key
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleCopyCode = (codeText: string, id: string) => {
    navigator.clipboard.writeText(codeText.trim());
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined" && article) {
      const url = `${window.location.origin}/resources?slug=${article.slug}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (!article) return null;

  // Helper to render markdown content into structured blocks
  const renderFormattedMarkdown = (content: string) => {
    const lines = content.trim().split("\n");
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockContent = "";
    let codeBlockLanguage = "";
    let codeBlockIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Handle Code Block Start / End
      if (line.startsWith("```")) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeBlockLanguage = line.replace("```", "").trim();
          codeBlockContent = "";
        } else {
          inCodeBlock = false;
          const currentCode = codeBlockContent;
          const currentLang = codeBlockLanguage || "bash";
          const blockId = `code-block-${codeBlockIndex++}`;

          elements.push(
            <div
              key={blockId}
              className="my-5 rounded-xl border border-border bg-muted/60 overflow-hidden font-mono text-xs shadow-inner"
            >
              <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/80 text-[11px] text-muted-foreground font-semibold">
                <span className="uppercase text-primary tracking-wider">
                  {currentLang}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(currentCode, blockId)}
                  className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {copiedCode === blockId ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-green-500" />
                      <span className="text-green-500 font-bold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-foreground whitespace-pre leading-relaxed">
                <code>{currentCode.trim()}</code>
              </pre>
            </div>
          );
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockContent += line + "\n";
        continue;
      }

      // Handle Headings
      if (line.startsWith("# ")) {
        elements.push(
          <h1
            key={`h1-${i}`}
            className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-6 mb-4"
          >
            {line.replace("# ", "")}
          </h1>
        );
      } else if (line.startsWith("## ")) {
        elements.push(
          <h2
            key={`h2-${i}`}
            className="text-xl sm:text-2xl font-bold text-foreground mt-6 mb-3 border-b border-border/60 pb-2"
          >
            {line.replace("## ", "")}
          </h2>
        );
      } else if (line.startsWith("### ")) {
        elements.push(
          <h3
            key={`h3-${i}`}
            className="text-lg font-bold text-foreground mt-4 mb-2"
          >
            {line.replace("### ", "")}
          </h3>
        );
      } else if (line.startsWith("> ")) {
        elements.push(
          <blockquote
            key={`quote-${i}`}
            className="my-3 pl-4 border-l-4 border-primary/50 text-xs sm:text-sm italic text-muted-foreground bg-primary/5 py-2 rounded-r-lg"
          >
            {line.replace("> ", "")}
          </blockquote>
        );
      } else if (line.startsWith("- ") || line.startsWith("* ")) {
        elements.push(
          <div
            key={`bullet-${i}`}
            className="flex items-start space-x-2 my-1.5 text-xs sm:text-sm text-muted-foreground"
          >
            <span className="text-primary mt-1">&bull;</span>
            <span className="leading-relaxed">
              {formatInlineText(line.substring(2))}
            </span>
          </div>
        );
      } else if (line.match(/^\d+\.\s/)) {
        const itemNumber = line.match(/^\d+/)?.[0] || "1";
        const itemText = line.replace(/^\d+\.\s/, "");
        elements.push(
          <div
            key={`num-${i}`}
            className="flex items-start space-x-2.5 my-1.5 text-xs sm:text-sm text-muted-foreground"
          >
            <span className="text-xs font-mono font-bold text-primary shrink-0 mt-0.5">
              {itemNumber}.
            </span>
            <span className="leading-relaxed">{formatInlineText(itemText)}</span>
          </div>
        );
      } else if (line.trim() === "---") {
        elements.push(
          <hr key={`hr-${i}`} className="my-6 border-t border-border/80" />
        );
      } else if (line.trim().length > 0) {
        elements.push(
          <p
            key={`p-${i}`}
            className="my-3 text-xs sm:text-sm text-muted-foreground leading-relaxed"
          >
            {formatInlineText(line)}
          </p>
        );
      }
    }

    return elements;
  };

  // Helper for bold and inline code
  const formatInlineText = (text: string) => {
    // Process **bold** and `code`
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="font-bold text-foreground">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={index}
            className="px-1.5 py-0.5 rounded-md bg-muted border border-border font-mono text-[11px] text-primary"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Container */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="article-modal-title"
            className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl border border-primary/30 bg-card text-foreground shadow-2xl z-10 flex flex-col"
          >
            {/* Top Toolbar */}
            <div className="flex items-center justify-between border-b border-border bg-card/95 px-6 py-4 sticky top-0 z-20 backdrop-blur-md">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-primary px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                  {article.category}
                </span>
                <span className="text-xs font-mono text-muted-foreground flex items-center">
                  <Clock className="h-3 w-3 mr-1 text-primary" />
                  {article.readTime}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyLink}
                  className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Copy share link"
                >
                  {copiedLink ? (
                    <Check className="h-3.5 w-3.5 text-green-500 mr-1" />
                  ) : (
                    <Share2 className="h-3.5 w-3.5 mr-1" />
                  )}
                  <span>{copiedLink ? "Link Copied" : "Share"}</span>
                </Button>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close article modal"
                  className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Article Body */}
            <div className="overflow-y-auto px-6 sm:px-10 py-6 space-y-6">
              {/* Header Title */}
              <div>
                <h1
                  id="article-modal-title"
                  className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-snug"
                >
                  {article.title}
                </h1>

                {/* Author & Meta Bar */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/80 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-3">
                    {article.authorAvatar && (
                      <img
                        src={article.authorAvatar}
                        alt={article.author}
                        className="h-9 w-9 rounded-full border border-primary/30 object-cover"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-foreground text-xs">
                        {article.author}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        {article.authorRole}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 font-mono text-[11px]">
                    <span className="flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1 text-primary" />
                      {article.date}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-muted border border-border font-semibold">
                      {article.difficulty}
                    </span>
                  </div>
                </div>
              </div>

              {/* Key Takeaways Card */}
              {article.keyTakeaways && article.keyTakeaways.length > 0 && (
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 sm:p-5">
                  <div className="flex items-center space-x-2 text-primary font-bold text-xs uppercase tracking-wider mb-2.5 font-mono">
                    <Sparkles className="h-4 w-4" />
                    <span>Executive Takeaways</span>
                  </div>
                  <div className="space-y-2">
                    {article.keyTakeaways.map((point, idx) => (
                      <div
                        key={idx}
                        className="flex items-start space-x-2 text-xs sm:text-sm text-foreground"
                      >
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground leading-relaxed">
                          {point}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Formatted Markdown Content */}
              <div className="prose prose-invert max-w-none">
                {renderFormattedMarkdown(article.markdownContent)}
              </div>

              {/* Tags & Action Footer */}
              <div className="pt-6 border-t border-border space-y-4">
                <div className="flex flex-wrap gap-1.5 items-center">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                  {article.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-muted border border-border text-muted-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <p className="text-xs text-muted-foreground">
                    Written for the IST Bengaluru open-source student community.
                  </p>
                  <a
                    href="https://github.com/IST-ZenithenLab/ZenithenOpen"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-mono text-primary hover:bg-primary/10 cursor-pointer"
                    >
                      <span>Discuss on GitHub</span>
                      <ExternalLink className="ml-1.5 h-3 w-3" />
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
