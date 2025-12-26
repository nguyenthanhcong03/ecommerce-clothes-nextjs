/*
  Warnings:

  - You are about to drop the column `createdAt` on the `cartitem` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `cartitem` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `category` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `category` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `category` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `category` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `category` table. All the data in the column will be lost.
  - You are about to alter the column `name` on the `category` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `slug` on the `category` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to drop the column `addressId` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `discount` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `note` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `orderNumber` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `paymentStatus` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `shippingFee` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `subtotal` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `order` table. All the data in the column will be lost.
  - The values [CONFIRMED,PROCESSING,DELIVERED] on the enum `Order_status` will be removed. If these variants are still used in the database, this will fail.
  - The values [BANK_TRANSFER,MOMO,VNPAY] on the enum `Payment_method` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `createdAt` on the `orderitem` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `orderitem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Int`.
  - You are about to drop the column `brand` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `material` on the `product` table. All the data in the column will be lost.
  - You are about to alter the column `name` on the `product` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `slug` on the `product` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to drop the column `comparePrice` on the `productvariant` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `productvariant` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `productvariant` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `productvariant` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `productvariant` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Int`.
  - You are about to drop the column `dateOfBirth` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `user` table. All the data in the column will be lost.
  - You are about to alter the column `email` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `password` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to drop the `address` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `media` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `productcategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `review` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `variantattribute` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `shippingAddress` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingName` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingPhone` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `address` DROP FOREIGN KEY `Address_userId_fkey`;

-- DropForeignKey
ALTER TABLE `cart` DROP FOREIGN KEY `Cart_userId_fkey`;

-- DropForeignKey
ALTER TABLE `cartitem` DROP FOREIGN KEY `CartItem_cartId_fkey`;

-- DropForeignKey
ALTER TABLE `media` DROP FOREIGN KEY `Media_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `media` DROP FOREIGN KEY `Media_productId_fkey`;

-- DropForeignKey
ALTER TABLE `media` DROP FOREIGN KEY `Media_reviewId_fkey`;

-- DropForeignKey
ALTER TABLE `media` DROP FOREIGN KEY `Media_userId_fkey`;

-- DropForeignKey
ALTER TABLE `media` DROP FOREIGN KEY `Media_variantId_fkey`;

-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_addressId_fkey`;

-- DropForeignKey
ALTER TABLE `orderitem` DROP FOREIGN KEY `OrderItem_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `productcategory` DROP FOREIGN KEY `ProductCategory_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `productcategory` DROP FOREIGN KEY `ProductCategory_productId_fkey`;

-- DropForeignKey
ALTER TABLE `productvariant` DROP FOREIGN KEY `ProductVariant_productId_fkey`;

-- DropForeignKey
ALTER TABLE `review` DROP FOREIGN KEY `Review_productId_fkey`;

-- DropForeignKey
ALTER TABLE `review` DROP FOREIGN KEY `Review_userId_fkey`;

-- DropForeignKey
ALTER TABLE `variantattribute` DROP FOREIGN KEY `VariantAttribute_variantId_fkey`;

-- DropIndex
DROP INDEX `Order_addressId_fkey` ON `order`;

-- DropIndex
DROP INDEX `Order_orderNumber_key` ON `order`;

-- DropIndex
DROP INDEX `User_phone_key` ON `user`;

-- AlterTable
ALTER TABLE `cartitem` DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`,
    ALTER COLUMN `quantity` DROP DEFAULT;

-- AlterTable
ALTER TABLE `category` DROP COLUMN `createdAt`,
    DROP COLUMN `description`,
    DROP COLUMN `isActive`,
    DROP COLUMN `isDeleted`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `image` VARCHAR(191) NULL,
    ADD COLUMN `imagePublicId` VARCHAR(191) NULL,
    ADD COLUMN `parentId` INTEGER NULL,
    MODIFY `name` VARCHAR(191) NOT NULL,
    MODIFY `slug` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `order` DROP COLUMN `addressId`,
    DROP COLUMN `discount`,
    DROP COLUMN `note`,
    DROP COLUMN `orderNumber`,
    DROP COLUMN `paymentStatus`,
    DROP COLUMN `shippingFee`,
    DROP COLUMN `subtotal`,
    DROP COLUMN `total`,
    ADD COLUMN `shippingAddress` VARCHAR(191) NOT NULL,
    ADD COLUMN `shippingName` VARCHAR(191) NOT NULL,
    ADD COLUMN `shippingPhone` VARCHAR(191) NOT NULL,
    ADD COLUMN `totalAmount` INTEGER NOT NULL,
    MODIFY `status` ENUM('PENDING', 'PAID', 'SHIPPING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    MODIFY `paymentMethod` ENUM('COD', 'ONLINE') NOT NULL;

-- AlterTable
ALTER TABLE `orderitem` DROP COLUMN `createdAt`,
    MODIFY `price` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `product` DROP COLUMN `brand`,
    DROP COLUMN `isActive`,
    DROP COLUMN `isDeleted`,
    DROP COLUMN `material`,
    ADD COLUMN `basePrice` INTEGER NULL,
    ADD COLUMN `categoryId` INTEGER NOT NULL,
    ADD COLUMN `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    MODIFY `name` VARCHAR(191) NOT NULL,
    MODIFY `slug` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `productvariant` DROP COLUMN `comparePrice`,
    DROP COLUMN `isActive`,
    DROP COLUMN `isDeleted`,
    DROP COLUMN `name`,
    ADD COLUMN `image` VARCHAR(191) NULL,
    MODIFY `sku` VARCHAR(191) NOT NULL,
    MODIFY `price` INTEGER NOT NULL,
    ALTER COLUMN `stock` DROP DEFAULT;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `dateOfBirth`,
    DROP COLUMN `isActive`,
    DROP COLUMN `isDeleted`,
    DROP COLUMN `name`,
    DROP COLUMN `phone`,
    ADD COLUMN `avatar` VARCHAR(191) NULL,
    ADD COLUMN `avatarPublicId` VARCHAR(191) NULL,
    ADD COLUMN `fullName` VARCHAR(191) NOT NULL,
    MODIFY `email` VARCHAR(191) NOT NULL,
    MODIFY `password` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `address`;

-- DropTable
DROP TABLE `media`;

-- DropTable
DROP TABLE `productcategory`;

-- DropTable
DROP TABLE `review`;

-- DropTable
DROP TABLE `variantattribute`;

-- CreateTable
CREATE TABLE `Attribute` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Attribute_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AttributeValue` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `attributeId` INTEGER NOT NULL,
    `value` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `AttributeValue_attributeId_value_key`(`attributeId`, `value`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VariantAttributeValue` (
    `variantId` INTEGER NOT NULL,
    `attributeValueId` INTEGER NOT NULL,

    PRIMARY KEY (`variantId`, `attributeValueId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductImage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `variantId` INTEGER NULL,
    `url` VARCHAR(191) NOT NULL,
    `publicId` VARCHAR(191) NOT NULL,
    `isMain` BOOLEAN NOT NULL DEFAULT false,

    INDEX `ProductImage_productId_idx`(`productId`),
    INDEX `ProductImage_variantId_idx`(`variantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `method` ENUM('COD', 'ONLINE') NOT NULL,
    `status` ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED') NOT NULL,
    `amount` INTEGER NOT NULL,
    `provider` ENUM('VNPAY', 'MOMO', 'STRIPE') NULL,
    `transactionId` VARCHAR(191) NULL,
    `paidAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Payment_orderId_key`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `CartItem_cartId_idx` ON `CartItem`(`cartId`);

-- CreateIndex
CREATE INDEX `Product_categoryId_idx` ON `Product`(`categoryId`);

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductVariant` ADD CONSTRAINT `ProductVariant_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AttributeValue` ADD CONSTRAINT `AttributeValue_attributeId_fkey` FOREIGN KEY (`attributeId`) REFERENCES `Attribute`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VariantAttributeValue` ADD CONSTRAINT `VariantAttributeValue_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `ProductVariant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VariantAttributeValue` ADD CONSTRAINT `VariantAttributeValue_attributeValueId_fkey` FOREIGN KEY (`attributeValueId`) REFERENCES `AttributeValue`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductImage` ADD CONSTRAINT `ProductImage_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductImage` ADD CONSTRAINT `ProductImage_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `ProductVariant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `Cart`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `cartitem` RENAME INDEX `CartItem_variantId_fkey` TO `CartItem_variantId_idx`;

-- RenameIndex
ALTER TABLE `order` RENAME INDEX `Order_userId_fkey` TO `Order_userId_idx`;

-- RenameIndex
ALTER TABLE `orderitem` RENAME INDEX `OrderItem_orderId_fkey` TO `OrderItem_orderId_idx`;

-- RenameIndex
ALTER TABLE `orderitem` RENAME INDEX `OrderItem_variantId_fkey` TO `OrderItem_variantId_idx`;

-- RenameIndex
ALTER TABLE `productvariant` RENAME INDEX `ProductVariant_productId_fkey` TO `ProductVariant_productId_idx`;
