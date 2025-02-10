/*
  Warnings:

  - You are about to drop the column `name` on the `alerts` table. All the data in the column will be lost.
  - Added the required column `device_id` to the `alerts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `message` to the `alerts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `alerts` DROP COLUMN `name`,
    ADD COLUMN `device_id` INTEGER NOT NULL,
    ADD COLUMN `message` VARCHAR(191) NOT NULL;
