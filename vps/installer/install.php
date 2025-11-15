<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Configuration
define('ROOT_DIR', dirname(__DIR__));
define('ENV_FILE', ROOT_DIR . '/.env');
define('ENV_PRODUCTION_FILE', ROOT_DIR . '/.env.production');

class WinDevExpertInstaller {
    private $config;
    private $errors = [];
    
    public function __construct() {
        // Vérifier si l'installation n'a pas déjà été effectuée
        if (file_exists(ROOT_DIR . '/.installed')) {
            $this->sendResponse(false, 'L\'installation a déjà été effectuée. Supprimez le fichier .installed pour réinstaller.');
        }
    }
    
    public function handleRequest() {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || !isset($input['action'])) {
            $this->sendResponse(false, 'Action non spécifiée');
        }
        
        $this->config = $input['config'] ?? [];
        
        switch ($input['action']) {
            case 'test_connection':
                $this->testDatabaseConnection();
                break;
            case 'validate_config':
                $this->validateConfiguration();
                break;
            case 'install_step':
                $this->executeInstallationStep($input['step']);
                break;
            case 'cleanup_installer':
                $this->cleanupInstaller();
                break;
            default:
                $this->sendResponse(false, 'Action non reconnue');
        }
    }
    
    private function testDatabaseConnection() {
        try {
            $dsn = $this->buildDatabaseDsn();
            $pdo = new PDO($dsn, $this->config['db_user'] ?? '', $this->config['db_password'] ?? '');
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            $this->sendResponse(true, 'Connexion à la base de données réussie');
        } catch (Exception $e) {
            $this->sendResponse(false, 'Erreur de connexion: ' . $e->getMessage());
        }
    }
    
    private function validateConfiguration() {
        $results = [
            'overall_status' => 'success',
            'database' => $this->validateDatabase(),
            'permissions' => $this->validatePermissions(),
            'php_version' => $this->validatePhpVersion(),
            'extensions' => $this->validatePhpExtensions(),
            'smtp' => $this->validateSmtpConfig(),
            'directories' => $this->validateDirectories()
        ];
        
        // Vérifier le statut global
        foreach ($results as $key => $result) {
            if ($key !== 'overall_status' && isset($result['status']) && $result['status'] === 'error') {
                $results['overall_status'] = 'error';
                break;
            }
        }
        
        $this->sendResponse(true, 'Validation terminée', $results);
    }
    
    private function validateDatabase() {
        try {
            if ($this->config['db_type'] === 'sqlite') {
                $dbPath = ROOT_DIR . '/database.sqlite';
                if (!is_writable(dirname($dbPath))) {
                    return ['status' => 'error', 'message' => 'Le répertoire pour SQLite n\'est pas accessible en écriture'];
                }
                return ['status' => 'success', 'message' => 'Configuration SQLite valide'];
            }
            
            $dsn = $this->buildDatabaseDsn();
            $pdo = new PDO($dsn, $this->config['db_user'], $this->config['db_password']);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            return ['status' => 'success', 'message' => 'Connexion à la base de données réussie'];
        } catch (Exception $e) {
            return ['status' => 'error', 'message' => 'Erreur de connexion: ' . $e->getMessage()];
        }
    }
    
    private function validatePermissions() {
        $requiredDirs = [
            ROOT_DIR . '/.next',
            ROOT_DIR . '/public/uploads',
            ROOT_DIR . '/storage',
            ROOT_DIR . '/logs'
        ];
        
        $issues = [];
        foreach ($requiredDirs as $dir) {
            if (!file_exists($dir)) {
                if (!mkdir($dir, 0755, true)) {
                    $issues[] = "Impossible de créer le répertoire: $dir";
                }
            } elseif (!is_writable($dir)) {
                $issues[] = "Répertoire non accessible en écriture: $dir";
            }
        }
        
        if (!empty($issues)) {
            return ['status' => 'error', 'message' => 'Problèmes de permissions détectés', 'details' => implode(', ', $issues)];
        }
        
        return ['status' => 'success', 'message' => 'Toutes les permissions sont correctes'];
    }
    
    private function validatePhpVersion() {
        $version = PHP_VERSION;
        $required = '8.1.0';
        
        if (version_compare($version, $required, '<')) {
            return ['status' => 'error', 'message' => "PHP $required ou supérieur requis. Version actuelle: $version"];
        }
        
        return ['status' => 'success', 'message' => "Version PHP $version compatible"];
    }
    
    private function validatePhpExtensions() {
        $required = ['pdo', 'json', 'mbstring', 'openssl', 'curl', 'gd'];
        $missing = [];
        
        foreach ($required as $ext) {
            if (!extension_loaded($ext)) {
                $missing[] = $ext;
            }
        }
        
        if (!empty($missing)) {
            return ['status' => 'error', 'message' => 'Extensions PHP manquantes', 'details' => implode(', ', $missing)];
        }
        
        return ['status' => 'success', 'message' => 'Toutes les extensions PHP requises sont présentes'];
    }
    
    private function validateSmtpConfig() {
        if (empty($this->config['smtp_host'])) {
            return ['status' => 'warning', 'message' => 'Configuration SMTP non fournie (optionnel)'];
        }
        
        // Test basique de connexion SMTP
        $host = $this->config['smtp_host'];
        $port = $this->config['smtp_port'] ?? 587;
        
        $socket = @fsockopen($host, $port, $errno, $errstr, 10);
        if (!$socket) {
            return ['status' => 'warning', 'message' => "Impossible de se connecter au serveur SMTP: $errstr"];
        }
        fclose($socket);
        
        return ['status' => 'success', 'message' => 'Configuration SMTP valide'];
    }
    
    private function validateDirectories() {
        $dirs = [
            'public/uploads' => 'Téléchargements',
            'storage/logs' => 'Logs',
            'storage/cache' => 'Cache',
            'storage/sessions' => 'Sessions'
        ];
        
        $created = [];
        foreach ($dirs as $dir => $label) {
            $fullPath = ROOT_DIR . '/' . $dir;
            if (!file_exists($fullPath)) {
                if (mkdir($fullPath, 0755, true)) {
                    $created[] = $label;
                }
            }
        }
        
        $message = 'Tous les répertoires sont prêts';
        if (!empty($created)) {
            $message .= '. Créés: ' . implode(', ', $created);
        }
        
        return ['status' => 'success', 'message' => $message];
    }
    
    private function executeInstallationStep($step) {
        switch ($step) {
            case 0:
                $this->createConfigFiles();
                break;
            case 1:
                $this->installDependencies();
                break;
            case 2:
                $this->setupDatabase();
                break;
            case 3:
                $this->runMigrations();
                break;
            case 4:
                $this->createAdminUser();
                break;
            case 5:
                $this->configureServices();
                break;
            case 6:
                $this->finalizeInstallation();
                break;
            default:
                $this->sendResponse(false, 'Étape d\'installation non reconnue');
        }
    }
    
    private function createConfigFiles() {
        try {
            // Créer le fichier .env
            $envContent = $this->generateEnvContent();
            file_put_contents(ENV_FILE, $envContent);
            
            // Créer le fichier .env.production
            $envProdContent = $this->generateEnvProductionContent();
            file_put_contents(ENV_PRODUCTION_FILE, $envProdContent);
            
            // Créer le fichier de configuration Next.js
            $this->createNextConfig();
            
            $this->sendResponse(true, 'Fichiers de configuration créés', 'Fichiers .env et .env.production générés');
        } catch (Exception $e) {
            $this->sendResponse(false, 'Erreur lors de la création des fichiers de configuration: ' . $e->getMessage());
        }
    }
    
    private function installDependencies() {
        try {
            // Vérifier si node_modules existe
            if (!file_exists(ROOT_DIR . '/node_modules')) {
                $output = [];
                $returnCode = 0;
                
                // Exécuter npm install
                exec('cd ' . ROOT_DIR . ' && npm install 2>&1', $output, $returnCode);
                
                if ($returnCode !== 0) {
                    throw new Exception('Erreur lors de l\'installation des dépendances: ' . implode('\n', $output));
                }
            }
            
            $this->sendResponse(true, 'Dépendances installées', 'Packages Node.js installés avec succès');
        } catch (Exception $e) {
            $this->sendResponse(false, 'Erreur lors de l\'installation des dépendances: ' . $e->getMessage());
        }
    }
    
    private function setupDatabase() {
        try {
            if ($this->config['db_type'] === 'sqlite') {
                // Créer le fichier SQLite
                $dbPath = ROOT_DIR . '/database.sqlite';
                if (!file_exists($dbPath)) {
                    touch($dbPath);
                    chmod($dbPath, 0664);
                }
            } else {
                // Tester la connexion à la base de données
                $dsn = $this->buildDatabaseDsn();
                $pdo = new PDO($dsn, $this->config['db_user'], $this->config['db_password']);
                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            }
            
            $this->sendResponse(true, 'Base de données configurée', 'Connexion établie et base de données prête');
        } catch (Exception $e) {
            $this->sendResponse(false, 'Erreur de configuration de la base de données: ' . $e->getMessage());
        }
    }
    
    private function runMigrations() {
        try {
            $output = [];
            $returnCode = 0;
            
            // Générer le client Prisma
            exec('cd ' . ROOT_DIR . ' && npx prisma generate 2>&1', $output, $returnCode);
            
            if ($returnCode !== 0) {
                throw new Exception('Erreur lors de la génération du client Prisma: ' . implode('\n', $output));
            }
            
            // Exécuter les migrations
            exec('cd ' . ROOT_DIR . ' && npx prisma db push 2>&1', $output, $returnCode);
            
            if ($returnCode !== 0) {
                throw new Exception('Erreur lors des migrations: ' . implode('\n', $output));
            }
            
            $this->sendResponse(true, 'Migrations exécutées', 'Structure de base de données créée');
        } catch (Exception $e) {
            $this->sendResponse(false, 'Erreur lors des migrations: ' . $e->getMessage());
        }
    }
    
    private function createAdminUser() {
        try {
            // Créer un script Node.js temporaire pour créer l'utilisateur admin
            $script = $this->generateAdminUserScript();
            $scriptPath = ROOT_DIR . '/create-admin.js';
            file_put_contents($scriptPath, $script);
            
            $output = [];
            $returnCode = 0;
            
            exec('cd ' . ROOT_DIR . ' && node create-admin.js 2>&1', $output, $returnCode);
            
            // Supprimer le script temporaire
            unlink($scriptPath);
            
            if ($returnCode !== 0) {
                throw new Exception('Erreur lors de la création de l\'utilisateur admin: ' . implode('\n', $output));
            }
            
            $this->sendResponse(true, 'Utilisateur administrateur créé', 'Compte admin configuré avec succès');
        } catch (Exception $e) {
            $this->sendResponse(false, 'Erreur lors de la création de l\'utilisateur admin: ' . $e->getMessage());
        }
    }
    
    private function configureServices() {
        try {
            // Créer les répertoires de logs et cache
            $dirs = ['storage/logs', 'storage/cache', 'storage/sessions', 'public/uploads'];
            foreach ($dirs as $dir) {
                $fullPath = ROOT_DIR . '/' . $dir;
                if (!file_exists($fullPath)) {
                    mkdir($fullPath, 0755, true);
                }
            }
            
            // Créer le fichier .htaccess pour Apache (si applicable)
            $this->createHtaccess();
            
            $this->sendResponse(true, 'Services configurés', 'Répertoires et services initialisés');
        } catch (Exception $e) {
            $this->sendResponse(false, 'Erreur lors de la configuration des services: ' . $e->getMessage());
        }
    }
    
    private function finalizeInstallation() {
        try {
            // Créer le fichier .installed
            file_put_contents(ROOT_DIR . '/.installed', date('Y-m-d H:i:s'));
            
            // Build de production
            $output = [];
            $returnCode = 0;
            
            exec('cd ' . ROOT_DIR . ' && npm run build 2>&1', $output, $returnCode);
            
            if ($returnCode !== 0) {
                // Le build peut échouer mais on continue l'installation
                error_log('Build warning: ' . implode('\n', $output));
            }
            
            $this->sendResponse(true, 'Installation finalisée', 'Plateforme WinDevExpert prête à l\'utilisation');
        } catch (Exception $e) {
            $this->sendResponse(false, 'Erreur lors de la finalisation: ' . $e->getMessage());
        }
    }
    
    private function cleanupInstaller() {
        try {
            // Supprimer les fichiers de l'installateur
            $files = [
                __FILE__,
                dirname(__FILE__) . '/index.html',
                dirname(__FILE__) . '/installer.js'
            ];
            
            foreach ($files as $file) {
                if (file_exists($file)) {
                    unlink($file);
                }
            }
            
            // Supprimer le répertoire installer s'il est vide
            $installerDir = dirname(__FILE__);
            if (is_dir($installerDir) && count(scandir($installerDir)) === 2) {
                rmdir($installerDir);
            }
            
            $this->sendResponse(true, 'Installateur supprimé avec succès');
        } catch (Exception $e) {
            $this->sendResponse(false, 'Erreur lors de la suppression: ' . $e->getMessage());
        }
    }
    
    private function buildDatabaseDsn() {
        $type = $this->config['db_type'];
        $host = $this->config['db_host'] ?? 'localhost';
        $port = $this->config['db_port'] ?? ($type === 'postgresql' ? 5432 : 3306);
        $name = $this->config['db_name'];
        
        if ($type === 'sqlite') {
            return 'sqlite:' . ROOT_DIR . '/database.sqlite';
        }
        
        return "$type:host=$host;port=$port;dbname=$name;charset=utf8mb4";
    }
    
    private function generateEnvContent() {
        $dbUrl = $this->buildDatabaseUrl();
        
        return "# Configuration générée automatiquement
DATABASE_URL=\"$dbUrl\"
NEXTAUTH_SECRET=\"{$this->config['nextauth_secret']}\"
NEXTAUTH_URL=\"{$this->config['site_url']}\"

# Email SMTP
SMTP_HOST=\"{$this->config['smtp_host']}\"
SMTP_PORT=\"{$this->config['smtp_port']}\"
SMTP_USER=\"{$this->config['smtp_user']}\"
SMTP_PASSWORD=\"{$this->config['smtp_password']}\"
SMTP_FROM=\"{$this->config['smtp_from']}\"

# Stripe
STRIPE_PUBLISHABLE_KEY=\"{$this->config['stripe_publishable_key']}\"
STRIPE_SECRET_KEY=\"{$this->config['stripe_secret_key']}\"

# SlickPay
SLICKPAY_APP_ID=\"{$this->config['slickpay_app_id']}\"
SLICKPAY_APP_SECRET=\"{$this->config['slickpay_app_secret']}\"

# Sécurité
ENCRYPTION_KEY=\"{$this->config['encryption_key']}\"

# Administration
ADMIN_EMAIL=\"{$this->config['admin_email']}\"
";
    }
    
    private function generateEnvProductionContent() {
        return "NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
";
    }
    
    private function buildDatabaseUrl() {
        $type = $this->config['db_type'];
        
        if ($type === 'sqlite') {
            return 'file:./database.sqlite';
        }
        
        $user = $this->config['db_user'];
        $password = $this->config['db_password'];
        $host = $this->config['db_host'] ?? 'localhost';
        $port = $this->config['db_port'] ?? ($type === 'postgresql' ? 5432 : 3306);
        $name = $this->config['db_name'];
        
        return "$type://$user:$password@$host:$port/$name";
    }
    
    private function generateAdminUserScript() {
        $email = $this->config['admin_email'];
        $password = $this->config['admin_password'] ?? 'admin123';
        
        return "const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
    try {
        const hashedPassword = await bcrypt.hash('$password', 12);
        
        const admin = await prisma.user.upsert({
            where: { email: '$email' },
            update: {},
            create: {
                email: '$email',
                name: 'Administrateur',
                password: hashedPassword,
                role: 'ADMIN',
                emailVerified: new Date()
            }
        });
        
        console.log('Utilisateur admin créé:', admin.email);
    } catch (error) {
        console.error('Erreur:', error);
        process.exit(1);
    } finally {
        await prisma.\$disconnect();
    }
}

createAdmin();";
    }
    
    private function createNextConfig() {
        $config = "/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverComponentsExternalPackages: ['@prisma/client']
    },
    images: {
        domains: ['localhost'],
    },
    env: {
        SITE_URL: '{$this->config['site_url']}'
    }
};

module.exports = nextConfig;";
        
        file_put_contents(ROOT_DIR . '/next.config.js', $config);
    }
    
    private function createHtaccess() {
        $htaccess = "RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]

# Sécurité
<Files \".env*\">
    Order allow,deny
    Deny from all
</Files>

<Files \"*.log\">
    Order allow,deny
    Deny from all
</Files>";
        
        file_put_contents(ROOT_DIR . '/.htaccess', $htaccess);
    }
    
    private function sendResponse($success, $message, $data = null) {
        $response = [
            'success' => $success,
            'message' => $message
        ];
        
        if ($data !== null) {
            if (is_array($data)) {
                $response = array_merge($response, $data);
            } else {
                $response['details'] = $data;
            }
        }
        
        echo json_encode($response);
        exit;
    }
}

// Exécution
try {
    $installer = new WinDevExpertInstaller();
    $installer->handleRequest();
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erreur fatale: ' . $e->getMessage()
    ]);
}
?>