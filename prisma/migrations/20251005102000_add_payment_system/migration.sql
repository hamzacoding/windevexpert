-- CreateTable
CREATE TABLE "PaymentSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ccpAccount" TEXT,
    "ccpAccountName" TEXT,
    "bankAccount" TEXT,
    "bankAccountName" TEXT,
    "bankName" TEXT,
    "cibEnabled" BOOLEAN NOT NULL DEFAULT false,
    "cibApiKey" TEXT,
    "cibSecretKey" TEXT,
    "cibTestMode" BOOLEAN NOT NULL DEFAULT true,
    "cibWebhookUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT,
    "productName" TEXT NOT NULL,
    "productPrice" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'DZD',
    "paymentMethod" TEXT NOT NULL,
    "totalAmount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNPAID',
    "dueDate" DATETIME NOT NULL,
    "paidAt" DATETIME,
    "adminNotified" BOOLEAN NOT NULL DEFAULT false,
    "adminViewed" BOOLEAN NOT NULL DEFAULT false,
    "adminViewedAt" DATETIME,
    "validatedBy" TEXT,
    "validatedAt" DATETIME,
    "notes" TEXT,
    "rejectionReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PaymentProof" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "paymentDate" DATETIME,
    "amount" REAL,
    "reference" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminNotes" TEXT,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" DATETIME,
    "reviewedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PaymentProof_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdminNotification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "invoiceId" TEXT,
    "userId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" DATETIME,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "actionUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");
