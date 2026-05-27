// Neon serverless driver — reads DATABASE_URL from process.env automatically
// Set DATABASE_URL in .env.local (local) or Vercel env vars (production)

import { neon } from "@neondatabase/serverless";

export const sql = neon(process.env.DATABASE_URL!);
