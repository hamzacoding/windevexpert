-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "version" TEXT,
    "publishedAt" DATETIME,
    "tagline" TEXT,
    "shortDescription" TEXT,
    "description" TEXT NOT NULL,
    "targetAudience" TEXT,
    "problemSolved" TEXT,
    "keyBenefits" TEXT,
    "features" TEXT,
    "screenshots" TEXT,
    "demoUrl" TEXT,
    "videoUrl" TEXT,
    "type" TEXT NOT NULL,
    "appType" TEXT,
    "compatibility" TEXT,
    "languages" TEXT,
    "technologies" TEXT,
    "requirements" TEXT,
    "hosting" TEXT,
    "security" TEXT,
    "price" REAL NOT NULL,
    "priceDA" REAL,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "pricingPlans" TEXT,
    "trialPeriod" INTEGER,
    "paymentMethods" TEXT,
    "supportTypes" TEXT,
    "documentation" TEXT,
    "training" TEXT,
    "updatePolicy" TEXT,
    "testimonials" TEXT,
    "caseStudies" TEXT,
    "partners" TEXT,
    "termsOfUse" TEXT,
    "privacyPolicy" TEXT,
    "license" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "image" TEXT,
    "categoryId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("categoryId", "createdAt", "description", "features", "id", "image", "name", "price", "priceDA", "slug", "status", "type", "updatedAt") SELECT "categoryId", "createdAt", "description", "features", "id", "image", "name", "price", "priceDA", "slug", "status", "type", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
CREATE TABLE "new_Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "userId" TEXT NOT NULL,
    "productId" TEXT,
    "projectId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Review" ("comment", "createdAt", "id", "productId", "projectId", "rating", "userId") SELECT "comment", "createdAt", "id", "productId", "projectId", "rating", "userId" FROM "Review";
DROP TABLE "Review";
ALTER TABLE "new_Review" RENAME TO "Review";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
