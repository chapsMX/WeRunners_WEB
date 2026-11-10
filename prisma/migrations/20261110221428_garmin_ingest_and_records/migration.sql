-- CreateEnum
CREATE TYPE "ExclusionReason" AS ENUM ('MANUAL', 'WEB_UPLOAD', 'NO_CLUB', 'BEFORE_JOIN', 'DUPLICATE', 'IMPLAUSIBLE_PACE');

-- AlterEnum
ALTER TYPE "PRDistance" ADD VALUE 'LONGEST_RUN';

-- DropIndex
DROP INDEX "personal_records_activityId_key";

-- AlterTable
ALTER TABLE "activities" ADD COLUMN     "countsForLeaderboard" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deviceName" TEXT,
ADD COLUMN     "exclusionReason" "ExclusionReason",
ADD COLUMN     "isManual" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isWebUpload" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parentExternalId" TEXT,
ADD COLUMN     "providerActivityType" TEXT,
ADD COLUMN     "startTimeOffsetSeconds" INTEGER,
ALTER COLUMN "source" DROP DEFAULT;

-- AlterTable
ALTER TABLE "device_connections_garmin" ADD COLUMN     "deregisteredAt" TIMESTAMP(3),
ADD COLUMN     "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "permissionsUpdatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "personal_records" ADD COLUMN     "distanceMeters" INTEGER,
ALTER COLUMN "durationSeconds" DROP NOT NULL,
ALTER COLUMN "achievedAt" DROP NOT NULL;

-- CreateTable
CREATE TABLE "garmin_webhook_events" (
    "id" TEXT NOT NULL,
    "summaryType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,

    CONSTRAINT "garmin_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "garmin_webhook_events_processedAt_receivedAt_idx" ON "garmin_webhook_events"("processedAt", "receivedAt");

-- CreateIndex
CREATE INDEX "personal_records_activityId_idx" ON "personal_records"("activityId");
