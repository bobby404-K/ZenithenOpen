"use client";

import * as React from "react";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  ExternalLink,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CampusEvent } from "@/types";
import { useAuth } from "@/components/auth/auth-context";

interface EventRsvpModalProps {
  event: CampusEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onRsvpSuccess: (updatedEvent: CampusEvent) => void;
}

export function EventRsvpModal({
  event,
  isOpen,
  onClose,
  onRsvpSuccess,
}: EventRsvpModalProps) {
  const { user } = useAuth();
  const [username, setUsername] = React.useState("");
  const [name, setName] = React.useState("");
  const [department, setDepartment] = React.useState("Computer Science");
  const [email, setEmail] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  // Auto-populate from logged-in user if available
  React.useEffect(() => {
    if (user?.githubUsername) {
      setUsername(user.githubUsername);
    }
    if (user?.name) {
      setName(user.name);
    }
    if (user?.department) {
      setDepartment(user.department);
    }
    setError(null);
    setSuccess(false);
  }, [user, isOpen, event]);

  if (!isOpen || !event) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Please provide your GitHub username");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/events/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          username: username.trim(),
          name: name.trim() || username.trim(),
          department: department.trim(),
          email: email.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit RSVP");
      }

      setSuccess(true);

      // Create an updated event object to notify parent
      const updatedEvent: CampusEvent = {
        ...event,
        rsvpCount: (event.rsvpCount || 0) + 1,
        attendees: [data.attendee, ...(event.attendees || [])],
      };
      onRsvpSuccess(updatedEvent);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to register RSVP";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const isFull = event.rsvpCount >= event.capacity;
  const isAlreadyRegistered =
    user?.githubUsername &&
    event.attendees.some(
      (a) => a.username.toLowerCase() === user.githubUsername?.toLowerCase()
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl shadow-primary/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-full border border-border bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 pr-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-primary/25 bg-primary/10 text-primary text-[10px] font-mono font-bold uppercase tracking-wider">
            <Sparkles className="h-3 w-3" />
            <span>{event.categoryLabel || "Campus Session"}</span>
          </div>
          <h2 className="text-xl font-bold text-foreground leading-snug">
            {event.title}
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1 font-mono">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              {event.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-primary" />
              {event.time}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              {event.location}
            </span>
          </div>
        </div>

        {/* Attendance Counter */}
        <div className="mt-4 p-3 rounded-xl border border-border bg-muted/40 flex items-center justify-between text-xs font-mono">
          <span className="flex items-center gap-1.5 text-foreground font-semibold">
            <Users className="h-4 w-4 text-primary" />
            <span>Capacity & Registrations</span>
          </span>
          <span className="text-muted-foreground">
            <strong className="text-primary font-bold">{event.rsvpCount}</strong> /{" "}
            {event.capacity} seats reserved
          </span>
        </div>

        {/* Success View */}
        {success ? (
          <div className="mt-6 space-y-4 text-center py-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">
                Registration Confirmed!
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                You are registered for <strong>{event.title}</strong> as @{username}. Save it to your calendar to receive timely reminders.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2 justify-center">
              {event.calendarLinks?.google && (
                <a
                  href={event.calendarLinks.google}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Add to Google Calendar</span>
                  <ExternalLink className="h-3 w-3 opacity-70" />
                </a>
              )}

              <a
                href={`/api/events/${encodeURIComponent(event.id)}/calendar?format=ics`}
                download={`${event.id}.ics`}
                className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl border border-border bg-card text-foreground text-xs font-semibold hover:bg-muted transition-all cursor-pointer shadow-xs"
              >
                <Download className="h-3.5 w-3.5 text-primary" />
                <span>Download .ics iCal</span>
              </a>
            </div>

            <div className="pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {isFull && !isAlreadyRegistered && (
              <div className="flex items-center gap-2 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-medium">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>This session is at full capacity. Check Discord for overflow streams.</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                GitHub Username <span className="text-primary">*</span>
              </label>
              <Input
                placeholder="e.g. bobby404-k"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={submitting || Boolean(user?.githubUsername)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Full Name
                </label>
                <Input
                  placeholder="e.g. Bobby Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={submitting}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Academic Department
                </label>
                <Input
                  placeholder="e.g. Computer Science"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  disabled={submitting}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Campus Email (Optional for updates)
              </label>
              <Input
                type="email"
                placeholder="student@ist.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                className="h-9 text-xs"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={submitting}
                className="text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={submitting || (isFull && !isAlreadyRegistered)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    <span>Registering...</span>
                  </>
                ) : isAlreadyRegistered ? (
                  <span>Registered (Update Info)</span>
                ) : (
                  <span>Confirm RSVP</span>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
