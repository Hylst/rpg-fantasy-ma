"""
Modèles de données pour l'état du jeu - Architecture des 4 Moteurs
"""

from dataclasses import dataclass, field
from typing import Dict, List, Any, Optional
from datetime import datetime
import json

@dataclass
class PlayerStats:
    """Statistiques du joueur"""
    health: int = 100
    max_health: int = 100
    mana: int = 100
    max_mana: int = 100
    strength: int = 10
    dexterity: int = 10
    intelligence: int = 10
    charisma: int = 10
    level: int = 1
    experience: int = 0
    
    def to_dict(self) -> dict:
        return {
            'health': self.health,
            'max_health': self.max_health,
            'mana': self.mana,
            'max_mana': self.max_mana,
            'strength': self.strength,
            'dexterity': self.dexterity,
            'intelligence': self.intelligence,
            'charisma': self.charisma,
            'level': self.level,
            'experience': self.experience
        }

@dataclass
class InventoryItem:
    """Objet dans l'inventaire"""
    id: str
    name: str
    type: str  # weapon, armor, consumable, misc
    description: str
    quantity: int = 1
    properties: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'name': self.name,
            'type': self.type,
            'description': self.description,
            'quantity': self.quantity,
            'properties': self.properties
        }

@dataclass
class Player:
    """Données du joueur"""
    name: str
    character_class: str
    stats: PlayerStats
    inventory: List[InventoryItem] = field(default_factory=list)
    equipped_items: Dict[str, str] = field(default_factory=dict)  # slot -> item_id
    
    def to_dict(self) -> dict:
        return {
            'name': self.name,
            'character_class': self.character_class,
            'stats': self.stats.to_dict(),
            'inventory': [item.to_dict() for item in self.inventory],
            'equipped_items': self.equipped_items
        }

@dataclass
class NPC:
    """Personnage non-joueur (inclut les créatures et ennemis)"""
    id: str
    name: str
    type: str  # merchant, guard, noble, commoner, creature, monster
    location: str
    disposition: str  # friendly, neutral, hostile
    dialogue_state: Dict[str, Any] = field(default_factory=dict)
    inventory: List[InventoryItem] = field(default_factory=list)
    motivations: List[str] = field(default_factory=list) # Ex: ['protéger le village', 'chercher de la nourriture']
    daily_routine: List[Dict[str, Any]] = field(default_factory=list) # Ex: [{'time': 'morning', 'action': 'aller au marché'}]
    relationships: Dict[str, str] = field(default_factory=dict) # Ex: {'npc_id_1': 'ami', 'faction_id_A': 'ennemi'}
    
    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'name': self.name,
            'type': self.type,
            'location': self.location,
            'disposition': self.disposition,
            'dialogue_state': self.dialogue_state,
            'inventory': [item.to_dict() for item in self.inventory],
            'motivations': self.motivations,
            'daily_routine': self.daily_routine,
            'relationships': self.relationships
        }

@dataclass
class Location:
    """Lieu dans le monde"""
    id: str
    name: str
    description: str
    type: str  # town, dungeon, wilderness, building
    connections: List[str] = field(default_factory=list)  # IDs des lieux connectés
    npcs: List[str] = field(default_factory=list)  # IDs des NPCs présents
    items: List[InventoryItem] = field(default_factory=list)  # Objets au sol
    properties: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'type': self.type,
            'connections': self.connections,
            'npcs': self.npcs,
            'items': [item.to_dict() for item in self.items],
            'properties': self.properties
        }

@dataclass
class Quest:
    """Quête"""
    id: str
    title: str
    description: str
    status: str  # active, completed, failed
    objectives: List[Dict[str, Any]] = field(default_factory=list)
    rewards: List[InventoryItem] = field(default_factory=list)
    
    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'status': self.status,
            'objectives': self.objectives,
            'rewards': [reward.to_dict() for reward in self.rewards]
        }

@dataclass
class NarrativeEntry:
    """Entrée narrative"""
    id: str
    type: str  # user_action, ai_response, system_event
    content: str
    timestamp: datetime
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'type': self.type,
            'content': self.content,
            'timestamp': self.timestamp.isoformat(),
            'metadata': self.metadata
        }

@dataclass
class WorldState:
    """État du monde"""
    current_location: str
    time_of_day: str = "day"  # day, night, dawn, dusk
    weather: str = "clear"  # clear, rain, storm, fog
    locations: Dict[str, Location] = field(default_factory=dict)
    npcs: Dict[str, NPC] = field(default_factory=dict)
    global_events: List[Dict[str, Any]] = field(default_factory=list)
    
    def to_dict(self) -> dict:
        return {
            'current_location': self.current_location,
            'time_of_day': self.time_of_day,
            'weather': self.weather,
            'locations': {k: v.to_dict() for k, v in self.locations.items()},
            'npcs': {k: v.to_dict() for k, v in self.npcs.items()},
            'global_events': self.global_events
        }

@dataclass
class GameState:
    """État complet du jeu"""
    session_id: str
    player: Player
    world_state: WorldState
    quests: List[Quest] = field(default_factory=list)
    narrative_history: List[NarrativeEntry] = field(default_factory=list)
    game_settings: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)
    last_updated: datetime = field(default_factory=datetime.now)
    
    def to_dict(self) -> dict:
        return {
            'session_id': self.session_id,
            'player': self.player.to_dict(),
            'world_state': self.world_state.to_dict(),
            'quests': [quest.to_dict() for quest in self.quests],
            'narrative_history': [entry.to_dict() for entry in self.narrative_history],
            'game_settings': self.game_settings,
            'created_at': self.created_at.isoformat(),
            'last_updated': self.last_updated.isoformat()
        }
    
    def to_json(self) -> str:
        """Sérialise l'état en JSON"""
        return json.dumps(self.to_dict(), indent=2)
    
    @classmethod
    def from_dict(cls, data: dict) -> 'GameState':
        """Crée un GameState à partir d'un dictionnaire"""
        # Reconstruction des objets complexes
        player_data = data['player']
        stats = PlayerStats(**player_data['stats'])
        inventory = [InventoryItem(**item) for item in player_data['inventory']]
        player = Player(
            name=player_data['name'],
            character_class=player_data['character_class'],
            stats=stats,
            inventory=inventory,
            equipped_items=player_data['equipped_items']
        )
        
        # Reconstruction du monde
        world_data = data['world_state']
        locations = {}
        for loc_id, loc_data in world_data['locations'].items():
            items = [InventoryItem(**item) for item in loc_data['items']]
            locations[loc_id] = Location(
                id=loc_data['id'],
                name=loc_data['name'],
                description=loc_data['description'],
                type=loc_data['type'],
                connections=loc_data['connections'],
                npcs=loc_data['npcs'],
                items=items,
                properties=loc_data['properties']
            )
        
        npcs = {}
        for npc_id, npc_data in world_data['npcs'].items():
            npc_inventory = [InventoryItem(**item) for item in npc_data['inventory']]
            npcs[npc_id] = NPC(
                id=npc_data['id'],
                name=npc_data['name'],
                type=npc_data['type'],
                location=npc_data['location'],
                disposition=npc_data['disposition'],
                dialogue_state=npc_data['dialogue_state'],
                inventory=npc_inventory,
                motivations=npc_data.get('motivations', []),
                daily_routine=npc_data.get('daily_routine', []),
                relationships=npc_data.get('relationships', {})
            )
        
        world_state = WorldState(
            current_location=world_data['current_location'],
            time_of_day=world_data['time_of_day'],
            weather=world_data['weather'],
            locations=locations,
            npcs=npcs,
            global_events=world_data['global_events']
        )
        
        # Reconstruction des quêtes
        quests = []
        for quest_data in data['quests']:
            rewards = [InventoryItem(**reward) for reward in quest_data['rewards']]
            quests.append(Quest(
                id=quest_data['id'],
                title=quest_data['title'],
                description=quest_data['description'],
                status=quest_data['status'],
                objectives=quest_data['objectives'],
                rewards=rewards
            ))
        
        # Reconstruction de l'historique narratif
        narrative_history = []
        for entry_data in data['narrative_history']:
            narrative_history.append(NarrativeEntry(
                id=entry_data['id'],
                type=entry_data['type'],
                content=entry_data['content'],
                timestamp=datetime.fromisoformat(entry_data['timestamp']),
                metadata=entry_data['metadata']
            ))
        
        return cls(
            session_id=data['session_id'],
            player=player,
            world_state=world_state,
            quests=quests,
            narrative_history=narrative_history,
            game_settings=data['game_settings'],
            created_at=datetime.fromisoformat(data['created_at']),
            last_updated=datetime.fromisoformat(data['last_updated'])
        )



