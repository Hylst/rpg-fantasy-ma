# Guide de Déploiement - RPG Fantasy Web App

## 🚀 Déploiement Automatique Gratuit

Ce guide vous explique comment déployer automatiquement votre application RPG Fantasy sur des services gratuits.

## 📋 Prérequis

- Compte GitHub (gratuit)
- Compte Railway.app (gratuit - 500h/mois)
- Git installé localement

## 🔧 Étape 1: Initialisation du Repository GitHub

### 1.1 Créer un nouveau repository sur GitHub
1. Allez sur [GitHub.com](https://github.com)
2. Cliquez sur "New repository"
3. Nommez-le `rpg-fantasy-app` (ou autre nom)
4. Cochez "Public" (requis pour GitHub Pages gratuit)
5. Ne cochez PAS "Initialize with README"
6. Cliquez "Create repository"

### 1.2 Initialiser Git localement
```bash
# Dans le dossier de votre projet
git init
git add .
git commit -m "Initial commit: RPG Fantasy Web App"
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/rpg-fantasy-app.git
git push -u origin main
```

## 🌐 Étape 2: Configuration GitHub Pages

### 2.1 Activer GitHub Pages
1. Dans votre repository GitHub, allez dans **Settings**
2. Scrollez jusqu'à **Pages** dans le menu de gauche
3. Dans **Source**, sélectionnez **GitHub Actions**
4. Sauvegardez

### 2.2 Configuration des Secrets (Optionnel)
1. Dans **Settings** > **Secrets and variables** > **Actions**
2. Cliquez **New repository secret**
3. Ajoutez:
   - `VITE_API_URL`: URL de votre backend Railway (voir étape 3)

## 🐍 Étape 3: Déploiement Backend sur Railway

### 3.1 Créer un compte Railway
1. Allez sur [Railway.app](https://railway.app)
2. Connectez-vous avec GitHub
3. Cliquez "New Project"

### 3.2 Déployer depuis GitHub
1. Sélectionnez "Deploy from GitHub repo"
2. Choisissez votre repository `rpg-fantasy-app`
3. Railway détectera automatiquement Python
4. Le déploiement commence automatiquement

### 3.3 Configuration des Variables d'Environnement
1. Dans Railway, allez dans votre projet
2. Cliquez sur l'onglet **Variables**
3. Ajoutez:
   ```
   FLASK_ENV=production
   PORT=$PORT
   SECRET_KEY=votre-clé-secrète-sécurisée
   CORS_ORIGINS=https://VOTRE_USERNAME.github.io
   ```

### 3.4 Obtenir l'URL du Backend
1. Dans Railway, allez dans **Settings**
2. Cliquez **Generate Domain**
3. Copiez l'URL générée (ex: `https://rpg-fantasy-backend.railway.app`)

## 🔄 Étape 4: Mise à Jour de la Configuration Frontend

### 4.1 Mettre à jour les variables d'environnement
1. Éditez `.env.production` dans votre projet
2. Remplacez `https://rpg-fantasy-backend.railway.app` par votre URL Railway
3. Remplacez `username.github.io` par votre username GitHub

### 4.2 Commit et Push
```bash
git add .
git commit -m "Update production config with Railway URL"
git push
```

## ✅ Étape 5: Vérification du Déploiement

### 5.1 Vérifier le Backend
1. Ouvrez votre URL Railway dans un navigateur
2. Ajoutez `/health` à la fin (ex: `https://votre-app.railway.app/health`)
3. Vous devriez voir un JSON avec `"status": "healthy"`

### 5.2 Vérifier le Frontend
1. Allez dans votre repository GitHub
2. Cliquez sur l'onglet **Actions**
3. Vérifiez que le workflow "Deploy RPG Fantasy App" est vert ✅
4. Votre site sera disponible à: `https://VOTRE_USERNAME.github.io/rpg-fantasy-app`

## 🔧 Déploiement Manuel (Alternative)

### Si GitHub Actions ne fonctionne pas:

```bash
# Build local
npm run build

# Déployer sur GitHub Pages avec gh-pages
npm install -g gh-pages
gh-pages -d dist
```

## 📊 Monitoring et Maintenance

### Surveillance Gratuite
1. **UptimeRobot**: Monitoring de disponibilité
2. **Railway Metrics**: Utilisation des ressources
3. **GitHub Insights**: Statistiques du repository

### Limites des Services Gratuits
- **Railway**: 500h/mois, mise en veille après inactivité
- **GitHub Pages**: 1GB stockage, 100GB bande passante/mois

## 🚨 Dépannage

### Problèmes Courants

#### 1. Erreur CORS
```
Access to fetch at 'railway-url' from origin 'github-pages-url' has been blocked by CORS policy
```
**Solution**: Vérifiez la variable `CORS_ORIGINS` dans Railway

#### 2. Backend en veille
```
Failed to fetch: TypeError: Failed to fetch
```
**Solution**: Le backend Railway s'endort. Visitez l'URL pour le réveiller.

#### 3. Build échoue
```
Module not found: Error: Can't resolve './image.png'
```
**Solution**: Vérifiez les chemins d'importation des images

### Commandes de Debug

```bash
# Tester le build localement
npm run build
npm run preview

# Vérifier les erreurs ESLint
npm run lint

# Tester le backend localement
python main.py
```

## 🔄 Mise à Jour Continue

### Workflow de Développement
1. Développez localement
2. Testez avec `npm run dev` et `python main.py`
3. Commit et push vers GitHub
4. GitHub Actions déploie automatiquement
5. Railway redéploie automatiquement le backend

### Commandes Utiles
```bash
# Développement local
npm run dev          # Frontend sur http://localhost:5173
python main.py       # Backend sur http://localhost:5000

# Production
npm run build        # Build pour production
npm run preview      # Prévisualiser le build
```

## 📞 Support

En cas de problème:
1. Vérifiez les logs GitHub Actions
2. Vérifiez les logs Railway
3. Testez localement d'abord
4. Consultez la documentation officielle des services

---

**🎉 Félicitations!** Votre application RPG Fantasy est maintenant déployée automatiquement et gratuitement!

**URLs de votre application:**
- Frontend: `https://VOTRE_USERNAME.github.io/rpg-fantasy-app`
- Backend: `https://votre-app.railway.app`
- Health Check: `https://votre-app.railway.app/health`