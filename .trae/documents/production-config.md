# ⚙️ Configuration de Production - Guide Détaillé

## 🎯 Vue d'Ensemble

Ce guide vous explique comment configurer correctement toutes les variables d'environnement et services pour le déploiement en production de votre application RPG Fantasy Web App.

---

## 🔧 1. Configuration des Variables d'Environnement

### 📁 Fichier `.env.production` (Frontend)

**Emplacement** : Racine de votre projet

```env
# ===========================================
# CONFIGURATION FRONTEND PRODUCTION
# ===========================================

# URL de l'API Backend (Railway)
# ⚠️ IMPORTANT : Remplacez par votre vraie URL Railway
VITE_API_URL=https://rpg-fantasy-backend-production.railway.app

# Configuration de l'application
VITE_APP_TITLE=RPG Fantasy Web App
VITE_APP_VERSION=1.0.0

# Mode de production
NODE_ENV=production

# Configuration CORS (GitHub Pages)
# ⚠️ IMPORTANT : Remplacez par votre vrai username GitHub
VITE_CORS_ORIGIN=https://VOTRE_USERNAME.github.io

# Configuration des assets (GitHub Pages)
# ⚠️ IMPORTANT : Remplacez par le nom de votre repository
VITE_ASSET_URL=/VOTRE_REPO_NAME/

# Configuration de debug (désactivé en production)
VITE_DEBUG=false

# Configuration de l'authentification
VITE_AUTH_ENABLED=true

# Configuration des logs (erreurs seulement en production)
VITE_LOG_LEVEL=error

# Configuration des timeouts API (en millisecondes)
VITE_API_TIMEOUT=30000

# Configuration du cache
VITE_CACHE_ENABLED=true
```

### 🚂 Variables Railway (Backend)

**Où les configurer** : Railway Dashboard > Votre Projet > Variables

```env
# ===========================================
# CONFIGURATION BACKEND RAILWAY
# ===========================================

# Configuration Flask
FLASK_ENV=production
FLASK_DEBUG=False

# Port (automatique Railway)
PORT=$PORT

# Clé secrète (GÉNÉREZ UNE CLÉ UNIQUE !)
# Utilisez : python -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY=votre-cle-secrete-unique-de-64-caracteres-minimum-123456789abcdef

# Configuration CORS
# ⚠️ IMPORTANT : Remplacez par votre vraie URL GitHub Pages
CORS_ORIGINS=https://VOTRE_USERNAME.github.io

# Configuration Python
PYTHONPATH=.
PYTHONUNBUFFERED=1

# Configuration de la base de données
DATABASE_URL=sqlite:///rpg_game.db

# Configuration des logs
LOG_LEVEL=INFO

# Configuration de sécurité
SESSION_COOKIE_SECURE=True
SESSION_COOKIE_HTTPONLY=True
SESSION_COOKIE_SAMESITE=Lax
```

---

## 🔐 2. Génération de Clés Sécurisées

### Générer une Clé Secrète

**Méthode 1 - Python** :
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

**Méthode 2 - PowerShell** :
```powershell
[System.Web.Security.Membership]::GeneratePassword(64, 10)
```

**Méthode 3 - En ligne** :
- Allez sur [passwordsgenerator.net](https://passwordsgenerator.net/)
- Générez un mot de passe de 64 caractères
- Cochez : Majuscules, minuscules, chiffres, symboles

---

## 🌐 3. Configuration GitHub Pages

### Étape 1 : Activation de GitHub Pages

1. **Repository GitHub > Settings**
2. **Pages (menu gauche)**
3. **Source : GitHub Actions**
4. **Save**

### Étape 2 : Configuration des Secrets

**Repository > Settings > Secrets and variables > Actions**

**Secrets à ajouter** :

| Nom | Valeur | Description |
|-----|--------|-------------|
| `VITE_API_URL` | `https://votre-app.railway.app` | URL de votre backend Railway |
| `VITE_APP_TITLE` | `RPG Fantasy Web App` | Titre de l'application |
| `VITE_DEBUG` | `false` | Mode debug désactivé |

### Étape 3 : Variables d'Environnement (Optionnel)

**Repository > Settings > Secrets and variables > Actions > Variables**

| Nom | Valeur | Description |
|-----|--------|-------------|
| `NODE_VERSION` | `18` | Version de Node.js |
| `BUILD_COMMAND` | `npm run build` | Commande de build |

---

## 🚂 4. Configuration Railway Détaillée

### Étape 1 : Connexion du Repository

1. **Railway Dashboard > New Project**
2. **Deploy from GitHub repo**
3. **Sélectionnez votre repository**
4. **Railway détecte automatiquement Python**

### Étape 2 : Configuration du Build

**Railway détecte automatiquement** :
- `requirements.txt` → Installation des dépendances
- `main.py` → Point d'entrée de l'application
- `railway.json` → Configuration personnalisée

### Étape 3 : Variables d'Environnement Railway

**Dans Railway Dashboard > Variables**, ajoutez :

```env
FLASK_ENV=production
PORT=$PORT
SECRET_KEY=votre-cle-secrete-generee
CORS_ORIGINS=https://VOTRE_USERNAME.github.io
PYTHONPATH=.
PYTHONUNBUFFERED=1
DATABASE_URL=sqlite:///rpg_game.db
LOG_LEVEL=INFO
```

### Étape 4 : Génération du Domaine

1. **Settings > Networking**
2. **Generate Domain**
3. **Copiez l'URL générée**
4. **Notez-la pour la configuration frontend**

---

## 🔄 5. Mise à Jour des Configurations

### Script de Mise à Jour Automatique

**Créez un fichier `update-config.bat`** :

```batch
@echo off
echo Mise à jour de la configuration de production...

:: Demander l'URL Railway
set /p RAILWAY_URL="Entrez votre URL Railway (ex: https://app.railway.app): "

:: Demander le username GitHub
set /p GITHUB_USER="Entrez votre username GitHub: "

:: Demander le nom du repository
set /p REPO_NAME="Entrez le nom de votre repository: "

:: Mettre à jour .env.production
echo VITE_API_URL=%RAILWAY_URL% > .env.production
echo VITE_CORS_ORIGIN=https://%GITHUB_USER%.github.io >> .env.production
echo VITE_ASSET_URL=/%REPO_NAME%/ >> .env.production
echo VITE_APP_TITLE=RPG Fantasy Web App >> .env.production
echo NODE_ENV=production >> .env.production
echo VITE_DEBUG=false >> .env.production

echo Configuration mise à jour !
echo N'oubliez pas de configurer les variables Railway !
pause
```

**Utilisation** :
```bash
# Double-cliquez sur update-config.bat
# Ou exécutez dans PowerShell :
.\update-config.bat
```

---

## ✅ 6. Vérification de la Configuration

### Checklist de Vérification

#### Frontend (GitHub Pages)
- [ ] ✅ `.env.production` existe et est configuré
- [ ] ✅ `VITE_API_URL` pointe vers Railway
- [ ] ✅ `VITE_CORS_ORIGIN` correspond à votre URL GitHub Pages
- [ ] ✅ `VITE_ASSET_URL` correspond à votre nom de repository
- [ ] ✅ Secrets GitHub configurés
- [ ] ✅ GitHub Pages activé avec GitHub Actions

#### Backend (Railway)
- [ ] ✅ Repository connecté à Railway
- [ ] ✅ Variables d'environnement configurées
- [ ] ✅ `SECRET_KEY` généré et unique
- [ ] ✅ `CORS_ORIGINS` correspond à votre URL GitHub Pages
- [ ] ✅ Domaine Railway généré
- [ ] ✅ Build réussi (pas d'erreurs dans les logs)

### Tests de Vérification

#### Test Backend
```bash
# Testez l'endpoint de santé
curl https://votre-app.railway.app/health

# Réponse attendue :
# {"status": "healthy", "service": "RPG Fantasy Backend API", ...}
```

#### Test Frontend Local
```bash
# Testez le build de production
npm run build
npm run preview

# Ouvrez http://localhost:4173
# Vérifiez qu'il n'y a pas d'erreurs dans la console (F12)
```

---

## 🚨 7. Dépannage des Configurations

### Problème : Variables d'Environnement Non Reconnues

**Symptômes** :
- `undefined` dans les logs
- Erreurs de configuration

**Solutions** :
```bash
# Vérifiez que les variables sont bien définies
echo $VITE_API_URL          # Linux/Mac
echo %VITE_API_URL%         # Windows CMD
echo $env:VITE_API_URL      # Windows PowerShell

# Redémarrez le serveur de développement
npm run dev
```

### Problème : CORS Toujours Bloqué

**Vérifications** :
1. **Railway** : `CORS_ORIGINS` exact (pas de slash final)
2. **Frontend** : `VITE_API_URL` exact (pas de slash final)
3. **GitHub Pages** : URL exacte dans les variables

**Format correct** :
```env
# ✅ Correct
CORS_ORIGINS=https://username.github.io
VITE_API_URL=https://app.railway.app

# ❌ Incorrect
CORS_ORIGINS=https://username.github.io/
VITE_API_URL=https://app.railway.app/
```

### Problème : Build Échoue

**Vérifiez** :
```bash
# Dépendances installées
npm install

# Pas d'erreurs ESLint
npm run lint

# Variables d'environnement présentes
cat .env.production
```

---

## 📋 8. Template de Configuration Rapide

### Copier-Coller Rapide

**Remplacez les valeurs entre `< >` par vos vraies valeurs** :

#### .env.production
```env
VITE_API_URL=https://<VOTRE-APP>.railway.app
VITE_CORS_ORIGIN=https://<VOTRE-USERNAME>.github.io
VITE_ASSET_URL=/<VOTRE-REPO>/
VITE_APP_TITLE=RPG Fantasy Web App
NODE_ENV=production
VITE_DEBUG=false
```

#### Variables Railway
```env
FLASK_ENV=production
PORT=$PORT
SECRET_KEY=<VOTRE-CLE-SECRETE-64-CARACTERES>
CORS_ORIGINS=https://<VOTRE-USERNAME>.github.io
PYTHONPATH=.
```

#### Secrets GitHub
- `VITE_API_URL` = `https://<VOTRE-APP>.railway.app`

---

## 🎯 Résumé des URLs Importantes

| Service | URL | Usage |
|---------|-----|-------|
| **GitHub Repository** | `https://github.com/<USER>/<REPO>` | Code source |
| **GitHub Pages** | `https://<USER>.github.io/<REPO>` | Frontend déployé |
| **Railway App** | `https://<APP>.railway.app` | Backend déployé |
| **Railway Health** | `https://<APP>.railway.app/health` | Test backend |
| **GitHub Actions** | `https://github.com/<USER>/<REPO>/actions` | Logs de déploiement |
| **Railway Logs** | Railway Dashboard > Deployments | Logs backend |

---

**🎉 Une fois tout configuré correctement, votre application sera automatiquement déployée à chaque push sur GitHub !**