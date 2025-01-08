-- AlterTable
ALTER TABLE "LabResult" ADD COLUMN     "appointmentId" TEXT;

-- AddForeignKey
ALTER TABLE "LabResult" ADD CONSTRAINT "LabResult_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
