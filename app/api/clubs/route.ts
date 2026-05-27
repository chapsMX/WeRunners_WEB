import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { sql } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    const clubName = form.get("clubName") as string;
    const city     = form.get("city")     as string;
    const email    = form.get("email")    as string;
    const runners  = form.get("runners")  as string | null;
    const logo     = form.get("logo")     as File | null;

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

    await sql`
      INSERT INTO "ClubRegistration" (id, "clubName", city, email, runners, "logoUrl", "createdAt")
      VALUES (
        gen_random_uuid()::text,
        ${clubName.trim()},
        ${city.trim()},
        ${email.trim().toLowerCase()},
        ${runners ? parseInt(runners) : null},
        ${logoUrl},
        NOW()
      )
    `;

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
