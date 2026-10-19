/**
 * Campus Events & Workshop Hub API Test Suite
 * Location: tests/backend/events-hub.test.ts
 *
 * Validates dynamic events discovery, category filtering, search queries,
 * interactive RSVP registrations, duplicate prevention, and iCalendar generation.
 */

import { TestSuite, SuiteResult } from "./test-utils";
import { GET as getEvents, resetEventsStore } from "../../app/api/events/route";
import { POST as postRsvp } from "../../app/api/events/rsvp/route";
import { GET as getCalendar } from "../../app/api/events/[id]/calendar/route";
import { NextRequest } from "next/server";

export async function runEventsHubTests(): Promise<SuiteResult> {
  const suite = new TestSuite("Campus Events & Workshop Hub API");
  suite.start();

  // Reset in-memory events store to clean baseline
  resetEventsStore();

  // --- 1. Baseline Events Fetch ---
  const defaultReq = new NextRequest("http://localhost:3000/api/events");
  const defaultRes = await getEvents(defaultReq);
  suite.assertEqual(defaultRes.status, 200, "GET /api/events returns 200 OK");

  const defaultData = await defaultRes.json();
  suite.assertEqual(defaultData.success, true, "Events response reports success: true");
  suite.assert(Array.isArray(defaultData.events), "Events is an array");
  suite.assert(defaultData.events.length >= 4, "Returns at least 4 default campus events");
  suite.assertEqual(defaultData.events.length, defaultData.count, "Count matches events array length");

  // Schema verification on first event
  const evt = defaultData.events[0];
  suite.assert(Boolean(evt.id), "Event has unique ID");
  suite.assert(Boolean(evt.title), "Event has title");
  suite.assert(Boolean(evt.category), "Event has category");
  suite.assert(Boolean(evt.categoryLabel), "Event has human-readable categoryLabel");
  suite.assert(Boolean(evt.date), "Event has date string");
  suite.assert(Boolean(evt.time), "Event has time string");
  suite.assert(Boolean(evt.location), "Event has location string");
  suite.assert(Boolean(evt.description), "Event has description");
  suite.assert(Array.isArray(evt.tags), "Event has tags array");
  suite.assert(typeof evt.capacity === "number" && evt.capacity > 0, "Event has positive capacity");
  suite.assert(typeof evt.rsvpCount === "number" && evt.rsvpCount >= 0, "Event has non-negative rsvpCount");
  suite.assert(Array.isArray(evt.attendees), "Event has attendees array");
  suite.assert(Array.isArray(evt.speakers), "Event has speakers array");
  suite.assert(Boolean(evt.calendarLinks?.google), "Event includes Google Calendar URL");
  suite.assert(Boolean(evt.calendarLinks?.ics), "Event includes .ics export URL");

  // --- 2. Category Filter: Workshops ---
  const workshopReq = new NextRequest("http://localhost:3000/api/events?category=workshop");
  const workshopRes = await getEvents(workshopReq);
  suite.assertEqual(workshopRes.status, 200, "GET /api/events?category=workshop returns 200 OK");
  const workshopData = await workshopRes.json();
  suite.assert(workshopData.events.length > 0, "Finds workshop events");
  suite.assert(
    workshopData.events.every((e: { category: string }) => e.category === "workshop"),
    "All filtered items are strictly workshops"
  );

  // --- 3. Category Filter: Office Hours ---
  const officeHoursReq = new NextRequest("http://localhost:3000/api/events?category=office-hours");
  const officeHoursRes = await getEvents(officeHoursReq);
  suite.assertEqual(officeHoursRes.status, 200, "GET /api/events?category=office-hours returns 200 OK");
  const officeHoursData = await officeHoursRes.json();
  suite.assert(officeHoursData.events.length > 0, "Finds community office hours events");
  suite.assert(
    officeHoursData.events.some((e: { id: string }) => e.id === "evt-open-source-saturday"),
    "Includes Open Source Saturday in office hours"
  );

  // --- 4. Search Filter: 'Git' ---
  const searchReq = new NextRequest("http://localhost:3000/api/events?search=git");
  const searchRes = await getEvents(searchReq);
  suite.assertEqual(searchRes.status, 200, "GET /api/events?search=git returns 200 OK");
  const searchData = await searchRes.json();
  suite.assert(searchData.events.length > 0, "Finds events matching keyword 'git'");
  suite.assert(
    searchData.events.some((e: { title: string }) => e.title.toLowerCase().includes("git")),
    "Search result title contains 'Git'"
  );

  // --- 5. Interactive RSVP Registration ---
  const initialRsvpCount = evt.rsvpCount;
  const testStudentHandle = "test-student-42";

  const rsvpReq = new NextRequest("http://localhost:3000/api/events/rsvp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventId: evt.id,
      username: testStudentHandle,
      name: "Test Developer",
      department: "Information Science",
      email: "test.dev@ist.edu",
    }),
  });

  const rsvpRes = await postRsvp(rsvpReq);
  suite.assertEqual(rsvpRes.status, 200, "POST /api/events/rsvp returns 200 OK");
  const rsvpData = await rsvpRes.json();
  suite.assertEqual(rsvpData.success, true, "RSVP response reports success: true");
  suite.assertEqual(rsvpData.event.rsvpCount, initialRsvpCount + 1, "RSVP count increments by 1");
  suite.assertEqual(rsvpData.attendee.username, testStudentHandle, "Attendee username matches registered student");
  suite.assertEqual(rsvpData.attendee.department, "Information Science", "Attendee department is recorded");

  // Verify attendee appears in GET /api/events
  const verifyReq = new NextRequest("http://localhost:3000/api/events");
  const verifyRes = await getEvents(verifyReq);
  const verifyData = await verifyRes.json();
  const updatedEvt = verifyData.events.find((e: { id: string }) => e.id === evt.id);
  suite.assert(
    updatedEvt.attendees.some((a: { username: string }) => a.username === testStudentHandle),
    "New attendee is persisted in event attendees list"
  );

  // --- 6. Duplicate RSVP Prevention ---
  const duplicateReq = new NextRequest("http://localhost:3000/api/events/rsvp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventId: evt.id,
      username: testStudentHandle,
    }),
  });
  const duplicateRes = await postRsvp(duplicateReq);
  suite.assertEqual(duplicateRes.status, 409, "Duplicate RSVP returns 409 Conflict");
  const duplicateData = await duplicateRes.json();
  suite.assertEqual(duplicateData.success, false, "Duplicate RSVP reports success: false");
  suite.assertEqual(duplicateData.alreadyRegistered, true, "Flag alreadyRegistered is true");

  // --- 7. Validation Edge Cases ---
  const missingEventReq = new NextRequest("http://localhost:3000/api/events/rsvp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "someone" }),
  });
  const missingEventRes = await postRsvp(missingEventReq);
  suite.assertEqual(missingEventRes.status, 400, "Missing eventId returns 400 Bad Request");

  const missingUserReq = new NextRequest("http://localhost:3000/api/events/rsvp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventId: evt.id, username: "" }),
  });
  const missingUserRes = await postRsvp(missingUserReq);
  suite.assertEqual(missingUserRes.status, 400, "Empty username returns 400 Bad Request");

  const invalidEventReq = new NextRequest("http://localhost:3000/api/events/rsvp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventId: "evt-non-existent-999", username: "validuser" }),
  });
  const invalidEventRes = await postRsvp(invalidEventReq);
  suite.assertEqual(invalidEventRes.status, 404, "Non-existent eventId returns 404 Not Found");

  // --- 8. Calendar Export APIs ---
  const calJsonReq = new NextRequest(`http://localhost:3000/api/events/${evt.id}/calendar?format=json`);
  const calJsonRes = await getCalendar(calJsonReq, { params: Promise.resolve({ id: evt.id }) });
  suite.assertEqual(calJsonRes.status, 200, "GET /api/events/[id]/calendar?format=json returns 200 OK");
  const calJsonData = await calJsonRes.json();
  suite.assertEqual(calJsonData.success, true, "Calendar JSON reports success: true");
  suite.assert(
    calJsonData.calendarUrls.google.includes("calendar.google.com"),
    "Google Calendar link points to render endpoint"
  );

  const calIcsReq = new NextRequest(`http://localhost:3000/api/events/${evt.id}/calendar?format=ics`);
  const calIcsRes = await getCalendar(calIcsReq, { params: Promise.resolve({ id: evt.id }) });
  suite.assertEqual(calIcsRes.status, 200, "GET /api/events/[id]/calendar?format=ics returns 200 OK");
  suite.assert(
    (calIcsRes.headers.get("content-type") || "").includes("text/calendar"),
    "Response header Content-Type is text/calendar"
  );
  const icsText = await calIcsRes.text();
  suite.assert(icsText.includes("BEGIN:VCALENDAR"), "Output contains BEGIN:VCALENDAR");
  suite.assert(icsText.includes("END:VCALENDAR"), "Output contains END:VCALENDAR");
  suite.assert(icsText.includes(evt.title), "Output includes event title");

  // Non-existent calendar export returns 404
  const cal404Req = new NextRequest("http://localhost:3000/api/events/evt-fake-123/calendar");
  const cal404Res = await getCalendar(cal404Req, { params: Promise.resolve({ id: "evt-fake-123" }) });
  suite.assertEqual(cal404Res.status, 404, "Non-existent calendar route returns 404 Not Found");

  return suite.summary();
}

if (process.argv[1]?.endsWith("events-hub.test.ts")) {
  runEventsHubTests().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
