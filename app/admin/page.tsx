"use client";

import * as React from "react";
import {
  ShieldCheck,
  Users,
  FolderGit2,
  Compass,
  AlertCircle,
  CheckCircle2,
  Lock,
  Plus,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MOCK_MEMBERS, MOCK_PROJECTS, MOCK_OPPORTUNITIES } from "@/lib/data/mock-data";

export default function AdminPage() {
  const [activeTab, setActiveTab] = React.useState<"members" | "projects" | "opportunities">("members");
  const [isSyncing, setIsSyncing] = React.useState(false);

  const handleSyncTrigger = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 1500);
  };

  return (
    <div className="py-16 bg-white min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="border-b border-slate-200 pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-blue-600 font-mono">
              <ShieldCheck className="h-4 w-4" />
              <span>Governance & Administration</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
              Admin Governance Dashboard
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Platform telemetry, repository indexing, mentor assignments, and role access controls.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleSyncTrigger}
              disabled={isSyncing}
              className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 shadow-sm transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin text-blue-600" : ""}`} />
              <span>{isSyncing ? "Triggering Sync..." : "Trigger GitHub Sync"}</span>
            </button>
            <span className="flex items-center space-x-1.5 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg text-xs text-blue-700 font-mono">
              <Lock className="h-3 w-3 text-blue-600" />
              <span>ADMIN_MODE</span>
            </span>
          </div>
        </div>

        {/* Quick Governance Stat Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <Card className="p-6 border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Registered Members
                </p>
                <p className="text-3xl font-extrabold text-slate-900 mt-1 font-mono">0</p>
              </div>
              <Users className="h-8 w-8 text-blue-600 p-1.5 rounded-xl bg-blue-50 border border-blue-200" />
            </div>
            <p className="text-[11px] text-slate-500 mt-3 flex items-center">
              <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" />
              <span>Awaiting first user OAuth registration</span>
            </p>
          </Card>

          <Card className="p-6 border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Managed Repositories
                </p>
                <p className="text-3xl font-extrabold text-slate-900 mt-1 font-mono">0</p>
              </div>
              <FolderGit2 className="h-8 w-8 text-purple-600 p-1.5 rounded-xl bg-purple-50 border border-purple-200" />
            </div>
            <p className="text-[11px] text-slate-500 mt-3">
              Organization sync target: IST-ZenithenLab
            </p>
          </Card>

          <Card className="p-6 border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Open Starter Issues
                </p>
                <p className="text-3xl font-extrabold text-slate-900 mt-1 font-mono">0</p>
              </div>
              <Compass className="h-8 w-8 text-emerald-600 p-1.5 rounded-xl bg-emerald-50 border border-emerald-200" />
            </div>
            <p className="text-[11px] text-slate-500 mt-3 flex items-center">
              <span>Ready for GitHub issue webhook ingestion</span>
            </p>
          </Card>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-6">
          <div className="flex space-x-2">
            {(["members", "projects", "opportunities"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  activeTab === tab
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab} (0)
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Zero State */}
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <ShieldCheck className="mx-auto h-8 w-8 text-blue-600 mb-2" />
          <p className="text-sm font-semibold text-slate-900">No {activeTab} to moderate yet</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            When users register or repositories are ingested, you can approve member roles, pin spotlight projects, and assign mentors here.
          </p>
        </div>
      </div>
    </div>
  );
}
