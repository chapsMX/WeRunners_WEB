import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { resend } from "@/lib/resend";
import { waitlistWelcomeHtml, waitlistWelcomeSubject } from "@/emails/waitlistWelcome";
import { waitlistNotificationHtml, waitlistNotificationSubject } from "@/emails/waitlistNotification";

export async function POST(req: NextRequest) {
  try {
    const { email, name, clubId } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    const normalized = email.trim().toLowerCase();

    await sql`
      INSERT INTO "WaitlistEntry" (id, email, name, "clubId", "createdAt")
      VALUES (gen_random_uuid()::text, ${normalized}, ${name?.trim() || null}, ${clubId || null}, NOW())
    `;

    // Fire both emails concurrently — failures don't block the 201 response
    await Promise.allSettled([
      resend.emails.send({
        from:    "w3runn3rs <noreply@w3runn3rs.com>",
        to:      normalized,
        subject: waitlistWelcomeSubject,
        html:    waitlistWelcomeHtml(name?.trim()),
      }),
      resend.emails.send({
        from:    "w3runn3rs <noreply@w3runn3rs.com>",
        to:      "run@w3runn3rs.com",
        subject: waitlistNotificationSubject(normalized),
        html:    waitlistNotificationHtml({ email: normalized, name: name?.trim(), clubId }),
      }),
    ]);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: unknown) {
    // PostgreSQL unique violation code
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "23505"
    ) {
      return NextResponse.json(
        { error: "This email is already on the waitlist." },
        { status: 409 }
      );
    }

    console.error("[waitlist] POST error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
