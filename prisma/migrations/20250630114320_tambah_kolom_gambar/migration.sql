/*
  Warnings:

  - You are about to drop the `jadwalibadah` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `jadwalibadah` DROP FOREIGN KEY `JadwalIbadah_userId_fkey`;

-- DropTable
DROP TABLE `jadwalibadah`;

-- CreateTable
CREATE TABLE `jadwal_ibadah` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `judul` VARCHAR(191) NOT NULL,
    `tanggal` DATETIME(3) NOT NULL,
    `deskripsi` VARCHAR(191) NOT NULL,
    `gambar` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `jadwal_ibadah` ADD CONSTRAINT `jadwal_ibadah_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
