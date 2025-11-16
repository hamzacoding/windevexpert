# 📚 Documentation API - WinDevExpert Platform

Documentation complète de l'API REST pour WinDevExpert Platform.

## 📋 Table des Matières

1. [Authentification](#authentification)
2. [Utilisateurs](#utilisateurs)
3. [Projets](#projets)
4. [Templates](#templates)
5. [Fichiers](#fichiers)
6. [Webhooks](#webhooks)
7. [Rate Limiting](#rate-limiting)
8. [Codes d'Erreur](#codes-derreur)
9. [Exemples](#exemples)

## 🔐 Authentification

### JWT Token

Toutes les requêtes API nécessitent un token JWT valide.

#### Obtenir un Token

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Réponse réussie:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "developer"
    }
  }
}
```

#### Utiliser le Token

```http
GET /api/v1/users/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Rafraîchir le Token

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 👥 Utilisateurs

### Créer un Utilisateur

```http
POST /api/v1/users
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "securepassword123",
  "name": "Jane Smith",
  "role": "developer"
}
```

### Obtenir le Profil

```http
GET /api/v1/users/profile
Authorization: Bearer {token}
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "developer",
    "avatar": "https://api.windevexpert.com/uploads/avatars/123.jpg",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T14:45:00Z",
    "subscription": {
      "plan": "pro",
      "expiresAt": "2024-12-31T23:59:59Z"
    },
    "stats": {
      "projectsCount": 15,
      "templatesCount": 8,
      "storageUsed": "2.5GB"
    }
  }
}
```

### Mettre à jour le Profil

```http
PUT /api/v1/users/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Updated",
  "avatar": "base64-encoded-image",
  "bio": "Développeur full-stack passionné"
}
```

### Liste des Utilisateurs (Admin)

```http
GET /api/v1/users?role=developer&page=1&limit=20
Authorization: Bearer {admin_token}
```

**Paramètres de requête:**
- `role`: Filtrer par rôle (admin, developer, client)
- `status`: Filtrer par statut (active, inactive, suspended)
- `search`: Recherche par nom ou email
- `page`: Numéro de page (défaut: 1)
- `limit`: Nombre d'éléments par page (défaut: 20, max: 100)

## 📁 Projets

### Créer un Projet

```http
POST /api/v1/projects
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Mon Application Web",
  "description": "Application de gestion de tâches",
  "type": "webapp",
  "templateId": "template-uuid",
  "settings": {
    "language": "javascript",
    "framework": "react",
    "database": "postgresql",
    "deployment": {
      "provider": "aws",
      "region": "us-east-1"
    }
  }
}
```

### Liste des Projets

```http
GET /api/v1/projects?status=active&page=1&limit=10
Authorization: Bearer {token}
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "proj-123e4567-e89b-12d3-a456-426614174000",
        "name": "Mon Application Web",
        "description": "Application de gestion de tâches",
        "type": "webapp",
        "status": "active",
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-20T14:45:00Z",
        "owner": {
          "id": "user-123",
          "name": "John Doe",
          "avatar": "https://api.windevexpert.com/uploads/avatars/user-123.jpg"
        },
        "stats": {
          "filesCount": 45,
          "size": "15.2MB",
          "lastActivity": "2024-01-20T12:30:00Z"
        },
        "deployment": {
          "status": "deployed",
          "url": "https://mon-app-123.windevexpert.app",
          "lastDeploy": "2024-01-19T16:20:00Z"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### Obtenir un Projet

```http
GET /api/v1/projects/{projectId}
Authorization: Bearer {token}
```

### Mettre à jour un Projet

```http
PUT /api/v1/projects/{projectId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Mon Application Web V2",
  "description": "Version améliorée avec nouvelles fonctionnalités",
  "settings": {
    "language": "typescript",
    "framework": "nextjs"
  }
}
```

### Supprimer un Projet

```http
DELETE /api/v1/projects/{projectId}
Authorization: Bearer {token}
```

### Fichiers d'un Projet

```http
GET /api/v1/projects/{projectId}/files
Authorization: Bearer {token}
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "files": [
      {
        "id": "file-123",
        "name": "index.html",
        "path": "/src/index.html",
        "type": "file",
        "size": 1024,
        "contentType": "text/html",
        "lastModified": "2024-01-20T14:30:00Z",
        "url": "https://api.windevexpert.com/projects/proj-123/files/file-123"
      },
      {
        "id": "folder-456",
        "name": "components",
        "path": "/src/components",
        "type": "folder",
        "childrenCount": 5
      }
    ]
  }
}
```

## 📋 Templates

### Liste des Templates

```http
GET /api/v1/templates?category=web&page=1&limit=20
Authorization: Bearer {token}
```

**Paramètres:**
- `category`: web, mobile, api, fullstack
- `technology`: react, vue, angular, nodejs, python
- `difficulty`: beginner, intermediate, advanced
- `search`: recherche par nom ou description

**Réponse:**
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "template-123e4567-e89b-12d3-a456-426614174000",
        "name": "React Dashboard",
        "description": "Dashboard moderne avec React et Material-UI",
        "category": "web",
        "technology": "react",
        "difficulty": "intermediate",
        "preview": "https://api.windevexpert.com/templates/preview-123.jpg",
        "features": ["Authentication", "Dashboard", "Charts", "Tables"],
        "filesCount": 25,
        "size": "2.1MB",
        "rating": 4.8,
        "downloads": 1250,
        "author": {
          "name": "WinDevExpert Team",
          "avatar": "https://api.windevexpert.com/uploads/avatars/team.jpg"
        },
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

### Obtenir un Template

```http
GET /api/v1/templates/{templateId}
Authorization: Bearer {token}
```

### Utiliser un Template

```http
POST /api/v1/templates/{templateId}/use
Authorization: Bearer {token}
Content-Type: application/json

{
  "projectName": "Mon Dashboard",
  "projectDescription": "Dashboard personnalisé pour mon entreprise"
}
```

## 📎 Fichiers

### Téléverser un Fichier

```http
POST /api/v1/files/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="file"; filename="example.js"
Content-Type: application/javascript

[contenu du fichier]
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="projectId"

proj-123e4567-e89b-12d3-a456-426614174000
------WebKitFormBoundary7MA4YWxkTrZu0gW--
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "file": {
      "id": "file-123e4567-e89b-12d3-a456-426614174000",
      "name": "example.js",
      "originalName": "example.js",
      "size": 2048,
      "contentType": "application/javascript",
      "url": "https://api.windevexpert.com/uploads/files/file-123.js",
      "projectId": "proj-123e4567-e89b-12d3-a456-426614174000"
    }
  }
}
```

### Télécharger un Fichier

```http
GET /api/v1/files/{fileId}/download
Authorization: Bearer {token}
```

### Supprimer un Fichier

```http
DELETE /api/v1/files/{fileId}
Authorization: Bearer {token}
```

## 🔄 Webhooks

### Créer un Webhook

```http
POST /api/v1/webhooks
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Déploiement Automatique",
  "url": "https://mon-webhook.com/deploy",
  "events": ["project.deploy", "project.update"],
  "secret": "my-webhook-secret",
  "active": true
}
```

### Liste des Webhooks

```http
GET /api/v1/webhooks
Authorization: Bearer {token}
```

### Payload du Webhook

```json
{
  "event": "project.deploy",
  "timestamp": "2024-01-20T14:30:00Z",
  "data": {
    "projectId": "proj-123e4567-e89b-12d3-a456-426614174000",
    "projectName": "Mon Application Web",
    "deploymentUrl": "https://mon-app-123.windevexpert.app",
    "status": "success"
  },
  "signature": "sha256=..."
}
```

## ⏱️ Rate Limiting

### Limites

- **Authentification**: 10 requêtes par minute
- **API générale**: 100 requêtes par minute
- **Upload de fichiers**: 5 requêtes par minute
- **Création de projets**: 20 requêtes par heure

### Headers de Réponse

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1642681200
```

### Réponse de Rate Limit

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests, please try again later.",
    "retryAfter": 60
  }
}
```

## ❌ Codes d'Erreur

### Codes HTTP

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

### Erreurs Courantes

```json
// Erreur de validation
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}

// Erreur d'authentification
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid credentials"
  }
}

// Erreur de permission
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions"
  }
}

// Ressource non trouvée
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Project not found"
  }
}
```

## 💡 Exemples

### Créer un Projet Complet

```javascript
const axios = require('axios');

const API_URL = 'https://api.windevexpert.com/api/v1';
const TOKEN = 'your-jwt-token';

async function createProject() {
  try {
    // 1. Créer le projet
    const projectResponse = await axios.post(
      `${API_URL}/projects`,
      {
        name: 'Ma Nouvelle App',
        description: 'Application de gestion',
        type: 'webapp',
        templateId: 'template-123'
      },
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const projectId = projectResponse.data.data.id;
    console.log('Projet créé:', projectId);

    // 2. Téléverser des fichiers
    const formData = new FormData();
    formData.append('file', fs.createReadStream('./index.html'));
    formData.append('projectId', projectId);

    const uploadResponse = await axios.post(
      `${API_URL}/files/upload`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          ...formData.getHeaders()
        }
      }
    );

    console.log('Fichier téléversé:', uploadResponse.data.data.file.id);

    // 3. Déployer le projet
    const deployResponse = await axios.post(
      `${API_URL}/projects/${projectId}/deploy`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`
        }
      }
    );

    console.log('Projet déployé:', deployResponse.data.data.url);

  } catch (error) {
    console.error('Erreur:', error.response?.data || error.message);
  }
}

createProject();
```

### Script Python d'Upload

```python
import requests
import json
from pathlib import Path

API_URL = "https://api.windevexpert.com/api/v1"
TOKEN = "your-jwt-token"

def upload_project_files(project_id, files_directory):
    headers = {
        "Authorization": f"Bearer {TOKEN}"
    }
    
    # Parcourir tous les fichiers du répertoire
    for file_path in Path(files_directory).rglob("*"):
        if file_path.is_file():
            # Créer le chemin relatif pour préserver la structure
            relative_path = file_path.relative_to(files_directory)
            
            with open(file_path, 'rb') as f:
                files = {
                    'file': (str(relative_path), f, 'application/octet-stream')
                }
                data = {
                    'projectId': project_id,
                    'path': str(relative_path.parent)
                }
                
                response = requests.post(
                    f"{API_URL}/files/upload",
                    headers=headers,
                    files=files,
                    data=data
                )
                
                if response.status_code == 200:
                    print(f"✅ Uploadé: {relative_path}")
                else:
                    print(f"❌ Erreur pour {relative_path}: {response.text}")

# Utilisation
upload_project_files("proj-123", "./mon-projet")
```

### Webhook Handler (Node.js)

```javascript
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body);
  const secret = 'my-webhook-secret';
  
  if (!verifyWebhookSignature(payload, signature, secret)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  const { event, data } = req.body;
  
  switch (event) {
    case 'project.deploy':
      console.log(`Projet ${data.projectName} déployé: ${data.deploymentUrl}`);
      // Actions de déploiement
      break;
      
    case 'project.update':
      console.log(`Projet ${data.projectName} mis à jour`);
      // Actions de mise à jour
      break;
      
    default:
      console.log(`Événement non géré: ${event}`);
  }
  
  res.json({ received: true });
});

app.listen(3000, () => {
  console.log('Webhook server running on port 3000');
});
```

## 📚 Référence OpenAPI

La documentation OpenAPI complète est disponible à:
- **Swagger UI**: https://api.windevexpert.com/docs
- **OpenAPI JSON**: https://api.windevexpert.com/openapi.json
- **Postman Collection**: https://api.windevexpert.com/postman-collection.json

## 🔗 Liens Utiles

- **SDK JavaScript**: https://github.com/windevexpert/windevexpert-js-sdk
- **SDK Python**: https://github.com/windevexpert/windevexpert-python-sdk
- **Exemples**: https://github.com/windevexpert/windevexpert-examples
- **Support API**: support-api@windevexpert.com

---

**Dernière mise à jour**: Janvier 2024
**Version API**: v1