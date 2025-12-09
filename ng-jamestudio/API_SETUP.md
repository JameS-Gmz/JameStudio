# Configuration de l'API Backend

## Problème résolu

Le problème était que les projets ajoutés par l'admin étaient stockés dans `localStorage`, qui est local au navigateur. Les autres utilisateurs ne pouvaient donc pas voir ces projets car ils ont leur propre `localStorage` vide.

## Solution

Le code a été modifié pour utiliser une API backend au lieu de `localStorage`. Les projets sont maintenant stockés dans une base de données partagée accessible à tous les utilisateurs.

## Configuration

### 1. URL de l'API

Modifiez le fichier `src/services/api-config.service.ts` pour définir l'URL de votre backend :

```typescript
private readonly API_BASE_URL = 'http://localhost:9091'; // Pour le développement
// ou
private readonly API_BASE_URL = 'https://votre-domaine.com/api'; // Pour la production
```

### 2. Endpoints requis

Votre backend doit implémenter les endpoints suivants :

#### Projets
- `GET /api/projects` - Récupérer tous les projets
- `GET /api/projects/:id` - Récupérer un projet par ID
- `POST /api/projects` - Créer un nouveau projet
- `PUT /api/projects/:id` - Mettre à jour un projet
- `DELETE /api/projects/:id` - Supprimer un projet
- `GET /api/projects/search?q=:query` - Rechercher des projets
- `GET /api/projects/user/:userId` - Récupérer les projets d'un utilisateur

#### Fichiers
- `POST /game/upload/file` - Uploader un fichier (FormData avec `file` et `projectId`)
- `GET /game/image/:projectId` - Récupérer l'URL de l'image d'un projet

### 3. Format des données

#### Projet (Project)
```typescript
{
  id: number;
  title: string;
  description: string;
  technologies: string[];
  github?: string | null;
  demo?: string | null;
  imageUrl?: string;
  images?: string[];
  UserId: number;
  StatusId: number;
  LanguageId: number;
  ControllerIds: number[];
  PlatformIds: number[];
  genreIds: number[];
  tagIds: number[];
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  price: number;
  authorStudio?: string | null;
}
```

### 4. Mode développement (localStorage)

Si vous voulez tester sans backend, modifiez `src/services/api.service.ts` :

```typescript
private readonly useApi: boolean = false; // Utilise localStorage au lieu de l'API
```

⚠️ **Attention** : En mode localStorage, les projets ne seront toujours pas partagés entre utilisateurs.

## Migration des données

Si vous avez des projets existants dans `localStorage`, vous devrez les migrer vers votre base de données backend. Vous pouvez créer un script de migration ou exporter les données depuis la console du navigateur :

```javascript
// Dans la console du navigateur (F12)
const projects = JSON.parse(localStorage.getItem('jamesstudio_projects'));
console.log(JSON.stringify(projects, null, 2));
```

Puis importez ces données dans votre backend.

## Test

1. Assurez-vous que votre backend est démarré et accessible
2. Vérifiez que l'URL dans `api-config.service.ts` est correcte
3. Testez l'ajout d'un projet en tant qu'admin
4. Vérifiez que le projet apparaît pour tous les utilisateurs

## Support

Si vous rencontrez des problèmes :
1. Vérifiez la console du navigateur pour les erreurs
2. Vérifiez que les endpoints de l'API répondent correctement
3. Vérifiez les CORS si vous testez en local

