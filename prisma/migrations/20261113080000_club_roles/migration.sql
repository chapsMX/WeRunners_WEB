-- CreateEnum
CREATE TYPE "ClubRole" AS ENUM ('MEMBER', 'ADMIN');

-- AlterTable
ALTER TABLE "club_memberships" ADD COLUMN     "role" "ClubRole" NOT NULL DEFAULT 'MEMBER';

-- AlterTable
ALTER TABLE "clubs" ADD COLUMN     "ownerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "clubs_ownerId_key" ON "clubs"("ownerId");

-- AddForeignKey
ALTER TABLE "clubs" ADD CONSTRAINT "clubs_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

