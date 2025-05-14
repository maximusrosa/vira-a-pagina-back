/*
  Warnings:

  - The values [RESERVED] on the enum `Book_status` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `createdAt` on the `Exchange` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Exchange` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `Student` table. All the data in the column will be lost.
  - The values [EXCHANGES_MODERATOR] on the enum `User_role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `ExchangesModerator` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserModerator` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[uniCard]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `authorizerId` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authorizerId` to the `Exchange` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uniCard` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Made the column `course` on table `Student` required. This step will fail if there are existing NULL values in that column.
  - Made the column `contact` on table `Student` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `ExchangesModerator` DROP FOREIGN KEY `ExchangesModerator_userId_fkey`;

-- DropForeignKey
ALTER TABLE `UserModerator` DROP FOREIGN KEY `UserModerator_userId_fkey`;

-- AlterTable
ALTER TABLE `Book` ADD COLUMN `authorizerId` INTEGER NOT NULL,
    MODIFY `status` ENUM('AVAILABLE', 'TRADED') NOT NULL;

-- AlterTable
ALTER TABLE `Exchange` DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `authorizerId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Student` DROP COLUMN `studentId`,
    ADD COLUMN `uniCard` VARCHAR(191) NOT NULL,
    MODIFY `course` VARCHAR(191) NOT NULL,
    MODIFY `contact` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `role` ENUM('USER_MODERATOR', 'MODERATOR', 'STUDENT') NOT NULL DEFAULT 'STUDENT';

-- DropTable
DROP TABLE `ExchangesModerator`;

-- DropTable
DROP TABLE `UserModerator`;

-- CreateTable
CREATE TABLE `Moderator` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,

    UNIQUE INDEX `Moderator_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Student_uniCard_key` ON `Student`(`uniCard`);

-- AddForeignKey
ALTER TABLE `Moderator` ADD CONSTRAINT `Moderator_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Book` ADD CONSTRAINT `Book_authorizerId_fkey` FOREIGN KEY (`authorizerId`) REFERENCES `Moderator`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Exchange` ADD CONSTRAINT `Exchange_authorizerId_fkey` FOREIGN KEY (`authorizerId`) REFERENCES `Moderator`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
