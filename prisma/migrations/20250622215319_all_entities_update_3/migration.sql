/*
  Warnings:

  - Added the required column `name` to the `Moderator` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Moderator` ADD COLUMN `name` VARCHAR(191) NOT NULL;
