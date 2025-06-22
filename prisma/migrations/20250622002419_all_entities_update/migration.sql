/*
  Warnings:

  - You are about to alter the column `status` on the `Book` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(3))` to `Enum(EnumId(2))`.
  - You are about to drop the column `providerBookId` on the `Exchange` table. All the data in the column will be lost.
  - You are about to drop the column `providerId` on the `Exchange` table. All the data in the column will be lost.
  - You are about to drop the column `requesterBookId` on the `Exchange` table. All the data in the column will be lost.
  - You are about to drop the column `requesterId` on the `Exchange` table. All the data in the column will be lost.
  - Added the required column `matchId` to the `Exchange` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Exchange` DROP FOREIGN KEY `Exchange_providerBookId_fkey`;

-- DropForeignKey
ALTER TABLE `Exchange` DROP FOREIGN KEY `Exchange_providerId_fkey`;

-- DropForeignKey
ALTER TABLE `Exchange` DROP FOREIGN KEY `Exchange_requesterBookId_fkey`;

-- DropForeignKey
ALTER TABLE `Exchange` DROP FOREIGN KEY `Exchange_requesterId_fkey`;

-- DropIndex
DROP INDEX `Exchange_providerBookId_fkey` ON `Exchange`;

-- DropIndex
DROP INDEX `Exchange_providerId_fkey` ON `Exchange`;

-- DropIndex
DROP INDEX `Exchange_requesterBookId_fkey` ON `Exchange`;

-- DropIndex
DROP INDEX `Exchange_requesterId_fkey` ON `Exchange`;

-- AlterTable
ALTER TABLE `Book` MODIFY `status` ENUM('WAITING_PUBLICATION_APPROVAL', 'AVAILABLE', 'WAITING_EXCHANGE_APPROVAL', 'TRADED') NOT NULL DEFAULT 'WAITING_PUBLICATION_APPROVAL';

-- AlterTable
ALTER TABLE `Exchange` DROP COLUMN `providerBookId`,
    DROP COLUMN `providerId`,
    DROP COLUMN `requesterBookId`,
    DROP COLUMN `requesterId`,
    ADD COLUMN `matchId` INTEGER NOT NULL,
    MODIFY `status` ENUM('REQUESTED', 'ACCEPTED', 'WAITING_APPROVAL', 'COMPLETED', 'CANCELED') NOT NULL DEFAULT 'REQUESTED';

-- CreateTable
CREATE TABLE `Match` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user1Id` INTEGER NOT NULL,
    `user2Id` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Match_user1Id_user2Id_key`(`user1Id`, `user2Id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_LikedBooks` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_LikedBooks_AB_unique`(`A`, `B`),
    INDEX `_LikedBooks_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_RequesterBookExchange` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_RequesterBookExchange_AB_unique`(`A`, `B`),
    INDEX `_RequesterBookExchange_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ProviderBookExchange` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_ProviderBookExchange_AB_unique`(`A`, `B`),
    INDEX `_ProviderBookExchange_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_User1BooksInMatch` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_User1BooksInMatch_AB_unique`(`A`, `B`),
    INDEX `_User1BooksInMatch_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_User2BooksInMatch` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_User2BooksInMatch_AB_unique`(`A`, `B`),
    INDEX `_User2BooksInMatch_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Exchange` ADD CONSTRAINT `Exchange_matchId_fkey` FOREIGN KEY (`matchId`) REFERENCES `Match`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_user1Id_fkey` FOREIGN KEY (`user1Id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_user2Id_fkey` FOREIGN KEY (`user2Id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_LikedBooks` ADD CONSTRAINT `_LikedBooks_A_fkey` FOREIGN KEY (`A`) REFERENCES `Book`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_LikedBooks` ADD CONSTRAINT `_LikedBooks_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_RequesterBookExchange` ADD CONSTRAINT `_RequesterBookExchange_A_fkey` FOREIGN KEY (`A`) REFERENCES `Book`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_RequesterBookExchange` ADD CONSTRAINT `_RequesterBookExchange_B_fkey` FOREIGN KEY (`B`) REFERENCES `Exchange`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ProviderBookExchange` ADD CONSTRAINT `_ProviderBookExchange_A_fkey` FOREIGN KEY (`A`) REFERENCES `Book`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ProviderBookExchange` ADD CONSTRAINT `_ProviderBookExchange_B_fkey` FOREIGN KEY (`B`) REFERENCES `Exchange`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_User1BooksInMatch` ADD CONSTRAINT `_User1BooksInMatch_A_fkey` FOREIGN KEY (`A`) REFERENCES `Book`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_User1BooksInMatch` ADD CONSTRAINT `_User1BooksInMatch_B_fkey` FOREIGN KEY (`B`) REFERENCES `Match`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_User2BooksInMatch` ADD CONSTRAINT `_User2BooksInMatch_A_fkey` FOREIGN KEY (`A`) REFERENCES `Book`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_User2BooksInMatch` ADD CONSTRAINT `_User2BooksInMatch_B_fkey` FOREIGN KEY (`B`) REFERENCES `Match`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
