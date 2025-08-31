# 🚀 Guide de Déploiement Complet - RPG Fantasy Web App

## 📋 Prérequis
- ✅ Dépôt GitHub créé: `https://github.com/Hylst/rpg-fantasy-ma.git`
- ✅ Compte Railway connecté
- ✅ Compte Vercel connecté
- ✅ Code pushé sur GitHub

---

## 🎯 Plan de Déploiement

### Phase 1: Backend sur Railway
### Phase 2: Frontend sur Vercel
### Phase 3: Configuration et Tests

---

## 🔧 Phase 1: Déploiement Backend (Railway)

### Étape 1.1: Créer le projet Railway
1. 🌐 Allez sur [railway.app](https://railway.app)
2. 🔑 Connectez-vous avec GitHub
3. ➕ Cliquez "New Project"
4. 📂 Sélectionnez "Deploy from GitHub repo"
5. 🎯 Choisissez `Hylst/rpg-fantasy-ma`

### Étape 1.2: Configuration Railway
1. 📊 Railway détectera automatiquement Python
2. ⚙️ Allez dans l'onglet "Variables"
3. 📝 Ajoutez ces variables d'environnement:

```env
FLASK_ENV=production
PORT=$PORT
PYTHONPATH=.
CORS_ORIGINS=https://rpg-fantasy-ma.vercel.app
```

### Étape 1.3: Lancer le déploiement
1. 🚀 Railway commencera automatiquement le build
2. ⏱️ Attendez 2-5 minutes
3. 📋 Surveillez les logs dans "Deployments"

### Étape 1.4: Récupérer l'URL Railway
1. 🔗 Allez dans "Settings" > "Domains"
2. 📋 Copiez l'URL générée (ex: `https://rpg-fantasy-ma-production.up.railway.app`)
3. 💾 **GARDEZ CETTE URL PRÉCIEUSEMENT !**

---

## 🎨 Phase 2: Déploiement Frontend (Vercel)

### Étape 2.1: Mettre à jour la configuration
1. 📝 Ouvrez le fichier `.env.production`
2. 🔄 Remplacez:
```env
VITE_API_URL=https://your-railway-app.railway.app
```
Par:
```env
VITE_API_URL=https://VOTRE-URL-RAILWAY-ICI
```

3. 💾 Sauvegardez et commitez:
```bash
git add .env.production
git commit -m "Update Railway API URL"
git push origin main
```

### Étape 2.2: Créer le projet Vercel
1. 🌐 Allez sur [vercel.com](https://vercel.com)
2. 🔑 Connectez-vous avec GitHub
3. ➕ Cliquez "New Project"
4. 📂 Trouvez `Hylst/rpg-fantasy-ma`
5. 📥 Cliquez "Import"

### Étape 2.3: Configuration Vercel
1. ⚙️ Vercel détectera automatiquement Vite
2. 📊 Dans "Environment Variables", ajoutez:

```env
VITE_API_URL=https://VOTRE-URL-RAILWAY-ICI
VITE_APP_TITLE=RPG Fantasy Web App
VITE_APP_VERSION=1.0.0
NODE_ENV=production
VITE_DEBUG=false
VITE_AUTH_ENABLED=true
VITE_LOG_LEVEL=error
```

### Étape 2.4: Déployer
1. 🚀 Cliquez "Deploy"
2. ⏱️ Attendez 1-3 minutes
3. 🎉 Récupérez votre URL Vercel (ex: `https://rpg-fantasy-ma.vercel.app`)

---

## 🔗 Phase 3: Configuration Finale

### Étape 3.1: Mettre à jour les CORS Railway
1. 🔙 Retournez sur Railway
2. ⚙️ Dans "Variables", modifiez `CORS_ORIGINS`:
```env
CORS_ORIGINS=https://rpg-fantasy-ma.vercel.app,https://hylst.github.io/rpg-fantasy-ma
```
3. 🔄 Railway redémarrera automatiquement

### Étape 3.2: Tests de vérification

#### Test Backend:
1. 🌐 Visitez: `https://VOTRE-URL-RAILWAY/health`
2. ✅ Vous devriez voir: `{"status": "healthy"}`

#### Test Frontend:
1. 🌐 Visitez votre URL Vercel
2. ✅ L'application doit se charger
3. 🎮 Testez la création de personnage
4. 📡 Vérifiez la communication avec le backend

---

## 🔍 Vérification Complète

### ✅ Checklist de déploiement
- [ ] Backend Railway déployé et accessible
- [ ] Frontend Vercel déployé et accessible
- [ ] Variables d'environnement configurées
- [ ] CORS configuré correctement
- [ ] Communication frontend-backend fonctionnelle
- [ ] Tests de l'application réussis

---

## 🚨 Résolution de Problèmes

### Backend ne démarre pas
```bash
# Vérifiez les logs Railway
# Assurez-vous que requirements.txt est correct
# Vérifiez que main.py existe
```

### Frontend ne se connecte pas au backend
```bash
# Vérifiez VITE_API_URL dans Vercel
# Vérifiez CORS_ORIGINS dans Railway
# Testez l'URL backend directement
```

### Erreur CORS
```bash
# Ajoutez l'URL Vercel aux CORS Railway
# Redéployez Railway après modification
```

---

## 🔄 Workflow de Mise à Jour

### Pour mettre à jour l'application:
1. 📝 Modifiez votre code localement
2. 💾 Commitez et pushez sur GitHub
3. 🚀 Railway et Vercel se redéploient automatiquement
4. ⏱️ Attendez 2-5 minutes
5. ✅ Testez les changements

---

## 📞 URLs Importantes

- 🔗 **Dépôt GitHub**: https://github.com/Hylst/rpg-fantasy-ma.git
- 🔗 **Backend Railway**: `https://VOTRE-URL-RAILWAY`
- 🔗 **Frontend Vercel**: `https://VOTRE-URL-VERCEL`
- 🔗 **Dashboard Railway**: https://railway.app/dashboard
- 🔗 **Dashboard Vercel**: https://vercel.com/dashboard

---

## 🎉 Félicitations !

Votre application RPG Fantasy est maintenant déployée avec:
- ✅ Backend Python/Flask sur Railway
- ✅ Frontend React/Vite sur Vercel
- ✅ Déploiement automatique via GitHub
- ✅ HTTPS et domaines personnalisés
- ✅ Monitoring et logs intégrés

**Votre application est prête à être utilisée par vos joueurs ! 🎮**