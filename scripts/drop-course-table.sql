-- Script pour supprimer les tables liées au modèle obsolète "Course"
-- IMPORTANT: Sauvegardez vos données avant exécution.
-- Ordre: supprimer d'abord les tables dépendantes pour éviter les contraintes.

USE windevexpert_platform;

-- Supprimer les contraintes si elles existent (ignorer erreurs si absentes)
-- Les noms de contraintes correspondent à ceux créés dans create-tables-mysql.sql
-- Vous pouvez exécuter chaque ALTER individuellement si nécessaire.
ALTER TABLE `Progress` DROP FOREIGN KEY `Progress_userId_fkey`;
ALTER TABLE `Progress` DROP FOREIGN KEY `Progress_lessonId_fkey`;
ALTER TABLE `Progress` DROP FOREIGN KEY `Progress_enrollmentId_fkey`;

ALTER TABLE `Enrollment` DROP FOREIGN KEY `Enrollment_userId_fkey`;
ALTER TABLE `Enrollment` DROP FOREIGN KEY `Enrollment_courseId_fkey`;

ALTER TABLE `Lesson` DROP FOREIGN KEY `Lesson_courseId_fkey`;

-- Supprimer les tables (progress -> enrollment -> lesson -> course)
DROP TABLE IF EXISTS `Progress`;
DROP TABLE IF EXISTS `Enrollment`;
DROP TABLE IF EXISTS `Lesson`;
DROP TABLE IF EXISTS `Course`;

SELECT 'Tables Course/Lesson/Enrollment/Progress supprimées.' AS info;