"use client";

import * as React from "react";
import {
  Printer,
  Copy,
  Check,
  Mail,
  MapPin,
  Globe,
  Sparkles,
  Edit3,
  Share2,
  ShieldCheck,
} from "lucide-react";
import { GithubIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProofOfWorkBadgeModal } from "@/components/resume/proof-of-work-badge-card";
import { MOCK_RESUME_DATA } from "@/lib/data/mock-data";
import { ResumeProfileData } from "@/types";

export default function ResumeBuilderPage() {
  const [copied, setCopied] = React.useState(false);
  const [shareCopied, setShareCopied] = React.useState(false);
  const [sharing, setSharing] = React.useState(false);
  const [editMode, setEditMode] = React.useState(false);
  const [badgeModalOpen, setBadgeModalOpen] = React.useState(false);
  const [data, setData] = React.useState<ResumeProfileData>(MOCK_RESUME_DATA);
  const [handleInput, setHandleInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleShareLink = async () => {
    try {
      setSharing(true);
      const res = await fetch("/api/resume/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.githubUsername,
          customHeadline: data.headline,
          customSummary: data.summary,
        }),
      });
      const json = await res.json();
      if (res.ok && json.shareUrl) {
        const fullUrl = `${window.location.origin}${json.shareUrl}`;
        await navigator.clipboard.writeText(fullUrl);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 3000);
      }
    } catch (err) {
      console.warn("[Resume Page] Failed to generate share token:", err);
    } finally {
      setSharing(false);
    }
  };

  const handleFetchProfile = async (targetUsername?: string) => {
    const userToFetch = (targetUsername || handleInput).trim();
    if (!userToFetch) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/resume/${encodeURIComponent(userToFetch)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.profile) {
          setData(json.profile);
        }
      }
    } catch (err) {
      console.warn("[Resume Page] Failed to fetch verified resume profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    const md = `# ${data.fullName}
**${data.headline}**
${data.email} | ${data.location} | GitHub: @${data.githubUsername}

## Summary
${data.summary}

## Technical Proficiencies
- **Languages:** ${data.skills.languages.join(", ")}
- **Frameworks:** ${data.skills.frameworks.join(", ")}
- **Tools & DevOps:** ${data.skills.tools.join(", ")}
- **Databases:** ${data.skills.databases.join(", ")}

## Education
${data.education.degree} in ${data.education.field} — ${data.education.institution} (Grad: ${data.education.graduationYear})
`;
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="py-16 bg-background text-foreground min-h-screen transition-colors">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Controls Toolbar (hidden during print) */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6 print:hidden">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-primary font-mono">
              <Sparkles className="h-4 w-4" />
              <span>Interactive Resume Engine</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground mt-1">
              Open-Source Developer Resume
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Edit your details live, then export to Markdown or Print to PDF.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Input
                placeholder="GitHub handle..."
                value={handleInput}
                onChange={(e) => setHandleInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFetchProfile()}
                className="h-8 w-36 text-xs bg-muted/40 border-border"
              />
              <Button
                onClick={() => handleFetchProfile()}
                disabled={loading || !handleInput.trim()}
                variant="outline"
                size="sm"
                className="h-8 text-xs border-border cursor-pointer"
              >
                {loading ? "Loading..." : "Sync Profile"}
              </Button>
            </div>

            <Button
              onClick={() => setEditMode(!editMode)}
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs border-border"
            >
              <Edit3 className="h-3.5 w-3.5 text-primary" />
              <span>{editMode ? "Close Editor" : "Edit Profile"}</span>
            </Button>

            <Button
              onClick={handleCopyMarkdown}
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs border-border"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-accent" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied!" : "Copy Markdown"}</span>
            </Button>

            <Button
              onClick={handleShareLink}
              disabled={sharing}
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs border-border cursor-pointer text-primary hover:bg-primary/10"
            >
              {shareCopied ? (
                <Check className="h-3.5 w-3.5 text-accent" />
              ) : (
                <Share2 className="h-3.5 w-3.5" />
              )}
              <span>{sharing ? "Generating..." : shareCopied ? "Link Copied!" : "Share Link"}</span>
            </Button>

            <Button
              onClick={() => setBadgeModalOpen(true)}
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20 cursor-pointer shadow-xs"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
              <span>Shareable Badge</span>
            </Button>

            <Button
              onClick={handlePrint}
              size="sm"
              className="gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Save PDF</span>
            </Button>
          </div>
        </div>

        {/* Live Interactive Edit Panel */}
        {editMode && (
          <div className="mb-8 rounded-2xl border border-primary/30 bg-primary/5 p-6 print:hidden space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-primary" />
              <span>Quick Profile Editor</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-muted-foreground mb-1 font-medium">Full Name</label>
                <Input
                  value={data.fullName}
                  onChange={(e) => setData({ ...data, fullName: e.target.value })}
                  className="bg-card border-border text-foreground text-xs"
                />
              </div>
              <div>
                <label className="block text-muted-foreground mb-1 font-medium">Headline</label>
                <Input
                  value={data.headline}
                  onChange={(e) => setData({ ...data, headline: e.target.value })}
                  className="bg-card border-border text-foreground text-xs"
                />
              </div>
              <div>
                <label className="block text-muted-foreground mb-1 font-medium">Email</label>
                <Input
                  value={data.email}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                  className="bg-card border-border text-foreground text-xs"
                />
              </div>
              <div>
                <label className="block text-muted-foreground mb-1 font-medium">GitHub Username</label>
                <Input
                  value={data.githubUsername}
                  onChange={(e) => setData({ ...data, githubUsername: e.target.value })}
                  className="bg-card border-border text-foreground text-xs font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-muted-foreground mb-1 font-medium">Professional Summary</label>
                <textarea
                  rows={2}
                  value={data.summary}
                  onChange={(e) => setData({ ...data, summary: e.target.value })}
                  className="w-full rounded-md bg-card border border-border p-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* The Printable Resume Canvas */}
        <div className="rounded-2xl border border-border bg-card p-8 sm:p-12 shadow-lg text-foreground print:bg-white print:text-black print:p-0 print:border-none print:shadow-none transition-colors">
          {/* Header */}
          <div className="border-b border-border print:border-black pb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground print:text-black">
              {data.fullName}
            </h1>
            <p className="text-sm font-semibold text-primary print:text-gray-800 mt-1">
              {data.headline}
            </p>

            <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground print:text-gray-600">
              <span className="flex items-center space-x-1.5">
                <Mail className="h-3.5 w-3.5" />
                <span>{data.email}</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <MapPin className="h-3.5 w-3.5" />
                <span>{data.location}</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <GithubIcon className="h-3.5 w-3.5" />
                <span>github.com/{data.githubUsername}</span>
              </span>
              {data.portfolioUrl && (
                <span className="flex items-center space-x-1.5">
                  <Globe className="h-3.5 w-3.5" />
                  <span>{data.portfolioUrl}</span>
                </span>
              )}
            </div>
          </div>

          {/* Professional Summary */}
          <div className="mt-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground print:text-black border-b border-border print:border-black pb-1 mb-2 font-mono">
              Professional Summary
            </h2>
            <p className="text-xs leading-relaxed text-foreground/90 print:text-gray-800">
              {data.summary}
            </p>
          </div>

          {/* Technical Skills */}
          <div className="mt-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground print:text-black border-b border-border print:border-black pb-1 mb-2 font-mono">
              Technical Proficiencies
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <p>
                <strong className="text-foreground print:text-black">Languages:</strong>{" "}
                <span className="text-muted-foreground print:text-gray-700">
                  {data.skills.languages.join(", ")}
                </span>
              </p>
              <p>
                <strong className="text-foreground print:text-black">Frameworks:</strong>{" "}
                <span className="text-muted-foreground print:text-gray-700">
                  {data.skills.frameworks.join(", ")}
                </span>
              </p>
              <p>
                <strong className="text-foreground print:text-black">Tools & DevOps:</strong>{" "}
                <span className="text-muted-foreground print:text-gray-700">
                  {data.skills.tools.join(", ")}
                </span>
              </p>
              <p>
                <strong className="text-foreground print:text-black">Databases:</strong>{" "}
                <span className="text-muted-foreground print:text-gray-700">
                  {data.skills.databases.join(", ")}
                </span>
              </p>
            </div>
          </div>

          {/* Education */}
          <div className="mt-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground print:text-black border-b border-border print:border-black pb-1 mb-2 font-mono">
              Education
            </h2>
            <div className="flex items-start justify-between text-xs">
              <div>
                <p className="font-semibold text-foreground print:text-black">
                  {data.education.institution}
                </p>
                <p className="text-muted-foreground print:text-gray-700">
                  {data.education.degree} in {data.education.field}
                </p>
              </div>
              <div className="text-right text-muted-foreground print:text-gray-600 font-mono">
                <p>Graduation: {data.education.graduationYear}</p>
                <p>GPA: {data.education.gpa}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Shareable Proof-of-Work Badge Card Modal */}
        <ProofOfWorkBadgeModal
          isOpen={badgeModalOpen}
          onClose={() => setBadgeModalOpen(false)}
          data={{
            username: data.githubUsername,
            name: data.fullName,
            department: data.education?.field || "Computer Science",
            year: data.education?.graduationYear || "Class of 2026",
            qualityPrs: data.highlightedRepos?.reduce((acc, r) => acc + (r.prsAuthored || 1), 0) || 3,
            campusMerges: data.highlightedRepos?.length || 2,
            totalPrs: data.highlightedRepos?.reduce((acc, r) => acc + (r.prsAuthored || 1), 0) || 5,
          }}
        />
      </div>
    </div>
  );
}
