# Intégration Stripe pour les Paiements EUR

## Vue d'ensemble

Cette documentation décrit l'intégration de Stripe pour permettre les paiements en euros (EUR) sur la plateforme WinDevExpert. L'intégration permet aux clients internationaux de payer leurs commandes avec des cartes de crédit via Stripe Checkout.

## Configuration

### 1. Variables d'environnement

Ajoutez les variables suivantes dans votre fichier `.env` :

```env
# Clés Stripe (obtenues depuis le dashboard Stripe)
STRIPE_PUBLISHABLE_KEY="pk_test_..." # Clé publique Stripe
STRIPE_SECRET_KEY="sk_test_..."      # Clé secrète Stripe
STRIPE_WEBHOOK_SECRET="whsec_..."    # Secret du webhook Stripe

# Clé publique pour le client (doit commencer par NEXT_PUBLIC_)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

### 2. Configuration du webhook Stripe

1. Connectez-vous à votre [dashboard Stripe](https://dashboard.stripe.com)
2. Allez dans **Développeurs > Webhooks**
3. Cliquez sur **Ajouter un endpoint**
4. URL de l'endpoint : `https://votre-domaine.com/api/webhooks/stripe`
5. Événements à écouter :
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.payment_failed`

## Architecture

### Composants créés

1. **`src/components/payment/stripe-payment.tsx`**
   - Composant de paiement Stripe
   - Gère l'initialisation de Stripe
   - Affiche les informations de paiement et les moyens acceptés

2. **`src/app/api/payments/stripe/route.ts`**
   - API route pour créer les sessions de checkout Stripe
   - Calcule le total en EUR
   - Crée une commande en base de données

3. **`src/app/api/webhooks/stripe/route.ts`**
   - Gère les webhooks Stripe
   - Met à jour le statut des commandes
   - Vide le panier après paiement réussi

4. **`src/app/api/payments/stripe/verify/route.ts`**
   - Vérifie les paiements Stripe
   - Récupère les détails de la session
   - Retourne les informations de commande

5. **`src/app/payment/success/page.tsx`**
   - Page de succès après paiement
   - Affiche les détails de la commande
   - Fournit les liens de téléchargement

### Intégration dans le panier

Le composant Stripe a été intégré dans `src/app/panier/page.tsx` pour offrir une option de paiement international aux côtés des paiements locaux (DZD).

## Fonctionnalités

### Paiement dual (DZD/EUR)

- **Paiements locaux (DZD)** : Via CCP, Chargily, SlickPay, virement bancaire
- **Paiements internationaux (EUR)** : Via Stripe avec cartes de crédit

### Conversion de devises

Les prix sont automatiquement convertis de DZD vers EUR en utilisant un taux de change configuré dans l'application.

### Sécurité

- Chiffrement SSL/TLS
- Standards PCI DSS via Stripe
- Vérification des signatures de webhook
- Authentification 3D Secure

## Flux de paiement

1. **Sélection du mode de paiement** : L'utilisateur choisit entre paiement local (DZD) ou international (EUR)
2. **Création de session** : Une session Stripe Checkout est créée via l'API
3. **Redirection** : L'utilisateur est redirigé vers Stripe Checkout
4. **Paiement** : L'utilisateur saisit ses informations de carte
5. **Webhook** : Stripe notifie notre application du résultat
6. **Confirmation** : L'utilisateur est redirigé vers la page de succès

## Tests

### Mode test

Utilisez les clés de test Stripe pour les tests :
- Clés commençant par `pk_test_` et `sk_test_`
- Cartes de test : `4242 4242 4242 4242` (Visa)

### Cartes de test courantes

```
Visa: 4242 4242 4242 4242
Mastercard: 5555 5555 5555 4444
American Express: 3782 822463 10005
Déclinée: 4000 0000 0000 0002
```

## Gestion des erreurs

Le système gère plusieurs types d'erreurs :

- **Configuration manquante** : Affichage d'un message si les clés Stripe ne sont pas configurées
- **Paiement échoué** : Notification via webhook et mise à jour du statut
- **Session expirée** : Nettoyage automatique des sessions expirées
- **Erreurs réseau** : Gestion des timeouts et erreurs de connexion

## Monitoring

### Logs

Les événements importants sont loggés :
- Création de sessions de paiement
- Réception de webhooks
- Erreurs de paiement

### Dashboard Stripe

Utilisez le dashboard Stripe pour :
- Suivre les paiements
- Analyser les échecs
- Gérer les remboursements
- Consulter les rapports

## Maintenance

### Mise à jour des clés

Pour passer en production :
1. Remplacez les clés de test par les clés de production
2. Mettez à jour l'URL du webhook
3. Testez avec de petits montants

### Monitoring des webhooks

Vérifiez régulièrement que les webhooks fonctionnent correctement dans le dashboard Stripe.

## Support

Pour toute question ou problème :
1. Consultez la [documentation Stripe](https://stripe.com/docs)
2. Vérifiez les logs de l'application
3. Contactez le support technique