-- DropForeignKey
ALTER TABLE `Book` DROP FOREIGN KEY `Book_authorizerId_fkey`;

-- DropIndex
DROP INDEX `Book_authorizerId_fkey` ON `Book`;

-- AlterTable
ALTER TABLE `Book` MODIFY `authorizerId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Book` ADD CONSTRAINT `Book_authorizerId_fkey` FOREIGN KEY (`authorizerId`) REFERENCES `Moderator`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
