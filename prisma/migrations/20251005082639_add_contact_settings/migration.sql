-- CreateTable
CREATE TABLE "QuoteRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quoteNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "company" TEXT,
    "position" TEXT,
    "projectType" TEXT NOT NULL,
    "projectTitle" TEXT NOT NULL,
    "projectDescription" TEXT NOT NULL,
    "services" TEXT NOT NULL,
    "features" TEXT,
    "budget" TEXT NOT NULL,
    "timeline" TEXT NOT NULL,
    "hasExistingWebsite" BOOLEAN NOT NULL DEFAULT false,
    "existingWebsiteUrl" TEXT,
    "targetAudience" TEXT,
    "competitors" TEXT,
    "additionalInfo" TEXT,
    "preferredContactMethod" TEXT NOT NULL DEFAULT 'email',
    "preferredContactTime" TEXT NOT NULL DEFAULT 'anytime',
    "acceptTerms" BOOLEAN NOT NULL DEFAULT false,
    "acceptMarketing" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminNotes" TEXT,
    "estimatedPrice" REAL,
    "quoteSentAt" DATETIME,
    "adminViewed" BOOLEAN NOT NULL DEFAULT false,
    "adminViewedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "contact_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "address" TEXT,
    "facebook" TEXT,
    "twitter" TEXT,
    "linkedin" TEXT,
    "instagram" TEXT,
    "youtube" TEXT,
    "github" TEXT,
    "openingHours" TEXT,
    "companyName" TEXT,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "QuoteRequest_quoteNumber_key" ON "QuoteRequest"("quoteNumber");
