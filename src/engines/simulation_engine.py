"""Moteur de Simulation - Architecture des 4 Moteurs
Simulation du monde persistant, NPCs autonomes et événements dynamiques"""

import json
import random
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import asdict

from src.engines.state_engine import state_engine
from src.models.game_state import NPC, Location

class SimulationEngine:
    """
    Moteur de Simulation - Responsabilités:
    1. Simulation du monde persistant en arrière-plan
    2. Gestion des NPCs autonomes et de leurs comportements
    3. Génération d'événements dynamiques
    4. Évolution temporelle du monde
    5. Calcul des conséquences à long terme
    """
    
    def __init__(self):
        self.simulation_rules = self._load_simulation_rules()
        self.npc_behaviors = self._load_npc_behaviors()
        self.event_generators = self._load_event_generators()
        self.world_dynamics = self._load_world_dynamics()
        
    def simulate_world_step(self, session_id: str, time_elapsed: float = 1.0) -> Dict[str, Any]:
        """
        Effectue une étape de simulation du monde
        time_elapsed: temps écoulé en heures de jeu
        """
        try:
            context = state_engine.get_full_context(session_id)
            
            simulation_results = {
                'npc_actions': [],
                'world_events': [],
                'environmental_changes': [],
                'quest_updates': [],
                'reputation_changes': []
            }
            
            # 1. Simuler les NPCs
            npc_results = self._simulate_npcs(context, time_elapsed)
            simulation_results['npc_actions'] = npc_results
            
            # 2. Générer des événements du monde
            world_events = self._generate_world_events(context, time_elapsed)
            simulation_results['world_events'] = world_events
            
            # 3. Simuler les changements environnementaux
            env_changes = self._simulate_environment(context, time_elapsed)
            simulation_results['environmental_changes'] = env_changes
            
            # 4. Mettre à jour les quêtes
            quest_updates = self._update_quests(context, time_elapsed)
            simulation_results['quest_updates'] = quest_updates
            
            # 5. Calculer les changements de réputation
            reputation_changes = self._calculate_reputation_changes(context, time_elapsed)
            simulation_results['reputation_changes'] = reputation_changes
            
            # 6. Appliquer tous les changements au moteur d'état
            self._apply_simulation_results(session_id, simulation_results)
            
            return {
                'success': True,
                'simulation_results': simulation_results,
                'world_time_advanced': time_elapsed
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Erreur de simulation: {str(e)}'
            }
    
    def _load_simulation_rules(self) -> Dict[str, Any]:
        """Charge les règles de simulation du monde"""
        return {
            'time_scale': {
                'action_duration': 0.25,
                'rest_duration': 8.0,
                'travel_speed': 5.0
            },
            'npc_activity_cycles': {
                'daily': ['morning', 'afternoon', 'evening', 'night'],
                'weekly': ['work_days', 'rest_days'],
                'seasonal': ['spring', 'summer', 'autumn', 'winter']
            },
            'world_stability': {
                'base_stability': 0.7,
                'chaos_threshold': 0.3,
                'order_threshold': 0.9
            }
        }
    
    def _load_npc_behaviors(self) -> Dict[str, Any]:
        """Charge les comportements des NPCs"""
        return {
            'merchant': {
                'primary_goals': ['profit', 'reputation', 'safety'],
                'daily_routine': ['open_shop', 'serve_customers', 'manage_inventory', 'close_shop']
            },
            'guard': {
                'primary_goals': ['security', 'order', 'duty'],
                'daily_routine': ['patrol', 'guard_post', 'investigate', 'report']
            },
            'commoner': {
                'primary_goals': ['survival', 'family', 'community'],
                'daily_routine': ['work', 'family_time', 'social_interaction', 'rest']
            }
        }
    
    def _load_event_generators(self) -> Dict[str, Any]:
        """Charge les générateurs d'événements"""
        return {
            'random_encounters': {
                'frequency': 0.1,
                'types': ['bandits', 'merchants', 'travelers', 'wildlife', 'weather']
            },
            'political_events': {
                'frequency': 0.05,
                'types': ['decree', 'conflict', 'alliance', 'succession', 'rebellion']
            }
        }
    
    def _load_world_dynamics(self) -> Dict[str, Any]:
        """Charge les dynamiques du monde"""
        return {
            'faction_relationships': {
                'alliance_decay': 0.01,
                'conflict_escalation': 0.05,
                'neutral_drift': 0.005
            },
            'economic_cycles': {
                'boom_duration': 20,
                'bust_duration': 15,
                'recovery_rate': 0.1
            }
        }
    
    def _simulate_npcs(self, context: Dict[str, Any], time_elapsed: float) -> List[Dict[str, Any]]:
        """Simule les actions des NPCs"""
        npc_actions = []
        npcs = context.get('npcs', [])
        
        for npc in npcs:
            action = self._determine_npc_action(npc, context, time_elapsed)
            if action:
                npc_actions.append({
                    'npc_id': npc.id,
                    'npc_name': npc.name,
                    'action': action,
                    'location': npc.current_location,
                    'timestamp': datetime.now().isoformat()
                })
        
        return npc_actions
    
    def _determine_npc_action(self, npc: NPC, context: Dict[str, Any], time_elapsed: float) -> Optional[Dict[str, Any]]:
        """Détermine l'action qu'un NPC va effectuer"""
        behavior = self.npc_behaviors.get(npc.type, self.npc_behaviors['commoner'])
        
        if random.random() < time_elapsed * 0.3:
            routine = behavior['daily_routine']
            action_type = random.choice(routine)
            
            return {
                'type': 'routine',
                'subtype': action_type,
                'description': f"{npc.name} effectue sa routine: {action_type}",
                'impact': {'mood': 0.1}
            }
        
        return None
    
    def _generate_world_events(self, context: Dict[str, Any], time_elapsed: float) -> List[Dict[str, Any]]:
        """Génère des événements du monde"""
        events = []
        
        if random.random() < 0.1 * time_elapsed:
            event = {
                'type': 'random_encounter',
                'description': 'Un événement aléatoire se produit',
                'impact': {'tension': 0.2},
                'timestamp': datetime.now().isoformat()
            }
            events.append(event)
        
        return events
    
    def _simulate_environment(self, context: Dict[str, Any], time_elapsed: float) -> List[Dict[str, Any]]:
        """Simule les changements environnementaux"""
        changes = []
        
        if random.random() < 0.2 * time_elapsed:
            weather_change = {
                'type': 'weather',
                'description': 'Le temps change',
                'impact': {'visibility': random.uniform(-0.2, 0.2)},
                'timestamp': datetime.now().isoformat()
            }
            changes.append(weather_change)
        
        return changes
    
    def _update_quests(self, context: Dict[str, Any], time_elapsed: float) -> List[Dict[str, Any]]:
        """Met à jour les quêtes actives"""
        updates = []
        active_quests = context.get('active_quests', [])
        
        for quest in active_quests:
            if quest.get('time_limit'):
                remaining_time = quest['time_limit'] - time_elapsed
                if remaining_time <= 0:
                    updates.append({
                        'quest_id': quest['id'],
                        'type': 'expired',
                        'description': f"La quête {quest['name']} a expiré"
                    })
        
        return updates
    
    def _calculate_reputation_changes(self, context: Dict[str, Any], time_elapsed: float) -> List[Dict[str, Any]]:
        """Calcule les changements de réputation"""
        changes = []
        
        # Dégradation naturelle de la réputation
        if random.random() < 0.05 * time_elapsed:
            changes.append({
                'faction': 'general',
                'change': -0.01,
                'reason': 'Dégradation naturelle'
            })
        
        return changes
    
    def _apply_simulation_results(self, session_id: str, results: Dict[str, Any]) -> None:
        """Applique les résultats de simulation au moteur d'état"""
        # Appliquer les changements de réputation
        for rep_change in results.get('reputation_changes', []):
            state_engine.update_player_reputation(
                session_id, 
                rep_change['faction'], 
                rep_change['change']
            )
        
        # Appliquer les événements du monde
        for event in results.get('world_events', []):
            state_engine.add_world_event(session_id, event)

# Instance globale
simulation_engine = SimulationEngine()