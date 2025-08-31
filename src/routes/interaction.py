from flask import Blueprint, request, jsonify
from src.engines.interaction_engine import InteractionEngine
from src.engines.simulation_engine import SimulationEngine
from src.engines.state_engine import StateEngine
from src.engines.narrative_engine import NarrativeEngine
from src.models.game_state import GameState
from src.utils.session_manager import session_manager

# Créer le blueprint pour les routes d'interaction
interaction_bp = Blueprint('interaction', __name__)

# Initialiser les moteurs
interaction_engine = InteractionEngine()
simulation_engine = SimulationEngine()
state_engine = StateEngine()
narrative_engine = NarrativeEngine()

@interaction_bp.route('/process_complete_action', methods=['POST'])
def process_complete_action():
    """Endpoint principal pour traiter une action complète du joueur"""
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        action_text = data.get('action')
        
        if not session_id or not action_text:
            return jsonify({'error': 'session_id et action sont requis'}), 400
        
        # Récupérer le contexte de jeu
        game_state = session_manager.get_session(session_id)
        if not game_state:
            return jsonify({'error': 'Session non trouvée'}), 404
        
        context = {
            'player_stats': game_state.player_stats,
            'world_state': game_state.world_state,
            'inventory': game_state.inventory,
            'location': game_state.current_location
        }
        
        # 1. Moteur d'Interaction - Parser l'action
        parsed_action = interaction_engine.parse_action(action_text, context)
        
        # 2. Moteur de Simulation - Calculer les conséquences
        simulation_result = simulation_engine.process_action(
            session_id, parsed_action, context
        )
        
        # 3. Moteur d'État - Appliquer les changements
        state_changes = state_engine.apply_consequences(
            session_id, simulation_result['consequences']
        )
        
        # 4. Moteur Narratif - Générer la réponse
        narrative_response = narrative_engine.generate_response(
            parsed_action, simulation_result, state_changes, context
        )
        
        # Mettre à jour la session
        session_manager.update_session(session_id, {
            'last_action': action_text,
            'last_response': narrative_response
        })
        
        return jsonify({
            'success': True,
            'parsed_action': parsed_action,
            'simulation_result': simulation_result,
            'state_changes': state_changes,
            'narrative_response': narrative_response
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@interaction_bp.route('/parse_action', methods=['POST'])
def parse_action():
    """Parse une action du joueur"""
    try:
        data = request.get_json()
        action_text = data.get('action')
        session_id = data.get('session_id')
        
        if not action_text:
            return jsonify({'error': 'Action text is required'}), 400
        
        # Récupérer le contexte si session_id fourni
        context = {}
        if session_id:
            game_state = session_manager.get_session(session_id)
            if game_state:
                context = {
                    'player_stats': game_state.player_stats,
                    'world_state': game_state.world_state,
                    'inventory': game_state.inventory,
                    'location': game_state.current_location
                }
        
        parsed_action = interaction_engine.parse_action(action_text, context)
        
        return jsonify({
            'success': True,
            'parsed_action': parsed_action
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@interaction_bp.route('/validate_action', methods=['POST'])
def validate_action():
    """Valide si une action est faisable"""
    try:
        data = request.get_json()
        parsed_action = data.get('parsed_action')
        session_id = data.get('session_id')
        
        if not parsed_action or not session_id:
            return jsonify({'error': 'parsed_action et session_id sont requis'}), 400
        
        game_state = session_manager.get_session(session_id)
        if not game_state:
            return jsonify({'error': 'Session non trouvée'}), 404
        
        context = {
            'player_stats': game_state.player_stats,
            'world_state': game_state.world_state,
            'inventory': game_state.inventory,
            'location': game_state.current_location
        }
        
        validation_result = interaction_engine.validate_action(parsed_action, context)
        
        return jsonify({
            'success': True,
            'validation_result': validation_result
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Fonctions internes pour appliquer les conséquences
def _apply_action_consequences(session_id: str, parsed_action: dict, consequences: list) -> list:
    """Applique les conséquences d'une action selon son type"""
    action_type = parsed_action.get('action_type', 'exploration')
    state_changes = []
    
    if action_type == 'combat':
        state_changes.extend(_apply_combat_consequences(session_id, parsed_action, consequences))
    elif action_type == 'exploration':
        state_changes.extend(_apply_exploration_consequences(session_id, parsed_action, consequences))
    elif action_type == 'dialogue':
        state_changes.extend(_apply_dialogue_consequences(session_id, parsed_action, consequences))
    elif action_type == 'inventory':
        state_changes.extend(_apply_inventory_consequences(session_id, parsed_action, consequences))
    elif action_type == 'magic':
        state_changes.extend(_apply_magic_consequences(session_id, parsed_action, consequences))
    elif action_type == 'social':
        state_changes.extend(_apply_social_consequences(session_id, parsed_action, consequences))
    
    return state_changes

def _apply_combat_consequences(session_id: str, parsed_action: dict, consequences: list) -> list:
    """Applique les conséquences de combat"""
    changes = []
    
    # Dégâts au joueur
    damage_taken = 0
    for consequence in consequences:
        if 'damage' in str(consequence).lower():
            damage_taken += 10
    
    if damage_taken > 0:
        state_engine.update_player_stats(session_id, {'health': -damage_taken})
        changes.append(f"Dégâts subis: {damage_taken}")
    
    # Expérience gagnée
    exp_gained = 25
    state_engine.update_player_stats(session_id, {'experience': exp_gained})
    changes.append(f"Expérience gagnée: {exp_gained}")
    
    return changes

def _apply_exploration_consequences(session_id: str, parsed_action: dict, consequences: list) -> list:
    """Applique les conséquences d'exploration"""
    changes = []
    
    # Découverte d'objets
    if any('découverte' in str(c).lower() for c in consequences):
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

# Fonctions utilitaires
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
    
    elif action_type == 'dialogue':
        if 'poliment' in action_lower or 'respectueusement' in action_lower:
            parameters['tone'] = 'polite'
        elif 'agressif' in action_lower or 'colère' in action_lower:
            parameters['tone'] = 'aggressive'
        elif 'amical' in action_lower or 'gentil' in action_lower:
            parameters['tone'] = 'friendly'
        elif 'persuasif' in action_lower:
            parameters['tone'] = 'persuasive'
        else:
            parameters['tone'] = 'neutral'
    
    elif action_type == 'magic':
        if 'puissant' in action_lower or 'fort' in action_lower:
            parameters['power_level'] = 'high'
        elif 'faible' in action_lower or 'léger' in action_lower:
            parameters['power_level'] = 'low'
        else:
            parameters['power_level'] = 'medium'
    
    return parameters

def _calculate_confidence(action_type: str, entities: dict, parameters: dict) -> float:
    """Calcule la confiance dans l'analyse de l'action"""
    confidence = 0.5  # Base confidence
    
    # Bonus pour type d'action identifié
    if action_type != 'exploration':  # exploration est le type par défaut
        confidence += 0.2
    
    # Bonus pour entités identifiées
    total_entities = sum(len(entity_list) for entity_list in entities.values())
    confidence += min(total_entities * 0.1, 0.2)
    
    # Bonus pour paramètres identifiés
    confidence += min(len(parameters) * 0.05, 0.1)
    
    return min(confidence, 1.0)