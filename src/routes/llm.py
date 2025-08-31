import os
import json
import requests
from flask import Blueprint, request, jsonify
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

llm_bp = Blueprint('llm', __name__)

# Configuration des fournisseurs LLM
LLM_PROVIDERS = {
    'deepseek': {
        'api_key': os.getenv('DEEPSEEK_API_KEY'),
        'base_url': 'https://api.deepseek.com/v1/chat/completions',
        'model': 'deepseek-chat'
    },
    'openrouter': {
        'api_key': os.getenv('OPENROUTER_API_KEY'),
        'base_url': 'https://openrouter.ai/api/v1/chat/completions',
        'model': 'google/gemini-2.0-flash-exp:free'
    },
    'gemini': {
        'api_key': os.getenv('GEMINI_API_KEY'),
        'base_url': 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        'model': 'gemini-pro'
    },
    'grok': {
        'api_key': os.getenv('GROK_API_KEY'),
        'base_url': 'https://api.x.ai/v1/chat/completions',
        'model': 'grok-beta'
    }
}

@llm_bp.route('/llm/generate', methods=['POST'])
def generate_text():
    """Endpoint pour générer du texte via les LLM"""
    try:
        data = request.get_json()
        
        # Validation des données d'entrée
        if not data:
            return jsonify({'error': 'Aucune donnée fournie'}), 400
        
        provider = data.get('provider', os.getenv('DEFAULT_LLM_PROVIDER', 'deepseek'))
        prompt = data.get('prompt', '')
        system_prompt = data.get('system_prompt', '')
        max_tokens = data.get('max_tokens', 2000)
        temperature = data.get('temperature', 0.7)
        
        if not prompt:
            return jsonify({'error': 'Le prompt est requis'}), 400
        
        if provider not in LLM_PROVIDERS:
            return jsonify({'error': f'Fournisseur {provider} non supporté'}), 400
        
        provider_config = LLM_PROVIDERS[provider]
        api_key = provider_config['api_key']
        
        if not api_key:
            return jsonify({'error': f'Clé API manquante pour {provider}'}), 500
        
        # Préparer les messages
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        # Appel à l'API selon le fournisseur
        if provider == 'gemini':
            response = call_gemini_api(api_key, prompt, system_prompt)
        else:
            response = call_openai_compatible_api(
                provider_config['base_url'],
                api_key,
                provider_config['model'],
                messages,
                max_tokens,
                temperature,
                provider
            )
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({'error': f'Erreur lors de la génération: {str(e)}'}), 500

def call_openai_compatible_api(base_url, api_key, model, messages, max_tokens, temperature, provider):
    """Appel aux API compatibles OpenAI (DeepSeek, OpenRouter, Grok)"""
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_key}'
    }
    
    # Configuration spécifique pour OpenRouter
    if provider == 'openrouter':
        headers['HTTP-Referer'] = 'https://rpg-ai-game.com'
        headers['X-Title'] = 'RPG AI Game'
    
    payload = {
        'model': model,
        'messages': messages,
        'max_tokens': max_tokens,
        'temperature': temperature
    }
    
    response = requests.post(base_url, headers=headers, json=payload, timeout=30)
    response.raise_for_status()
    
    result = response.json()
    
    if 'choices' in result and len(result['choices']) > 0:
        return {
            'success': True,
            'response': result['choices'][0]['message']['content'],
            'provider': provider,
            'model': model,
            'usage': result.get('usage', {})
        }
    else:
        raise Exception(f'Format de réponse invalide de {provider}')

def call_gemini_api(api_key, prompt, system_prompt=''):
    """Appel spécifique à l'API Gemini"""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={api_key}"
    
    # Construire le contenu
    full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
    
    payload = {
        "contents": [{
            "parts": [{"text": full_prompt}]
        }],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 2000
        }
    }
    
    headers = {'Content-Type': 'application/json'}
    
    response = requests.post(url, headers=headers, json=payload, timeout=30)
    response.raise_for_status()
    
    result = response.json()
    
    if 'candidates' in result and len(result['candidates']) > 0:
        candidate = result['candidates'][0]
        if 'content' in candidate and 'parts' in candidate['content']:
            return {
                'success': True,
                'response': candidate['content']['parts'][0]['text'],
                'provider': 'gemini',
                'model': 'gemini-pro'
            }
    
    raise Exception('Format de réponse invalide de Gemini')

@llm_bp.route('/llm/providers', methods=['GET'])
def get_providers():
    """Retourne la liste des fournisseurs LLM disponibles"""
    providers = {}
    for name, config in LLM_PROVIDERS.items():
        providers[name] = {
            'name': name,
            'model': config['model'],
            'available': bool(config['api_key'])
        }
    
    return jsonify({
        'providers': providers,
        'default': os.getenv('DEFAULT_LLM_PROVIDER', 'deepseek')
    })

@llm_bp.route('/llm/test/<provider>', methods=['POST'])
def test_provider(provider):
    """Teste la connexion à un fournisseur LLM"""
    try:
        if provider not in LLM_PROVIDERS:
            return jsonify({'error': f'Fournisseur {provider} non supporté'}), 400
        
        provider_config = LLM_PROVIDERS[provider]
        api_key = provider_config['api_key']
        
        if not api_key:
            return jsonify({'error': f'Clé API manquante pour {provider}'}), 400
        
        # Test simple
        test_prompt = "Réponds simplement 'Test réussi' pour vérifier la connexion."
        
        if provider == 'gemini':
            response = call_gemini_api(api_key, test_prompt)
        else:
            messages = [{"role": "user", "content": test_prompt}]
            response = call_openai_compatible_api(
                provider_config['base_url'],
                api_key,
                provider_config['model'],
                messages,
                100,
                0.1,
                provider
            )
        
        return jsonify({
            'success': True,
            'message': 'Connexion établie avec succès',
            'provider': provider,
            'response': response.get('response', '')[:100]  # Limiter la réponse
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Échec de la connexion: {str(e)}'
        }), 500

