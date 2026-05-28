import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { sql } from "@/lib/db";
import { resend } from "@/lib/resend";

export async function GET() {
  try {
    const rows = await sql`
      SELECT id, "clubName", city
      FROM "ClubRegistration"
      WHERE enabled = true
      ORDER BY "clubName"
    `;
    return NextResponse.json(rows);
  } catch (error) {
    console.error("[clubs] GET error:", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    const clubName  = form.get("clubName")  as string;
    const city      = form.get("city")      as string;
    const email     = form.get("email")     as string;
    const runners   = form.get("runners")   as string | null;
    const instagram = form.get("instagram") as string | null;
    const twitter   = form.get("twitter")   as string | null;
    const tiktok    = form.get("tiktok")    as string | null;
    const facebook  = form.get("facebook")  as string | null;
    const logo      = form.get("logo")      as File | null;

    if (!clubName || !city || !email) {
      return NextResponse.json(
        { error: "Club name, city and email are required." },
        { status: 400 }
      );
    }

    // Upload logo to Vercel Blob if provided
    let logoUrl: string | null = null;
    if (logo && logo.size > 0) {
      const blob = await put(`clubs/${Date.now()}-${logo.name}`, logo, {
        access: "public",
      });
      logoUrl = blob.url;
    }

    const trim = (v: string | null) => v?.trim() || null;

    await sql`
      INSERT INTO "ClubRegistration"
        (id, "clubName", city, email, runners, "logoUrl", instagram, twitter, tiktok, facebook, "createdAt")
      VALUES (
        gen_random_uuid()::text,
        ${clubName.trim()},
        ${city.trim()},
        ${email.trim().toLowerCase()},
        ${runners ? parseInt(runners) : null},
        ${logoUrl},
        ${trim(instagram)},
        ${trim(twitter)},
        ${trim(tiktok)},
        ${trim(facebook)},
        NOW()
      )
    `;

    // Send notification email — non-blocking, failure doesn't affect the response
    const social = [
      instagram && `Instagram: ${instagram}`,
      twitter   && `Twitter/X: ${twitter}`,
      tiktok    && `TikTok: ${tiktok}`,
      facebook  && `Facebook: ${facebook}`,
    ].filter(Boolean).join("\n") || "—";

    resend.emails.send({
      from:    "w3runn3rs <noreply@w3runn3rs.com>",
      to:      "run@w3runn3rs.com",
      subject: `🏃 New club registration: ${clubName.trim()}`,
      text: [
        `New club registration on w3runn3rs`,
        ``,
        `Club name : ${clubName.trim()}`,
        `City      : ${city.trim()}`,
        `Email     : ${email.trim().toLowerCase()}`,
        `Runners   : ${runners || "—"}`,
        `Logo      : ${logoUrl || "—"}`,
        ``,
        `Social media`,
        social,
        ``,
        `Submitted at: ${new Date().toISOString()}`,
      ].join("\n"),
    }).catch((err) => console.error("[clubs] email error:", err));

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "23505"
    ) {
      return NextResponse.json(
        { error: "A club with this email is already registered." },
        { status: 409 }
      );
    }

    console.error("[clubs] POST error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
