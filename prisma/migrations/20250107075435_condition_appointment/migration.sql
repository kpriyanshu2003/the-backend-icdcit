/*
  Warnings:

  - Added the required column `category` to the `Appointment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AppointmentCategory" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'ANNUALLY', 'QUARTERLY', 'BI_ANNUALLY', 'AS_NEEDED');

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "category" "AppointmentCategory" NOT NULL,
ADD COLUMN     "conditionId" TEXT;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_conditionId_fkey" FOREIGN KEY ("conditionId") REFERENCES "Condition"("id") ON DELETE SET NULL ON UPDATE CASCADE;
