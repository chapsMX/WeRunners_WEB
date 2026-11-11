import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { resend } from "@/lib/resend";
import { parseAmbassadorInput } from "@/lib/ambassadors";
import { ambassadorConfirmationHtml, ambassadorConfirmationSubject } from "@/emails/ambassadorConfirmation";
import { ambassadorNotificationHtml, ambassadorNotificationSubject } from "@/emails/ambassadorNotification";

// Ambassador program applications → AmbassadorApplication (status "pending").
// Same pattern as /api/waitlist: insert, then fire both emails without
// blocking the response on them.
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = parseAmbassadorInput(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const a = parsed.data;

  try {
    await sql`
      INSERT INTO "AmbassadorApplication"
        (id, "fullName", email, country, instagram, twitter, tiktok, motivation, "createdAt", "updatedAt")
      VALUES
        (gen_random_uuid()::text, ${a.fullName}, ${a.email}, ${a.country}, ${a.instagram},
         ${a.twitter}, ${a.tiktok}, ${a.motivation}, NOW(), NOW())
    `;
  } catch (error: unknown) {
    // PostgreSQL unique violation → this email already applied
    if (typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "23505") {
      return NextResponse.json({ error: "This email has already applied." }, { status: 409 });
    }
    console.error("[ambassadors] insert failed:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  // Email failures don't fail the application (it's already saved).
  const results = await Promise.allSettled([
    resend.emails.send({
      from: "w3runn3rs <noreply@w3runn3rs.com>",
      to: a.email,
      subject: ambassadorConfirmationSubject,
      html: ambassadorConfirmationHtml(a.fullName),
    }),
    resend.emails.send({
      from: "w3runn3rs <noreply@w3runn3rs.com>",
      to: "run@w3runn3rs.com",
      replyTo: a.email,
      subject: ambassadorNotificationSubject(a.fullName),
      html: ambassadorNotificationHtml(a),
    }),
  ]);
  for (const r of results) {
    if (r.status === "rejected") console.error("[ambassadors] email failed:", r.reason);
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
