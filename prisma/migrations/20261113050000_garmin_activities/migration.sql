-- CreateTable
CREATE TABLE "garmin_activities" (
    "id" TEXT NOT NULL,
    "summaryId" TEXT NOT NULL,
    "garminUserId" TEXT NOT NULL,
    "userId" TEXT,
    "garminActivityId" TEXT,
    "activityType" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "manual" BOOLEAN NOT NULL DEFAULT false,
    "isWebUpload" BOOLEAN NOT NULL DEFAULT false,
    "deviceName" TEXT,
    "raw" JSONB NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "activityId" TEXT,

    CONSTRAINT "garmin_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "garmin_activities_summaryId_key" ON "garmin_activities"("summaryId");

-- CreateIndex
CREATE UNIQUE INDEX "garmin_activities_activityId_key" ON "garmin_activities"("activityId");

-- CreateIndex
CREATE INDEX "garmin_activities_garminUserId_startTime_idx" ON "garmin_activities"("garminUserId", "startTime");

-- CreateIndex
CREATE INDEX "garmin_activities_userId_startTime_idx" ON "garmin_activities"("userId", "startTime");

-- AddForeignKey
ALTER TABLE "garmin_activities" ADD CONSTRAINT "garmin_activities_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "garmin_activities" ADD CONSTRAINT "garmin_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

