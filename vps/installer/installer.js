// Variables globales
let currentStep = 1;
let installationConfig = {};
let validationResults = {};

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    updateDbConfig();
    
    // Écouteur pour le changement de type de base de données
    document.getElementById('db_type').addEventListener('change', updateDbConfig);
});

// Mise à jour de la configuration de base de données selon le type
function updateDbConfig() {
    const dbType = document.getElementById('db_type').value;
    const dbConfig = document.getElementById('db-config');
    const portField = document.getElementById('db_port');
    
    if (dbType === 'sqlite') {
        dbConfig.style.display = 'none';
    } else {
        dbConfig.style.display = 'block';
        if (dbType === 'postgresql') {
            portField.value = '5432';
        } else if (dbType === 'mysql') {
            portField.value = '3306';
        }
    }
}

// Génération de clés secrètes
function generateSecret(fieldId) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let secret = '';
    for (let i = 0; i < 64; i++) {
        secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    document.getElementById(fieldId).value = secret;
}

// Initialisation du formulaire avec des valeurs par défaut
function initializeForm() {
    // Génération automatique des clés secrètes
    generateSecret('nextauth_secret');
    generateSecret('encryption_key');
    
    // URL du site basée sur le domaine actuel
    const currentDomain = window.location.hostname;
    if (currentDomain !== 'localhost' && currentDomain !== '127.0.0.1') {
        document.getElementById('site_url').value = `https://${currentDomain}`;
    }
}

// Test de connexion à la base de données
async function testConnection() {
    const button = event.target;
    const originalText = button.innerHTML;
    
    button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Test en cours...';
    button.disabled = true;
    
    try {
        const config = getFormData();
        
        const response = await fetch('install.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'test_connection',
                config: config
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Connexion réussie !', 'success');
        } else {
            showNotification(`Erreur de connexion: ${result.message}`, 'error');
        }
    } catch (error) {
        showNotification(`Erreur: ${error.message}`, 'error');
    } finally {
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

// Récupération des données du formulaire
function getFormData() {
    const form = document.getElementById('installation-form');
    const formData = new FormData(form);
    const config = {};
    
    for (let [key, value] of formData.entries()) {
        config[key] = value;
    }
    
    return config;
}

// Navigation entre les étapes
function nextStep() {
    if (validateCurrentStep()) {
        installationConfig = getFormData();
        currentStep++;
        updateStepDisplay();
        
        if (currentStep === 2) {
            performValidation();
        }
    }
}

function previousStep() {
    currentStep--;
    updateStepDisplay();
}

// Validation de l'étape actuelle
function validateCurrentStep() {
    if (currentStep === 1) {
        const requiredFields = ['site_url', 'admin_email'];
        const dbType = document.getElementById('db_type').value;
        
        if (dbType !== 'sqlite') {
            requiredFields.push('db_name', 'db_user');
        }
        
        for (let field of requiredFields) {
            const element = document.getElementById(field);
            if (!element.value.trim()) {
                showNotification(`Le champ "${element.previousElementSibling.textContent}" est obligatoire`, 'error');
                element.focus();
                return false;
            }
        }
        
        // Validation de l'URL
        const siteUrl = document.getElementById('site_url').value;
        try {
            new URL(siteUrl);
        } catch {
            showNotification('L\'URL du site n\'est pas valide', 'error');
            document.getElementById('site_url').focus();
            return false;
        }
        
        // Validation de l'email
        const email = document.getElementById('admin_email').value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('L\'adresse email n\'est pas valide', 'error');
            document.getElementById('admin_email').focus();
            return false;
        }
    }
    
    return true;
}

// Mise à jour de l'affichage des étapes
function updateStepDisplay() {
    // Masquer toutes les étapes
    document.querySelectorAll('.step-content').forEach(step => {
        step.classList.add('hidden');
    });
    
    // Afficher l'étape actuelle
    document.getElementById(`step-${currentStep}`).classList.remove('hidden');
    
    // Mettre à jour les indicateurs d'étapes
    for (let i = 1; i <= 4; i++) {
        const stepElement = document.getElementById(`step${i}`);
        stepElement.className = stepElement.className.replace(/step-(active|completed|inactive)/, '');
        
        if (i < currentStep) {
            stepElement.classList.add('step-completed');
        } else if (i === currentStep) {
            stepElement.classList.add('step-active');
        } else {
            stepElement.classList.add('step-inactive');
        }
    }
}

// Validation de la configuration
async function performValidation() {
    const validationContainer = document.getElementById('validation-results');
    validationContainer.innerHTML = '<div class="text-center"><i class="fas fa-spinner fa-spin text-2xl text-blue-600"></i><p class="mt-2">Validation en cours...</p></div>';
    
    try {
        const response = await fetch('install.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'validate_config',
                config: installationConfig
            })
        });
        
        const result = await response.json();
        validationResults = result;
        
        displayValidationResults(result);
        
        // Activer le bouton d'installation si tout est OK
        const installBtn = document.getElementById('install-btn');
        if (result.overall_status === 'success') {
            installBtn.disabled = false;
            installBtn.classList.remove('disabled:bg-gray-400');
        }
        
    } catch (error) {
        validationContainer.innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <div class="flex items-center">
                    <i class="fas fa-exclamation-triangle text-red-600 mr-3"></i>
                    <div>
                        <h4 class="font-bold text-red-800">Erreur de validation</h4>
                        <p class="text-red-600">${error.message}</p>
                    </div>
                </div>
            </div>
        `;
    }
}

// Affichage des résultats de validation
function displayValidationResults(results) {
    const container = document.getElementById('validation-results');
    let html = '';
    
    const checks = [
        { key: 'database', label: 'Connexion à la base de données', icon: 'database' },
        { key: 'permissions', label: 'Permissions des fichiers', icon: 'lock' },
        { key: 'php_version', label: 'Version PHP', icon: 'code' },
        { key: 'extensions', label: 'Extensions PHP requises', icon: 'puzzle-piece' },
        { key: 'smtp', label: 'Configuration SMTP', icon: 'envelope' },
        { key: 'directories', label: 'Répertoires d\'écriture', icon: 'folder' }
    ];
    
    checks.forEach(check => {
        const result = results[check.key];
        if (result) {
            const statusClass = result.status === 'success' ? 'green' : result.status === 'warning' ? 'yellow' : 'red';
            const statusIcon = result.status === 'success' ? 'check-circle' : result.status === 'warning' ? 'exclamation-triangle' : 'times-circle';
            
            html += `
                <div class="bg-${statusClass}-50 border border-${statusClass}-200 rounded-lg p-4">
                    <div class="flex items-start">
                        <i class="fas fa-${statusIcon} text-${statusClass}-600 mr-3 mt-1"></i>
                        <div class="flex-1">
                            <h4 class="font-bold text-${statusClass}-800 flex items-center">
                                <i class="fas fa-${check.icon} mr-2"></i>
                                ${check.label}
                            </h4>
                            <p class="text-${statusClass}-600 mt-1">${result.message}</p>
                            ${result.details ? `<div class="text-sm text-${statusClass}-500 mt-2">${result.details}</div>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }
    });
    
    container.innerHTML = html;
}

// Démarrage de l'installation
async function startInstallation() {
    currentStep = 3;
    updateStepDisplay();
    
    const logContainer = document.getElementById('installation-log');
    const progressBar = document.getElementById('overall-progress-bar');
    const progressText = document.getElementById('overall-progress-text');
    const stepsContainer = document.getElementById('installation-steps');
    
    const steps = [
        'Création des fichiers de configuration',
        'Installation des dépendances',
        'Configuration de la base de données',
        'Exécution des migrations',
        'Création de l\'utilisateur administrateur',
        'Configuration des services',
        'Finalisation de l\'installation'
    ];
    
    // Initialisation des étapes
    stepsContainer.innerHTML = steps.map((step, index) => `
        <div id="install-step-${index}" class="flex items-center p-3 bg-gray-50 rounded-lg">
            <div class="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                <span class="text-xs font-bold text-gray-600">${index + 1}</span>
            </div>
            <span class="text-gray-600">${step}</span>
            <div class="ml-auto">
                <i class="fas fa-clock text-gray-400"></i>
            </div>
        </div>
    `).join('');
    
    try {
        for (let i = 0; i < steps.length; i++) {
            const stepElement = document.getElementById(`install-step-${i}`);
            const stepIcon = stepElement.querySelector('.ml-auto i');
            const stepCircle = stepElement.querySelector('.w-6');
            
            // Marquer l'étape comme en cours
            stepElement.classList.remove('bg-gray-50');
            stepElement.classList.add('bg-blue-50');
            stepIcon.className = 'fas fa-spinner fa-spin text-blue-600';
            stepCircle.classList.remove('bg-gray-300');
            stepCircle.classList.add('bg-blue-600');
            stepCircle.querySelector('span').classList.add('text-white');
            
            // Log de l'étape
            addToLog(`Étape ${i + 1}: ${steps[i]}...`);
            
            // Appel à l'API d'installation
            const response = await fetch('install.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'install_step',
                    step: i,
                    config: installationConfig
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Marquer l'étape comme terminée
                stepElement.classList.remove('bg-blue-50');
                stepElement.classList.add('bg-green-50');
                stepIcon.className = 'fas fa-check text-green-600';
                stepCircle.classList.remove('bg-blue-600');
                stepCircle.classList.add('bg-green-600');
                
                addToLog(`✓ ${steps[i]} - Terminé`);
                if (result.details) {
                    addToLog(`  ${result.details}`);
                }
            } else {
                // Marquer l'étape comme échouée
                stepElement.classList.remove('bg-blue-50');
                stepElement.classList.add('bg-red-50');
                stepIcon.className = 'fas fa-times text-red-600';
                stepCircle.classList.remove('bg-blue-600');
                stepCircle.classList.add('bg-red-600');
                
                addToLog(`✗ Erreur: ${result.message}`);
                throw new Error(result.message);
            }
            
            // Mise à jour de la progression
            const progress = Math.round(((i + 1) / steps.length) * 100);
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `${progress}%`;
            
            // Délai pour l'effet visuel
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        addToLog('Installation terminée avec succès !');
        
        // Passer à l'étape finale
        setTimeout(() => {
            currentStep = 4;
            updateStepDisplay();
            setupFinalStep();
        }, 2000);
        
    } catch (error) {
        addToLog(`Erreur fatale: ${error.message}`);
        addToLog('Installation interrompue.');
    }
}

// Ajout d'une ligne au log
function addToLog(message) {
    const logContainer = document.getElementById('installation-log');
    const timestamp = new Date().toLocaleTimeString();
    logContainer.innerHTML += `<div>[${timestamp}] ${message}</div>`;
    logContainer.scrollTop = logContainer.scrollHeight;
}

// Configuration de l'étape finale
function setupFinalStep() {
    const siteUrl = installationConfig.site_url;
    document.getElementById('site-link').href = siteUrl;
    document.getElementById('admin-link').href = `${siteUrl}/nimda`;
}

// Téléchargement de la configuration
function downloadConfig() {
    const config = {
        ...installationConfig,
        installation_date: new Date().toISOString(),
        version: '1.0.0'
    };
    
    // Masquer les mots de passe sensibles
    const sensitiveFields = ['db_password', 'nextauth_secret', 'encryption_key', 'smtp_password', 'stripe_secret_key', 'slickpay_app_secret'];
    sensitiveFields.forEach(field => {
        if (config[field]) {
            config[field] = '***HIDDEN***';
        }
    });
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'windevexpert-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Nettoyage de l'installateur
async function cleanupInstaller() {
    if (confirm('Êtes-vous sûr de vouloir supprimer l\'installateur ? Cette action est irréversible.')) {
        try {
            const response = await fetch('install.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'cleanup_installer'
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification('Installateur supprimé avec succès', 'success');
                setTimeout(() => {
                    window.location.href = installationConfig.site_url;
                }, 2000);
            } else {
                showNotification(`Erreur lors de la suppression: ${result.message}`, 'error');
            }
        } catch (error) {
            showNotification(`Erreur: ${error.message}`, 'error');
        }
    }
}

// Affichage des notifications
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500';
    
    notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-transform duration-300 translate-x-full`;
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : type === 'warning' ? 'exclamation' : 'info'} mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Suppression automatique
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}