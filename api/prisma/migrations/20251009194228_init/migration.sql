-- CreateTable
CREATE TABLE `User` (
    `userid` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`userid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Property` (
    `propertyId` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `listedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ownerId` INTEGER NOT NULL,

    PRIMARY KEY (`propertyId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PropertyAddress` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `locality` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `zipcode` VARCHAR(191) NOT NULL,
    `propertyId` INTEGER NOT NULL,

    UNIQUE INDEX `PropertyAddress_propertyId_key`(`propertyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PropertyImage` (
    `imageId` INTEGER NOT NULL AUTO_INCREMENT,
    `imageUrl` VARCHAR(191) NOT NULL,
    `imageName` VARCHAR(191) NOT NULL,
    `imageTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `propertyId` INTEGER NOT NULL,

    PRIMARY KEY (`imageId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Property` ADD CONSTRAINT `Property_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`userid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PropertyAddress` ADD CONSTRAINT `PropertyAddress_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `Property`(`propertyId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PropertyImage` ADD CONSTRAINT `PropertyImage_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `Property`(`propertyId`) ON DELETE RESTRICT ON UPDATE CASCADE;
