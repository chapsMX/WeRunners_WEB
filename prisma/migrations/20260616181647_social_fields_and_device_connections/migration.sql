/*
  Warnings:

  - You are about to drop the column `connectedDevice` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `connectedDeviceExpiresAt` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `connectedDeviceLastSync` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `connectedDeviceRefresh` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `connectedDeviceToken` on the `user` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PolarRegistrationStatus" AS ENUM ('PENDING', 'REGISTERED');

-- AlterTable
ALTER TABLE "user" DROP COLUMN "connectedDevice",
DROP COLUMN "connectedDeviceExpiresAt",
DROP COLUMN "connectedDeviceLastSync",
DROP COLUMN "connectedDeviceRefresh",
DROP COLUMN "connectedDeviceToken",
ADD COLUMN     "connectedProvider" "DeviceProvider",
ADD COLUMN     "facebookProfileUrl" TEXT,
ADD COLUMN     "instagramHandle" TEXT,
ADD COLUMN     "stravaProfileUrl" TEXT,
ADD COLUMN     "twitterHandle" TEXT;

-- CreateTable
CREATE TABLE "device_connections_garmin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "garminUserId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3) NOT NULL,
    "refreshTokenExpiresAt" TIMESTAMP(3) NOT NULL,
    "scope" TEXT,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSyncAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "device_connections_garmin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_connections_polar" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "polarUserId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "registrationStatus" "PolarRegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registeredAt" TIMESTAMP(3),
    "lastSyncAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "device_connections_polar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_connections_strava" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stravaAthleteId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3) NOT NULL,
    "scope" TEXT,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSyncAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "device_connections_strava_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "device_connections_garmin_userId_key" ON "device_connections_garmin"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "device_connections_garmin_garminUserId_key" ON "device_connections_garmin"("garminUserId");

-- CreateIndex
CREATE UNIQUE INDEX "device_connections_polar_userId_key" ON "device_connections_polar"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "device_connections_polar_polarUserId_key" ON "device_connections_polar"("polarUserId");

-- CreateIndex
CREATE UNIQUE INDEX "device_connections_polar_memberId_key" ON "device_connections_polar"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "device_connections_strava_userId_key" ON "device_connections_strava"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "device_connections_strava_stravaAthleteId_key" ON "device_connections_strava"("stravaAthleteId");

-- AddForeignKey
ALTER TABLE "device_connections_garmin" ADD CONSTRAINT "device_connections_garmin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_connections_polar" ADD CONSTRAINT "device_connections_polar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_connections_strava" ADD CONSTRAINT "device_connections_strava_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
