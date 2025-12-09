# 🚀 Démarrage Rapide

## Installation locale

```bash
# 1. Aller dans le dossier backend
cd backend

# 2. Installer les dépendances
npm install

# 3. Démarrer le serveur
npm start
# ou en mode développement avec auto-reload
npm run dev
```

Le serveur démarre sur **http://localhost:9091**

## Tester l'API

```bash
# Vérifier que l'API fonctionne
curl http://localhost:9091/health

# Devrait retourner : {"status":"OK","message":"API James Studio est opérationnelle"}
```

## Structure des fichiers

```
backend/
├── server.js              # Serveur principal
├── package.json           # Dépendances
├── database.sqlite        # Base de données (créée automatiquement)
├── uploads/              # Dossier pour les fichiers uploadés
├── README.md             # Documentation complète
├── DEPLOYMENT_VPS.md     # Guide de déploiement VPS
└── ecosystem.config.js   # Configuration PM2
```

## Prochaines étapes

1. ✅ Backend démarré
2. 🔧 Vérifier que l'URL dans `ng-sharegame/src/services/api-config.service.ts` est `http://localhost:9091`
3. 🧪 Tester l'ajout d'un projet depuis l'interface Angular
4. 📦 Voir `DEPLOYMENT_VPS.md` pour le déploiement en production

## Commandes utiles

```bash
# Voir les logs
npm run dev  # Les logs apparaissent dans le terminal

# Arrêter le serveur
Ctrl + C

# Réinitialiser la base de données
rm database.sqlite
npm start  # La base sera recréée automatiquement
```

