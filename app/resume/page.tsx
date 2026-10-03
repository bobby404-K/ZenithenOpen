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
  RefreshCw,
} from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MOCK_RESUME_DATA } from "@/lib/data/mock-data";
import { ResumeProfileData } from "@/types";

export default function ResumeBuilderPage() {
  const [copied, setCopied] = React.useState(false);
  const [editMode, setEditMode] = React.useState(false);
  const [data, setData] = React.useState<ResumeProfileData>(MOCK_RESUME_DATA);

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
    <div className="py-16 bg-white min-h-screen">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Controls Toolbar (hidden during print) */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 print:hidden">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-blue-600 font-mono">
              <Sparkles className="h-4 w-4" />
              <span>Interactive Resume Engine</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
              Open-Source Developer Resume
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Edit your details live, then export to Markdown or Print to PDF.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => setEditMode(!editMode)}
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
            >
              <Edit3 className="h-3.5 w-3.5 text-blue-600" />
              <span>{editMode ? "Close Editor" : "Edit Profile"}</span>
            </Button>

            <Button
              onClick={handleCopyMarkdown}
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied!" : "Copy Markdown"}</span>
            </Button>

            <Button
              onClick={handlePrint}
              size="sm"
              className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 shadow-sm"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Save PDF</span>
            </Button>
          </div>
        </div>

        {/* Live Interactive Edit Panel */}
        {editMode && (
          <div className="mb-8 rounded-2xl border border-blue-200 bg-blue-50/50 p-6 print:hidden space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-blue-600" />
              <span>Quick Profile Editor</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Full Name</label>
                <Input
                  value={data.fullName}
                  onChange={(e) => setData({ ...data, fullName: e.target.value })}
                  className="bg-white border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Headline</label>
                <Input
                  value={data.headline}
                  onChange={(e) => setData({ ...data, headline: e.target.value })}
                  className="bg-white border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Email</label>
                <Input
                  value={data.email}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                  className="bg-white border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-medium">GitHub Username</label>
                <Input
                  value={data.githubUsername}
                  onChange={(e) => setData({ ...data, githubUsername: e.target.value })}
                  className="bg-white border-slate-200 text-xs font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-600 mb-1 font-medium">Professional Summary</label>
                <textarea
                  rows={2}
                  value={data.summary}
                  onChange={(e) => setData({ ...data, summary: e.target.value })}
                  className="w-full rounded-md bg-white border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* The Printable Resume Canvas */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 shadow-lg text-slate-800 print:bg-white print:text-black print:p-0 print:border-none print:shadow-none">
          {/* Header */}
          <div className="border-b border-slate-200 print:border-black pb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 print:text-black">
              {data.fullName}
            </h1>
            <p className="text-sm font-semibold text-blue-600 print:text-gray-800 mt-1">
              {data.headline}
            </p>

            <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500 print:text-gray-600">
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
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 print:text-black border-b border-slate-200 print:border-black pb-1 mb-2 font-mono">
              Professional Summary
            </h2>
            <p className="text-xs leading-relaxed text-slate-700 print:text-gray-800">
              {data.summary}
            </p>
          </div>

          {/* Technical Skills */}
          <div className="mt-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 print:text-black border-b border-slate-200 print:border-black pb-1 mb-2 font-mono">
              Technical Proficiencies
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <p>
                <strong className="text-slate-900 print:text-black">Languages:</strong>{" "}
                <span className="text-slate-700 print:text-gray-700">
                  {data.skills.languages.join(", ")}
                </span>
              </p>
              <p>
                <strong className="text-slate-900 print:text-black">Frameworks:</strong>{" "}
                <span className="text-slate-700 print:text-gray-700">
                  {data.skills.frameworks.join(", ")}
                </span>
              </p>
              <p>
                <strong className="text-slate-900 print:text-black">Tools & DevOps:</strong>{" "}
                <span className="text-slate-700 print:text-gray-700">
                  {data.skills.tools.join(", ")}
                </span>
              </p>
              <p>
                <strong className="text-slate-900 print:text-black">Databases:</strong>{" "}
                <span className="text-slate-700 print:text-gray-700">
                  {data.skills.databases.join(", ")}
                </span>
              </p>
            </div>
          </div>

          {/* Education */}
          <div className="mt-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 print:text-black border-b border-slate-200 print:border-black pb-1 mb-2 font-mono">
              Education
            </h2>
            <div className="flex items-start justify-between text-xs">
              <div>
                <p className="font-semibold text-slate-900 print:text-black">
                  {data.education.institution}
                </p>
                <p className="text-slate-700 print:text-gray-700">
                  {data.education.degree} in {data.education.field}
                </p>
              </div>
              <div className="text-right text-slate-500 print:text-gray-600 font-mono">
                <p>Graduation: {data.education.graduationYear}</p>
                <p>GPA: {data.education.gpa}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
