-- AlterTable
ALTER TABLE "WaitlistEntry" ADD COLUMN     "inviteClubId" TEXT;

-- AddForeignKey
ALTER TABLE "WaitlistEntry" ADD CONSTRAINT "WaitlistEntry_inviteClubId_fkey" FOREIGN KEY ("inviteClubId") REFERENCES "clubs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

