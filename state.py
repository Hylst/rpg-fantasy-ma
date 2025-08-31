"""
Routes API pour le Moteur d'État Global
Intégré avec le gestionnaire de persistance
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
import uuid

from src.engines.state_engine import state_engine
from src.models.game_state import InventoryItem, Quest, NPC, Location, WorldEvent
from src.persistence.session_manager import session_manager

state_bp = Blueprint('state', __name__)

@state_bp.route('/sessions', methods=['POST'])
def create_session():
    """Crée une nouvelle session de jeu"""
    try:
        data = request.get_json() or {}
        player_name = data.get('player_name', 'Aventurier')
        universe = data.get('universe', 'fantasy')
        narrative_style = data.get('narrative_style', 'epic')
        
        session_id = state_engine.create_session(player_name, universe, narrative_style)
        
        # Sauvegarder automatiquement la nouvelle session
        session = state_engine.get_session(session_id)
        if session:
            session_manager.save_session(session, "auto")
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'message': 'Session créée avec succès'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@state_bp.route('/sessions/<session_id>', methods=['GET'])
def get_session(session_id):
    """Récupère les informations d'une session"""
    try:
        session = state_engine.get_session(session_id)
        if not session:
            return jsonify({
                'success': False,
                'error': 'Session non trouvée'
            }), 404
        
        # Retourner un résumé de la session
        summary = state_engine.get_session_summary(session_id)
        
        return jsonify({
            'success': True,
            'session': summary
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@state_bp.route('/sessions/<session_id>/full-state', methods=['GET'])
def get_full_state(session_id):
    """Récupère l'état complet d'une session"""
    try:
        full_state = state_engine.get_full_state(session_id)
        if not full_state:
            return jsonify({
                'success': False,
                'error': 'Session non trouvée'
            }), 404
        
        return jsonify({
            'success': True,
            'state': full_state
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@state_bp.route('/sessions/<session_id>/context', methods=['POST'])
def get_context_for_systems(session_id):
    """Récupère le contexte nécessaire pour des systèmes spécifiques"""
    try:
        data = request.get_json() or {}
        required_systems = data.get('systems', [])
        
        context = state_engine.get_context_for_systems(session_id, required_systems)
        
        return jsonify({
            'success': True,
            'context': context
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@state_bp.route('/sessions/<session_id>/player/stats', methods=['PUT'])
def update_player_stats(session_id):
    """Met à jour les statistiques du joueur"""
    try:
        data = request.get_json() or {}
        stat_changes = data.get('stat_changes', {})
        
        success = state_engine.update_player_stats(session_id, stat_changes)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Statistiques mises à jour'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Impossible de mettre à jour les statistiques'
            }), 400
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@state_bp.route('/sessions/<session_id>/player/inventory', methods=['POST'])
def add_inventory_item(session_id):
    """Ajoute un objet à l'inventaire"""
    try:
        data = request.get_json() or {}
        
        # Créer l'objet InventoryItem
        item = InventoryItem(
            id=data.get('id', str(uuid.uuid4())),
            name=data.get('name', ''),
            type=data.get('type', 'misc'),
            description=data.get('description', ''),
            quantity=data.get('quantity', 1),
            condition=data.get('condition', 'good'),
            properties=data.get('properties', {}),
            equipped=data.get('equipped', False)
        )
        
        success = state_engine.add_inventory_item(session_id, item)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Objet ajouté à l\'inventaire'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Impossible d\'ajouter l\'objet'
            }), 400
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@state_bp.route('/sessions/<session_id>/player/inventory/<item_id>', methods=['DELETE'])
def remove_inventory_item(session_id, item_id):
    """Retire un objet de l'inventaire"""
    try:
        data = request.get_json() or {}
        quantity = data.get('quantity', 1)
        
        success = state_engine.remove_inventory_item(session_id, item_id, quantity)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Objet retiré de l\'inventaire'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Objet non trouvé'
            }), 404
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@state_bp.route('/sessions/<session_id>/world/location', methods=['PUT'])
def update_location(session_id):
    """Met à jour la localisation du joueur"""
    try:
        data = request.get_json() or {}
        new_location_id = data.get('location_id')
        
        if not new_location_id:
            return jsonify({
                'success': False,
                'error': 'ID de localisation requis'
            }), 400
        
        success = state_engine.update_location(session_id, new_location_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Localisation mise à jour'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Localisation invalide'
            }), 400
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@state_bp.route('/sessions/<session_id>/world/npcs', methods=['POST'])
def add_npc(session_id):
    """Ajoute un NPC au monde"""
    try:
        data = request.get_json() or {}
        
        npc = NPC(
            id=data.get('id', str(uuid.uuid4())),
            name=data.get('name', ''),
            description=data.get('description', ''),
            location=data.get('location', ''),
            disposition=data.get('disposition', 'neutral'),
            relationship=data.get('relationship', 0),
            dialogue_history=data.get('dialogue_history', []),
            properties=data.get('properties', {}),
            is_alive=data.get('is_alive', True)
        )
        
        success = state_engine.add_npc(session_id, npc)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'NPC ajouté au monde'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Impossible d\'ajouter le NPC'
            }), 400
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@state_bp.route('/sessions/<session_id>/world/npcs/<npc_id>/relationship', methods=['PUT'])
def update_npc_relationship(session_id, npc_id):
    """Met à jour la relation avec un NPC"""
    try:
        data = request.get_json() or {}
        relationship_change = data.get('change', 0)
        
        success = state_engine.update_npc_relationship(session_id, npc_id, relationship_change)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Relation mise à jour'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'NPC non trouvé'
            }), 404
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@state_bp.route('/sessions/<session_id>/quests', methods=['POST'])
def add_quest(session_id):
    """Ajoute une quête"""
    try:
        data = request.get_json() or {}
        
        quest = Quest(
            id=data.get('id', str(uuid.uuid4())),
            title=data.get('title', ''),
            description=data.get('description', ''),
            type=data.get('type', 'side'),
            status=data.get('status', 'not_started'),
            objectives=data.get('objectives', []),
            rewards=data.get('rewards', {}),
            giver_npc=data.get('giver_npc'),
            location=data.get('location'),
            progress=data.get('progress', {})
        )
        
        success = state_engine.add_quest(session_id, quest)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Quête ajoutée'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Impossible d\'ajouter la quête'
            }), 400
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@state_bp.route('/sessions/<session_id>/quests/<quest_id>/status', methods=['PUT'])
def update_quest_status(session_id, quest_id):
    """Met à jour le statut d'une quête"""
    try:
        data = request.get_json() or {}
        new_status = data.get('status')
        
        if not new_status:
            return jsonify({
                'success': False,
                'error': 'Statut requis'
            }), 400
        
        success = state_engine.update_quest_status(session_id, quest_id, new_status)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Statut de quête mis à jour'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Quête non trouvée'
            }), 404
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@state_bp.route('/sessions/<session_id>/state/apply', methods=['POST'])
def apply_state_changes(session_id):
    """Applique des changements d'état multiples"""
    try:
        data = request.get_json() or {}
        changes = data.get('changes', {})
        
        success = state_engine.apply_state_changes(session_id, changes)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Changements appliqués'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Impossible d\'appliquer les changements'
            }), 400
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@state_bp.route('/sessions/<session_id>/narrative', methods=['POST'])
def add_narrative_entry(session_id):
    """Ajoute une entrée à l'historique narratif"""
    try:
        data = request.get_json() or {}
        entry = data.get('entry', {})
        
        success = state_engine.add_narrative_entry(session_id, entry)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Entrée narrative ajoutée'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Impossible d\'ajouter l\'entrée'
            }), 400
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@state_bp.route('/sessions/<session_id>/compress', methods=['POST'])
def compress_context(session_id):
    """Déclenche la compression contextuelle"""
    try:
        success = state_engine.compress_context(session_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Compression effectuée'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Impossible de compresser le contexte'
            }), 400
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@state_bp.route('/sessions/<session_id>/rollback', methods=['POST'])
def rollback_state(session_id):
    """Effectue un rollback de l'état"""
    try:
        data = request.get_json() or {}
        steps = data.get('steps', 1)
        
        success = state_engine.rollback_state(session_id, steps)
        
        if success:
            return jsonify({
                'success': True,
                'message': f'Rollback de {steps} étape(s) effectué'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Impossible d\'effectuer le rollback'
            }), 400
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500



# Routes de persistance

@state_bp.route('/sessions/list', methods=['GET'])
def list_sessions():
    """Liste toutes les sessions disponibles"""
    try:
        sessions = session_manager.list_sessions()
        
        return jsonify({
            'success': True,
            'sessions': sessions
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@state_bp.route('/sessions/<session_id>/saves', methods=['GET'])
def list_saves(session_id):
    """Liste toutes les sauvegardes d'une session"""
    try:
        saves = session_manager.list_saves(session_id)
        
        return jsonify({
            'success': True,
            'saves': saves
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@state_bp.route('/sessions/<session_id>/save', methods=['POST'])
def save_session(session_id):
    """Sauvegarde manuelle d'une session"""
    try:
        data = request.get_json() or {}
        save_type = data.get('save_type', 'manual')
        
        session = state_engine.get_session(session_id)
        if not session:
            return jsonify({
                'success': False,
                'error': 'Session non trouvée'
            }), 404
        
        success = session_manager.save_session(session, save_type)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Session sauvegardée'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Échec de la sauvegarde'
            }), 500
        
    excep
(Content truncated due to size limit. Use line ranges to read in chunks)