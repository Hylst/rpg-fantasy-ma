# Configuration Railway pour RPG Fantasy Web App

## Étape 1: Connexion du dépôt GitHub à Railway

### 1.1 Accéder à Railway
1. Allez sur [railway.app](https://railway.app)
2. Connectez-vous avec votre compte GitHub
3. Cliquez sur "New Project"

### 1.2 Connecter votre dépôt
1. Sélectionnez "Deploy from GitHub repo"
2. Choisissez votre dépôt: `Hylst/rpg-fantasy-ma`
3. Railway détectera automatiquement que c'est un projet Python

## Étape 2: Configuration du projet

### 2.1 Variables d'environnement Railway
Dans l'onglet "Variables" de votre projet Railway, ajoutez:

```
FLASK_ENV=production
PORT=$PORT
PYTHONPATH=.
CORS_ORIGINS=https://hylst.github.io,https://hylst.github.io/rpg-fantasy-ma
```

### 2.2 Configuration automatique
Railway utilisera automatiquement:
- `requirements.txt` pour installer les dépendances
- `main.py` comme point d'entrée
- Le fichier `railway.json` pour la configuration

## Étape 3: Déploiement

### 3.1 Premier déploiement
1. Railway commencera automatiquement le build
2. Surveillez les logs dans l'onglet "Deployments"
3. Le déploiement prend généralement 2-5 minutes

### 3.2 Obtenir l'URL de production
1. Une fois déployé, allez dans l'onglet "Settings"
2. Dans "Domains", vous verrez l'URL générée automatiquement
3. Elle ressemblera à: `https://rpg-fantasy-ma-production.up.railway.app`

## Étape 4: Mise à jour de la configuration frontend

### 4.1 Mettre à jour .env.production
Remplacez dans le fichier `.env.production`:
```
VITE_API_URL=https://your-railway-app.railway.app
```
Par l'URL réelle obtenue à l'étape 3.2

### 4.2 Commit et push des changements
```bash
git add .env.production
git commit -m "Update API URL with Railway deployment"
git push origin main
```

## Étape 5: Vérification

### 5.1 Test de l'API
Testez votre API en visitant:
- `https://votre-url-railway.railway.app/health`
- `https://votre-url-railway.railway.app/api/status`

### 5.2 Logs de débogage
En cas de problème, consultez les logs dans Railway:
1. Onglet "Deployments"
2. Cliquez sur le déploiement actuel
3. Consultez les logs en temps réel

## Commandes utiles pour le débogage

```bash
# Vérifier la structure du projet
ls -la

# Vérifier les dépendances Python
pip list

# Tester localement avant déploiement
python main.py
```

## Résolution des problèmes courants

### Erreur de build
- Vérifiez que `requirements.txt` est à la racine
- Assurez-vous que `main.py` existe

### Erreur de démarrage
- Vérifiez les logs Railway
- Assurez-vous que le port est configuré avec `$PORT`

### Erreur CORS
- Vérifiez la variable `CORS_ORIGINS`
- Assurez-vous que l'URL frontend est correcte

---

**Note importante**: Gardez l'URL Railway précieusement, vous en aurez besoin pour configurer le frontend !