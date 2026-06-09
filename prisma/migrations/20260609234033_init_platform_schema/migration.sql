-- CreateEnum
CREATE TYPE "Role" AS ENUM ('RUNNER', 'CLUB_ADMIN', 'ADMIN');

-- CreateEnum
CREATE TYPE "DistanceUnit" AS ENUM ('KM', 'MILES');

-- CreateEnum
CREATE TYPE "ClubType" AS ENUM ('RECREATIONAL', 'COMPETITIVE', 'TRAIL', 'TRIATHLON');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('RUN', 'TRAIL', 'TREADMILL', 'RACE');

-- CreateEnum
CREATE TYPE "ActivitySource" AS ENUM ('MANUAL', 'STRAVA', 'GARMIN', 'COROS');

-- CreateEnum
CREATE TYPE "PRDistance" AS ENUM ('M400', 'HALF_MILE', 'K1', 'MILE', 'K2', 'K5', 'K10', 'K15', 'MILE10', 'K20', 'HALF_MARATHON', 'K30', 'MARATHON', 'ULTRA');

-- CreateEnum
CREATE TYPE "PRSource" AS ENUM ('AUTO', 'MANUAL');

-- CreateEnum
CREATE TYPE "PeriodType" AS ENUM ('WEEKLY', 'MONTHLY', 'YEARLY', 'ALL_TIME');

-- CreateEnum
CREATE TYPE "LeaderboardCategory" AS ENUM ('DISTANCE', 'PACE', 'ELEVATION', 'MARATHONS', 'CONSISTENCY', 'DISTANCE_PER_MEMBER');

-- AlterTable
ALTER TABLE "WaitlistEntry" ADD COLUMN     "convertedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "username" TEXT,
    "bio" TEXT,
    "role" "Role" NOT NULL DEFAULT 'RUNNER',
    "preferredUnit" "DistanceUnit" NOT NULL DEFAULT 'KM',
    "locale" TEXT NOT NULL DEFAULT 'es',
    "timezone" TEXT NOT NULL DEFAULT 'America/Mexico_City',
    "betaAccess" BOOLEAN NOT NULL DEFAULT false,
    "lastActiveAt" TIMESTAMP(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "idToken" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clubs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "city" TEXT,
    "country" TEXT NOT NULL DEFAULT 'MX',
    "clubType" "ClubType" NOT NULL DEFAULT 'RECREATIONAL',
    "instagram" TEXT,
    "twitter" TEXT,
    "tiktok" TEXT,
    "facebook" TEXT,
    "contactEmail" TEXT,
    "initialMemberCount" INTEGER,
    "memberCount" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clubs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_memberships" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lockExpiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "club_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clubId" TEXT,
    "distanceMeters" INTEGER NOT NULL,
    "durationSeconds" INTEGER NOT NULL,
    "elevationGainMeters" INTEGER,
    "elevationLossMeters" INTEGER,
    "activityDate" TIMESTAMP(3) NOT NULL,
    "title" TEXT,
    "activityType" "ActivityType" NOT NULL DEFAULT 'RUN',
    "source" "ActivitySource" NOT NULL DEFAULT 'MANUAL',
    "externalId" TEXT,
    "avgPaceSecPerKm" INTEGER,
    "avgHeartRate" INTEGER,
    "maxHeartRate" INTEGER,
    "avgCadence" INTEGER,
    "calories" INTEGER,
    "startLat" DOUBLE PRECISION,
    "startLng" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personal_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityId" TEXT,
    "distance" "PRDistance" NOT NULL,
    "durationSeconds" INTEGER NOT NULL,
    "achievedAt" TIMESTAMP(3) NOT NULL,
    "source" "PRSource" NOT NULL DEFAULT 'AUTO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "personal_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_stats" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "periodType" "PeriodType" NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "totalDistanceMeters" INTEGER NOT NULL DEFAULT 0,
    "totalActivities" INTEGER NOT NULL DEFAULT 0,
    "totalDurationSeconds" INTEGER NOT NULL DEFAULT 0,
    "activeMembers" INTEGER NOT NULL DEFAULT 0,
    "avgPaceSecPerKm" INTEGER,
    "bestPaceSecPerKm" INTEGER,
    "totalElevationMeters" INTEGER NOT NULL DEFAULT 0,
    "races5k" INTEGER NOT NULL DEFAULT 0,
    "races10k" INTEGER NOT NULL DEFAULT 0,
    "racesHalfMarathon" INTEGER NOT NULL DEFAULT 0,
    "racesMarathon" INTEGER NOT NULL DEFAULT 0,
    "racesUltra" INTEGER NOT NULL DEFAULT 0,
    "avgActivitiesPerMember" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "weeksWithActivity" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "club_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leaderboard_entries" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "periodType" "PeriodType" NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "category" "LeaderboardCategory" NOT NULL,
    "rank" INTEGER NOT NULL,
    "previousRank" INTEGER,
    "totalDistanceMeters" INTEGER,
    "avgPaceSecPerKm" INTEGER,
    "totalElevationMeters" INTEGER,
    "racesMarathon" INTEGER,
    "weeksWithActivity" INTEGER,
    "distancePerMember" DOUBLE PRECISION,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leaderboard_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_snapshots" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clubId" TEXT,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "totalDistanceMeters" INTEGER NOT NULL DEFAULT 0,
    "totalActivities" INTEGER NOT NULL DEFAULT 0,
    "totalDurationSeconds" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weekly_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "clubs_slug_key" ON "clubs"("slug");

-- CreateIndex
CREATE INDEX "club_memberships_clubId_idx" ON "club_memberships"("clubId");

-- CreateIndex
CREATE INDEX "club_memberships_userId_idx" ON "club_memberships"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "club_memberships_userId_isActive_key" ON "club_memberships"("userId", "isActive");

-- CreateIndex
CREATE INDEX "activities_userId_activityDate_idx" ON "activities"("userId", "activityDate");

-- CreateIndex
CREATE INDEX "activities_clubId_activityDate_idx" ON "activities"("clubId", "activityDate");

-- CreateIndex
CREATE UNIQUE INDEX "activities_userId_source_externalId_key" ON "activities"("userId", "source", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "personal_records_activityId_key" ON "personal_records"("activityId");

-- CreateIndex
CREATE INDEX "personal_records_userId_idx" ON "personal_records"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "personal_records_userId_distance_key" ON "personal_records"("userId", "distance");

-- CreateIndex
CREATE INDEX "club_stats_clubId_periodType_idx" ON "club_stats"("clubId", "periodType");

-- CreateIndex
CREATE UNIQUE INDEX "club_stats_clubId_periodType_periodStart_key" ON "club_stats"("clubId", "periodType", "periodStart");

-- CreateIndex
CREATE INDEX "leaderboard_entries_periodType_periodStart_category_rank_idx" ON "leaderboard_entries"("periodType", "periodStart", "category", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "leaderboard_entries_clubId_periodType_periodStart_category_key" ON "leaderboard_entries"("clubId", "periodType", "periodStart", "category");

-- CreateIndex
CREATE INDEX "weekly_snapshots_userId_weekStart_idx" ON "weekly_snapshots"("userId", "weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "weekly_snapshots_userId_weekStart_key" ON "weekly_snapshots"("userId", "weekStart");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_memberships" ADD CONSTRAINT "club_memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_memberships" ADD CONSTRAINT "club_memberships_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_records" ADD CONSTRAINT "personal_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_records" ADD CONSTRAINT "personal_records_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_stats" ADD CONSTRAINT "club_stats_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaderboard_entries" ADD CONSTRAINT "leaderboard_entries_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_snapshots" ADD CONSTRAINT "weekly_snapshots_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_snapshots" ADD CONSTRAINT "weekly_snapshots_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
