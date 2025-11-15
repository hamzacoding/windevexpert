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
    "slickPayPublicKey" TEXT,
    "slickPaySecretKey" TEXT,
    "slickPayTestMode" BOOLEAN NOT NULL DEFAULT true,
    "slickPayWebhookUrl" TEXT,
    "stripeEnabled" BOOLEAN NOT NULL DEFAULT false,
    "stripePublicKey" TEXT,
    "stripeSecretKey" TEXT,
    "stripeTestMode" BOOLEAN NOT NULL DEFAULT true,
    "stripeWebhookSecret" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_PaymentSettings" ("bankAccount", "bankAccountName", "bankName", "ccpAccount", "ccpAccountName", "createdAt", "id", "isActive", "slickPayEnabled", "slickPayPublicKey", "slickPaySecretKey", "slickPayTestMode", "slickPayWebhookUrl", "updatedAt") SELECT "bankAccount", "bankAccountName", "bankName", "ccpAccount", "ccpAccountName", "createdAt", "id", "isActive", "slickPayEnabled", "slickPayPublicKey", "slickPaySecretKey", "slickPayTestMode", "slickPayWebhookUrl", "updatedAt" FROM "PaymentSettings";
DROP TABLE "PaymentSettings";
ALTER TABLE "new_PaymentSettings" RENAME TO "PaymentSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
