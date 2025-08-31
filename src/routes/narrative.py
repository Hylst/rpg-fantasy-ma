"""
Routes API pour le Moteur de Narration - Architecture des 4 Moteurs
"""

from flask import Blueprint, request, jsonify
from src.engines.narrative_engine import narrative_engine

narrative_bp = Blueprint('narrative', __name__)

@narrative_bp.route('/narrative/generate', methods=['POST'])
def generate_narrative():
    """Génère une réponse narrative basée sur l'action et l'état du jeu"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Aucune donnée fournie'}), 400
        
        session_id = data.get('session_id')
        parsed_action = data.get('parsed_action')
        validation_result = data.get('validation_result')
        
        if not session_id:
            return jsonify({'error': 'Session ID requis'}), 400
        
        if not parsed_action:
            return jsonify({'error': 'Action parsée requise'}), 400
        
        if not validation_result:
            return jsonify({'error': 'Résultat de validation requis'}), 400
        
        # Générer la réponse narrative
        result = narrative_engine.generate_narrative_response(
            session_id, parsed_action, validation_result
        )
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erreur lors de la génération narrative: {str(e)}'
        }), 500

@narrative_bp.route('/narrative/styles', methods=['GET'])
def get_narrative_styles():
    """Récupère les styles narratifs disponibles"""
    try:
        styles = narrative_engine.style_profiles
        return jsonify({
            'success': True,
            'styles': styles
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@narrative_bp.route('/narrative/arcs', methods=['GET'])
def get_narrative_arcs():
    """Récupère les patterns d'arcs narratifs disponibles"""
    try:
        arcs = narrative_engine.arc_patterns
        return jsonify({
            'success': True,
            'arcs': arcs
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

