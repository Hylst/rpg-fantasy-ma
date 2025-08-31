"""Moteur d'État Global - Architecture des 4 Moteurs
Source de vérité unique pour l'état du jeu, gestion de la cohérence et compression contextuelle
"""

import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import asdict
import copy

from src.models.game_state import (
    GameState, Player, WorldState, Quest, NPC, Location, 
    InventoryItem, NarrativeEntry, PlayerStats
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
        self.sessions: Dict[str, GameState] = {}
        self.state_history: Dict[str, List[Dict[str, Any]]] = {}
        self.compression_counters: Dict[str, int] = {}
        self.max_history_size = 10  # Nombre de versions d'état à conserver
        self.compression_threshold = 15  # Compression après X actions
        
    def create_session(self, player_name: str = "Aventurier", 
                      universe: str = "fantasy", 
                      narrative_style: str = "epic") -> str:
        """Crée une nouvelle session de jeu"""
        session_id = str(uuid.uuid4())
        
        # Créer les statistiques du joueur
        player_stats = PlayerStats()
        
        # Créer le joueur
        player = Player(
            name=player_name,
            character_class="Aventurier",
            stats=player_stats
        )
        
        # Créer une location de départ
        starting_location = Location(
            id="village_start",
            name="Village de départ",
            description="Un petit village paisible où commence votre aventure.",
            type="town"
        )
        
        # Créer l'état du monde
        world_state = WorldState(
            current_location="village_start",
            locations={"village_start": starting_location}
        )
        
        # Créer l'état de jeu complet
        game_state = GameState(
            session_id=session_id,
            player=player,
            world_state=world_state,
            game_settings={
                "universe": universe,
                "narrative_style": narrative_style
            }
        )
        
        self.sessions[session_id] = game_state
        self.state_history[session_id] = []
        self.compression_counters[session_id] = 0
        
        # Sauvegarder l'état initial
        self._save_state_snapshot(session_id)
        
        return session_id
    
    def get_session(self, session_id: str) -> Optional[GameState]:
        """Récupère une session de jeu"""
        return self.sessions.get(session_id)
    
    def update_session(self, session_id: str, updates: Dict[str, Any]) -> bool:
        """Met à jour une session de jeu"""
        if session_id not in self.sessions:
            return False
        
        game_state = self.sessions[session_id]
        game_state.last_updated = datetime.now()
        
        # Appliquer les mises à jour
        for key, value in updates.items():
            if hasattr(game_state, key):
                setattr(game_state, key, value)
        
        self._save_state_snapshot(session_id)
        return True
    
    def update_player_stats(self, session_id: str, stat_changes: Dict[str, int]) -> bool:
        """Met à jour les statistiques du joueur"""
        if session_id not in self.sessions:
            return False
        
        player_stats = self.sessions[session_id].player.stats
        
        for stat, change in stat_changes.items():
            if hasattr(player_stats, stat):
                current_value = getattr(player_stats, stat)
                new_value = max(0, current_value + change)  # Éviter les valeurs négatives
                setattr(player_stats, stat, new_value)
        
        self._save_state_snapshot(session_id)
        return True
    
    def add_inventory_item(self, session_id: str, item: InventoryItem) -> bool:
        """Ajoute un objet à l'inventaire du joueur"""
        if session_id not in self.sessions:
            return False
        
        self.sessions[session_id].player.inventory.append(item)
        self._save_state_snapshot(session_id)
        return True
    
    def update_npc_relationship(self, session_id: str, npc_name: str, change: float) -> bool:
        """Met à jour la relation avec un NPC"""
        if session_id not in self.sessions:
            return False
        
        # Pour l'instant, on stocke dans les paramètres du jeu
        game_state = self.sessions[session_id]
        if 'npc_relationships' not in game_state.game_settings:
            game_state.game_settings['npc_relationships'] = {}
        
        current_rel = game_state.game_settings['npc_relationships'].get(npc_name, 0.0)
        game_state.game_settings['npc_relationships'][npc_name] = max(-1.0, min(1.0, current_rel + change))
        
        self._save_state_snapshot(session_id)
        return True
    
    def update_player_reputation(self, session_id: str, faction: str, change: float) -> bool:
        """Met à jour la réputation du joueur"""
        if session_id not in self.sessions:
            return False
        
        game_state = self.sessions[session_id]
        if 'reputation' not in game_state.game_settings:
            game_state.game_settings['reputation'] = {}
        
        current_rep = game_state.game_settings['reputation'].get(faction, 0.0)
        game_state.game_settings['reputation'][faction] = max(-1.0, min(1.0, current_rep + change))
        
        self._save_state_snapshot(session_id)
        return True
    
    def _save_state_snapshot(self, session_id: str):
        """Sauvegarde un instantané de l'état"""
        if session_id not in self.sessions:
            return
        
        game_state = self.sessions[session_id]
        snapshot = game_state.to_dict()
        
        if session_id not in self.state_history:
            self.state_history[session_id] = []
        
        self.state_history[session_id].append(snapshot)
        
        # Limiter la taille de l'historique
        if len(self.state_history[session_id]) > self.max_history_size:
            self.state_history[session_id].pop(0)

# Instance globale
state_engine = StateEngine()