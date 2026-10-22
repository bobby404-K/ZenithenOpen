/**
 * Campus Event Calendar Export API
 * Location: app/api/events/[id]/calendar/route.ts
 *
 * Generates RFC 5545 standard iCalendar (.ics) format or direct Google Calendar URLs
 * for campus developer sessions.
 */

import { NextRequest, NextResponse } from "next/server";
import { getEventsStore } from "../../route";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function formatIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const cleanId = (id || "").trim();

    const events = getEventsStore();
    const event = events.find((e) => e.id === cleanId);

    if (!event) {
      return NextResponse.json(
        { success: false, error: `Event with id '${cleanId}' not found` },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format")?.toLowerCase();

    // Default dates if specific timestamp isn't parsed
    const now = new Date();
    const startDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days in future
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration

    const startIcs = formatIcsDate(startDate);
    const endIcs = formatIcsDate(endDate);

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.title
    )}&dates=${startIcs}/${endIcs}&details=${encodeURIComponent(
      event.description + "\n\nRSVP & Details: " + "https://zenithenopen.ist.edu" + event.rsvpLink
    )}&location=${encodeURIComponent(event.location)}`;

    if (format === "json") {
      return NextResponse.json({
        success: true,
        event: {
          id: event.id,
          title: event.title,
          date: event.date,
          time: event.time,
          location: event.location,
        },
        calendarUrls: {
          google: googleCalendarUrl,
          ics: `/api/events/${encodeURIComponent(event.id)}/calendar?format=ics`,
        },
      });
    }

    // Generate standard RFC 5545 iCalendar format
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//ZenithenOpen//Campus Events Hub//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${event.id}@zenithenopen.ist`,
      `DTSTAMP:${formatIcsDate(new Date())}`,
      `DTSTART:${startIcs}`,
      `DTEND:${endIcs}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description.replace(/\n/g, "\\n")}`,
      `LOCATION:${event.location}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    return new Response(icsContent, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="${event.id}.ics"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("[GET /api/events/[id]/calendar] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate event calendar export" },
      { status: 500 }
    );
  }
}
