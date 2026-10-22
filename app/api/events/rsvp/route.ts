/**
 * Campus Event RSVP Registration API
 * Location: app/api/events/rsvp/route.ts
 *
 * Registers student contributors for upcoming workshops, office hours, and hackathons
 * with capacity checking and duplicate prevention.
 */

import { NextRequest, NextResponse } from "next/server";
import { getEventsStore } from "../route";
import { EventAttendee } from "@/types";
import { deleteCached } from "@/lib/redis/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    const { eventId, username, name, email, department } = body;

    if (!eventId || typeof eventId !== "string") {
      return NextResponse.json(
        { success: false, error: "Field 'eventId' is required" },
        { status: 400 }
      );
    }

    const cleanUsername = (username || "").trim();
    if (!cleanUsername || cleanUsername.length < 2) {
      return NextResponse.json(
        { success: false, error: "A valid GitHub username (min 2 characters) is required" },
        { status: 400 }
      );
    }

    const events = getEventsStore();
    const event = events.find((e) => e.id === eventId);

    if (!event) {
      return NextResponse.json(
        { success: false, error: `Event with id '${eventId}' not found` },
        { status: 404 }
      );
    }

    // Check if student already RSVP'd
    const alreadyRegistered = event.attendees.some(
      (att) => att.username.toLowerCase() === cleanUsername.toLowerCase()
    );

    if (alreadyRegistered) {
      return NextResponse.json(
        {
          success: false,
          error: `@${cleanUsername} is already registered for this event!`,
          alreadyRegistered: true,
        },
        { status: 409 }
      );
    }

    // Check capacity
    if (event.rsvpCount >= event.capacity) {
      return NextResponse.json(
        {
          success: false,
          error: `Event '${event.title}' is currently at full capacity (${event.capacity} seats).`,
          atCapacity: true,
        },
        { status: 400 }
      );
    }

    const attendeeName = (name || "").trim() || cleanUsername;
    const newAttendee: EventAttendee = {
      username: cleanUsername,
      name: attendeeName,
      email: (email || "").trim() || undefined,
      department: (department || "").trim() || "Computer Science",
      avatarUrl: `https://avatars.githubusercontent.com/${encodeURIComponent(cleanUsername)}`,
      rsvpAt: new Date().toISOString(),
    };

    // Update in-memory store
    event.attendees.unshift(newAttendee);
    event.rsvpCount += 1;

    // Invalidate Redis caches for events list
    await deleteCached("events:list:*");

    return NextResponse.json({
      success: true,
      message: `RSVP confirmed for @${cleanUsername}! Check your calendar for session details.`,
      event: {
        id: event.id,
        title: event.title,
        rsvpCount: event.rsvpCount,
        capacity: event.capacity,
        date: event.date,
        time: event.time,
        location: event.location,
      },
      attendee: newAttendee,
    });
  } catch (error) {
    console.error("[POST /api/events/rsvp] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process event RSVP registration" },
      { status: 500 }
    );
  }
}
