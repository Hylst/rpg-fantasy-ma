# 🚀 Guide de Déploiement pour Débutants - RPG Fantasy Web App

## 📋 Table des Matières
1. [Résolution du Problème de Push GitHub](#1-résolution-du-problème-de-push-github)
2. [Configuration Git Complète](#2-configuration-git-complète)
3. [Déploiement Backend sur Railway](#3-déploiement-backend-sur-railway)
4. [Déploiement Frontend sur GitHub Pages](#4-déploiement-frontend-sur-github-pages)
5. [Alternative : Déploiement sur Vercel](#5-alternative-déploiement-sur-vercel)
6. [Vérification et Tests](#6-vérification-et-tests)
7. [Dépannage des Problèmes Courants](#7-dépannage-des-problèmes-courants)

---

## 1. Résolution du Problème de Push GitHub

### 🔍 Diagnostic du Problème

Avant tout, vérifions pourquoi le push a échoué. Ouvrez votre terminal (PowerShell ou CMD) dans le dossier de votre projet :

```bash
# Naviguez vers votre dossier projet
cd "d:\0CODE\MANUSAI\RPG_AI\Web App de Jeu de Rôle Fantasy"

# Vérifiez le statut Git
git status
```

### 🛠️ Solutions aux Problèmes Courants

#### Problème 1 : Repository distant non configuré
```bash
# Ajoutez votre repository GitHub (remplacez par votre URL)
git remote add origin https://github.com/VOTRE_USERNAME/VOTRE_REPO.git

# Vérifiez que c'est bien ajouté
git remote -v
```

#### Problème 2 : Authentification GitHub
```bash
# Si vous avez des problèmes d'authentification, utilisez un token personnel
# Allez sur GitHub > Settings > Developer settings > Personal access tokens
# Créez un nouveau token avec les permissions "repo"

# Utilisez le token comme mot de passe lors du push
git push -u origin main
```

#### Problème 3 : Branche principale incorrecte
```bash
# Vérifiez le nom de votre branche
git branch

# Si vous êtes sur "master" au lieu de "main"
git branch -M main

# Puis poussez
git push -u origin main
```

#### Problème 4 : Fichiers trop volumineux
```bash
# Vérifiez la taille des fichiers
dir /s

# Si des fichiers sont trop gros, ajoutez-les au .gitignore
echo "*.db" >> .gitignore
echo "node_modules/" >> .gitignore
echo "dist/" >> .gitignore

# Puis recommitez
git add .
git commit -m "Fix: Ignore large files"
git push -u origin main
```

---

## 2. Configuration Git Complète

### 🔧 Configuration Initiale

```bash
# 1. Configurez votre identité Git (si pas déjà fait)
git config --global user.name "Votre Nom"
git config --global user.email "votre.email@example.com"

# 2. Vérifiez que Git est bien initialisé
git init

# 3. Ajoutez tous les fichiers
git add .

# 4. Créez le commit initial
git commit -m "Initial commit: RPG Fantasy Web App"

# 5. Créez la branche main
git branch -M main

# 6. Ajoutez votre repository distant
git remote add origin https://github.com/VOTRE_USERNAME/VOTRE_REPO.git

# 7. Poussez vers GitHub
git push -u origin main
```

### 📝 Commandes Git Essentielles pour la Suite

```bash
# Pour les futures modifications :
git add .                    # Ajouter tous les changements
git commit -m "Description"  # Créer un commit
git push                     # Pousser vers GitHub

# Pour voir l'état :
git status                   # Voir les fichiers modifiés
git log --oneline           # Voir l'historique des commits
```

---

## 3. Déploiement Backend sur Railway

### 🚂 Étape 1 : Préparation du Backend

1. **Connectez-vous à Railway** : [railway.app](https://railway.app)
2. **Cliquez sur "New Project"**
3. **Sélectionnez "Deploy from GitHub repo"**
4. **Choisissez votre repository** `rpg-fantasy-app`

### ⚙️ Étape 2 : Configuration des Variables d'Environnement

1. **Dans Railway, allez dans votre projet**
2. **Cliquez sur l'onglet "Variables"**
3. **Ajoutez ces variables** :

```env
FLASK_ENV=production
PORT=$PORT
SECRET_KEY=votre-cle-secrete-super-longue-et-complexe-123456789
CORS_ORIGINS=https://VOTRE_USERNAME.github.io
PYTHONPATH=.
```

### 🌐 Étape 3 : Obtenir l'URL du Backend

1. **Dans Railway, allez dans "Settings"**
2. **Cliquez sur "Generate Domain"**
3. **Copiez l'URL générée** (ex: `https://rpg-fantasy-backend-production.railway.app`)
4. **Notez cette URL**, vous en aurez besoin !

### ✅ Étape 4 : Tester le Backend

1. **Ouvrez votre URL Railway dans un navigateur**
2. **Ajoutez `/health` à la fin** : `https://votre-app.railway.app/health`
3. **Vous devriez voir** :
```json
{
  "status": "healthy",
  "service": "RPG Fantasy Backend API",
  "timestamp": "2024-01-21T..."
}
```

---

## 4. Déploiement Frontend sur GitHub Pages

### 📄 Étape 1 : Configuration GitHub Pages

1. **Allez sur votre repository GitHub**
2. **Cliquez sur "Settings"**
3. **Dans le menu de gauche, cliquez sur "Pages"**
4. **Dans "Source", sélectionnez "GitHub Actions"**
5. **Sauvegardez**

### 🔧 Étape 2 : Configuration des Variables d'Environnement

1. **Dans votre repository, allez dans "Settings" > "Secrets and variables" > "Actions"**
2. **Cliquez "New repository secret"**
3. **Ajoutez** :
   - **Nom** : `VITE_API_URL`
   - **Valeur** : Votre URL Railway (ex: `https://rpg-fantasy-backend-production.railway.app`)

### 📝 Étape 3 : Mise à Jour du Fichier de Configuration

1. **Ouvrez le fichier `.env.production` dans votre projet**
2. **Modifiez ces lignes** :

```env
# Remplacez par votre vraie URL Railway
VITE_API_URL=https://rpg-fantasy-backend-production.railway.app

# Remplacez par votre vrai username GitHub
VITE_CORS_ORIGIN=https://VOTRE_USERNAME.github.io

# Remplacez par le nom de votre repository
VITE_ASSET_URL=/VOTRE_REPO_NAME/
```

3. **Sauvegardez et commitez** :

```bash
git add .env.production
git commit -m "Update production config with real URLs"
git push
```

### 🚀 Étape 4 : Déclenchement du Déploiement

1. **Le push va automatiquement déclencher GitHub Actions**
2. **Allez dans l'onglet "Actions" de votre repository**
3. **Vous verrez le workflow "Deploy RPG Fantasy App" en cours**
4. **Attendez qu'il devienne vert ✅**

### 🌐 Étape 5 : Accès à Votre Site

**Votre site sera disponible à** : `https://VOTRE_USERNAME.github.io/VOTRE_REPO_NAME`

---

## 5. Alternative : Déploiement sur Vercel

### 🔄 Si GitHub Pages ne fonctionne pas

1. **Connectez-vous à Vercel** : [vercel.com](https://vercel.com)
2. **Cliquez "New Project"**
3. **Importez votre repository GitHub**
4. **Dans "Build and Output Settings"** :
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`
5. **Dans "Environment Variables"**, ajoutez** :
   - `VITE_API_URL` : Votre URL Railway
6. **Cliquez "Deploy"**

---

## 6. Vérification et Tests

### ✅ Checklist de Vérification

#### Backend (Railway)
- [ ] ✅ URL Railway accessible
- [ ] ✅ `/health` retourne un JSON avec `"status": "healthy"`
- [ ] ✅ Variables d'environnement configurées
- [ ] ✅ Pas d'erreurs dans les logs Railway

#### Frontend (GitHub Pages ou Vercel)
- [ ] ✅ Site accessible à l'URL de déploiement
- [ ] ✅ Page d'accueil se charge correctement
- [ ] ✅ Images s'affichent (dragon_quest.png, etc.)
- [ ] ✅ Pas d'erreurs dans la console du navigateur (F12)

#### Intégration Frontend-Backend
- [ ] ✅ Pas d'erreurs CORS
- [ ] ✅ Les appels API fonctionnent
- [ ] ✅ Le jeu répond aux interactions

### 🧪 Tests Manuels

1. **Ouvrez votre site déployé**
2. **Appuyez sur F12 pour ouvrir les outils de développement**
3. **Allez dans l'onglet "Console"**
4. **Vérifiez qu'il n'y a pas d'erreurs rouges**
5. **Testez la création de personnage**
6. **Testez le début d'une aventure**

---

## 7. Dépannage des Problèmes Courants

### 🚨 Problème : Erreur CORS

**Symptôme** :
```
Access to fetch at 'railway-url' from origin 'github-pages-url' has been blocked by CORS policy
```

**Solution** :
1. **Vérifiez la variable `CORS_ORIGINS` dans Railway**
2. **Elle doit contenir votre URL GitHub Pages exacte**
3. **Format** : `https://VOTRE_USERNAME.github.io`

### 🚨 Problème : Backend en Veille

**Symptôme** :
```
Failed to fetch: TypeError: Failed to fetch
```

**Solution** :
1. **Railway met le backend en veille après inactivité**
2. **Visitez directement l'URL Railway pour le réveiller**
3. **Attendez 30 secondes puis retestez votre site**

### 🚨 Problème : Images Manquantes

**Symptôme** : Images cassées sur le site

**Solution** :
1. **Vérifiez que les images sont dans le bon dossier**
2. **Les images doivent être à la racine du projet** :
   - `dragon_quest.png`
   - `paris_revolution.png`
   - `eldervik_magic.png`

### 🚨 Problème : GitHub Actions Échoue

**Symptôme** : Workflow rouge ❌ dans l'onglet Actions

**Solution** :
1. **Cliquez sur le workflow échoué**
2. **Lisez les logs d'erreur**
3. **Problèmes courants** :
   - Erreurs ESLint → Corrigez le code
   - Dépendances manquantes → Vérifiez `package.json`
   - Variables d'environnement → Vérifiez les secrets GitHub

### 🚨 Problème : Site Blanc/Vide

**Solution** :
1. **Ouvrez F12 > Console**
2. **Cherchez les erreurs JavaScript**
3. **Vérifiez que `VITE_ASSET_URL` est correct dans `.env.production`**
4. **Format** : `/VOTRE_REPO_NAME/`

---

## 🎯 Commandes de Debug Utiles

### Pour Tester Localement
```bash
# Frontend
npm run dev          # http://localhost:5173

# Backend
python main.py       # http://localhost:5000

# Test de build
npm run build
npm run preview      # Test du build de production
```

### Pour Vérifier Git
```bash
git status           # État des fichiers
git log --oneline    # Historique des commits
git remote -v        # URLs des repositories distants
```

### Pour Vérifier les Logs
```bash
# Logs Railway : Dans l'interface Railway > Deployments > View Logs
# Logs GitHub Actions : Repository > Actions > Cliquer sur le workflow
# Logs Browser : F12 > Console
```

---

## 🎉 Félicitations !

Si vous avez suivi toutes ces étapes, votre application RPG Fantasy Web App devrait maintenant être déployée et accessible !

### 📱 Vos URLs Finales
- **Frontend** : `https://VOTRE_USERNAME.github.io/VOTRE_REPO_NAME`
- **Backend** : `https://votre-app.railway.app`
- **Health Check** : `https://votre-app.railway.app/health`

### 🔄 Pour les Futures Mises à Jour

```bash
# 1. Modifiez votre code
# 2. Commitez et poussez
git add .
git commit -m "Description des changements"
git push

# 3. GitHub Actions redéploiera automatiquement !
# 4. Railway redéploiera automatiquement le backend !
```

---

## 📞 Besoin d'Aide ?

Si vous rencontrez encore des problèmes :

1. **Vérifiez les logs** (Railway, GitHub Actions, Console navigateur)
2. **Testez localement d'abord** avec `npm run dev` et `python main.py`
3. **Vérifiez que toutes les URLs sont correctes**
4. **Assurez-vous que les variables d'environnement sont bien configurées**

**Bonne chance avec votre déploiement ! 🚀**