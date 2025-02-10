-- CreateTable
CREATE TABLE `alert` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mac` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
