-- AlterTable
ALTER TABLE "user" ADD COLUMN     "onboardingCompletedAt" TIMESTAMP(3),
ALTER COLUMN "locale" SET DEFAULT 'en';
