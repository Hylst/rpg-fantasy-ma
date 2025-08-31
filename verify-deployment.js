#!/usr/bin/env node

/**
 * Script de vérification du déploiement
 * Teste la connectivité entre le frontend et le backend
 */

const https = require('https');
const http = require('http');

// Configuration des URLs (à modifier selon votre déploiement)
const CONFIG = {
  BACKEND_URL: 'https://your-railway-app.railway.app',
  FRONTEND_URL: 'https://rpg-fantasy-ma.vercel.app',
  GITHUB_PAGES_URL: 'https://hylst.github.io/rpg-fantasy-ma'
};

// Couleurs pour la console
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

/**
 * Fonction pour faire une requête HTTP/HTTPS
 */
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          data: data,
          headers: res.headers
        });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

/**
 * Test de santé du backend
 */
async function testBackend() {
  console.log(`${colors.blue}🔍 Test du backend...${colors.reset}`);
  
  try {
    const healthUrl = `${CONFIG.BACKEND_URL}/health`;
    console.log(`   Tentative de connexion à: ${healthUrl}`);
    
    const response = await makeRequest(healthUrl);
    
    if (response.statusCode === 200) {
      console.log(`${colors.green}✅ Backend accessible (${response.statusCode})${colors.reset}`);
      console.log(`   Réponse: ${response.data.substring(0, 100)}...`);
      return true;
    } else {
      console.log(`${colors.yellow}⚠️  Backend répond avec le code ${response.statusCode}${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Erreur backend: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Test de santé du frontend
 */
async function testFrontend(url, name) {
  console.log(`${colors.blue}🔍 Test du ${name}...${colors.reset}`);
  
  try {
    console.log(`   Tentative de connexion à: ${url}`);
    
    const response = await makeRequest(url);
    
    if (response.statusCode === 200) {
      console.log(`${colors.green}✅ ${name} accessible (${response.statusCode})${colors.reset}`);
      
      // Vérifier si c'est du HTML
      if (response.data.includes('<html') || response.data.includes('<!DOCTYPE')) {
        console.log(`   ✅ Contenu HTML détecté`);
      }
      
      return true;
    } else {
      console.log(`${colors.yellow}⚠️  ${name} répond avec le code ${response.statusCode}${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Erreur ${name}: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Test de l'API du backend
 */
async function testBackendAPI() {
  console.log(`${colors.blue}🔍 Test des endpoints API...${colors.reset}`);
  
  const endpoints = [
    '/health',
    '/api/status',
    '/api/character/create'
  ];
  
  let successCount = 0;
  
  for (const endpoint of endpoints) {
    try {
      const url = `${CONFIG.BACKEND_URL}${endpoint}`;
      console.log(`   Test: ${endpoint}`);
      
      const response = await makeRequest(url);
      
      if (response.statusCode < 500) {
        console.log(`   ${colors.green}✅ ${endpoint} (${response.statusCode})${colors.reset}`);
        successCount++;
      } else {
        console.log(`   ${colors.red}❌ ${endpoint} (${response.statusCode})${colors.reset}`);
      }
    } catch (error) {
      console.log(`   ${colors.red}❌ ${endpoint} - ${error.message}${colors.reset}`);
    }
  }
  
  return successCount;
}

/**
 * Fonction principale
 */
async function main() {
  console.log(`${colors.blue}🚀 Vérification du déploiement RPG Fantasy Web App${colors.reset}`);
  console.log('=' .repeat(60));
  
  // Vérifier la configuration
  console.log(`${colors.blue}📋 Configuration:${colors.reset}`);
  console.log(`   Backend: ${CONFIG.BACKEND_URL}`);
  console.log(`   Frontend Vercel: ${CONFIG.FRONTEND_URL}`);
  console.log(`   GitHub Pages: ${CONFIG.GITHUB_PAGES_URL}`);
  console.log('');
  
  let results = {
    backend: false,
    frontendVercel: false,
    frontendGitHub: false,
    apiEndpoints: 0
  };
  
  // Tests
  results.backend = await testBackend();
  console.log('');
  
  results.frontendVercel = await testFrontend(CONFIG.FRONTEND_URL, 'Frontend Vercel');
  console.log('');
  
  results.frontendGitHub = await testFrontend(CONFIG.GITHUB_PAGES_URL, 'Frontend GitHub Pages');
  console.log('');
  
  if (results.backend) {
    results.apiEndpoints = await testBackendAPI();
    console.log('');
  }
  
  // Résumé
  console.log('=' .repeat(60));
  console.log(`${colors.blue}📊 Résumé des tests:${colors.reset}`);
  console.log(`   Backend Railway: ${results.backend ? colors.green + '✅ OK' : colors.red + '❌ ERREUR'}${colors.reset}`);
  console.log(`   Frontend Vercel: ${results.frontendVercel ? colors.green + '✅ OK' : colors.red + '❌ ERREUR'}${colors.reset}`);
  console.log(`   GitHub Pages: ${results.frontendGitHub ? colors.green + '✅ OK' : colors.red + '❌ ERREUR'}${colors.reset}`);
  console.log(`   Endpoints API: ${results.apiEndpoints}/3 fonctionnels`);
  
  // Recommandations
  console.log('');
  console.log(`${colors.blue}💡 Recommandations:${colors.reset}`);
  
  if (!results.backend) {
    console.log(`   ${colors.red}• Vérifiez le déploiement Railway${colors.reset}`);
    console.log(`   ${colors.red}• Consultez les logs Railway${colors.reset}`);
  }
  
  if (!results.frontendVercel) {
    console.log(`   ${colors.red}• Vérifiez le déploiement Vercel${colors.reset}`);
    console.log(`   ${colors.red}• Vérifiez les variables d'environnement${colors.reset}`);
  }
  
  if (results.backend && results.frontendVercel) {
    console.log(`   ${colors.green}• Déploiement réussi ! 🎉${colors.reset}`);
    console.log(`   ${colors.green}• Votre application est prête à être utilisée${colors.reset}`);
  }
  
  console.log('');
  console.log(`${colors.blue}🔗 URLs importantes:${colors.reset}`);
  console.log(`   • Application: ${CONFIG.FRONTEND_URL}`);
  console.log(`   • API: ${CONFIG.BACKEND_URL}`);
  console.log(`   • GitHub: https://github.com/Hylst/rpg-fantasy-ma`);
}

// Exécution
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testBackend, testFrontend, testBackendAPI };