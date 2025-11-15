/*
  Warnings:

  - You are about to drop the column `cibApiKey` on the `PaymentSettings` table. All the data in the column will be lost.
  - You are about to drop the column `cibEnabled` on the `PaymentSettings` table. All the data in the column will be lost.
  - You are about to drop the column `cibSecretKey` on the `PaymentSettings` table. All the data in the column will be lost.
  - You are about to drop the column `cibTestMode` on the `PaymentSettings` table. All the data in the column will be lost.
  - You are about to drop the column `cibWebhookUrl` on the `PaymentSettings` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PaymentSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ccpAccount" TEXT,
    "ccpAccountName" TEXT,
    "bankAccount" TEXT,
    "bankAccountName" TEXT,
    "bankName" TEXT,
    "slickPayEnabled" BOOLEAN NOT NULL DEFAULT false,
    "slickPayApiKey" TEXT,
    "slickPayTestMode" BOOLEAN NOT NULL DEFAULT true,
    "slickPayWebhookUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_PaymentSettings" ("bankAccount", "bankAccountName", "bankName", "ccpAccount", "ccpAccountName", "createdAt", "id", "isActive", "updatedAt") SELECT "bankAccount", "bankAccountName", "bankName", "ccpAccount", "ccpAccountName", "createdAt", "id", "isActive", "updatedAt" FROM "PaymentSettings";
DROP TABLE "PaymentSettings";
ALTER TABLE "new_PaymentSettings" RENAME TO "PaymentSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
