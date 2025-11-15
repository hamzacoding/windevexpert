-- Script de création de la base de données MySQL pour WindevExpert Platform
-- À exécuter dans phpMyAdmin ou MySQL CLI

-- Créer la base de données
CREATE DATABASE IF NOT EXISTS windevexpert_platform 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Utiliser la base de données
USE windevexpert_platform;

-- Créer un utilisateur dédié (optionnel, pour la sécurité)
-- Remplacez 'your_password' par un mot de passe sécurisé
CREATE USER IF NOT EXISTS 'windevexpert_user'@'localhost' IDENTIFIED BY 'windevexpert_password';

-- Accorder tous les privilèges sur la base de données à l'utilisateur
GRANT ALL PRIVILEGES ON windevexpert_platform.* TO 'windevexpert_user'@'localhost';

-- Appliquer les changements de privilèges
FLUSH PRIVILEGES;

-- Afficher un message de confirmation
SELECT 'Base de données windevexpert_platform créée avec succès!' as message;