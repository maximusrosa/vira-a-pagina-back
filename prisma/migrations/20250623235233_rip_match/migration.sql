/*
  Warnings:

  - You are about to drop the column `matchId` on the `Exchange` table. All the data in the column will be lost.
  - You are about to drop the `_ProviderBookExchange` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_RequesterBookExchange` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_User1BooksInMatch` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_User2BooksInMatch` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `providerBookId` to the `Exchange` table without a default value. This is not possible if the table is not empty.
  - Added the required column `providerId` to the `Exchange` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requesterBookId` to the `Exchange` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requesterId` to the `Exchange` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Exchange` DROP FOREIGN KEY `Exchange_matchId_fkey`;

-- DropForeignKey
ALTER TABLE `Match` DROP FOREIGN KEY `Match_user1Id_fkey`;

-- DropForeignKey
ALTER TABLE `Match` DROP FOREIGN KEY `Match_user2Id_fkey`;

-- DropForeignKey
ALTER TABLE `_ProviderBookExchange` DROP FOREIGN KEY `_ProviderBookExchange_A_fkey`;

-- DropForeignKey
ALTER TABLE `_ProviderBookExchange` DROP FOREIGN KEY `_ProviderBookExchange_B_fkey`;

-- DropForeignKey
ALTER TABLE `_RequesterBookExchange` DROP FOREIGN KEY `_RequesterBookExchange_A_fkey`;

-- DropForeignKey
ALTER TABLE `_RequesterBookExchange` DROP FOREIGN KEY `_RequesterBookExchange_B_fkey`;

-- DropForeignKey
ALTER TABLE `_User1BooksInMatch` DROP FOREIGN KEY `_User1BooksInMatch_A_fkey`;

-- DropForeignKey
ALTER TABLE `_User1BooksInMatch` DROP FOREIGN KEY `_User1BooksInMatch_B_fkey`;

-- DropForeignKey
ALTER TABLE `_User2BooksInMatch` DROP FOREIGN KEY `_User2BooksInMatch_A_fkey`;

-- DropForeignKey
ALTER TABLE `_User2BooksInMatch` DROP FOREIGN KEY `_User2BooksInMatch_B_fkey`;

-- DropIndex
DROP INDEX `Exchange_matchId_fkey` ON `Exchange`;

-- DropIndex
DROP INDEX `Match_user2Id_fkey` ON `Match`;

-- AlterTable
ALTER TABLE `Exchange` DROP COLUMN `matchId`,
    ADD COLUMN `providerBookId` INTEGER NOT NULL,
    ADD COLUMN `providerId` INTEGER NOT NULL,
    ADD COLUMN `requesterBookId` INTEGER NOT NULL,
    ADD COLUMN `requesterId` INTEGER NOT NULL;

-- DropTable
DROP TABLE `_ProviderBookExchange`;

-- DropTable
DROP TABLE `_RequesterBookExchange`;

-- DropTable
DROP TABLE `_User1BooksInMatch`;

-- DropTable
DROP TABLE `_User2BooksInMatch`;

-- AddForeignKey
ALTER TABLE `Exchange` ADD CONSTRAINT `Exchange_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Exchange` ADD CONSTRAINT `Exchange_requesterId_fkey` FOREIGN KEY (`requesterId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Exchange` ADD CONSTRAINT `Exchange_requesterBookId_fkey` FOREIGN KEY (`requesterBookId`) REFERENCES `Book`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Exchange` ADD CONSTRAINT `Exchange_providerBookId_fkey` FOREIGN KEY (`providerBookId`) REFERENCES `Book`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
