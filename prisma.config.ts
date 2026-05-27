import path from "node:path";
import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";

// Load .env so DATABASE_URL_UNPOOLED is available at config-eval time
dotenv.config();

// Prisma 7 configuration
// DATABASE_URL_UNPOOLED → direct connection (no pgBouncer) used for migrations
// DATABASE_URL          → pooled connection used by PrismaClient at runtime

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL_UNPOOLED!,
  },
});
