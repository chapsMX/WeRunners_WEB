-- CreateTable
CREATE TABLE "club_owner_invites" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "invitedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "club_owner_invites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "club_owner_invites_email_key" ON "club_owner_invites"("email");

-- CreateIndex
CREATE INDEX "club_owner_invites_clubId_idx" ON "club_owner_invites"("clubId");

-- AddForeignKey
ALTER TABLE "club_owner_invites" ADD CONSTRAINT "club_owner_invites_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

