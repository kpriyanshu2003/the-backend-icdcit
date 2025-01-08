/*
  Warnings:

  - You are about to drop the column `appointmentId` on the `LabResult` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "LabResult" DROP CONSTRAINT "LabResult_appointmentId_fkey";

-- AlterTable
ALTER TABLE "LabResult" DROP COLUMN "appointmentId",
ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "LabResult" ADD CONSTRAINT "LabResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
