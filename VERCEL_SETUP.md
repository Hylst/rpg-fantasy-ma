# Configuration Vercel pour RPG Fantasy Web App

## Étape 1: Connexion du dépôt GitHub à Vercel

### 1.1 Accéder à Vercel
1. Allez sur [vercel.com](https://vercel.com)
2. Connectez-vous avec votre compte GitHub
3. Cliquez sur "New Project"

### 1.2 Importer votre dépôt
1. Dans la liste des dépôts, trouvez `Hylst/rpg-fantasy-ma`
2. Cliquez sur "Import"
3. Vercel détectera automatiquement que c'est un projet Vite/React

## Étape 2: Configuration du projet

### 2.1 Paramètres de build
Vercel configurera automatiquement:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm ci`

### 2.2 Variables d'environnement Vercel
Dans l'onglet "Environment Variables", ajoutez:

```
VITE_API_URL=https://votre-url-railway.railway.app
VITE_APP_TITLE=RPG Fantasy Web App
VITE_APP_VERSION=1.0.0
NODE_ENV=production
VITE_CORS_ORIGIN=https://hylst.github.io
VITE_ASSET_URL=/rpg-fantasy-ma/
VITE_DEBUG=false
VITE_AUTH_ENABLED=true
VITE_LOG_LEVEL=error
```

**Important**: Remplacez `https://votre-url-railway.railway.app` par l'URL réelle de votre backend Railway.

## Étape 3: Configuration avancée

### 3.1 Créer vercel.json (optionnel)
Pour une configuration plus fine, créez un fichier `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
```

## Étape 4: Déploiement

### 4.1 Premier déploiement
1. Cliquez sur "Deploy"
2. Vercel commencera le build automatiquement
3. Le déploiement prend généralement 1-3 minutes

### 4.2 Obtenir l'URL de production
Après déploiement, vous obtiendrez:
- **URL de production**: `https://rpg-fantasy-ma.vercel.app`
- **URL de prévisualisation**: pour chaque commit

## Étape 5: Configuration du domaine personnalisé (optionnel)

### 5.1 Ajouter un domaine
1. Dans l'onglet "Settings" > "Domains"
2. Ajoutez votre domaine personnalisé
3. Configurez les DNS selon les instructions Vercel

## Étape 6: Mise à jour de la configuration backend

### 6.1 Mettre à jour les CORS sur Railway
Dans Railway, ajoutez l'URL Vercel aux CORS:
```
CORS_ORIGINS=https://rpg-fantasy-ma.vercel.app,https://hylst.github.io/rpg-fantasy-ma
```

## Étape 7: Vérification

### 7.1 Test du frontend
1. Visitez votre URL Vercel
2. Vérifiez que l'application se charge
3. Testez la communication avec le backend

### 7.2 Logs de débogage
En cas de problème:
1. Onglet "Functions" pour les logs
2. Onglet "Deployments" pour l'historique
3. Console du navigateur pour les erreurs frontend

## Déploiement automatique

### 7.1 Configuration Git
Vercel déploiera automatiquement:
- **Production**: à chaque push sur `main`
- **Preview**: à chaque push sur les autres branches
- **Pull Requests**: prévisualisation automatique

## Commandes utiles

```bash
# Installer Vercel CLI (optionnel)
npm i -g vercel

# Déployer depuis le terminal
vercel

# Voir les logs en temps réel
vercel logs

# Lister les déploiements
vercel ls
```

## Résolution des problèmes courants

### Erreur de build
- Vérifiez `package.json` et les dépendances
- Consultez les logs de build dans Vercel

### Variables d'environnement non reconnues
- Assurez-vous qu'elles commencent par `VITE_`
- Redéployez après avoir ajouté les variables

### Erreur 404 sur les routes
- Vérifiez la configuration des rewrites
- Assurez-vous que le routeur React est configuré

### Problème de CORS
- Vérifiez l'URL backend dans `VITE_API_URL`
- Assurez-vous que Railway accepte l'origine Vercel

---

**Note importante**: Notez l'URL Vercel, vous devrez l'ajouter aux CORS de Railway !