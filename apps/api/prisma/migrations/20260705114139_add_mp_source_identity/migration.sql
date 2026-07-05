/*
  Warnings:

  - Made the column `constituency` on table `Mp` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Mp" ALTER COLUMN "constituency" SET NOT NULL;
