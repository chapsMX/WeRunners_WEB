-- CreateTable
CREATE TABLE "ClubRegistration" (
    "id" TEXT NOT NULL,
    "clubName" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "runners" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClubRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClubRegistration_email_key" ON "ClubRegistration"("email");
