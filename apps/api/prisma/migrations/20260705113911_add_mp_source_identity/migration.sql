/*
  Warnings:

  - A unique constraint covering the columns `[source,name,constituency]` on the table `Mp` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Mp_source_name_constituency_key" ON "Mp"("source", "name", "constituency");
