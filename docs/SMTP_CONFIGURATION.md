# Configuration SMTP

Ce document explique comment configurer le service SMTP pour l'envoi d'emails.

## Migration de SMTP2GO vers SMTP Direct

Le projet a été migré de l'API SMTP2GO vers un service SMTP direct utilisant `nodemailer` pour plus de flexibilité et de contrôle.

## Variables d'environnement requises

Ajoutez ces variables à votre fichier `.env` :

```env
# Configuration SMTP
SMTP_HOST="votre-serveur-smtp.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="votre-nom-utilisateur"
SMTP_PASS="votre-mot-de-passe"
EMAIL_FROM="noreply@votre-domaine.com"
EMAIL_FROM_NAME="Votre Nom"
```

## Paramètres de configuration

### SMTP_HOST
L'adresse du serveur SMTP (ex: `smtp.gmail.com`, `smtp.office365.com`)

### SMTP_PORT
Le port du serveur SMTP :
- `587` : STARTTLS (recommandé) - Configuration automatique
- `465` : SSL/TLS direct - Configuration automatique
- `25` : STARTTLS ou non sécurisé - Configuration automatique
- Autres ports : Configuration flexible

### SMTP_SECURE
- `true` : Pour le port 465 (SSL/TLS direct)
- `false` : Pour les autres ports (STARTTLS ou non sécurisé)

**Note :** La plateforme détecte automatiquement la configuration SSL/TLS optimale selon le port utilisé.

### SMTP_USER
Nom d'utilisateur pour l'authentification SMTP

### SMTP_PASS
Mot de passe pour l'authentification SMTP

### EMAIL_FROM
Adresse email d'expéditeur

### EMAIL_FROM_NAME
Nom d'affichage de l'expéditeur

## Exemples de configuration

### Gmail
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="votre-email@gmail.com"
SMTP_PASS="votre-mot-de-passe-app"
```

### Outlook/Office365
```env
SMTP_HOST="smtp.office365.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="votre-email@outlook.com"
SMTP_PASS="votre-mot-de-passe"
```

### Serveur SMTP personnalisé
```env
SMTP_HOST="mail.votre-domaine.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="noreply@votre-domaine.com"
SMTP_PASS="votre-mot-de-passe"
```

## Mode développement

En mode développement (`NODE_ENV=development`) ou si la configuration SMTP est incomplète, le service fonctionne en mode simulation :
- Les emails ne sont pas réellement envoyés
- Le contenu est affiché dans la console
- Les logs sont enregistrés en base de données

## Test de la configuration

Pour tester votre configuration SMTP, vous pouvez utiliser la méthode `testConnection()` :

```typescript
import { smtpService } from '@/lib/services/smtp-service'

const isConnected = await smtpService.testConnection()
console.log('SMTP configuré :', isConnected)
```

## Dépannage

### Erreur d'authentification
- Vérifiez vos identifiants SMTP
- Pour Gmail, utilisez un mot de passe d'application
- Vérifiez que l'authentification 2FA est configurée si nécessaire

### Erreur de connexion
- Vérifiez l'adresse du serveur SMTP
- Vérifiez le port utilisé
- Vérifiez les paramètres de sécurité (SSL/TLS)

### Erreur SSL "wrong version number"
Cette erreur indique un problème de configuration SSL/TLS. La plateforme résout automatiquement ce problème en :
- Détectant le type de connexion selon le port (465=SSL, 587/25=STARTTLS)
- Utilisant des ciphers sécurisés et modernes
- Configurant automatiquement TLS v1.2 minimum
- Gérant les timeouts de connexion

**Solutions manuelles si le problème persiste :**
- Port 465 : Utilisez `SMTP_SECURE="true"` pour SSL direct
- Port 587 : Utilisez `SMTP_SECURE="false"` pour STARTTLS
- Vérifiez que votre serveur SMTP supporte TLS v1.2+

### Emails non reçus
- Vérifiez les dossiers spam/indésirables
- Vérifiez la réputation de votre domaine
- Vérifiez les logs d'erreur dans la console

## Sécurité

- Ne jamais commiter les vraies valeurs dans le code
- Utilisez des variables d'environnement
- Utilisez des mots de passe d'application quand possible
- Activez l'authentification 2FA sur vos comptes email