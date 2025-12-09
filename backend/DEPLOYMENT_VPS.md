# Déploiement sur VPS - Guide Complet

## Oui, vous pouvez déployer plusieurs services backend sur un VPS ! 🚀

Il existe plusieurs méthodes pour déployer plusieurs services sur un VPS :

### Méthode 1 : Ports différents (Simple)
Chaque service écoute sur un port différent (ex: 9091, 9092, etc.)

### Méthode 2 : Reverse Proxy avec Nginx (Recommandé)
Un seul point d'entrée (port 80/443) qui route vers différents services

### Méthode 3 : PM2 avec plusieurs instances
Gérer plusieurs processus Node.js avec PM2

---

## Installation de base sur VPS

### 1. Connexion SSH
```bash
ssh root@votre-ip-vps
```

### 2. Mise à jour du système
```bash
apt update && apt upgrade -y
```

### 3. Installation de Node.js
```bash
# Installer Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Vérifier l'installation
node --version
npm --version
```

### 4. Installation de PM2 (Gestionnaire de processus)
```bash
npm install -g pm2
```

---

## Déploiement du Backend James Studio

### 1. Cloner ou transférer le projet
```bash
# Créer un dossier pour le projet
mkdir -p /var/www/james-studio-backend
cd /var/www/james-studio-backend

# Transférer vos fichiers (via SCP, Git, etc.)
# Exemple avec SCP depuis votre machine locale:
# scp -r backend/* root@votre-ip:/var/www/james-studio-backend/
```

### 2. Installer les dépendances
```bash
cd /var/www/james-studio-backend
npm install --production
```

### 3. Configurer les variables d'environnement
```bash
nano .env
```

Ajoutez :
```env
PORT=9091
NODE_ENV=production
```

### 4. Démarrer avec PM2
```bash
# Démarrer le service
pm2 start server.js --name james-studio-api

# Sauvegarder la configuration PM2
pm2 save

# Configurer PM2 pour démarrer au boot
pm2 startup
```

### 5. Vérifier le statut
```bash
pm2 status
pm2 logs james-studio-api
```

---

## Déploiement de plusieurs services backend

### Exemple : 2 services backend

#### Service 1 : James Studio API (Port 9091)
```bash
cd /var/www/james-studio-backend
pm2 start server.js --name james-studio-api -- --port 9091
```

#### Service 2 : Autre API (Port 9092)
```bash
cd /var/www/autre-backend
# Modifier le PORT dans .env ou server.js
pm2 start server.js --name autre-api -- --port 9092
```

### Gérer les services
```bash
# Voir tous les services
pm2 list

# Redémarrer un service
pm2 restart james-studio-api

# Arrêter un service
pm2 stop james-studio-api

# Voir les logs
pm2 logs james-studio-api

# Surveiller
pm2 monit
```

---

## Configuration Nginx (Reverse Proxy)

### 1. Installer Nginx
```bash
apt install -y nginx
```

### 2. Configuration pour James Studio API
```bash
nano /etc/nginx/sites-available/james-studio-api
```

Contenu :
```nginx
server {
    listen 80;
    server_name api.jamesstudio.fr;  # Remplacez par votre domaine

    location / {
        proxy_pass http://localhost:9091;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Configuration pour plusieurs services
```bash
nano /etc/nginx/sites-available/multi-services
```

```nginx
# Service 1 : James Studio API
server {
    listen 80;
    server_name api1.jamesstudio.fr;

    location / {
        proxy_pass http://localhost:9091;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# Service 2 : Autre API
server {
    listen 80;
    server_name api2.jamesstudio.fr;

    location / {
        proxy_pass http://localhost:9092;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 4. Activer la configuration
```bash
# Créer un lien symbolique
ln -s /etc/nginx/sites-available/james-studio-api /etc/nginx/sites-enabled/

# Tester la configuration
nginx -t

# Redémarrer Nginx
systemctl restart nginx
```

---

## Configuration SSL avec Let's Encrypt (HTTPS)

### 1. Installer Certbot
```bash
apt install -y certbot python3-certbot-nginx
```

### 2. Obtenir un certificat SSL
```bash
certbot --nginx -d api.jamesstudio.fr
```

### 3. Renouvellement automatique
```bash
# Tester le renouvellement
certbot renew --dry-run

# Le renouvellement est automatique via cron
```

---

## Configuration du Firewall

### 1. Autoriser les ports nécessaires
```bash
# UFW (Uncomplicated Firewall)
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 9091/tcp  # API directe (optionnel si vous utilisez Nginx)

# Activer le firewall
ufw enable
```

---

## Mise à jour de l'URL dans Angular

Modifiez `ng-sharegame/src/services/api-config.service.ts` :

```typescript
private readonly API_BASE_URL = 'https://api.jamesstudio.fr'; // Production
// ou
private readonly API_BASE_URL = 'http://votre-ip:9091'; // Si pas de domaine
```

---

## Sauvegarde de la base de données

### Script de sauvegarde automatique
```bash
nano /usr/local/bin/backup-james-studio-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/james-studio"
DB_PATH="/var/www/james-studio-backend/database.sqlite"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
cp $DB_PATH "$BACKUP_DIR/database_$DATE.sqlite"

# Garder seulement les 7 derniers backups
ls -t $BACKUP_DIR/database_*.sqlite | tail -n +8 | xargs rm -f
```

```bash
chmod +x /usr/local/bin/backup-james-studio-db.sh

# Ajouter au cron (tous les jours à 2h du matin)
crontab -e
# Ajouter :
0 2 * * * /usr/local/bin/backup-james-studio-db.sh
```

---

## Monitoring et logs

### PM2 Monitoring
```bash
pm2 monit
```

### Logs Nginx
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Logs de l'application
```bash
pm2 logs james-studio-api
```

---

## Commandes utiles

```bash
# Redémarrer tous les services
pm2 restart all

# Voir l'utilisation des ressources
pm2 status
htop

# Vérifier les ports utilisés
netstat -tulpn | grep LISTEN

# Tester l'API
curl http://localhost:9091/health
```

---

## Résolution de problèmes

### Le service ne démarre pas
```bash
pm2 logs james-studio-api
# Vérifier les erreurs dans les logs
```

### Port déjà utilisé
```bash
# Trouver le processus utilisant le port
lsof -i :9091
# Tuer le processus si nécessaire
kill -9 <PID>
```

### Problème de permissions
```bash
# Donner les permissions au dossier uploads
chmod -R 755 /var/www/james-studio-backend/uploads
chown -R www-data:www-data /var/www/james-studio-backend/uploads
```

---

## Exemple complet : 2 services backend

### Architecture
- **Service 1** : James Studio API → Port 9091 → api1.jamesstudio.fr
- **Service 2** : Autre API → Port 9092 → api2.jamesstudio.fr
- **Frontend** : Angular → Port 80 → jamesstudio.fr

### Configuration Nginx pour 2 services
```nginx
# api1.jamesstudio.fr → Port 9091
server {
    listen 80;
    server_name api1.jamesstudio.fr;
    location / {
        proxy_pass http://localhost:9091;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# api2.jamesstudio.fr → Port 9092
server {
    listen 80;
    server_name api2.jamesstudio.fr;
    location / {
        proxy_pass http://localhost:9092;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Checklist de déploiement

- [ ] Node.js installé
- [ ] PM2 installé et configuré
- [ ] Backend démarré avec PM2
- [ ] Nginx installé et configuré
- [ ] Firewall configuré
- [ ] SSL configuré (Let's Encrypt)
- [ ] Sauvegarde automatique configurée
- [ ] URL API mise à jour dans Angular
- [ ] Tests de l'API effectués

---

## Support

En cas de problème, vérifiez :
1. Les logs PM2 : `pm2 logs`
2. Les logs Nginx : `/var/log/nginx/error.log`
3. Le statut des services : `pm2 status`
4. La connectivité : `curl http://localhost:9091/health`

