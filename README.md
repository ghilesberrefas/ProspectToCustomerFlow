# Prospecttocustomersflow

Application de Gestion Commerciale pour bien gérer les prospects et les convertir efficacement en clients.

## Présentation Fonctionnelle

- Gestion des Prospects : Ajout, modification, suppression et conversion des prospects en clients. Done
- Gestion des Clients : Gestion complète des clients, incluant la modification, et la suppression.
- Suivi des Interactions : Enregistrement et suivi des interactions (e-mails, appels, réunions) avec les prospects.
- Tableau de Bord Statistique : Visualisation des données clés, efficacité des campagnes et taux de conversion.

- Intégration d'Envoi d'E-mails : Pour les campagnes marketing et la communication automatique.

## Présentation Technique

### Technologies Utilisées

- Next.js : Pour le développement du front-end et le rendu côté serveur.
- MongoDB : Base de données pour le stockage des informations des prospects, clients et interactions.
- Tailwind CSS : Pour le design et la mise en page de l'application.
- Joi : Pour la validation des données côté serveur.


## Architecture

L'architecture de l'application se base sur le modèle client-serveur avec une application Next.js qui sert à la fois de frontend et de backend grâce à son système de pages API. Voici comment les différentes parties interagissent entre elles :

- **Frontend** : Construit avec React et stylisé avec Tailwind CSS, le frontend fournit une interface utilisateur interactive pour gérer les prospects, les clients, et suivre les interactions. Il communique avec le backend via des requêtes HTTP pour effectuer des opérations CRUD (Create, Read, Update, Delete) et d'autres actions spécifiques.

- **Backend** : Les pages API de Next.js agissent comme le backend de l'application, traitant les requêtes HTTP provenant du frontend. Elles interagissent avec la base de données MongoDB pour persister les données des prospects, clients, et interactions.

- **Base de Données** : MongoDB est utilisé comme système de gestion de base de données pour stocker et gérer les données de l'application de manière structurée. Chaque collection (prospects, clients, interactions) stocke les données pertinentes pour chaque aspect de l'application.

## Endpoints de l'API

Voici les endpoints principaux de l'API développés :

### Gestion des Prospects

- `POST /api/prospects` : Ajoute un nouveau prospect.
- `GET /api/prospects` : Récupère tous les prospects.
- `PUT /api/prospects/{id}` : Met à jour un prospect spécifique.
- `DELETE /api/prospects/{id}` : Supprime un prospect spécifique.

### Gestion des Clients

- `POST /api/clients` : Convertit un prospect en client.
- `GET /api/clients` : Récupère tous les clients.
- `PUT /api/clients/{id}` : Met à jour un client spécifique.
- `DELETE /api/clients/{id}` : Supprime un client spécifique.

### Suivi des Interactions

- `POST /api/interactions` : Ajoute une nouvelle interaction pour un prospect ou client.
- `GET /api/interactions` : Récupère toutes les interactions.
- `PUT /api/interactions/{id}` : Met à jour une interaction spécifique.
- `DELETE /api/interactions/{id}` : Supprime une interaction spécifique.

### Logging avec Winston

Winston pour le logging afin de capturer et d'organiser les logs de l'application. Ceci inclut les erreurs, les avertissements, et d'autres informations utiles pour le débogage et la surveillance.

#### Endpoint API pour le Logging

- `POST /api/log` : Permet d'enregistrer des logs côté serveur.


### Librairies et Outils Utilisés

Notre application `prospecttocustomersflow` utilise une combinaison de technologies modernes et de librairies robustes pour assurer performance et facilité de développement.

**Backend et Base de Données :**

- **Mongoose** : Outil de modélisation d'objets MongoDB pour Node.js, simplifiant les interactions avec notre base de données.
- **Joi** : Librairie de validation de schéma pour JavaScript, utilisée pour valider les données côté serveur.

**Frontend :**

- **React** et **React DOM** : Pour construire notre interface utilisateur avec des composants réactifs.
- **Next.js** : Framework React qui permet un rendu côté serveur et facilite la création de routes API.

**Stylisation et Mise en Forme :**

- **TailwindCSS** : Framework CSS utility-first pour un design rapide et réactif sans quitter le HTML.

**Développement et Linting :**

- **TypeScript** : Ajoute une typage statique à JavaScript pour améliorer la sécurité et la lisibilité du code.
- **ESLint** : Outil de linting pour identifier et rapporter les patterns trouvés dans le code ECMAScript/JavaScript.
- **PostCSS** et **Autoprefixer** : Outils de post-traitement CSS qui automatisent certaines tâches CSS, y compris l'ajout de préfixes automatiques pour la compatibilité entre navigateurs.

**Gestion des packages :**

- Utilisation de `npm` pour gérer les dépendances du projet, avec des scripts pour le développement, le build, et le déploiement.


### Sécurité

### UI/UX


## Démonstration

Incluez des liens vers des captures d'écran, des vidéos de démonstration, des schémas de votre base de données et des rapports de SonarQube pour montrer la qualité du code.

- ![Capture d'écran de la fonctionnalité X](lien_vers_la_capture)
- ![Schéma de la base de données](/)
- [Vidéo de démonstration](lien_vers_la_vidéo)

## Comment Exécuter Localement

```bash
git clone https://github.com/ghilesberrefas/ProspectToCustomerFlow.git
cd ProspectToCustomerFlow
npm install
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) avec votre navigateur pour voir le résultat.

