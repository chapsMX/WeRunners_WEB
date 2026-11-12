-- One active membership per runner, any number of past ones.
-- Replaces @@unique([userId, isActive]), which also blocked a second inactive row.
DROP INDEX "club_memberships_userId_isActive_key";

ALTER TABLE "club_memberships" ADD COLUMN "activeUserId" TEXT;

-- Backfill: active memberships carry their userId (none exist today).
UPDATE "club_memberships" SET "activeUserId" = "userId" WHERE "isActive" = true;

CREATE UNIQUE INDEX "club_memberships_activeUserId_key" ON "club_memberships"("activeUserId");

-- Platform club ↔ landing registration ("for clubs" form).
ALTER TABLE "clubs" ADD COLUMN "registrationId" TEXT;

CREATE UNIQUE INDEX "clubs_registrationId_key" ON "clubs"("registrationId");

ALTER TABLE "clubs" ADD CONSTRAINT "clubs_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "ClubRegistration"("id") ON DELETE SET NULL ON UPDATE CASCADE;
