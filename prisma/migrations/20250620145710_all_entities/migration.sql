/*
  Warnings:

  - You are about to drop the column `bookId` on the `Exchange` table. All the data in the column will be lost.
  - Added the required column `providerBookId` to the `Exchange` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requesterBookId` to the `Exchange` table without a default value. This is not possible if the table is not empty.
  - Made the column `rating` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Exchange` DROP FOREIGN KEY `Exchange_bookId_fkey`;

-- DropIndex
DROP INDEX `Exchange_bookId_fkey` ON `Exchange`;

-- AlterTable
ALTER TABLE `Book` MODIFY `status` ENUM('AVAILABLE', 'ON_HOLD', 'TRADED', 'WAITING_APPROVAL') NOT NULL DEFAULT 'WAITING_APPROVAL';

-- AlterTable
ALTER TABLE `Exchange` DROP COLUMN `bookId`,
    ADD COLUMN `providerBookId` INTEGER NOT NULL,
    ADD COLUMN `requesterBookId` INTEGER NOT NULL,
    MODIFY `status` ENUM('REQUESTED', 'ACCEPTED', 'COMPLETED', 'CANCELED') NOT NULL DEFAULT 'REQUESTED';

-- AlterTable
ALTER TABLE `User` MODIFY `rating` DOUBLE NOT NULL DEFAULT 5.0;

-- CreateTable
CREATE TABLE `Evaluation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `raterId` INTEGER NOT NULL,
    `ratedId` INTEGER NOT NULL,
    `rating` DOUBLE NOT NULL DEFAULT 5.0,

    UNIQUE INDEX `Evaluation_raterId_ratedId_key`(`raterId`, `ratedId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Exchange` ADD CONSTRAINT `Exchange_requesterBookId_fkey` FOREIGN KEY (`requesterBookId`) REFERENCES `Book`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Exchange` ADD CONSTRAINT `Exchange_providerBookId_fkey` FOREIGN KEY (`providerBookId`) REFERENCES `Book`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Evaluation` ADD CONSTRAINT `Evaluation_raterId_fkey` FOREIGN KEY (`raterId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Evaluation` ADD CONSTRAINT `Evaluation_ratedId_fkey` FOREIGN KEY (`ratedId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
