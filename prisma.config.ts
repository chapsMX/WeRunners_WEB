import path from "node:path";
import { defineConfig } from "prisma/config";

// Prisma 7 configuration
// DATABASE_URL is sourced from .env.local (local) or Vercel (production)
export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
});
