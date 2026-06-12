/*
  Warnings:

  - You are about to drop the column `betaAccess` on the `user` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "DeviceProvider" AS ENUM ('GARMIN', 'POLAR', 'OURA', 'WHOOP', 'COROS', 'SUUNTO', 'STRAVA', 'APPLE_HEALTH', 'GOOGLE_FIT');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActivitySource" ADD VALUE 'POLAR';
ALTER TYPE "ActivitySource" ADD VALUE 'OURA';
ALTER TYPE "ActivitySource" ADD VALUE 'WHOOP';
ALTER TYPE "ActivitySource" ADD VALUE 'SUUNTO';
ALTER TYPE "ActivitySource" ADD VALUE 'APPLE_HEALTH';
ALTER TYPE "ActivitySource" ADD VALUE 'GOOGLE_FIT';

-- AlterTable
ALTER TABLE "user" DROP COLUMN "betaAccess",
ADD COLUMN     "connectedDevice" "DeviceProvider",
ADD COLUMN     "connectedDeviceExpiresAt" TIMESTAMP(3),
ADD COLUMN     "connectedDeviceLastSync" TIMESTAMP(3),
ADD COLUMN     "connectedDeviceRefresh" TEXT,
ADD COLUMN     "connectedDeviceToken" TEXT;

-- CreateTable
CREATE TABLE "app_config" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "betaOpen" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_config_pkey" PRIMARY KEY ("id")
);
