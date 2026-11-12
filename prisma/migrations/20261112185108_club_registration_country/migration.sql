-- Country of each registered club (ISO 3166-1 alpha-2). Required.
-- Existing registrations: the active Mexican clubs default to MX; Hayahay
-- (Davao) is in the Philippines. The default is dropped afterwards so every
-- new registration must send a country.
ALTER TABLE "ClubRegistration" ADD COLUMN "country" TEXT NOT NULL DEFAULT 'MX';

UPDATE "ClubRegistration" SET "country" = 'PH' WHERE "clubName" = 'Hayahay';

ALTER TABLE "ClubRegistration" ALTER COLUMN "country" DROP DEFAULT;
