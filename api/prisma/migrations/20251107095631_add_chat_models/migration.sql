/*
  Warnings:

  - Added the required column `propertyId` to the `Conversation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Conversation` ADD COLUMN `propertyId` INTEGER NOT NULL,
    MODIFY `buyerId` INTEGER NULL;
