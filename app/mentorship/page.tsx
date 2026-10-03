"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users2,
  Sparkles,
  Search,
  CheckCircle2,
  Send,
  HelpCircle,
  BookOpen,
  UserCheck,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MOCK_MEMBERS } from "@/lib/data/mock-data";

export default function MentorshipPage() {
  const [selectedTopic, setSelectedTopic] = React.useState<string>("All");
  const [requestModalOpen, setRequestModalOpen] = React.useState<boolean>(false);
  const [requestSent, setRequestSent] = React.useState<boolean>(false);
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    topic: "GSoC Preparation",
    goal: "",
  });

  const mentors = MOCK_MEMBERS.filter((m) => m.isAvailableForMentorship);

  const topics = [
    "All",
    "GSoC Preparation",
    "Distributed Systems",
    "Next.js & React 19",
    "PyTorch Open Source",
    "DevOps Roadmaps",
  ];

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setRequestSent(true);
    setTimeout(() => {
      setRequestModalOpen(false);
      setRequestSent(false);
      setFormData({ name: "", email: "", topic: "GSoC Preparation", goal: "" });
    }, 1800);
  };

  return (
    <div className="py-16 bg-white min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="border-b border-slate-200 pb-8">
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-blue-600 font-mono">
            <Users2 className="h-4 w-4" />
            <span>Peer Mentorship Matching</span>
          </div>
          <div className="mt-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                Open-Source Mentorship
              </h1>
              <p className="mt-1 text-sm text-slate-600 max-w-2xl leading-relaxed">
                Connect with senior students and alumni who have shipped production code, landed GSoC fellowships, and guided newcomers.
              </p>
            </div>
            <Button
              onClick={() => setRequestModalOpen(true)}
              className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-md text-xs shrink-0 self-start md:self-auto"
            >
              <UserCheck className="h-4 w-4" />
              <span>Request a Mentor</span>
            </Button>
          </div>

          {/* Topics filter */}
          <div className="mt-8 flex flex-wrap gap-2 items-center">
            <span className="text-xs text-slate-500 mr-2">Focus Topic:</span>
            {topics.map((topic) => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedTopic === topic
                    ? "bg-blue-600 text-white font-semibold shadow-sm"
                    : "bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900"
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Mentors Grid or Zero State */}
        {mentors.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 mb-4">
              <Users2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Mentor Network Initializing</h3>
            <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Are you a senior student or GSoC contributor? Apply to become a founding mentor, review PRs, and guide first-year students.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button
                onClick={() => setRequestModalOpen(true)}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-xs"
              >
                <span>Submit Mentorship Request</span>
              </Button>
              <Link href="/learning">
                <Button variant="outline" className="text-xs">
                  Follow Self-Guided Roadmaps
                </Button>
              </Link>
            </div>
          </div>
        ) : null}

        {/* Request Modal */}
        {requestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Request Open-Source Mentorship</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Match with an S-VYASA student mentor for 1-on-1 code reviews.
                  </p>
                </div>
                <button
                  onClick={() => setRequestModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-1 text-sm"
                >
                  ✕
                </button>
              </div>

              {requestSent ? (
                <div className="py-8 text-center space-y-2">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                  <p className="text-base font-bold text-slate-900">Request Dispatched!</p>
                  <p className="text-xs text-slate-500">
                    A mentor will review your topic and contact you via your university email.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendRequest} className="mt-5 space-y-4">
                  <div>
                    <label className="text-xs text-slate-700 font-semibold block mb-1">Your Full Name</label>
                    <Input
                      required
                      placeholder="e.g. Rahul Verma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-white border-slate-200 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-700 font-semibold block mb-1">University Email</label>
                    <Input
                      required
                      type="email"
                      placeholder="student@svyasa.edu.in"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-white border-slate-200 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-700 font-semibold block mb-1">Target Focus Area</label>
                    <select
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      className="w-full rounded-md bg-white border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="GSoC Preparation">Google Summer of Code (GSoC) Mentorship</option>
                      <option value="Distributed Systems">Go & Distributed Systems</option>
                      <option value="Next.js & React 19">Next.js & React 19 Web Architecture</option>
                      <option value="PyTorch Open Source">PyTorch AI & Data Science</option>
                      <option value="DevOps Roadmaps">Docker & Cloud DevOps</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-700 font-semibold block mb-1">What is your primary goal?</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="e.g. I want to contribute my first PR to an open-source repo before December..."
                      value={formData.goal}
                      onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                      className="w-full rounded-md bg-white border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="pt-2 flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setRequestModalOpen(false)}
                      className="text-xs text-slate-600 hover:text-slate-900"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="text-xs bg-blue-600 hover:bg-blue-700 font-semibold gap-1.5 text-white shadow-sm"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Submit Request</span>
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
