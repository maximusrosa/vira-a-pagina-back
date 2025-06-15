/*
  Warnings:

  - You are about to drop the column `authorizerId` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `authorizerId` on the `Exchange` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Moderator` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Student` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `Moderator` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uniCard]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Moderator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `Moderator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contact` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `course` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uniCard` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Book` DROP FOREIGN KEY `Book_authorizerId_fkey`;

-- DropForeignKey
ALTER TABLE `Book` DROP FOREIGN KEY `Book_ownerId_fkey`;

-- DropForeignKey
ALTER TABLE `Exchange` DROP FOREIGN KEY `Exchange_authorizerId_fkey`;

-- DropForeignKey
ALTER TABLE `Exchange` DROP FOREIGN KEY `Exchange_providerId_fkey`;

-- DropForeignKey
ALTER TABLE `Exchange` DROP FOREIGN KEY `Exchange_requesterId_fkey`;

-- DropForeignKey
ALTER TABLE `Moderator` DROP FOREIGN KEY `Moderator_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Student` DROP FOREIGN KEY `Student_userId_fkey`;

-- DropIndex
DROP INDEX `Book_authorizerId_fkey` ON `Book`;

-- DropIndex
DROP INDEX `Book_ownerId_fkey` ON `Book`;

-- DropIndex
DROP INDEX `Exchange_authorizerId_fkey` ON `Exchange`;

-- DropIndex
DROP INDEX `Exchange_providerId_fkey` ON `Exchange`;

-- DropIndex
DROP INDEX `Exchange_requesterId_fkey` ON `Exchange`;

-- DropIndex
DROP INDEX `Moderator_userId_key` ON `Moderator`;

-- AlterTable
ALTER TABLE `Book` DROP COLUMN `authorizerId`,
    MODIFY `status` ENUM('AVAILABLE', 'ON_HOLD', 'TRADED') NOT NULL;

-- AlterTable
ALTER TABLE `Exchange` DROP COLUMN `authorizerId`;

-- AlterTable
ALTER TABLE `Moderator` DROP COLUMN `userId`,
    ADD COLUMN `email` VARCHAR(191) NOT NULL,
    ADD COLUMN `password` VARCHAR(191) NOT NULL,
    ADD COLUMN `role` ENUM('MODERATOR', 'USER_MODERATOR') NOT NULL DEFAULT 'MODERATOR';

-- AlterTable
ALTER TABLE `User` DROP COLUMN `role`,
    ADD COLUMN `contact` VARCHAR(191) NOT NULL,
    ADD COLUMN `course` VARCHAR(191) NOT NULL,
    ADD COLUMN `rating` DOUBLE NULL,
    ADD COLUMN `uniCard` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `Student`;

-- CreateIndex
CREATE UNIQUE INDEX `Moderator_email_key` ON `Moderator`(`email`);

-- CreateIndex
CREATE UNIQUE INDEX `User_uniCard_key` ON `User`(`uniCard`);

-- AddForeignKey
ALTER TABLE `Book` ADD CONSTRAINT `Book_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Exchange` ADD CONSTRAINT `Exchange_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Exchange` ADD CONSTRAINT `Exchange_requesterId_fkey` FOREIGN KEY (`requesterId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
