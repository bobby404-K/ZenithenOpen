"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users2,
  CheckCircle2,
  Send,
  UserCheck,
  ExternalLink,
  BookOpen,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Member } from "@/types";

export default function MentorshipPage() {
  const [selectedTopic, setSelectedTopic] = React.useState<string>("All");
  const [requestModalOpen, setRequestModalOpen] = React.useState<boolean>(false);
  const [requestSent, setRequestSent] = React.useState<boolean>(false);
  const [allMentors, setAllMentors] = React.useState<Member[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);

  const [selectedMentor, setSelectedMentor] = React.useState<Member | null>(null);
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    topic: "GSoC Preparation",
    goal: "",
  });

  React.useEffect(() => {
    async function loadMentors() {
      try {
        setLoading(true);
        const res = await fetch("/api/members", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.members)) {
            const activeMentors = json.members.filter(
              (m: Member) => m.isAvailableForMentorship || m.role === "MENTOR"
            );
            setAllMentors(activeMentors);
          }
        }
      } catch (err) {
        console.error("[MentorshipPage] Error loading mentors:", err);
      } finally {
        setLoading(false);
      }
    }

    loadMentors();
  }, []);

  const topics = [
    "All",
    "GSoC Preparation",
    "Distributed Systems",
    "Next.js & React 19",
    "PyTorch Open Source",
    "DevOps Roadmaps",
  ];

  const filteredMentors = allMentors.filter((m) => {
    if (selectedTopic === "All") return true;
    const matchTopic =
      m.mentorshipTopics?.some((t) => t.toLowerCase().includes(selectedTopic.toLowerCase())) ||
      m.skills?.some((s) => s.name.toLowerCase().includes(selectedTopic.toLowerCase())) ||
      m.bio?.toLowerCase().includes(selectedTopic.toLowerCase());
    return matchTopic;
  });

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/mentorship/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menteeName: formData.name,
          menteeEmail: formData.email,
          topic: formData.topic,
          message: formData.goal,
          mentorId: selectedMentor?.id,
          mentorUsername: selectedMentor?.username,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRequestSent(true);
        setTimeout(() => {
          setRequestModalOpen(false);
          setRequestSent(false);
          setFormData({ name: "", email: "", topic: "GSoC Preparation", goal: "" });
          setSelectedMentor(null);
        }, 2000);
      } else {
        setErrorMessage(data.error || "Failed to submit request. Please verify the form fields.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-16 bg-background text-foreground min-h-screen transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="border-b border-border pb-8">
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-primary font-mono">
            <Users2 className="h-4 w-4" />
            <span>Peer Mentorship Matching</span>
          </div>
          <div className="mt-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Open-Source Mentorship
              </h1>
              <p className="mt-1 text-sm text-muted-foreground max-w-2xl leading-relaxed">
                Connect with senior students and alumni who have shipped production code, landed GSoC fellowships, and guided newcomers.
              </p>
            </div>
            <Button
              onClick={() => {
                setSelectedMentor(null);
                setErrorMessage(null);
                setRequestModalOpen(true);
              }}
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md text-xs shrink-0 self-start md:self-auto cursor-pointer"
            >
              <UserCheck className="h-4 w-4" />
              <span>Request a Mentor</span>
            </Button>
          </div>

          {/* Topics filter */}
          <div className="mt-8 flex flex-wrap gap-2 items-center">
            <span className="text-xs text-muted-foreground mr-2">Focus Topic:</span>
            {topics.map((topic) => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  selectedTopic === topic
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "bg-muted border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Mentors Grid or Zero State */}
        {loading ? (
          <div className="py-16 text-center text-xs font-mono text-muted-foreground">
            Loading mentor directory from database...
          </div>
        ) : filteredMentors.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-border bg-card p-16 text-center shadow-xs">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-4">
              <Users2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground">
              {allMentors.length === 0 ? "Mentor Network Initializing" : `No mentors found for "${selectedTopic}"`}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Are you a senior student or GSoC contributor? Apply to become a founding mentor, review PRs, and guide first-year students.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button
                onClick={() => setRequestModalOpen(true)}
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs cursor-pointer"
              >
                <span>Submit Mentorship Request</span>
              </Button>
              <Link href="/resources">
                <Button variant="outline" className="text-xs border-border">
                  Explore Learning Resources
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <Card
                key={mentor.id}
                className="p-6 border border-border bg-card shadow-xs flex flex-col justify-between hover:border-primary/40 transition-all"
              >
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <img
                      src={mentor.avatarUrl}
                      alt={mentor.name}
                      className="h-12 w-12 rounded-full border border-border bg-muted object-cover"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-bold text-foreground">{mentor.name}</h3>
                        <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                          {mentor.role}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">
                        @{mentor.username} • {mentor.department}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-4">
                    {mentor.bio || "Active mentor helping campus developers get started with open source and PR reviews."}
                  </p>

                  {mentor.mentorshipTopics && mentor.mentorshipTopics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {mentor.mentorshipTopics.map((topic) => (
                        <Badge key={topic} variant="secondary" className="text-[10px] font-mono">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-xs font-mono text-muted-foreground">
                    {mentor.mergedPrCount} PRs merged
                  </span>
                  <Button
                    onClick={() => {
                      setSelectedMentor(mentor);
                      setFormData((prev) => ({ ...prev, topic: mentor.mentorshipTopics?.[0] || prev.topic }));
                      setErrorMessage(null);
                      setRequestModalOpen(true);
                    }}
                    size="sm"
                    className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold cursor-pointer"
                  >
                    Request Match
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Request Modal */}
        {requestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl text-foreground">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    {selectedMentor ? `Request Mentorship: ${selectedMentor.name}` : "Request Open-Source Mentorship"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedMentor
                      ? `Direct match with @${selectedMentor.username} (${selectedMentor.department})`
                      : "Match with an IST student mentor for 1-on-1 code reviews."}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setRequestModalOpen(false);
                    setSelectedMentor(null);
                    setErrorMessage(null);
                  }}
                  className="text-muted-foreground hover:text-foreground p-1 text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {requestSent ? (
                <div className="py-8 text-center space-y-2">
                  <CheckCircle2 className="h-10 w-10 text-accent mx-auto" />
                  <p className="text-base font-bold text-foreground">Request Dispatched!</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedMentor
                      ? `@${selectedMentor.username} will review your topic and contact you via your university email.`
                      : "A mentor will review your topic and contact you via your university email."}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendRequest} className="mt-5 space-y-4">
                  {errorMessage && (
                    <div className="p-2.5 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-xs">
                      {errorMessage}
                    </div>
                  )}

                  <div>
                    <label className="text-xs text-foreground font-semibold block mb-1">Your Full Name</label>
                    <Input
                      required
                      placeholder="e.g. Rahul Verma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-background border-border text-foreground text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-foreground font-semibold block mb-1">University Email</label>
                    <Input
                      required
                      type="email"
                      placeholder="student@ist.edu.in"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-background border-border text-foreground text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-foreground font-semibold block mb-1">Target Focus Area</label>
                    <select
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      className="w-full rounded-md bg-background border border-border p-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="GSoC Preparation">Google Summer of Code (GSoC) Mentorship</option>
                      <option value="Distributed Systems">Go & Distributed Systems</option>
                      <option value="Next.js & React 19">Next.js & React 19 Web Architecture</option>
                      <option value="PyTorch Open Source">PyTorch AI & Data Science</option>
                      <option value="DevOps Roadmaps">Docker & Cloud DevOps</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-foreground font-semibold block mb-1">What is your primary goal?</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="e.g. I want to contribute my first PR to an open-source repo before December..."
                      value={formData.goal}
                      onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                      className="w-full rounded-md bg-background border border-border p-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="pt-2 flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setRequestModalOpen(false);
                        setSelectedMentor(null);
                        setErrorMessage(null);
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>{submitting ? "Submitting..." : "Submit Request"}</span>
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
