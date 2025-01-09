/*
  Warnings:

  - You are about to drop the column `doctorName` on the `Appointment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "doctorName",
ADD COLUMN     "doctorId" TEXT;

-- AlterTable
ALTER TABLE "LabResult" ALTER COLUMN "value" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "Doctor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phNo" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,

    CONSTRAINT "Doctor_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
