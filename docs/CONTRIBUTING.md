# 🤝 Guide de Contribution - WinDevExpert Platform

Merci de votre intérêt pour contribuer à WinDevExpert Platform ! Ce guide vous aidera à démarrer.

## 📋 Table des Matières

1. [Code de Conduite](#code-de-conduite)
2. [Comment Contribuer](#comment-contribuer)
3. [Configuration du Développement](#configuration-du-développement)
4. [Standards de Code](#standards-de-code)
5. [Processus de Pull Request](#processus-de-pull-request)
6. [Rapport de Bugs](#rapport-de-bugs)
7. [Demandes de Fonctionnalités](#demandes-de-fonctionnalités)
8. [Documentation](#documentation)
9. [Tests](#tests)
10. [Reconnaissance](#reconnaissance)

## Code de Conduite

### Notre Engagement

Nous nous engageons à créer une expérience d'apprentissage et de collaboration accueillante et inclusive pour tous les participants, indépendamment de leur niveau d'expérience, de leur âge, de leur taille, de leur handicap, de leur origine ethnique, de leurs caractéristiques sexuelles, de leur identité et expression de genre, de leur niveau de compétence, de leur nationalité, de leur apparence personnelle, de leur race, de leur religion ou de leur identité et orientation sexuelle.

### Nos Standards

Exemples de comportements qui contribuent à créer un environnement positif :

- Utiliser un langage accueillant et inclusif
- Être respectueux des différents points de vue et expériences
- Accepter gracieusement la critique constructive
- Se concentrer sur ce qui est le mieux pour la communauté
- Faire preuve d'empathie envers les autres membres de la communauté

Exemples de comportements inacceptables :

- L'utilisation de langage ou d'imagerie sexualisée et d'attentions sexuelles non désirées
- Le trolling, les commentaires insultants ou dégradants, et les attaques personnelles ou politiques
- Le harcèlement en public ou en privé
- La publication d'informations privées d'autrui, telles que des adresses physiques ou électroniques, sans permission explicite
- Toute autre conduite qui pourrait raisonnablement être considérée comme inappropriée dans un cadre professionnel

## Comment Contribuer

### Première Contribution ?

Pas de problème ! Voici comment commencer :

1. **Fork le repository** sur GitHub
2. **Clone votre fork** localement
3. **Créez une branche** pour votre contribution
4. **Faites vos modifications**
5. **Testez vos changements**
6. **Commit et push** vers votre fork
7. **Créez une Pull Request** vers le repository principal

### Trouver des Issues

- **Issues marquées `good first issue`** - Parfait pour les débutants
- **Issues marquées `help wanted`** - Nous avons besoin d'aide
- **Issues marquées `bug`** - Corrections de bugs
- **Issues marquées `enhancement`** - Améliorations de fonctionnalités

## Configuration du Développement

### Prérequis

- Node.js 20.x ou supérieur
- npm 9.x ou supérieur
- Git
- PostgreSQL 14+ ou MySQL 8+
- Redis (optionnel mais recommandé)

### Installation

```bash
# 1. Fork et clone le repository
git clone https://github.com/votre-username/windevexpert-platform.git
cd windevexpert-platform

# 2. Installer les dépendances
npm install

# 3. Copier et configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos configurations

# 4. Initialiser la base de données
npm run db:migrate
npm run db:seed

# 5. Lancer le serveur de développement
npm run dev
```

### Scripts de Développement

```bash
# Démarrer le serveur de développement
npm run dev

# Build pour la production
npm run build

# Lancer les tests
npm test

# Tests de type checking
npm run type-check

# Linting
npm run lint

# Formatage du code
npm run format

# Générer la documentation
npm run docs
```

## Standards de Code

### Conventions de Nommage

```javascript
// Variables et fonctions - camelCase
const userName = 'John';
function getUserData() {}

// Classes et composants - PascalCase
class UserController {}
function UserProfile() {}

// Constantes - UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';

// Fichiers et dossiers - kebab-case
// user-profile.js, auth-service.ts, user-profile.module.css
```

### Structure des Fichiers

```
src/
├── components/          # Composants React réutilisables
│   ├── common/       # Composants partagés
│   ├── ui/           # Composants UI basiques
│   └── features/     # Composants de fonctionnalités
├── pages/            # Pages Next.js
├── hooks/            # Hooks React personnalisés
├── utils/            # Utilitaires
├── services/         # Services API
├── types/            # Types TypeScript
├── styles/           # Fichiers de style
└── tests/            # Tests unitaires et d'intégration
```

### Qualité du Code

- **TypeScript** - Utiliser TypeScript pour tous les nouveaux fichiers
- **ESLint** - Suivre les règles ESLint configurées
- **Prettier** - Formater automatiquement le code
- **Tests** - Écrire des tests pour toute nouvelle fonctionnalité
- **Documentation** - Documenter les fonctions complexes

### Exemple de Composant

```typescript
// components/common/Button.tsx
import React from 'react';
import styles from './Button.module.css';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * Composant Button réutilisable
 * @param {ButtonProps} props - Les propriétés du bouton
 * @returns {JSX.Element} Le composant Button
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
  className = '',
}) => {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${className}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
};
```

## Processus de Pull Request

### Avant de Soumettre

1. **Testez vos changements**
   ```bash
   npm test
   npm run type-check
   npm run lint
   ```

2. **Mettez à jour la documentation**
   - README.md si nécessaire
   - JSDoc pour les nouvelles fonctions
   - Mise à jour des types TypeScript

3. **Vérifiez les conflits**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

### Soumission de la Pull Request

1. **Créez une branche descriptive**
   ```bash
   git checkout -b feature/add-user-authentication
   git checkout -b fix/login-page-error
   git checkout -b docs/update-deployment-guide
   ```

2. **Commit avec des messages clairs**
   ```bash
   git commit -m "feat: add user authentication system"
   git commit -m "fix: resolve login page validation error"
   git commit -m "docs: update deployment guide with SSL configuration"
   ```

3. **Push vers votre fork**
   ```bash
   git push origin feature/add-user-authentication
   ```

4. **Créez la Pull Request**
   - Utilisez le template de PR fourni
   - Décrivez vos changements en détail
   - Ajoutez des captures d'écran si pertinent
   - Référencez les issues concernées

### Template de Pull Request

```markdown
## Description
Décrivez brièvement les changements apportés.

## Type de Changement
- [ ] Bug fix (changement non-cassant qui corrige un problème)
- [ ] New feature (changement non-cassant qui ajoute une fonctionnalité)
- [ ] Breaking change (changement qui casse la compatibilité)
- [ ] Documentation update

## Changements
- Changement 1
- Changement 2
- Changement 3

## Tests
- [ ] Tests unitaires passés
- [ ] Tests d'intégration passés
- [ ] Tests manuels effectués

## Captures d'Écran
(Ajoutez des captures d'écran si pertinent)

## Issues Liées
Fixes #123
Closes #456
```

## Rapport de Bugs

### Avant de Reporter

- [ ] Vérifiez que vous utilisez la dernière version
- [ ] Recherchez des issues similaires
- [ ] Testez avec différents navigateurs/appareils

### Comment Reporter

1. **Utilisez le template de bug**
2. **Fournissez des informations détaillées**
3. **Ajoutez des étapes pour reproduire**
4. **Incluez des captures d'écran**
5. **Spécifiez votre environnement**

### Template de Bug

```markdown
## Description du Bug
Une description claire et concise du bug.

## Étapes pour Reproduire
1. Aller à '...'
2. Cliquer sur '...'
3. Faire défiler jusqu'à '...'
4. Observer l'erreur

## Comportement Attendu
Ce qui devrait se passer.

## Comportement Réel
Ce qui se passe réellement.

## Captures d'Écran
(Ajoutez des captures d'écran si pertinent)

## Environnement
- OS: [ex: Windows 11, macOS 13, Ubuntu 22.04]
- Navigateur: [ex: Chrome 108, Safari 16, Firefox 107]
- Version: [ex: 1.0.0]

## Contexte Additionnel
(Ajoutez tout autre contexte ici)
```

## Demandes de Fonctionnalités

### Avant de Proposer

- [ ] Vérifiez que la fonctionnalité n'existe pas déjà
- [ ] Recherchez des demandes similaires
- [ ] Considérez l'impact sur l'expérience utilisateur

### Comment Proposer

1. **Utilisez le template de fonctionnalité**
2. **Décrivez le problème à résoudre**
3. **Expliquez la solution proposée**
4. **Discutez des alternatives**
5. **Ajoutez des maquettes si pertinent**

### Template de Fonctionnalité

```markdown
## Problème
Une description claire et concise du problème à résoudre.

## Solution Proposée
Une description claire et concise de la solution.

## Alternatives Considérées
Décrivez les alternatives que vous avez considérées.

## Impact sur l'Utilisateur
Comment cela améliorera l'expérience utilisateur.

## Maquettes
(Ajoutez des maquettes ou des captures d'écran si pertinent)

## Informations Additionnelles
(Ajoutez toute autre information ici)
```

## Documentation

### Standards de Documentation

- **JSDoc** pour toutes les fonctions publiques
- **README.md** pour chaque module important
- **Documentation utilisateur** pour les nouvelles fonctionnalités
- **Changelog** pour toutes les modifications

### Exemple de JSDoc

```javascript
/**
 * Authentifie un utilisateur avec email et mot de passe
 * @param {string} email - L'email de l'utilisateur
 * @param {string} password - Le mot de passe de l'utilisateur
 * @returns {Promise<User>} L'utilisateur authentifié
 * @throws {AuthenticationError} Si l'authentification échoue
 * @example
 * const user = await authenticateUser('user@example.com', 'password123')
 */
async function authenticateUser(email, password) {
  // Implémentation
}
```

## Tests

### Types de Tests

- **Unit Tests** - Testez les fonctions individuelles
- **Integration Tests** - Testez les interactions entre composants
- **E2E Tests** - Testez les parcours utilisateur complets

### Écriture de Tests

```typescript
// user.service.test.ts
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123'
      };

      const user = await UserService.createUser(userData);

      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user.password).not.toBe(userData.password); // Should be hashed
    });

    it('should throw error with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        name: 'Test User',
        password: 'password123'
      };

      await expect(UserService.createUser(userData))
        .rejects.toThrow('Invalid email format');
    });
  });
});
```

### Couverture de Tests

- **Minimum 80%** de couverture de code
- **100%** de couverture pour les fonctions critiques
- **Tests pour tous les nouveaux features**

## Reconnaissance

### Contributeurs

Merci à tous les contributeurs qui ont aidé à améliorer WinDevExpert Platform !

### Comment Être Reconnu

- **Contributors** - Toutes les contributions sont listées
- **Release Notes** - Contributions significatives mentionnées
- **Community** - Reconnaissance dans les discussions

### Récompenses

- **Badges** - Badges GitHub pour les contributeurs actifs
- **Early Access** - Accès anticipé aux nouvelles fonctionnalités
- **Mentions Spéciales** - Dans les notes de version

---

### Questions ?

- **Discussions GitHub** - Pour des questions générales
- **Issues** - Pour des problèmes spécifiques
- **Discord** - Chat en direct avec la communauté

Merci de contribuer à Win