# Projet Collaboratif — API

API REST en Node.js / Express / PostgreSQL (via Sequelize) pour gérer des **projets** et leurs **tâches**, avec authentification par compte utilisateur.

> 🚧 **Statut : en développement.**
> Ce projet tourne actuellement en local. Le **déploiement en ligne** et l'ajout de **nouvelles routes** sont prévus prochainement — voir la section [Roadmap](#roadmap) plus bas.

---

## Sommaire

- [Stack technique](#stack-technique)
- [Structure du projet](#structure-du-projet)
- [Installation](#installation)
- [Variables d'environnement](#variables-denvironnement)
- [Lancer le serveur](#lancer-le-serveur)
- [Authentification](#authentification)
- [Routes de l'API](#routes-de-lapi)
- [Limite de requêtes (rate limiting)](#limite-de-requêtes-rate-limiting)
- [Tester l'API](#tester-lapi)
- [Sécurité](#sécurité)
- [Roadmap](#roadmap)

---

## Stack technique

| Composant | Choix |
|---|---|
| Serveur | Node.js + [Express](https://expressjs.com/) 5 |
| Base de données | PostgreSQL |
| ORM | [Sequelize](https://sequelize.org/) |
| Authentification | JWT ([jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)) + mots de passe hashés ([bcryptjs](https://www.npmjs.com/package/bcryptjs)) |
| Validation | [express-validator](https://express-validator.github.io/) |
| Anti-abus | [express-rate-limit](https://www.npmjs.com/package/express-rate-limit) |
| Variables d'environnement | [dotenv](https://www.npmjs.com/package/dotenv) |

## Structure du projet

```
project-collaboratif-api/
├── app.js                  # Point d'entrée, déclaration des routes et du rate limiting global
├── config/
│   └── database.js         # Connexion Sequelize à PostgreSQL
├── middleware/
│   ├── auth.js             # Vérifie le token JWT (routes protégées)
│   └── validate.js         # Règles de validation (express-validator)
├── models/
│   ├── index.js            # Relations entre modèles (Project / User / Task)
│   ├── Project.js
│   ├── Task.js
│   └── User.js
├── routes/
│   ├── authRoutes.js       # /api/auth/...
│   ├── projectRoutes.js    # /api/projects/...
│   └── taskRoutes.js       # /api/tasks/...
├── index.html              # Console de test (interface web pour tester l'API)
├── api-tests.http          # Requêtes prêtes à l'emploi (extension REST Client de VS Code)
├── .env.example             # Modèle des variables d'environnement à définir
└── .gitignore
```

## Installation

```bash
git clone <url-du-repo>
cd project-collaboratif-api
npm install
```

## Variables d'environnement

Copie `.env.example` en `.env`, puis remplis tes propres valeurs (ce fichier ne doit **jamais** être commité — voir [Sécurité](#sécurité)) :

```
DB_NAME=
DB_USER=
DB_PASS=
JWT_SECRET=
```

`JWT_SECRET` doit être une chaîne aléatoire longue, pas un mot lisible. Pour en générer une :

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Lancer le serveur

```bash
node app.js
```

Au démarrage, Sequelize se connecte à la base et synchronise les tables automatiquement (`sequelize.sync({ alter: true })`). Le serveur écoute sur `http://localhost:3000`.

## Authentification

1. Crée un compte via `POST /api/auth/register`.
2. Connecte-toi via `POST /api/auth/login` → tu reçois un `token` (JWT), valable **1 heure**.
3. Pour toute route protégée, envoie ce token dans l'en-tête `Authorization`.

⚠️ **Particularité de ce projet** : le token se place tel quel dans l'en-tête, **sans préfixe `Bearer`** :

```
Authorization: eyJhbGciOiJIUzI1NiIs...
```

## Routes de l'API

| Méthode | Route | Protégée | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Non | Créer un compte |
| `POST` | `/api/auth/login` | Non | Se connecter, récupère un token |
| `GET` | `/api/projects` | **Oui** | Lister **mes** projets uniquement |
| `GET` | `/api/projects/:id` | **Oui** | Voir un de **mes** projets, avec ses tâches |
| `POST` | `/api/projects` | **Oui** | Créer un projet (rattaché à mon compte) |
| `POST` | `/api/projects/:projectId/tasks` | **Oui** | Ajouter une tâche à un de **mes** projets |
| `GET` | `/api/tasks` | **Oui** | Lister les tâches de **mes** projets uniquement |
| `PUT` | `/api/tasks/:id` | **Oui** | Marquer une de **mes** tâches comme « terminée » |

> Toutes les routes sont désormais cloisonnées par compte : chaque utilisateur ne voit et ne modifie que ses propres projets et tâches. Tenter d'accéder au projet ou à la tâche d'un autre utilisateur (même en devinant l'id dans l'URL) renvoie `404`.

## Limite de requêtes (rate limiting)

Pour limiter les abus :
- `/api/auth/login` et `/api/auth/register` : **5 requêtes / 15 min** par IP.
- Le reste de l'API : **100 requêtes / 15 min** par IP.

Au-delà, le serveur répond `429 Too Many Requests`.

## Tester l'API

Trois façons, au choix :

1. **`index.html`** — interface web complète (inscription, connexion, création de projets/tâches, journal des requêtes). Ouvre-le directement dans un navigateur pendant que le serveur tourne.
🎥 [Voir la démo vidéo](https://github.com/chorouk-ely/collaborative-task-api/releases/download/v1.0.0/DEMO_API.mp4)


2. **`api-tests.http`** — fichier de requêtes prêtes à l'emploi pour l'extension **REST Client** de VS Code.
3. **Postman** — importe les routes manuellement, ou récupère le token via `/api/auth/login` puis renseigne-le dans l'en-tête `Authorization` des autres requêtes.

## Sécurité

- Les mots de passe sont hashés avec `bcryptjs` avant stockage — jamais en clair.
- `JWT_SECRET` et les identifiants de base de données vivent uniquement dans `.env`, qui est exclu de Git via `.gitignore`. Seul `.env.example` (sans valeurs réelles) est versionné.
- Ne partage jamais un token JWT ni une capture d'écran qui le contient — c'est l'équivalent d'un mot de passe temporaire.

## Roadmap

- [ ] **Déploiement** de l'API en ligne (hébergeur à définir — Render)
- [ ] Ajout de nouvelles routes, par exemple :
  - `PUT /api/projects/:id` — modifier un projet
  - `DELETE /api/projects/:id` — supprimer un projet
  - `DELETE /api/tasks/:id` — supprimer une tâche
  - `GET /api/auth/me` — infos de l'utilisateur connecté
