-- AlterTable
ALTER TABLE "AmbassadorApplication" ADD COLUMN     "clubId" TEXT,
ADD COLUMN     "clubRegistrationId" TEXT,
ADD COLUMN     "userId" TEXT,
ALTER COLUMN "fullName" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "country" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AmbassadorApplication_userId_key" ON "AmbassadorApplication"("userId");

-- AddForeignKey
ALTER TABLE "AmbassadorApplication" ADD CONSTRAINT "AmbassadorApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmbassadorApplication" ADD CONSTRAINT "AmbassadorApplication_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmbassadorApplication" ADD CONSTRAINT "AmbassadorApplication_clubRegistrationId_fkey" FOREIGN KEY ("clubRegistrationId") REFERENCES "ClubRegistration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

