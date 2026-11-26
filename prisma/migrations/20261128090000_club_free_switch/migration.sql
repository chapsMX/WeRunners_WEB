-- AlterTable
ALTER TABLE "clubs" ADD COLUMN     "freeSwitch" BOOLEAN NOT NULL DEFAULT false;


-- Solo Running Club: the one club runners can leave anytime
UPDATE "clubs" SET "freeSwitch" = true WHERE "slug" = 'solo-running-club';
