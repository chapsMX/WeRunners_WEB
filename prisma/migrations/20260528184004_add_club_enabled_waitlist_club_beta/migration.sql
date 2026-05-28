-- AlterTable
ALTER TABLE "ClubRegistration" ADD COLUMN     "enabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "WaitlistEntry" ADD COLUMN     "betaAccess" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "clubId" TEXT;

-- AddForeignKey
ALTER TABLE "WaitlistEntry" ADD CONSTRAINT "WaitlistEntry_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "ClubRegistration"("id") ON DELETE SET NULL ON UPDATE CASCADE;
