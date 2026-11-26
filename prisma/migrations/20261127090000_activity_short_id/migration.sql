-- AlterTable
ALTER TABLE "activities" ADD COLUMN     "shortId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "activities_shortId_key" ON "activities"("shortId");

