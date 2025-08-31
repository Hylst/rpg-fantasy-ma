"""
Moteur de Simulation - Architecture des 4 Moteurs
Simulation du monde persistant, NPCs autonomes et événements dynamiques
"""

import json
import random
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import asdict

from src.engines.state_engine import state_engine
from src.models.game_state import NPC, WorldEvent, Location

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
                'action_duration': 0.25,  # Une action = 15 minutes de jeu
                'rest_duration': 8.0,     # Un repos = 8 heures
                'travel_speed': 5.0       # 5 km/h à pied
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
            },
            'economic_factors': {
                'supply_demand': True,
                'seasonal_variations': True,
                'trade_routes': True
            }
        }
    
    def _load_npc_behaviors(self) -> Dict[str, Any]:
        """Charge les comportements des NPCs"""
        return {
            'merchant': {
                'primary_goals': ['profit', 'reputation', 'safety'],
                'daily_routine': ['open_shop', 'serve_customers', 'manage_inventory', 'close_shop'],
                'interaction_patterns': {
                    'friendly': 0.6,
                    'neutral': 0.3,
                    'hostile': 0.1
                },
                'decision_factors': ['profit_margin', 'relationship', 'risk_level']
            },
            'guard': {
                'primary_goals': ['security', 'order', 'duty'],
                'daily_routine': ['patrol', 'guard_post', 'investigate', 'report'],
                'interaction_patterns': {
                    'authoritative': 0.5,
                    'helpful': 0.3,
                    'suspicious': 0.2
                },
                'decision_factors': ['law_compliance', 'threat_level', 'authority']
            },
            'noble': {
                'primary_goals': ['power', 'prestige', 'influence'],
                'daily_routine': ['court_duties', 'social_events', 'private_meetings', 'leisure'],
                'interaction_patterns': {
                    'condescending': 0.4,
                    'diplomatic': 0.4,
                    'dismissive': 0.2
                },
                'decision_factors': ['political_advantage', 'social_status', 'personal_interest']
            },
            'commoner': {
                'primary_goals': ['survival', 'family', 'community'],
                'daily_routine': ['work', 'family_time', 'social_interaction', 'rest'],
                'interaction_patterns': {
                    'friendly': 0.5,
                    'cautious': 0.3,
                    'indifferent': 0.2
                },
                'decision_factors': ['safety', 'family_welfare', 'community_benefit']
            }
        }
    
    def _load_event_generators(self) -> Dict[str, Any]:
        """Charge les générateurs d'événements"""
        return {
            'random_encounters': {
                'frequency': 0.1,  # 10% de chance par étape
                'types': ['bandits', 'merchants', 'travelers', 'wildlife', 'weather'],
                'location_modifiers': {
                    'wilderness': 1.5,
                    'road': 1.0,
                    'city': 0.3,
                    'dungeon': 2.0
                }
            },
            'political_events': {
                'frequency': 0.05,  # 5% de chance par étape
                'types': ['decree', 'conflict', 'alliance', 'succession', 'rebellion'],
                'impact_radius': 'regional'
            },
            'economic_events': {
                'frequency': 0.08,  # 8% de chance par étape
                'types': ['market_crash', 'trade_boom', 'shortage', 'discovery', 'embargo'],
                'duration': 'medium_term'
            },
            'natural_events': {
                'frequency': 0.03,  # 3% de chance par étape
                'types': ['storm', 'earthquake', 'plague', 'harvest', 'drought'],
                'impact_scope': 'wide'
            }
        }
    
    def _load_world_dynamics(self) -> Dict[str, Any]:
        """Charge les dynamiques du monde"""
        return {
            'faction_relationships': {
                'alliance_decay': 0.01,    # Les alliances se dégradent lentement
                'conflict_escalation': 0.05,  # Les conflits s'intensifient
                'neutral_drift': 0.005     # Tendance vers la neutralité
            },
            'economic_cycles': {
                'boom_duration': 20,       # 20 étapes de simulation
                'bust_duration': 15,       # 15 étapes de simulation
                'recovery_rate': 0.1       # 10% de récupération par étape
            },
            'population_dynamics': {
                'growth_rate': 0.001,      # Croissance démographique
                'migration_factor': 0.05,  # Migration basée sur les conditions
                'mortality_events': 0.02   # Événements de mortalité
            }
        }
    
    def _simulate_npcs(self, context: Dict[str, Any], time_elapsed: float) -> List[Dict[str, Any]]:
        """Simule les actions autonomes des NPCs"""
        npc_actions = []
        world_state = context.get('world_state', {})
        npcs = world_state.get('npcs', [])
        
        for npc_data in npcs:
            npc = NPC(**npc_data) if isinstance(npc_data, dict) else npc_data
            
            # Déterminer l'action du NPC basée sur son comportement
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
        
        # Récupérer le comportement du type de NPC
        behavior = self.npc_behaviors.get(npc.type, self.npc_behaviors['commoner'])
        
        # Facteurs de décision
        decision_factors = behavior['decision_factors']
        
        # Calculer les scores pour différentes actions possibles
        possible_actions = self._get_possible_npc_actions(npc, behavior, context)
        
        if not possible_actions:
            return None
        
        # Sélectionner l'action avec le score le plus élevé
        best_action = max(possible_actions, key=lambda x: x['score'])
        
        # Chance d'action basée sur le temps écoulé
        action_probability = min(time_elapsed * 0.3, 0.8)  # Max 80% de chance
        
        if random.random() < action_probability:
            return {
                'type': best_action['type'],
                'description': best_action['description'],
                'impact': best_action.get('impact', {}),
                'duration': best_action.get('duration', 1.0)
            }
        
        return None
    
    def _get_possible_npc_actions(self, npc: NPC, behavior: Dict[str, Any], context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Génère les actions possibles pour un NPC"""
        actions = []
        
        # Actions basées sur la routine quotidienne
        routine = behavior['daily_routine']
        for routine_action in routine:
            score = self._calculate_action_score(npc, routine_action, behavior, context)
            actions.append({
                'type': 'routine',
                'subtype': routine_action,
                'description': f"{npc.name} effectue sa routine: {routine_action}",
                'score': score,
                'impact': {'mood': 0.1, 'productivity': 0.1}
            })
        
        # Actions sociales
        if random.random() < 0.3:  # 30% de chance d'action sociale
            social_score = self._calculate_social_action_score(npc, context)
            actions.append({
                'type': 'social',
                'description': f"{npc.name} interagit avec d'autres personnages",
                'score': social_score,
                'impact': {'relationships': 0.1, 'information': 0.2}
            })
        
        # Actions économiques (pour les marchands)
        if npc.type == 'merchant':
            economic_score = self._calculate_economic_action_score(npc, context)
            actions.append({
                'type': 'economic',
                'description': f"{npc.name} ajuste ses prix ou son inventaire",
                'score': economic_score,
                'impact': {'economy': 0.2, 'availability': 0.1}
            })
        
        return actions
    
    def _calculate_action_score(self, npc: NPC, action: str, behavior: Dict[str, Any], context: Dict[str, Any]) -> float:
        """Calcule le score d'une action pour un NPC"""
        base_score = 0.5
        
        # Facteurs de personnalité
        personality_bonus = 0.0
        if hasattr(npc, 'personality'):
            personality = npc.personality
            if action in ['work', 'guard_post'] and 'diligent' in personality:
                personality_bonus += 0.2
            elif action in ['social_interaction', 'serve_customers'] and 'friendly' in personality:
                personality_bonus += 0.2
        
        # Facteurs de temps (heure de la journée)
        time_bonus = self._calculate_time_bonus(action)
        
        # Facteurs de contexte
        context_bonus = self._calculate_context_bonus(npc, action, context)
        
        return min(base_score + personality_bonus + time_bonus + context_bonus, 1.0)
    
    def _calculate_time_bonus(self, action: str) -> float:
        """Calcule le bonus basé sur l'heure de la journée"""
        # Simulation simple de l'heure
        current_hour = datetime.now().hour
        
        time_preferences = {
            'work': (8, 18),      # 8h-18h
            'social_interaction': (18, 22),  # 18h-22h
            'rest': (22, 6),      # 22h-6h
            'patrol': (0, 24)     # Toute la journée
        }
        
        if action in time_preferences:
            start, end = time_preferences[action]
            if start <= current_hour <= end or (start > end and (current_hour >= start or current_hour <= end)):
                return 0.3
        
        return 0.0
    
    def _calculate_context_bonus(self, npc: NPC, action: str, context: Dict[str, Any]) -> float:
        """Calcule le bonus basé sur le contexte du jeu"""
        bonus = 0.0
        
        # Facteurs de sécurité
        world_state = context.get('world_state', {})
        threat_level = world_state.get('threat_level', 0.3)
        
        if action in ['guard_post', 'patrol'] and threat_level > 0.5:
            bonus += 0.3
        elif action in ['social_interaction', 'leisure'] and threat_level < 0.3:
            bonus += 0.2
        
        # Facteurs économiques
        economic_state = world_state.get('economic_state', 0.5)
        if action in ['work', 'manage_inventory'] and economic_state < 0.4:
            bonus += 0.2
        
        return bonus
    
    def _calculate_social_action_score(self, npc: NPC, context: Dict[str, Any]) -> float:
        """Calcule le score pour les actions sociales"""
        base_score = 0.4
        
        # Bonus si le joueur est dans la même zone
        player = context.get('player', {})
        if player.get('current_location') == npc.current_location:
            base_score += 0.3
        
        # Bonus basé sur la relation avec le joueur
        relationship = npc.relationship_with_player
        if relationship > 0.5:
            base_score += 0.2
        elif relationship < -0.5:
            base_score -= 0.2
        
        return max(base_score, 0.1)
    
    def _calculate_economic_action_score(self, npc: NPC, context: Dict[str, Any]) -> float:
        """Calcule le score pour les actions économiques"""
        base_score = 0.3
        
        # Facteurs économiques globaux
        world_state = context.get('world_state', {})
        economic_state = world_state.get('economic_state', 0.5)
        
        if economic_state < 0.4:  # Économie en difficulté
            base_score += 0.4  # Plus d'activité économique nécessaire
        elif economic_state > 0.7:  # Économie florissante
            base_score += 0.2
        
        return base_score
    
    def _generate_world_events(self, context: Dict[str, Any], time_elapsed: float) -> List[Dict[str, Any]]:
        """Génère des événements du monde"""
        events = []
        
        for event_type, config
(Content truncated due to size limit. Use line ranges to read in chunks)