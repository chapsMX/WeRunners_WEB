-- CreateTable
CREATE TABLE "activity_routes" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "source" "ActivitySource" NOT NULL,
    "path" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "pointCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_routes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "activity_routes_activityId_key" ON "activity_routes"("activityId");

-- AddForeignKey
ALTER TABLE "activity_routes" ADD CONSTRAINT "activity_routes_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

