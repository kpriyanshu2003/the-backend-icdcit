/*
  Warnings:

  - A unique constraint covering the columns `[phNo]` on the table `Doctor` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Doctor_phNo_key" ON "Doctor"("phNo");
