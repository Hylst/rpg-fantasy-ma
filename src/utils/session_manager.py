"""
Gestionnaire de Persistance des Sessions - Architecture des 4 Moteurs
Gère la sauvegarde et le chargement des sessions de jeu
"""

import os
import json
import pickle
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import asdict
import uuid

from src.models.game_state import GameState
import json

class GameStateEncoder(json.JSONEncoder):
    """Custom JSON encoder for GameState objects"""
    def default(self, obj):
        if hasattr(obj, 'to_dict'):
            return obj.to_dict()
        elif hasattr(obj, '__dict__'):
            return obj.__dict__
        return super().default(obj)

class SessionManager:
    """
    Gestionnaire de persistance pour les sessions de jeu
    
    Responsabilités:
    1. Sauvegarde automatique des sessions
    2. Chargement des sessions existantes
    3. Gestion des sauvegardes multiples
    4. Nettoyage des anciennes sessions
    5. Export/Import de sessions
    """
    
    def __init__(self, storage_path: str = "/tmp/rpg_sessions"):
        self.storage_path = storage_path
        self.auto_save_interval = 300  # 5 minutes
        self.max_saves_per_session = 10
        self.session_expiry_days = 30
        
        # Créer le répertoire de stockage s'il n'existe pas
        os.makedirs(storage_path, exist_ok=True)
        
        # Sous-répertoires pour l'organisation
        os.makedirs(os.path.join(storage_path, "active"), exist_ok=True)
        os.makedirs(os.path.join(storage_path, "saves"), exist_ok=True)
        os.makedirs(os.path.join(storage_path, "exports"), exist_ok=True)
    
    def save_session(self, session: GameState, save_type: str = "auto") -> bool:
        """
        Sauvegarde une session de jeu
        
        Args:
            session: La session à sauvegarder
            save_type: Type de sauvegarde ("auto", "manual", "checkpoint")
        """
        try:
            session_id = session.id
            timestamp = datetime.now()
            
            # Préparer les données de sauvegarde
            save_data = {
                "session_id": session_id,
                "save_type": save_type,
                "timestamp": timestamp.isoformat(),
                "version": "1.0",
                "session_data": asdict(session)
            }
            
            # Nom du fichier de sauvegarde
            if save_type == "auto":
                filename = f"{session_id}_auto.json"
                filepath = os.path.join(self.storage_path, "active", filename)
            else:
                timestamp_str = timestamp.strftime("%Y%m%d_%H%M%S")
                filename = f"{session_id}_{save_type}_{timestamp_str}.json"
                filepath = os.path.join(self.storage_path, "saves", filename)
            
            # Sauvegarder en JSON
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(save_data, f, cls=GameStateEncoder, indent=2, ensure_ascii=False)
            
            # Mettre à jour la métadonnée de la session
            session.last_save = timestamp
            
            # Nettoyer les anciennes sauvegardes si nécessaire
            if save_type != "auto":
                self._cleanup_old_saves(session_id)
            
            return True
            
        except Exception as e:
            print(f"Erreur lors de la sauvegarde de la session {session.id}: {e}")
            return False
    
    def load_session(self, session_id: str, save_type: str = "auto") -> Optional[GameState]:
        """
        Charge une session de jeu
        
        Args:
            session_id: ID de la session à charger
            save_type: Type de sauvegarde à charger ("auto", "latest", ou timestamp spécifique)
        """
        try:
            if save_type == "auto":
                filename = f"{session_id}_auto.json"
                filepath = os.path.join(self.storage_path, "active", filename)
            elif save_type == "latest":
                # Trouver la sauvegarde la plus récente
                filepath = self._find_latest_save(session_id)
                if not filepath:
                    return None
            else:
                # Charger une sauvegarde spécifique
                filepath = os.path.join(self.storage_path, "saves", f"{session_id}_{save_type}.json")
            
            if not os.path.exists(filepath):
                return None
            
            # Charger les données
            with open(filepath, 'r', encoding='utf-8') as f:
                save_data = json.load(f)
            
            # Reconstruire la session
            session_data = save_data["session_data"]
            session = self._reconstruct_session(session_data)
            
            return session
            
        except Exception as e:
            print(f"Erreur lors du chargement de la session {session_id}: {e}")
            return None
    
    def list_sessions(self) -> List[Dict[str, Any]]:
        """Liste toutes les sessions disponibles"""
        sessions = []
        
        try:
            # Sessions actives
            active_dir = os.path.join(self.storage_path, "active")
            for filename in os.listdir(active_dir):
                if filename.endswith("_auto.json"):
                    session_id = filename.replace("_auto.json", "")
                    filepath = os.path.join(active_dir, filename)
                    
                    # Lire les métadonnées
                    with open(filepath, 'r', encoding='utf-8') as f:
                        save_data = json.load(f)
                    
                    session_info = {
                        "session_id": session_id,
                        "type": "active",
                        "last_save": save_data["timestamp"],
                        "player_name": save_data["session_data"]["player"]["name"],
                        "action_count": save_data["session_data"]["action_count"],
                        "universe": save_data["session_data"]["universe"],
                        "narrative_style": save_data["session_data"]["narrative_style"]
                    }
                    sessions.append(session_info)
            
            return sessions
            
        except Exception as e:
            print(f"Erreur lors de la liste des sessions: {e}")
            return []
    
    def list_saves(self, session_id: str) -> List[Dict[str, Any]]:
        """Liste toutes les sauvegardes d'une session"""
        saves = []
        
        try:
            saves_dir = os.path.join(self.storage_path, "saves")
            for filename in os.listdir(saves_dir):
                if filename.startswith(f"{session_id}_") and filename.endswith(".json"):
                    filepath = os.path.join(saves_dir, filename)
                    
                    # Extraire les informations du nom de fichier
                    parts = filename.replace(".json", "").split("_")
                    if len(parts) >= 3:
                        save_type = parts[1]
                        timestamp_str = "_".join(parts[2:])
                        
                        # Lire les métadonnées
                        with open(filepath, 'r', encoding='utf-8') as f:
                            save_data = json.load(f)
                        
                        save_info = {
                            "filename": filename,
                            "save_type": save_type,
                            "timestamp": save_data["timestamp"],
                            "action_count": save_data["session_data"]["action_count"]
                        }
                        saves.append(save_info)
            
            # Trier par timestamp décroissant
            saves.sort(key=lambda x: x["timestamp"], reverse=True)
            return saves
            
        except Exception as e:
            print(f"Erreur lors de la liste des sauvegardes pour {session_id}: {e}")
            return []
    
    def delete_session(self, session_id: str) -> bool:
        """Supprime une session et toutes ses sauvegardes"""
        try:
            deleted_count = 0
            
            # Supprimer la session active
            auto_file = os.path.join(self.storage_path, "active", f"{session_id}_auto.json")
            if os.path.exists(auto_file):
                os.remove(auto_file)
                deleted_count += 1
            
            # Supprimer toutes les sauvegardes
            saves_dir = os.path.join(self.storage_path, "saves")
            for filename in os.listdir(saves_dir):
                if filename.startswith(f"{session_id}_"):
                    filepath = os.path.join(saves_dir, filename)
                    os.remove(filepath)
                    deleted_count += 1
            
            return deleted_count > 0
            
        except Exception as e:
            print(f"Erreur lors de la suppression de la session {session_id}: {e}")
            return False
    
    def export_session(self, session_id: str, export_format: str = "json") -> Optional[str]:
        """
        Exporte une session dans un format portable
        
        Args:
            session_id: ID de la session à exporter
            export_format: Format d'export ("json", "zip")
        
        Returns:
            Chemin du fichier exporté ou None en cas d'erreur
        """
        try:
            # Charger la session
            session = self.load_session(session_id, "auto")
            if not session:
                session = self.load_session(session_id, "latest")
            
            if not session:
                return None
            
            # Préparer les données d'export
            export_data = {
                "export_version": "1.0",
                "export_timestamp": datetime.now().isoformat(),
                "session_data": asdict(session),
                "saves": self.list_saves(session_id)
            }
            
            # Nom du fichier d'export
            timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
            export_filename = f"{session_id}_export_{timestamp_str}.{export_format}"
            export_path = os.path.join(self.storage_path, "exports", export_filename)
            
            if export_format == "json":
                with open(export_path, 'w', encoding='utf-8') as f:
                    json.dump(export_data, f, cls=GameStateEncoder, indent=2, ensure_ascii=False)
            
            return export_path
            
        except Exception as e:
            print(f"Erreur lors de l'export de la session {session_id}: {e}")
            return None
    
    def import_session(self, import_path: str) -> Optional[str]:
        """
        Importe une session depuis un fichier d'export
        
        Args:
            import_path: Chemin du fichier à importer
        
        Returns:
            ID de la session importée ou None en cas d'erreur
        """
        try:
            # Charger les données d'import
            with open(import_path, 'r', encoding='utf-8') as f:
                import_data = json.load(f)
            
            # Reconstruire la session
            session_data = import_data["session_data"]
            session = self._reconstruct_session(session_data)
            
            # Générer un nouvel ID pour éviter les conflits
            old_id = session.id
            new_id = str(uuid.uuid4())
            session.id = new_id
            
            # Sauvegarder la session importée
            success = self.save_session(session, "manual")
            
            if success:
                return new_id
            else:
                return None
            
        except Exception as e:
            print(f"Erreur lors de l'import de la session: {e}")
            return None
    
    def cleanup_expired_sessions(self) -> int:
        """Nettoie les sessions expirées"""
        cleaned_count = 0
        expiry_date = datetime.now() - timedelta(days=self.session_expiry_days)
        
        try:
            # Nettoyer les sessions actives expirées
            active_dir = os.path.join(self.storage_path, "active")
            for filename in os.listdir(active_dir):
                filepath = os.path.join(active_dir, filename)
                file_mtime = datetime.fromtimestamp(os.path.getmtime(filepath))
                
                if file_mtime < expiry_date:
                    os.remove(filepath)
                    cleaned_count += 1
            
            # Nettoyer les anciennes sauvegardes
            saves_dir = os.path.join(self.storage_path, "saves")
            for filename in os.listdir(saves_dir):
                filepath = os.path.join(saves_dir, filename)
                file_mtime = datetime.fromtimestamp(os.path.getmtime(filepath))
                
                if file_mtime < expiry_date:
                    os.remove(filepath)
                    cleaned_count += 1
            
            return cleaned_count
            
        except Exception as e:
            print(f"Erreur lors du nettoyage des sessions expirées: {e}")
            return 0
    
    def _find_latest_save(self, session_id: str) -> Optional[str]:
        """Trouve la sauvegarde la plus récente d'une session"""
        latest_file = None
        latest_time = None
        
        saves_dir = os.path.join(self.storage_path, "saves")
        for filename in os.listdir(saves_dir):
            if filename.startswith(f"{session_id}_") and filename.endswith(".json"):
                filepath = os.path.join(saves_dir, filename)
                file_mtime = datetime.fromtimestamp(os.path.getmtime(filepath))
                
                if latest_time is None or file_mtime > latest_time:
                    latest_time = file_mtime
                    latest_file = filepath
        
        return latest_file
    
    def _cleanup_old_saves(self, session_id: str):
        """Nettoie les anciennes sauvegardes d'une session"""
        saves = self.list_saves(session_id)
        
        if len(saves) > self.max_saves_per_session:
            # Garder seulement les plus récentes
            saves_to_delete = saves[self.max_saves_per_session:]
            
            for save_info in saves_to_delete:
                filepath = os.path.join(self.storage_path, "saves", save_info["filename"])
                try:
                    os.remove(filepath)
                except Exception as e:
                    print(f"Erreur lors de la suppression de {filepath}: {e}")
    
    def _reconstruct_session(self, session_data: dict) -> GameState:
        """Reconstruit un objet GameState depuis les données JSON"""
        try:
            # Use the from_dict method if available
            if hasattr(GameState, 'from_dict'):
                return GameState.from_dict(session_data)
            else:
                # Fallback to basic reconstruction
                from src.models.game_state import (
                    Player, WorldState, Quest, 
                    PlayerStats, InventoryItem, NPC, Location
                )
                
                # Create a basic GameState object
                # This is a simplified reconstruction
                game_state = GameState(
                    player=Player(**session_data.get("player", {})),
                    world_state=WorldState(**session_data.get("world_state", {})),
                    quests=[Quest(**q) for q in session_data.get("quests", [])],
                    narrative_history=session_data.get("narrative_history", []),
                    action_count=session_data.get("action_count", 0)
                )
                
                return game_state
        except Exception as e:
            print(f"Erreur lors de la reconstruction de la session: {e}")
            # Return a minimal GameState in case of error
            return GameState(
                player=Player(name="Unknown", stats=PlayerStats()),
                world_state=WorldState(locations=[], npcs=[]),
                quests=[],
                narrative_history=[],
                action_count=0
            )

# Instance globale du gestionnaire de session
session_manager = SessionManager()