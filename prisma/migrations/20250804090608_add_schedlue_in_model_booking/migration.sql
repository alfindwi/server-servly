/*
  Warnings:

  - Added the required column `scheduledAt` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "scheduledAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "bookingDate" SET DEFAULT CURRENT_TIMESTAMP;
