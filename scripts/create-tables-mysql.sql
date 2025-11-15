-- Script SQL pour créer toutes les tables MySQL de WindevExpert Platform
-- Généré à partir du schéma Prisma

-- Créer la base de données si elle n'existe pas
CREATE DATABASE IF NOT EXISTS windevexpert_platform 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE windevexpert_platform;

-- Créer un utilisateur dédié
CREATE USER IF NOT EXISTS 'windevexpert_user'@'localhost' IDENTIFIED BY 'windevexpert_password';
GRANT ALL PRIVILEGES ON windevexpert_platform.* TO 'windevexpert_user'@'localhost';
FLUSH PRIVILEGES;

-- ========================================
-- TABLES PRINCIPALES
-- ========================================

-- Table des utilisateurs
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `emailVerified` DATETIME(3) NULL,
    `image` VARCHAR(191) NULL,
    `profileImage` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `role` ENUM('CLIENT', 'ADMIN') NOT NULL DEFAULT 'CLIENT',
    `isBlocked` BOOLEAN NOT NULL DEFAULT false,
    `blockedAt` DATETIME(3) NULL,
    `blockedReason` VARCHAR(191) NULL,
    `firstName` VARCHAR(191) NULL,
    `lastName` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `postalCode` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `wilayaId` VARCHAR(191) NULL,
    `communeId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Table des comptes OAuth
CREATE TABLE `Account` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerAccountId` VARCHAR(191) NOT NULL,
    `refresh_token` TEXT NULL,
    `access_token` TEXT NULL,
    `expires_at` INTEGER NULL,
    `token_type` VARCHAR(191) NULL,
    `scope` VARCHAR(191) NULL,
    `id_token` TEXT NULL,
    `session_state` VARCHAR(191) NULL,

    UNIQUE INDEX `Account_provider_providerAccountId_key`(`provider`, `providerAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Table des sessions
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `sessionToken` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Session_sessionToken_key`(`sessionToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Table des tokens de vérification
CREATE TABLE `VerificationToken` (
    `identifier` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `VerificationToken_token_key`(`token`),
    UNIQUE INDEX `VerificationToken_identifier_token_key`(`identifier`, `token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ========================================
-- GÉOGRAPHIE ALGÉRIENNE
-- ========================================

-- Table des wilayas
CREATE TABLE `Wilaya` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `nameAr` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Wilaya_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Table des communes
CREATE TABLE `Commune` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `nameAr` VARCHAR(191) NULL,
    `wilayaId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Commune_code_wilayaId_key`(`code`, `wilayaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ========================================
-- PRODUITS ET CATÉGORIES
-- ========================================

-- Table des catégories
CREATE TABLE `Category` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `image` VARCHAR(191) NULL,
    `parentId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Category_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Table des produits
CREATE TABLE `Product` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `logo` VARCHAR(191) NULL,
    `version` VARCHAR(191) NULL,
    `publishedAt` DATETIME(3) NULL,
    `tagline` VARCHAR(191) NULL,
    `shortDescription` VARCHAR(191) NULL,
    `description` TEXT NOT NULL,
    `targetAudience` VARCHAR(191) NULL,
    `problemSolved` VARCHAR(191) NULL,
    `keyBenefits` TEXT NULL,
    `features` TEXT NULL,
    `screenshots` TEXT NULL,
    `demoUrl` VARCHAR(191) NULL,
    `videoUrl` VARCHAR(191) NULL,
    `type` ENUM('SERVICE', 'SOFTWARE', 'COMPONENT') NOT NULL,
    `appType` ENUM('WEB_APP', 'DESKTOP_APP', 'MOBILE_APP', 'BROWSER_EXTENSION', 'PLUGIN', 'API_SERVICE', 'SAAS_PLATFORM', 'MULTIPLATFORM') NULL,
    `compatibility` TEXT NULL,
    `languages` TEXT NULL,
    `technologies` TEXT NULL,
    `requirements` VARCHAR(191) NULL,
    `hosting` VARCHAR(191) NULL,
    `security` VARCHAR(191) NULL,
    `price` DOUBLE NOT NULL,
    `priceDA` DOUBLE NULL,
    `isFree` BOOLEAN NOT NULL DEFAULT false,
    `pricingPlans` TEXT NULL,
    `trialPeriod` INTEGER NULL,
    `paymentMethods` TEXT NULL,
    `supportTypes` TEXT NULL,
    `documentation` VARCHAR(191) NULL,
    `training` VARCHAR(191) NULL,
    `updatePolicy` VARCHAR(191) NULL,
    `testimonials` TEXT NULL,
    `caseStudies` TEXT NULL,
    `partners` TEXT NULL,
    `termsOfUse` VARCHAR(191) NULL,
    `privacyPolicy` VARCHAR(191) NULL,
    `license` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'DRAFT') NOT NULL DEFAULT 'ACTIVE',
    `image` VARCHAR(191) NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Product_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ========================================
-- FORMATIONS ET COURS
-- ========================================

-- Nouvelle table des formations (structure exacte demandée)
CREATE TABLE IF NOT EXISTS `Formations` (
    `id_formation` VARCHAR(191) NOT NULL,
    `titre` VARCHAR(191) NOT NULL,
    `sous_titre` VARCHAR(191) NULL,
    `description_courte` TEXT NULL,
    `description_complete` TEXT NOT NULL,
    `langue` ENUM('FRANCAIS', 'ANGLAIS') NOT NULL,
    `categorie` ENUM('DEVELOPPEMENT_WEB', 'MARKETING') NOT NULL,
    `sous_categorie` ENUM('JAVASCRIPT', 'SEO') NULL,

    `objectifs_apprentissage` TEXT NULL,
    `duree_totale_heures` DECIMAL(10,2) NOT NULL DEFAULT 0,
    `nombre_modules` INTEGER NOT NULL DEFAULT 0,
    `nombre_lecons` INTEGER NOT NULL DEFAULT 0,
    `certificat_fin_formation` BOOLEAN NOT NULL DEFAULT false,

    `niveau_requis` ENUM('DEBUTANT', 'INTERMEDIAIRE', 'AVANCE') NOT NULL,
    `prerequis` TEXT NULL,
    `public_cible` TEXT NULL,

    `prix_usd` DECIMAL(10,2) NOT NULL,
    `prix_eur` DECIMAL(10,2) NOT NULL,
    `prix_dzd` DECIMAL(10,2) NOT NULL,
    `prix_afr` DECIMAL(10,2) NOT NULL,
    `type_acces` ENUM('ACCES_A_VIE', 'ABONNEMENT_1_AN') NOT NULL,
    `garantie_remboursement_jours` INTEGER NULL DEFAULT 0,

    `image_couverture_url` VARCHAR(191) NULL,
    `video_presentation_url` VARCHAR(191) NULL,
    `mots_cles` TEXT NULL,
    `url_slug` VARCHAR(191) NOT NULL,
    `lien_paiement` VARCHAR(191) NULL,

    `statut` ENUM('BROUILLON', 'PUBLIE', 'ARCHIVE') NOT NULL DEFAULT 'BROUILLON',
    `date_creation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `date_mise_a_jour` DATETIME(3) NOT NULL,
    `note_moyenne` DECIMAL(10,2) NULL,
    `nombre_avis` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `Formations_url_slug_key`(`url_slug`),
    PRIMARY KEY (`id_formation`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Table des cours
CREATE TABLE `Course` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `shortDescription` VARCHAR(191) NULL,
    `logo` VARCHAR(191) NULL,
    `duration` INTEGER NOT NULL,
    `level` ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED') NOT NULL,
    `language` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `price` DOUBLE NOT NULL,
    `priceDA` DOUBLE NULL,
    `isFree` BOOLEAN NOT NULL DEFAULT false,
    `categoryId` VARCHAR(191) NOT NULL,
    `features` TEXT NULL,
    `targetAudience` VARCHAR(191) NULL,
    `objectives` TEXT NULL,
    `prerequisites` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Course_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Table des leçons
CREATE TABLE `Lesson` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `videoUrl` VARCHAR(191) NOT NULL,
    `duration` INTEGER NOT NULL,
    `order` INTEGER NOT NULL,
    `courseId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Table des inscriptions
CREATE TABLE `Enrollment` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `courseId` VARCHAR(191) NOT NULL,
    `enrolledAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completedAt` DATETIME(3) NULL,
    `progress` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `Enrollment_userId_courseId_key`(`userId`, `courseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Table des progrès
CREATE TABLE `Progress` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `lessonId` VARCHAR(191) NOT NULL,
    `enrollmentId` VARCHAR(191) NOT NULL,
    `completed` BOOLEAN NOT NULL DEFAULT false,
    `watchTime` INTEGER NOT NULL DEFAULT 0,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Progress_userId_lessonId_key`(`userId`, `lessonId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ========================================
-- COMMANDES ET PAIEMENTS
-- ========================================

-- Table des commandes
CREATE TABLE `Order` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `total` DOUBLE NOT NULL,
    `status` ENUM('PENDING', 'PAID', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `paymentId` VARCHAR(191) NULL,
    `paymentMethod` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Table des articles de commande
CREATE TABLE `OrderItem` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `price` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ========================================
-- PANIER
-- ========================================

-- Table des paniers
CREATE TABLE `Cart` (
    `id` VARCHAR(191) NOT NULL,
    `sessionId` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NULL,
    `total` DOUBLE NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Cart_sessionId_key`(`sessionId`),
    UNIQUE INDEX `Cart_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Table des articles du panier
CREATE TABLE `CartItem` (
    `id` VARCHAR(191) NOT NULL,
    `cartId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `price` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CartItem_cartId_productId_key`(`cartId`, `productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ========================================
-- PROJETS ET GESTION
-- ========================================

-- Table des projets
CREATE TABLE `Project` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `status` ENUM('PLANNING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PLANNING',
    `progress` INTEGER NOT NULL DEFAULT 0,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `budget` DOUBLE NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Table des jalons
CREATE TABLE `Milestone` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `dueDate` DATETIME(3) NULL,
    `completed` BOOLEAN NOT NULL DEFAULT false,
    `projectId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Table des messages
CREATE TABLE `Message` (
    `id` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `senderId` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Table des fichiers de projet
CREATE TABLE `ProjectFile` (
    `id` VARCHAR(191) NOT NULL,
    `filename` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `size` INTEGER NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ========================================
-- AVIS ET ÉVALUATIONS
-- ========================================

-- Table des avis
CREATE TABLE `Review` (
    `id` VARCHAR(191) NOT NULL,
    `rating` INTEGER NOT NULL,
    `comment` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NULL,
    `projectId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ========================================
-- BLOG ET CONTENU
-- ========================================

-- Table des articles de blog
CREATE TABLE `BlogPost` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `excerpt` VARCHAR(191) NULL,
    `image` VARCHAR(191) NULL,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `tags` VARCHAR(191) NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BlogPost_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Table du contenu des pages
CREATE TABLE `PageContent` (
    `id` VARCHAR(191) NOT NULL,
    `pageSlug` VARCHAR(191) NOT NULL,
    `sectionKey` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PageContent_pageSlug_sectionKey_key`(`pageSlug`, `sectionKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ========================================
-- EMAILS ET TEMPLATES
-- ========================================

-- Table des templates d'email
CREATE TABLE `EmailTemplate` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `htmlContent` TEXT NOT NULL,
    `textContent` TEXT NULL,
    `type` ENUM('WELCOME', 'EMAIL_VERIFICATION', 'PASSWORD_RESET', 'ORDER_CONFIRMATION', 'COURSE_ENROLLMENT', 'COURSE_COMPLETION', 'NEWSLETTER', 'NOTIFICATION', 'CUSTOM') NOT NULL,
    `variables` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `EmailTemplate_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Table des logs d'email
CREATE TABLE `EmailLog` (
    `id` VARCHAR(191) NOT NULL,
    `to` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `templateId` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'SENT', 'FAILED', 'BOUNCED') NOT NULL DEFAULT 'PENDING',
    `errorMessage` VARCHAR(191) NULL,
    `sentAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ========================================
-- PARAMÈTRES ET CONFIGURATION
-- ========================================

-- Table des paramètres SMTP
CREATE TABLE `SMTPSettings` (
    `id` VARCHAR(191) NOT NULL,
    `host` VARCHAR(191) NOT NULL,
    `port` INTEGER NOT NULL,
    `secure` BOOLEAN NOT NULL DEFAULT false,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `fromEmail` VARCHAR(191) NOT NULL,
    `fromName` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SMTPSettings_isDefault_key`(`isDefault`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Table des paramètres d'application
CREATE TABLE `AppSettings` (
    `id` VARCHAR(191) NOT NULL,
    `tinymceApiKey` VARCHAR(191) NULL,
    `openaiApiKey` VARCHAR(191) NULL,
    `geminiApiKey` VARCHAR(191) NULL,
    `siteName` VARCHAR(191) NOT NULL DEFAULT 'WindevExpert Platform',
    `siteDescription` VARCHAR(191) NULL,
    `maintenanceMode` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Table des paramètres de contact
CREATE TABLE `ContactSettings` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `whatsapp` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `facebook` VARCHAR(191) NULL,
    `twitter` VARCHAR(191) NULL,
    `linkedin` VARCHAR(191) NULL,
    `instagram` VARCHAR(191) NULL,
    `youtube` VARCHAR(191) NULL,
    `github` VARCHAR(191) NULL,
    `openingHours` TEXT NULL,
    `companyName` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Table des paramètres de paiement
CREATE TABLE `PaymentSettings` (
    `id` VARCHAR(191) NOT NULL,
    `ccpAccount` VARCHAR(191) NULL,
    `ccpAccountName` VARCHAR(191) NULL,
    `bankAccount` VARCHAR(191) NULL,
    `bankAccountName` VARCHAR(191) NULL,
    `bankName` VARCHAR(191) NULL,
    `slickPayEnabled` BOOLEAN NOT NULL DEFAULT false,
    `slickPayPublicKey` VARCHAR(191) NULL,
    `slickPaySecretKey` VARCHAR(191) NULL,
    `slickPayTestMode` BOOLEAN NOT NULL DEFAULT true,
    `slickPayWebhookUrl` VARCHAR(191) NULL,
    `stripeEnabled` BOOLEAN NOT NULL DEFAULT false,
    `stripePublicKey` VARCHAR(191) NULL,
    `stripeSecretKey` VARCHAR(191) NULL,
    `stripeTestMode` BOOLEAN NOT NULL DEFAULT true,
    `stripeWebhookSecret` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ========================================
-- DEMANDES DE DEVIS
-- ========================================

-- Table des demandes de devis
CREATE TABLE `QuoteRequest` (
    `id` VARCHAR(191) NOT NULL,
    `quoteNumber` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `company` VARCHAR(191) NULL,
    `position` VARCHAR(191) NULL,
    `projectType` VARCHAR(191) NOT NULL,
    `projectTitle` VARCHAR(191) NOT NULL,
    `projectDescription` TEXT NOT NULL,
    `services` TEXT NOT NULL,
    `features` TEXT NULL,
    `budget` VARCHAR(191) NOT NULL,
    `timeline` VARCHAR(191) NOT NULL,
    `hasExistingWebsite` BOOLEAN NOT NULL DEFAULT false,
    `existingWebsiteUrl` VARCHAR(191) NULL,
    `targetAudience` TEXT NULL,
    `competitors` TEXT NULL,
    `additionalInfo` TEXT NULL,
    `preferredContactMethod` VARCHAR(191) NOT NULL DEFAULT 'email',
    `preferredContactTime` VARCHAR(191) NOT NULL DEFAULT 'anytime',
    `acceptTerms` BOOLEAN NOT NULL DEFAULT false,
    `acceptMarketing` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('PENDING', 'REVIEWED', 'QUOTED', 'ACCEPTED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `adminNotes` TEXT NULL,
    `estimatedPrice` DOUBLE NULL,
    `quoteSentAt` DATETIME(3) NULL,
    `adminViewed` BOOLEAN NOT NULL DEFAULT false,
    `adminViewedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `QuoteRequest_quoteNumber_key`(`quoteNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ========================================
-- FACTURES ET PAIEMENTS ALGÉRIENS
-- ========================================

-- Table des factures
CREATE TABLE `Invoice` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceNumber` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NULL,
    `productName` VARCHAR(191) NOT NULL,
    `productPrice` DOUBLE NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'DZD',
    `paymentMethod` ENUM('CCP', 'BANK_TRANSFER', 'SLICKPAY') NOT NULL,
    `totalAmount` DOUBLE NOT NULL,
    `status` ENUM('UNPAID', 'PROOF_UPLOADED', 'UNDER_REVIEW', 'PAID', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'UNPAID',
    `dueDate` DATETIME(3) NOT NULL,
    `paidAt` DATETIME(3) NULL,
    `adminNotified` BOOLEAN NOT NULL DEFAULT false,
    `adminViewed` BOOLEAN NOT NULL DEFAULT false,
    `adminViewedAt` DATETIME(3) NULL,
    `validatedBy` VARCHAR(191) NULL,
    `validatedAt` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `rejectionReason` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Invoice_invoiceNumber_key`(`invoiceNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Table des preuves de paiement
CREATE TABLE `PaymentProof` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceId` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `fileUrl` VARCHAR(191) NOT NULL,
    `fileSize` INTEGER NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `paymentDate` DATETIME(3) NULL,
    `amount` DOUBLE NULL,
    `reference` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'NEEDS_INFO') NOT NULL DEFAULT 'PENDING',
    `adminNotes` TEXT NULL,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reviewedAt` DATETIME(3) NULL,
    `reviewedBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Table des notifications admin
CREATE TABLE `AdminNotification` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('PAYMENT_PROOF_UPLOADED', 'PAYMENT_VALIDATED', 'PAYMENT_REJECTED', 'INVOICE_CREATED', 'SYSTEM_ALERT') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `invoiceId` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `readAt` DATETIME(3) NULL,
    `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') NOT NULL DEFAULT 'MEDIUM',
    `actionUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ========================================
-- CLÉS ÉTRANGÈRES (FOREIGN KEYS)
-- ========================================

-- Relations User
ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `User` ADD CONSTRAINT `User_wilayaId_fkey` FOREIGN KEY (`wilayaId`) REFERENCES `Wilaya`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `User` ADD CONSTRAINT `User_communeId_fkey` FOREIGN KEY (`communeId`) REFERENCES `Commune`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Relations géographiques
ALTER TABLE `Commune` ADD CONSTRAINT `Commune_wilayaId_fkey` FOREIGN KEY (`wilayaId`) REFERENCES `Wilaya`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Relations catégories et produits
ALTER TABLE `Category` ADD CONSTRAINT `Category_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `Product` ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Relations cours et formations
ALTER TABLE `Course` ADD CONSTRAINT `Course_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Lesson` ADD CONSTRAINT `Lesson_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Enrollment` ADD CONSTRAINT `Enrollment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Enrollment` ADD CONSTRAINT `Enrollment_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Progress` ADD CONSTRAINT `Progress_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Progress` ADD CONSTRAINT `Progress_lessonId_fkey` FOREIGN KEY (`lessonId`) REFERENCES `Lesson`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Progress` ADD CONSTRAINT `Progress_enrollmentId_fkey` FOREIGN KEY (`enrollmentId`) REFERENCES `Enrollment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Relations commandes
ALTER TABLE `Order` ADD CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Relations panier
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `Cart`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Relations projets
ALTER TABLE `Project` ADD CONSTRAINT `Project_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Milestone` ADD CONSTRAINT `Milestone_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Message` ADD CONSTRAINT `Message_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Message` ADD CONSTRAINT `Message_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `ProjectFile` ADD CONSTRAINT `ProjectFile_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Relations avis
ALTER TABLE `Review` ADD CONSTRAINT `Review_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Review` ADD CONSTRAINT `Review_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Relations factures et paiements
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `PaymentProof` ADD CONSTRAINT `PaymentProof_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- ========================================
-- INDEX POUR PERFORMANCE
-- ========================================

-- Index pour les recherches fréquentes
CREATE INDEX `idx_user_email` ON `User`(`email`);
CREATE INDEX `idx_user_role` ON `User`(`role`);
CREATE INDEX `idx_product_status` ON `Product`(`status`);
CREATE INDEX `idx_product_type` ON `Product`(`type`);
CREATE INDEX `idx_product_category` ON `Product`(`categoryId`);
CREATE INDEX `idx_order_status` ON `Order`(`status`);
CREATE INDEX `idx_order_user` ON `Order`(`userId`);
CREATE INDEX `idx_invoice_status` ON `Invoice`(`status`);
CREATE INDEX `idx_invoice_user` ON `Invoice`(`userId`);
CREATE INDEX `idx_quote_status` ON `QuoteRequest`(`status`);

-- Message de confirmation
SELECT 'Base de données WindevExpert Platform créée avec succès!' as message;
SELECT 'Toutes les tables ont été créées avec les relations appropriées.' as info;
SELECT 'Vous pouvez maintenant exécuter le script de seed pour ajouter les données initiales.' as next_step;