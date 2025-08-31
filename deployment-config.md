# Configuration de Déploiement Gratuit

## Architecture de Déploiement

### Frontend - GitHub Pages (Gratuit)
- **Service**: GitHub Pages
- **Coût**: Gratuit
- **URL**: `https://[username].github.io/[repository-name]`
- **Build**: Vite build automatique via GitHub Actions

### Backend - Railway (Gratuit)
- **Service**: Railway.app
- **Coût**: Gratuit (500h/mois)
- **URL**: `https://[app-name].railway.app`
- **Base de données**: SQLite intégrée

## Configuration Requise

### 1. Variables d'Environnement Frontend
```env
# .env.production
VITE_API_URL=https://[your-backend-app].railway.app
VITE_APP_TITLE=RPG Fantasy Web App
```

### 2. Variables d'Environnement Backend
```env
# Railway Environment Variables
PORT=5000
FLASK_ENV=production
SECRET_KEY=your-production-secret-key
CORS_ORIGINS=https://[username].github.io
```

### 3. Configuration Railway
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "python main.py",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

## Étapes de Déploiement

### Phase 1: Préparation du Code
1. ✅ Correction des erreurs ESLint
2. ✅ Suppression des images inutilisées
3. ✅ Correction des chemins d'importation
4. ⏳ Configuration des variables d'environnement

### Phase 2: Configuration GitHub
1. ⏳ Initialisation du repository Git
2. ⏳ Configuration GitHub Actions
3. ⏳ Activation GitHub Pages

### Phase 3: Déploiement Backend
1. ⏳ Création compte Railway
2. ⏳ Déploiement backend Python/Flask
3. ⏳ Configuration base de données

### Phase 4: Tests et Validation
1. ⏳ Test de l'API backend
2. ⏳ Test de l'interface frontend
3. ⏳ Validation de l'intégration complète

## Alternatives Gratuites

### Backend Alternatives
1. **Render.com** (Gratuit avec limitations)
2. **Heroku** (Gratuit avec limitations)
3. **Vercel** (Pour API serverless)

### Frontend Alternatives
1. **Netlify** (Gratuit)
2. **Vercel** (Gratuit)
3. **Surge.sh** (Gratuit)

## Limitations des Services Gratuits

### Railway (Gratuit)
- 500 heures d'exécution par mois
- 1GB RAM
- 1GB stockage
- Mise en veille après inactivité

### GitHub Pages
- Sites publics uniquement
- 1GB de stockage
- 100GB de bande passante/mois
- Builds limités à 10 par heure

## Optimisations pour le Gratuit

### Frontend
- Minification automatique avec Vite
- Compression des assets
- Lazy loading des composants
- Cache des ressources statiques

### Backend
- Utilisation de SQLite (pas de DB externe)
- Compression des réponses API
- Cache en mémoire pour les données fréquentes
- Optimisation des requêtes

## Monitoring Gratuit

### Outils Recommandés
1. **UptimeRobot** - Monitoring de disponibilité
2. **Google Analytics** - Analytics frontend
3. **Railway Metrics** - Monitoring backend intégré
4. **GitHub Insights** - Statistiques du repository