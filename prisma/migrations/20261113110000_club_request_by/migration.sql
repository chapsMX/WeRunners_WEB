-- AlterTable
ALTER TABLE "ClubRegistration" ADD COLUMN     "requestedById" TEXT;

-- AddForeignKey
ALTER TABLE "ClubRegistration" ADD CONSTRAINT "ClubRegistration_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

