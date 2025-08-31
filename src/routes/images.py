import os
import json
import requests
from flask import Blueprint, request, jsonify
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

images_bp = Blueprint('images', __name__)

# Configuration pour la génération d'images
IMAGE_PROVIDERS = {
    'huggingface': {
        'api_key': os.getenv('HF_TOKEN'),
        'base_url': 'https://black-forest-labs-flux-1-schnell.hf.space',
        'model': 'black-forest-labs/FLUX.1-schnell'
    }
}

@images_bp.route('/images/generate', methods=['POST'])
def generate_image():
    """Endpoint pour générer des images"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Aucune donnée fournie'}), 400
        
        prompt = data.get('prompt', '')
        provider = data.get('provider', 'huggingface')
        width = data.get('width', 1024)
        height = data.get('height', 1024)
        steps = data.get('steps', 4)
        seed = data.get('seed', 0)
        randomize_seed = data.get('randomize_seed', True)
        
        if not prompt:
            return jsonify({'error': 'Le prompt est requis'}), 400
        
        if provider not in IMAGE_PROVIDERS:
            return jsonify({'error': f'Fournisseur {provider} non supporté'}), 400
        
        provider_config = IMAGE_PROVIDERS[provider]
        
        if provider == 'huggingface':
            response = generate_with_huggingface(
                prompt, width, height, steps, seed, randomize_seed
            )
        else:
            return jsonify({'error': f'Fournisseur {provider} non implémenté'}), 400
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({'error': f'Erreur lors de la génération d\'image: {str(e)}'}), 500

def generate_with_huggingface(prompt, width, height, steps, seed, randomize_seed):
    """Génération d'image via Hugging Face FLUX.1-schnell"""
    try:
        # Utilisation de l'API Gradio Client pour Hugging Face
        # Pour simplifier, nous utilisons l'API REST directe
        
        api_url = "https://black-forest-labs-flux-1-schnell.hf.space/call/infer"
        
        payload = {
            "data": [
                prompt,           # prompt
                seed,            # seed
                randomize_seed,  # randomize_seed
                width,           # width
                height,          # height
                steps            # num_inference_steps
            ]
        }
        
        headers = {
            'Content-Type': 'application/json'
        }
        
        # Première requête pour démarrer la génération
        response = requests.post(api_url, headers=headers, json=payload, timeout=60)
        response.raise_for_status()
        
        result = response.json()
        
        if 'event_id' in result:
            # Récupérer le résultat
            event_id = result['event_id']
            result_url = f"https://black-forest-labs-flux-1-schnell.hf.space/call/infer/{event_id}"
            
            # Attendre le résultat (polling)
            import time
            max_attempts = 30
            for attempt in range(max_attempts):
                time.sleep(2)
                
                result_response = requests.get(result_url, timeout=10)
                if result_response.status_code == 200:
                    result_data = result_response.json()
                    
                    if result_data.get('type') == 'complete':
                        # Extraire l'URL de l'image
                        if 'data' in result_data and len(result_data['data']) > 0:
                            image_data = result_data['data'][0]
                            if isinstance(image_data, dict) and 'url' in image_data:
                                image_url = image_data['url']
                                # Construire l'URL absolue
                                if image_url.startswith('/'):
                                    image_url = f"https://black-forest-labs-flux-1-schnell.hf.space{image_url}"
                                
                                return {
                                    'success': True,
                                    'image_url': image_url,
                                    'provider': 'huggingface',
                                    'model': 'FLUX.1-schnell',
                                    'prompt': prompt,
                                    'parameters': {
                                        'width': width,
                                        'height': height,
                                        'steps': steps,
                                        'seed': seed
                                    }
                                }
                    elif result_data.get('type') == 'error':
                        raise Exception(f"Erreur Hugging Face: {result_data.get('data', 'Erreur inconnue')}")
            
            raise Exception("Timeout lors de la génération d'image")
        else:
            raise Exception("Format de réponse invalide de Hugging Face")
            
    except Exception as e:
        # Fallback vers une image par défaut
        return {
            'success': False,
            'error': str(e),
            'fallback_image': get_fallback_image(prompt),
            'provider': 'huggingface'
        }

def get_fallback_image(prompt):
    """Retourne une image de fallback basée sur le prompt"""
    prompt_lower = prompt.lower()
    
    if any(word in prompt_lower for word in ['character', 'portrait', 'person']):
        return '/fallback/character_default.jpg'
    elif any(word in prompt_lower for word in ['location', 'landscape', 'place', 'environment']):
        return '/fallback/location_default.jpg'
    elif any(word in prompt_lower for word in ['combat', 'battle', 'fight']):
        return '/fallback/combat_default.jpg'
    elif any(word in prompt_lower for word in ['item', 'object', 'weapon', 'armor']):
        return '/fallback/item_default.jpg'
    else:
        return '/fallback/default.jpg'

@images_bp.route('/images/providers', methods=['GET'])
def get_image_providers():
    """Retourne la liste des fournisseurs d'images disponibles"""
    providers = {}
    for name, config in IMAGE_PROVIDERS.items():
        providers[name] = {
            'name': name,
            'model': config['model'],
            'available': bool(config.get('api_key', True))  # HF ne nécessite pas toujours de clé
        }
    
    return jsonify({
        'providers': providers,
        'default': 'huggingface'
    })

@images_bp.route('/images/enhance-prompt', methods=['POST'])
def enhance_prompt():
    """Améliore un prompt pour la génération d'images"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Aucune donnée fournie'}), 400
        
        base_prompt = data.get('prompt', '')
        image_type = data.get('type', 'general')  # character, location, combat, item, general
        style = data.get('style', '')
        
        if not base_prompt:
            return jsonify({'error': 'Le prompt de base est requis'}), 400
        
        enhanced_prompt = enhance_image_prompt(base_prompt, image_type, style)
        
        return jsonify({
            'success': True,
            'original_prompt': base_prompt,
            'enhanced_prompt': enhanced_prompt,
            'type': image_type,
            'style': style
        })
        
    except Exception as e:
        return jsonify({'error': f'Erreur lors de l\'amélioration du prompt: {str(e)}'}), 500

def enhance_image_prompt(base_prompt, image_type, style=''):
    """Améliore un prompt avec des détails spécifiques au type d'image"""
    enhanced_prompt = base_prompt
    
    # Ajouter des détails spécifiques au type
    type_enhancements = {
        'character': ', portrait, detailed face, fantasy character art',
        'location': ', landscape, wide view, detailed environment',
        'combat': ', dynamic pose, action scene, dramatic lighting',
        'item': ', isolated on background, detailed texture, fantasy item'
    }
    
    if image_type in type_enhancements:
        enhanced_prompt += type_enhancements[image_type]
    
    # Ajouter le style si spécifié
    if style:
        enhanced_prompt += f', {style} style'
    
    # Ajouter des instructions générales pour améliorer la qualité
    enhanced_prompt += ', high quality, detailed, 4k, professional digital art'
    
    return enhanced_prompt

