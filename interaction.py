"""
Routes pour le Moteur d'Interaction - Architecture des 4 Moteurs
Intégré avec les Moteurs d'État, de Narration et de Simulation
"""

import os
import json
import re
from flask import Blueprint, request, jsonify
from dotenv import load_dotenv

from src.engines.state_engine import state_engine
from src.engines.narrative_engine import narrative_engine
from src.engines.simulation_engine import simulation_engine

# Charger les variables d'environnement
load_dotenv()

interaction_bp = Blueprint('interaction', __name__)

@interaction_bp.route('/interaction/process_action', methods=['POST'])
def process_complete_action():
    """
    Endpoint principal - Traite une action complète via l'architecture des 4 moteurs
    
    Flux complet:
    1. Moteur d'Interaction: Parse et valide l'action
    2. Moteur de Simulation: Simule le monde en arrière-plan
    3. Moteur d'État: Met à jour l'état du jeu
    4. Moteur de Narration: Génère la réponse narrative
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Aucune donnée fournie'}), 400
        
        raw_action = data.get('action', '').strip()
        session_id = data.get('session_id')
        
        if not raw_action:
            return jsonify({'error': 'Action vide'}), 400
        
        if not session_id:
            return jsonify({'error': 'Session ID requis'}), 400
        
        # Étape 1: Parser l'action (Moteur d'Interaction)
        parse_result = _parse_action_internal(raw_action, session_id)
        if not parse_result['success']:
            return jsonify(parse_result), 400
        
        parsed_action = parse_result['parsed_action']
        
        # Étape 2: Valider l'action (Moteur d'Interaction)
        validation_result = _validate_action_internal(parsed_action, session_id)
        if not validation_result['success']:
            return jsonify(validation_result), 400
        
        # Étape 3: Simuler le monde (Moteur de Simulation)
        simulation_result = simulation_engine.simulate_world_step(session_id, 0.25)  # 15 minutes de jeu
        
        # Étape 4: Appliquer les conséquences (Moteur d'État)
        state_result = _apply_action_consequences(session_id, parsed_action, validation_result)
        
        # Étape 5: Générer la réponse narrative (Moteur de Narration)
        narrative_result = narrative_engine.generate_narrative_response(
            session_id, parsed_action, validation_result
        )
        
        # Compiler la réponse complète
        complete_response = {
            'success': True,
            'action_processed': {
                'parsed_action': parsed_action,
                'validation': validation_result,
                'state_changes': state_result,
                'simulation_events': simulation_result.get('simulation_results', {}),
                'narrative_response': narrative_result
            },
            'game_state_updated': True,
            'world_simulated': simulation_result.get('success', False)
        }
        
        return jsonify(complete_response)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erreur lors du traitement de l\'action: {str(e)}'
        }), 500

# Routes individuelles pour les tests et le débogage
@interaction_bp.route('/interaction/parse', methods=['POST'])
def parse_action():
    """Parse et catégorise l'action du joueur"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Aucune donnée fournie'}), 400
        
        raw_action = data.get('action', '').strip()
        session_id = data.get('session_id')
        
        if not raw_action:
            return jsonify({'error': 'Action vide'}), 400
        
        if not session_id:
            return jsonify({'error': 'Session ID requis'}), 400
        
        result = _parse_action_internal(raw_action, session_id)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@interaction_bp.route('/interaction/validate', methods=['POST'])
def validate_action():
    """Valide la faisabilité d'une action parsée"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Aucune donnée fournie'}), 400
        
        parsed_action = data.get('parsed_action')
        session_id = data.get('session_id')
        
        if not parsed_action:
            return jsonify({'error': 'Action parsée requise'}), 400
        
        if not session_id:
            return jsonify({'error': 'Session ID requis'}), 400
        
        result = _validate_action_internal(parsed_action, session_id)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def _parse_action_internal(raw_action: str, session_id: str) -> dict:
    """Fonction interne pour parser une action"""
    # Récupérer le contexte depuis le moteur d'état
    context = state_engine.get_context_for_systems(session_id, ['world_state', 'stats', 'inventory'])
    
    # Parser l'action
    parsed_action = _parse_action_text(raw_action, context)
    
    # Ajouter l'entrée narrative
    narrative_entry = {
        'type': 'user_action',
        'content': raw_action,
        'parsed': parsed_action
    }
    state_engine.add_narrative_entry(session_id, narrative_entry)
    
    return {
        'success': True,
        'parsed_action': parsed_action
    }

def _validate_action_internal(parsed_action: dict, session_id: str) -> dict:
    """Fonction interne pour valider une action"""
    # Récupérer le contexte complet
    context = state_engine.get_full_context(session_id)
    
    # Valider l'action
    validation_result = _validate_action_feasibility(parsed_action, context)
    
    return {
        'success': True,
        'validation_result': validation_result
    }

def _apply_action_consequences(session_id: str, parsed_action: dict, validation_result: dict) -> dict:
    """Applique les conséquences de l'action au moteur d'état"""
    consequences = validation_result.get('validation_result', {}).get('consequences', [])
    state_changes = []
    
    # Appliquer les conséquences selon le type d'action
    action_type = parsed_action.get('action_type', 'exploration')
    
    if action_type == 'combat':
        # Logique de combat
        state_changes.extend(_apply_combat_consequences(session_id, parsed_action, consequences))
    elif action_type == 'exploration':
        # Logique d'exploration
        state_changes.extend(_apply_exploration_consequences(session_id, parsed_action, consequences))
    elif action_type == 'dialogue':
        # Logique de dialogue
        state_changes.extend(_apply_dialogue_consequences(session_id, parsed_action, consequences))
    elif action_type == 'inventory':
        # Logique d'inventaire
        state_changes.extend(_apply_inventory_consequences(session_id, parsed_action, consequences))
    elif action_type == 'magic':
        # Logique de magie
        state_changes.extend(_apply_magic_consequences(session_id, parsed_action, consequences))
    elif action_type == 'social':
        # Logique sociale
        state_changes.extend(_apply_social_consequences(session_id, parsed_action, consequences))
    
    return {
        'applied_consequences': consequences,
        'state_changes': state_changes
    }

def _apply_combat_consequences(session_id: str, parsed_action: dict, consequences: list) -> list:
    """Applique les conséquences de combat"""
    changes = []
    
    # Réduction de santé/mana selon l'intensité du combat
    complexity = parsed_action.get('complexity', 'simple')
    if complexity == 'complex':
        health_loss = 10
        mana_loss = 5
    else:
        health_loss = 5
        mana_loss = 2
    
    # Appliquer les changements
    state_engine.update_player_stats(session_id, {
        'health': -health_loss,
        'mana': -mana_loss
    })
    
    changes.append(f"Santé réduite de {health_loss}")
    changes.append(f"Mana réduite de {mana_loss}")
    
    return changes

def _apply_exploration_consequences(session_id: str, parsed_action: dict, consequences: list) -> list:
    """Applique les conséquences d'exploration"""
    changes = []
    
    # Possibilité de découvrir des objets
    if 'découverte' in consequences:
        # Ajouter un objet aléatoire à l'inventaire
        discovered_item = {
            'id': f"item_{len(consequences)}",
            'name': 'Objet mystérieux',
            'type': 'misc',
            'description': 'Un objet trouvé lors de votre exploration'
        }
        
        state_engine.add_inventory_item(session_id, discovered_item)
        changes.append(f"Objet découvert: {discovered_item['name']}")
    
    return changes

def _apply_dialogue_consequences(session_id: str, parsed_action: dict, consequences: list) -> list:
    """Applique les conséquences de dialogue"""
    changes = []
    
    # Changements de réputation
    entities = parsed_action.get('entities', {})
    npcs = entities.get('npcs', [])
    
    for npc_name in npcs:
        # Améliorer légèrement la relation
        state_engine.update_npc_relationship(session_id, npc_name, 0.1)
        changes.append(f"Relation améliorée avec {npc_name}")
    
    return changes

def _apply_inventory_consequences(session_id: str, parsed_action: dict, consequences: list) -> list:
    """Applique les conséquences d'inventaire"""
    changes = []
    
    # Logique d'utilisation d'objets
    entities = parsed_action.get('entities', {})
    objects = entities.get('objects', [])
    
    for obj_name in objects:
        # Simuler l'utilisation d'un objet
        changes.append(f"Objet utilisé: {obj_name}")
    
    return changes

def _apply_magic_consequences(session_id: str, parsed_action: dict, consequences: list) -> list:
    """Applique les conséquences de magie"""
    changes = []
    
    # Coût en mana
    complexity = parsed_action.get('complexity', 'simple')
    mana_cost = 15 if complexity == 'complex' else 8
    
    state_engine.update_player_stats(session_id, {'mana': -mana_cost})
    changes.append(f"Mana consommée: {mana_cost}")
    
    return changes

def _apply_social_consequences(session_id: str, parsed_action: dict, consequences: list) -> list:
    """Applique les conséquences sociales"""
    changes = []
    
    # Changements de réputation générale
    if 'persuasion' in str(consequences):
        state_engine.update_player_reputation(session_id, 'general', 0.05)
        changes.append("Réputation générale légèrement améliorée")
    
    return changes

# Fonctions utilitaires (reprises du code précédent)
def _parse_action_text(action_text: str, context: dict) -> dict:
    """Parse l'action du joueur et détermine le type, la complexité et les systèmes impactés"""
    action_lower = action_text.lower()
    
    # Types d'actions supportées
    ACTION_TYPES = {
        'combat': ['attaque', 'combat', 'frappe', 'tue', 'bataille', 'fight', 'attack', 'kill'],
        'exploration': ['examine', 'regarde', 'cherche', 'fouille', 'explore', 'va', 'marche', 'entre', 'sort', 'ouvre', 'ferme'],
        'dialogue': ['parle', 'dit', 'demande', 'répond', 'salue', 'discute', 'conversation', 'talk', 'speak', 'ask'],
        'inventory': ['prend', 'ramasse', 'utilise', 'équipe', 'range', 'donne', 'jette', 'inventaire', 'take', 'use', 'equip'],
        'magic': ['lance', 'incante', 'sort', 'magie', 'enchante', 'cast', 'spell', 'magic'],
        'social': ['persuade', 'intimide', 'négocie', 'marchande', 'séduit', 'persuade', 'intimidate', 'negotiate']
    }
    
    # Déterminer le type d'action
    action_type = _determine_action_type(action_lower, ACTION_TYPES)
    
    # Déterminer la complexité
    complexity = _determine_complexity(action_lower, action_type, context)
    
    # Extraire les entités mentionnées
    entities = _extract_entities(action_lower, context)
    
    # Déterminer les paramètres spécifiques à l'action
    action_parameters = _extract_action_parameters(action_lower, action_type)
    
    return {
        "action_type": action_type,
        "complexity": complexity,
        "parsed_action": action_text,
        "raw_action": action_text,
        "entities": entities,
        "parameters": action_parameters,
        "confidence": _calculate_confidence(action_type, entities, action_parameters)
    }

def _determine_action_type(action_lower: str, action_types: dict) -> str:
    """Détermine le type d'action basé sur les mots-clés"""
    type_scores = {}
    
    for action_type, keywords in action_types.items():
        score = 0
        for keyword in keywords:
            if keyword in action_lower:
                if action_lower.startswith(keyword):
                    score += 2
                else:
                    score += 1
        type_scores[action_type] = score
    
    if max(type_scores.values()) > 0:
        return max(type_scores, key=type_scores.get)
    
    return 'exploration'

def _determine_complexity(action_lower: str, action_type: str, context: dict) -> str:
    """Détermine la complexité de l'action"""
    complexity_indicators = {
        'simple': [
            len(action_lower.split()) <= 3,
            action_type in ['exploration', 'inventory'],
            'regarde' in action_lower or 'examine' in action_lower
        ],
        'complex': [
            len(action_lower.split()) > 8,
            action_type in ['combat', 'magic'],
            'simultanément' in action_lower or 'en même temps' in action_lower
        ]
    }
    
    simple_score = sum(complexity_indicators['simple'])
    complex_score = sum(complexity_indicators['complex'])
    
    if complex_score > simple_score:
        return 'complex'
    elif simple_score > 0:
        return 'simple'
    else:
        return 'moderate'

def _extract_entities(action_lower: str, context: dict) -> dict:
    """Extrait les entités mentionnées dans l'action"""
    entities = {
        'npcs': [],
        'objects': [],
        'locations': [],
        'spells': []
    }
    
    # Extraire les NPCs du contexte
    world_state = context.get('world_state', {})
    npcs = world_state.get('npcs', [])
    
    for npc_data in npcs:
        npc_name = npc_data.get('name', '').lower() if isinstance(npc_data, dict) else npc_data.name.lower()
        if npc_name in action_lower:
            entities['npcs'].append(npc_name)
    
    # Extraire les objets communs
    common_objects = ['épée', 'bouclier', 'potion', 'clé', 'livre', 'coffre', 'porte', 'fenêtre']
    for obj in common_objects:
        if obj in action_lower:
            entities['objects'].append(obj)
    
    # Extraire les sorts communs
    common_spells = ['boule de feu', 'soin', 'téléportation', 'invisibilité', 'protection']
    for spell in common_spells:
        if spell in action_lower:
            entities['spells'].append(spell)
    
    return entities

def _extract_action_parameters(action_lower: str, action_type: str) -> dict:
    """Extrait les paramètres spécifiques à l'action"""
    parameters = {}
    
    if action_type == 'combat':
        if 'attaque' in action_lower:
            parameters['attack_type'] = 'melee'
        elif 'tire' in action_lower or 'arc' in action_lower:
            parameters['attack_type'] = 'ranged'
        
        if 'défense' in action_lower or 'bloque' in action_lower:
            parameters['defensive'] = True
    
    elif action_type == 'exploration':
        if 'discrètement' in action_lower or 'silencieusement' in action_lower:
            parameters['stealth'] = True
        
        if 'rapidement' in action_lower or 'vite' in action_lower:
            parameters['speed'] = 'fast'
    
    elif action_type == 'dia
(Content truncated due to size limit. Use line ranges to read in chunks)