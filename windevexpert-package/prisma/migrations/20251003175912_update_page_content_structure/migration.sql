/*
  Warnings:

  - You are about to drop the column `isPublished` on the `PageContent` table. All the data in the column will be lost.
  - You are about to drop the column `metaDescription` on the `PageContent` table. All the data in the column will be lost.
  - You are about to drop the column `metaTitle` on the `PageContent` table. All the data in the column will be lost.
  - You are about to drop the column `pageKey` on the `PageContent` table. All the data in the column will be lost.
  - Added the required column `pageSlug` to the `PageContent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sectionKey` to the `PageContent` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PageContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pageSlug" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_PageContent" ("content", "createdAt", "id", "title", "updatedAt") SELECT "content", "createdAt", "id", "title", "updatedAt" FROM "PageContent";
DROP TABLE "PageContent";
ALTER TABLE "new_PageContent" RENAME TO "PageContent";
CREATE UNIQUE INDEX "PageContent_pageSlug_sectionKey_key" ON "PageContent"("pageSlug", "sectionKey");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
