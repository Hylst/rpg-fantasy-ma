# RPG Fantasy Web Application - Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the RPG Fantasy Web Application in both development and production environments. The application consists of a React/Vite frontend and a Flask/Python backend with SQLite database.

## Architecture Summary

* **Frontend**: React 18 + Vite + TailwindCSS

* **Backend**: Flask + SQLAlchemy + CORS

* **Database**: SQLite (development) / PostgreSQL (production recommended)

* **Authentication**: Flask sessions

* **File Storage**: Local filesystem (development) / Cloud storage (production)

## Prerequisites

### Development Environment

* Node.js 18+ and npm

* Python 3.8+

* Git

### Production Environment

* All development prerequisites

* Domain name (optional)

* SSL certificate (recommended)

* Cloud hosting account (Vercel, Netlify, Heroku, etc.)

## Environment Configuration

### Environment Variables

Create the following environment files:

#### `.env` (Backend)

```bash
# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your-secret-key-here

# Database
DATABASE_URL=sqlite:///database/app.db

# CORS Settings
CORS_ORIGINS=http://localhost:5173,http://localhost:5176,http://localhost:5177

# LLM API Keys (Optional)
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key

# File Storage
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216
```

#### `.env.local` (Frontend)

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_TITLE=RPG Fantasy Adventure

# Feature Flags
VITE_ENABLE_MULTIPLAYER=false
VITE_ENABLE_ANALYTICS=false
```

## Development Deployment

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd "Web App de Jeu de Rôle Fantasy"

# Install frontend dependencies
npm install

# Install backend dependencies
pip install -r requirements.txt
```

### 2. Database Setup

```bash
# Create database directory
mkdir -p database

# Initialize database (automatic on first run)
python main.py
```

### 3. Start Development Servers

#### Terminal 1 - Backend Server

```bash
python main.py
# Server runs on http://localhost:5000
```

#### Terminal 2 - Frontend Server

```bash
npm run dev
# Server runs on http://localhost:5173
```

### 4. Access Application

* Frontend: <http://localhost:5173>

* Backend API: <http://localhost:5000/api>

* Database: SQLite file at `database/app.db`

## Production Deployment

### Option 1: Vercel + Railway (Recommended)

#### Frontend on Vercel

1. **Prepare for deployment**:

```bash
# Build the frontend
npm run build
```

1. **Deploy to Vercel**:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

1. **Configure environment variables** in Vercel dashboard:

```bash
VITE_API_BASE_URL=https://your-backend-url.railway.app/api
VITE_APP_TITLE=RPG Fantasy Adventure
```

#### Backend on Railway

1. **Create** **`railway.json`**:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "python main.py",
    "healthcheckPath": "/api/health"
  }
}
```

1. **Update** **`main.py`** **for production**:

```python
import os

# Add health check endpoint
@app.route('/api/health')
def health_check():
    return {'status': 'healthy'}, 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
```

1. **Deploy to Railway**:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

1. **Configure environment variables** in Railway dashboard:

```bash
FLASK_ENV=production
FLASK_DEBUG=False
SECRET_KEY=your-production-secret-key
DATABASE_URL=postgresql://user:pass@host:port/dbname
CORS_ORIGINS=https://your-frontend-domain.vercel.app
```

### Option 2: Netlify + Heroku

#### Frontend on Netlify

1. **Create** **`netlify.toml`**:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

1. **Deploy via Git** or drag & drop the `dist` folder

#### Backend on Heroku

1. **Create** **`Procfile`**:

```
web: python main.py
```

1. **Create** **`runtime.txt`**:

```
python-3.11.0
```

1. **Deploy to Heroku**:

```bash
# Install Heroku CLI
# Create Heroku app
heroku create your-app-name

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:mini

# Deploy
git push heroku main
```

### Option 3: VPS Deployment (Ubuntu)

#### Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install python3 python3-pip nodejs npm nginx certbot python3-certbot-nginx -y

# Install PM2 for process management
npm install -g pm2
```

#### Application Setup

```bash
# Clone repository
git clone <repository-url> /var/www/rpg-app
cd /var/www/rpg-app

# Install dependencies
pip3 install -r requirements.txt
npm install
npm run build

# Create production environment file
sudo nano .env
```

#### Process Management

```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'rpg-backend',
    script: 'main.py',
    interpreter: 'python3',
    env: {
      FLASK_ENV: 'production',
      PORT: 5000
    }
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### Nginx Configuration

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/rpg-app
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/rpg-app/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/rpg-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Setup SSL
sudo certbot --nginx -d your-domain.com
```

## Database Migration

### SQLite to PostgreSQL

1. **Export SQLite data**:

```bash
sqlite3 database/app.db .dump > backup.sql
```

1. **Convert to PostgreSQL**:

```bash
# Install conversion tool
pip install sqlite3-to-postgres

# Convert
sqlite3-to-postgres -f database/app.db -t postgresql://user:pass@host:port/dbname
```

1. **Update environment variables**:

```bash
DATABASE_URL=postgresql://user:pass@host:port/dbname
```

## Monitoring and Maintenance

### Health Checks

Add health check endpoints:

```python
@app.route('/api/health')
def health_check():
    return {
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    }

@app.route('/api/health/db')
def db_health_check():
    try:
        db.session.execute('SELECT 1')
        return {'database': 'connected'}
    except Exception as e:
        return {'database': 'error', 'message': str(e)}, 500
```

### Logging

```python
import logging
from logging.handlers import RotatingFileHandler

if not app.debug:
    file_handler = RotatingFileHandler('logs/app.log', maxBytes=10240, backupCount=10)
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
    app.logger.setLevel(logging.INFO)
```

### Backup Strategy

```bash
# Database backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/rpg-app"
mkdir -p $BACKUP_DIR

# SQLite backup
cp database/app.db $BACKUP_DIR/app_$DATE.db

# PostgreSQL backup
# pg_dump $DATABASE_URL > $BACKUP_DIR/app_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "app_*.db" -mtime +7 -delete
```

## Troubleshooting

### Common Issues

1. **CORS Errors**:

   * Check `CORS_ORIGINS` environment variable

   * Ensure frontend URL is included in allowed origins

2. **Database Connection**:

   * Verify database directory exists

   * Check file permissions

   * Validate connection string

3. **Build Failures**:

   * Clear node\_modules and reinstall

   * Check Node.js version compatibility

   * Verify environment variables

4. **API Errors**:

   * Check backend logs

   * Verify API endpoints

   * Test with curl or Postman

### Performance Optimization

1. **Frontend**:

   * Enable gzip compression

   * Implement code splitting

   * Optimize images and assets

   * Use CDN for static files

2. **Backend**:

   * Implement caching (Redis)

   * Database query optimization

   * Use connection pooling

   * Enable compression middleware

## Security Considerations

1. **Environment Variables**:

   * Never commit `.env` files

   * Use strong secret keys

   * Rotate keys regularly

2. **Database**:

   * Use parameterized queries

   * Implement proper authentication

   * Regular

