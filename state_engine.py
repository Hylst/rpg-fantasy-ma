Moteur d'État Global - Architecture des 4 Moteurs
Source de vérité unique pour l'état du jeu, gestion de la cohérence et compression contextuelle
"""

import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import asdict
import copy

from src.models.game_state import (
    GameSession, Player, WorldState, Quest, NPC, Location, 
    InventoryItem, StatusEffect, WorldEvent, GameStateEncoder,
    create_new_game_session
)

class StateEngine:
    """
    Moteur d'État Global - Responsabilités:
    1. Source de vérité unique pour l'état du monde et du joueur
    2. Gestion de la cohérence des données
    3. Compression contextuelle périodique
    4. Extraction ciblée des données pour les autres moteurs
    5. Rollback et versioning
    """
    
    def __init__(self):
        self.sessions: Dict[str, GameSession] = {}
        self.state_history: Dict[str, List[Dict[str, Any]]] = {}
        self.compression_counters: Dict[str, int] = {}
        self.max_history_size = 10  # Nombre de versions d'état à conserver
        self.compression_threshold = 15  # Compression après X actions
        
    def create_session(self, player_name: str = "Aventurier", 
                      universe: str = "fantasy", 
                      narrative_style: str = "epic") -> str:
        """Crée une nouvelle session de jeu"""
        session = create_new_game_session(player_name)
        session.universe = universe
        session.narrative_style = narrative_style
        
        session_id = session.id
        self.sessions[session_id] = session
        self.state_history[session_id] = []
        self.compression_counters[session_id] = 0
        
        # Sauvegarder l'état initial
        self._save_state_snapshot(session_id)