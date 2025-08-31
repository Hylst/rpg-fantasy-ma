from flask import Blueprint, request, jsonify
from src.engines.simulation_engine import SimulationEngine
from src.models.game_state import GameState

simulation_bp = Blueprint("simulation", __name__)
simulation_engine = SimulationEngine()

@simulation_bp.route("/simulation/tick", methods=["POST"])
def simulation_tick_route():
    data = request.get_json()
    game_state_data = data.get("game_state")
    
    if not game_state_data:
        return jsonify({"error": "Missing game_state data"}), 400

    # Reconstruction de l\"état du jeu à partir des données JSON
    game_state = GameState.from_dict(game_state_data)
    
    # Exécution du tick de simulation
    simulation_engine.process_simulation_tick(game_state)
    
    return jsonify({"success": True, "message": "Tick de simulation exécuté."})

@simulation_bp.route("/simulation/update_behaviors", methods=["POST"])
def update_behaviors_route():
    data = request.get_json()
    game_state_data = data.get("game_state")
    
    if not game_state_data:
        return jsonify({"error": "Missing game_state data"}), 400

    # Reconstruction de l\"état du jeu à partir des données JSON
    game_state = GameState.from_dict(game_state_data)
    
    # Mise à jour des comportements des PNJ
    simulation_engine.update_npc_behaviors(game_state)
    
    return jsonify({"success": True, "message": "Comportements des PNJ mis à jour."})

@simulation_bp.route("/simulation/update_relationships", methods=["POST"])
def update_relationships_route():
    data = request.get_json()
    game_state_data = data.get("game_state")
    
    if not game_state_data:
        return jsonify({"error": "Missing game_state data"}), 400

    # Reconstruction de l\"état du jeu à partir des données JSON
    game_state = GameState.from_dict(game_state_data)
    
    # Mise à jour des relations entre les PNJ
    simulation_engine.update_npc_relationships(game_state)
    
    return jsonify({"success": True, "message": "Relations entre PNJ mises à jour."})

@simulation_bp.route("/simulation/process_daily_routines", methods=["POST"])
def process_daily_routines_route():
    data = request.get_json()
    game_state_data = data.get("game_state")
    
    if not game_state_data:
        return jsonify({"error": "Missing game_state data"}), 400

    # Reconstruction de l\"état du jeu à partir des données JSON
    game_state = GameState.from_dict(game_state_data)
    
    # Exécution des routines quotidiennes des PNJ
    simulation_engine.process_daily_routines(game_state)
    
    return jsonify({"success": True, "message": "Routines quotidiennes des PNJ exécutées."})


