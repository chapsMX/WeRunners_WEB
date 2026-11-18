-- AlterTable
ALTER TABLE "device_connections_polar" ADD COLUMN     "deregisteredAt" TIMESTAMP(3),
ADD COLUMN     "tokenExpiresAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "polar_webhook_events" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,

    CONSTRAINT "polar_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "polar_activities" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "polarUserId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "deviceName" TEXT,
    "raw" JSONB NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "activityId" TEXT NOT NULL,

    CONSTRAINT "polar_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "polar_webhook_events_processedAt_receivedAt_idx" ON "polar_webhook_events"("processedAt", "receivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "polar_activities_exerciseId_key" ON "polar_activities"("exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "polar_activities_activityId_key" ON "polar_activities"("activityId");

-- CreateIndex
CREATE INDEX "polar_activities_polarUserId_startTime_idx" ON "polar_activities"("polarUserId", "startTime");

-- AddForeignKey
ALTER TABLE "polar_activities" ADD CONSTRAINT "polar_activities_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

