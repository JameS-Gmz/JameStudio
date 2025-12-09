# Backend API - James Studio

Backend simple et léger pour l'API James Studio utilisant Express.js et SQLite.

## Installation

```bash
# Installer les dépendances
npm install

# Initialiser la base de données (optionnel, se crée automatiquement)
npm run init-db
```

## Démarrage

### Mode développement
```bash
npm run dev
```

### Mode production
```bash
npm start
```

Le serveur démarre sur le port **9091** par défaut.

## Variables d'environnement

Créez un fichier `.env` pour configurer :

```env
PORT=9091
NODE_ENV=production
```

## Endpoints API

### Projets

- `GET /api/projects` - Liste tous les projets
- `GET /api/projects/:id` - Récupère un projet par ID
- `POST /api/projects` - Crée un nouveau projet
- `PUT /api/projects/:id` - Met à jour un projet
- `DELETE /api/projects/:id` - Supprime un projet
- `GET /api/projects/search?q=:query` - Recherche des projets
- `GET /api/projects/user/:userId` - Projets d'un utilisateur

### Fichiers

- `POST /game/upload/file` - Upload un fichier (FormData: `file`, `projectId`)
- `GET /game/image/:projectId` - Récupère l'URL de l'image d'un projet
- `GET /uploads/:filename` - Accède aux fichiers uploadés

### Santé

- `GET /health` - Vérifie l'état de l'API

## Structure de la base de données

### Table `projects`

- `id` (INTEGER PRIMARY KEY)
- `title` (TEXT)
- `description` (TEXT)
- `technologies` (TEXT JSON)
- `github` (TEXT)
- `demo` (TEXT)
- `imageUrl` (TEXT)
- `images` (TEXT JSON)
- `UserId` (INTEGER)
- `StatusId` (INTEGER)
- `LanguageId` (INTEGER)
- `ControllerIds` (TEXT JSON)
- `PlatformIds` (TEXT JSON)
- `genreIds` (TEXT JSON)
- `tagIds` (TEXT JSON)
- `price` (REAL)
- `authorStudio` (TEXT)
- `createdAt` (DATETIME)
- `updatedAt` (DATETIME)

## Notes

- Les fichiers uploadés sont stockés dans le dossier `uploads/`
- La base de données SQLite est créée automatiquement au premier démarrage
- Pour la production, considérez l'utilisation de PostgreSQL ou MySQL

