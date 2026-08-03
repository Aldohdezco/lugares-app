/*
  Warnings:

  - You are about to drop the column `placeId` on the `photo` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `place` table. All the data in the column will be lost.
  - You are about to drop the column `visitDate` on the `place` table. All the data in the column will be lost.
  - Added the required column `visitId` to the `Photo` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `photo` DROP FOREIGN KEY `Photo_placeId_fkey`;

-- DropIndex
DROP INDEX `Place_visitDate_idx` ON `place`;

-- AlterTable
ALTER TABLE `photo` DROP COLUMN `placeId`,
    ADD COLUMN `visitId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `place` DROP COLUMN `description`,
    DROP COLUMN `visitDate`;

-- CreateTable
CREATE TABLE `Visit` (
    `id` VARCHAR(191) NOT NULL,
    `placeId` VARCHAR(191) NOT NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `visitDate` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Visit_placeId_idx`(`placeId`),
    INDEX `Visit_visitDate_idx`(`visitDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Visit` ADD CONSTRAINT `Visit_placeId_fkey` FOREIGN KEY (`placeId`) REFERENCES `Place`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Visit` ADD CONSTRAINT `Visit_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Photo` ADD CONSTRAINT `Photo_visitId_fkey` FOREIGN KEY (`visitId`) REFERENCES `Visit`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
