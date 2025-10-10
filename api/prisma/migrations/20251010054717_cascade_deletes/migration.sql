-- DropForeignKey
ALTER TABLE `Property` DROP FOREIGN KEY `Property_ownerId_fkey`;

-- DropForeignKey
ALTER TABLE `PropertyAddress` DROP FOREIGN KEY `PropertyAddress_propertyId_fkey`;

-- DropForeignKey
ALTER TABLE `PropertyImage` DROP FOREIGN KEY `PropertyImage_propertyId_fkey`;

-- DropIndex
DROP INDEX `Property_ownerId_fkey` ON `Property`;

-- DropIndex
DROP INDEX `PropertyImage_propertyId_fkey` ON `PropertyImage`;

-- AddForeignKey
ALTER TABLE `Property` ADD CONSTRAINT `Property_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`userid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PropertyAddress` ADD CONSTRAINT `PropertyAddress_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `Property`(`propertyId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PropertyImage` ADD CONSTRAINT `PropertyImage_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `Property`(`propertyId`) ON DELETE CASCADE ON UPDATE CASCADE;
