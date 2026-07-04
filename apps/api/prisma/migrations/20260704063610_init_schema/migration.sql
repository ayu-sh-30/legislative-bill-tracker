/*
  Warnings:

  - A unique constraint covering the columns `[source,sourceUrl]` on the table `Bill` will be added. If there are existing duplicate values, this will fail.
  - Made the column `sourceUrl` on table `Bill` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Bill" ALTER COLUMN "sourceUrl" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Bill_source_sourceUrl_key" ON "Bill"("source", "sourceUrl");
