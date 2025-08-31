"""Moteur d'Interaction - Parse et valide les actions du joueur"""

import re
from typing import Dict, List, Any

class InteractionEngine:
    """Moteur responsable du parsing et de la validation des actions du joueur"""
    
    def __init__(self):
        """Initialise le moteur d'interaction"""
        self.action_types = {
            'combat': ['attaque', 'combat', 'frappe', 'tue', 'bataille', 'fight', 'attack', 'kill'],
            'exploration': ['examine', 'regarde', 'cherche', 'fouille', 'explore', 'va', 'marche', 'entre', 'sort', 'ouvre', 'ferme'],
            'dialogue': ['parle', 'dit', 'demande', 'répond', 'salue', 'discute', 'conversation', 'talk', 'speak', 'ask'],
            'inventory': ['prend', 'ramasse', 'utilise', 'équipe', 'range', 'donne', 'jette', 'inventaire', 'take', 'use', 'equip'],
            'magic': ['lance', 'incante', 'sort', 'magie', 'enchante', 'cast', 'spell', 'magic'],
            'social': ['persuade', 'intimide', 'négocie', 'marchande', 'séduit', 'persuade', 'intimidate', 'negotiate']
        }
    
    def parse_action(self, action_text: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Parse l'action du joueur et retourne une structure d'action analysée"""
        action_lower = action_text.lower().strip()
        
        # Déterminer le type d'action
        action_type = self._determine_action_type(action_lower)
        
        # Déterminer la complexité
        complexity = self._determine_complexity(action_lower, action_type, context)
        
        # Extraire les entités mentionnées
        entities = self._extract_entities(action_lower, context)
        
        # Déterminer les paramètres spécifiques à l'action
        action_parameters = self._extract_action_parameters(action_lower, action_type)
        
        # Calculer la confiance dans l'analyse
        confidence = self._calculate_confidence(action_type, entities, action_parameters)
        
        return {
            "action_type": action_type,
            "complexity": complexity,
            "parsed_action": action_text,
            "raw_action": action_text,
            "entities": entities,
            "parameters": action_parameters,
            "confidence": confidence
        }
    
    def validate_action(self, parsed_action: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Valide si une action parsée est faisable dans le contexte actuel"""
        validation_result = {
            'feasible': True,
            'confidence': 0.8,
            'consequences': [],
            'requirements_met': True,
            'warnings': []
        }
        
        action_type = parsed_action.get('action_type', 'exploration')
        complexity = parsed_action.get('complexity', 'simple')
        
        # Validation basée sur le type d'action
        if action_type == 'combat':
            validation_result = self._validate_combat_action(parsed_action, context, validation_result)
        elif action_type == 'magic':
            validation_result = self._validate_magic_action(parsed_action, context, validation_result)
        elif action_type == 'exploration':
            validation_result = self._validate_exploration_action(parsed_action, context, validation_result)
        elif action_type == 'dialogue':
            validation_result = self._validate_dialogue_action(parsed_action, context, validation_result)
        elif action_type == 'inventory':
            validation_result = self._validate_inventory_action(parsed_action, context, validation_result)
        elif action_type == 'social':
            validation_result = self._validate_social_action(parsed_action, context, validation_result)
        
        return validation_result
    
    def _determine_action_type(self, action_lower: str) -> str:
        """Détermine le type d'action basé sur les mots-clés"""
        type_scores = {}
        
        for action_type, keywords in self.action_types.items():
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
        
        return 'exploration'  # Type par défaut
    
    def _determine_complexity(self, action_lower: str, action_type: str, context: Dict[str, Any]) -> str:
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
    
    def _extract_entities(self, action_lower: str, context: Dict[str, Any]) -> Dict[str, List[str]]:
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
            npc_name = npc_data.get('name', '').lower() if isinstance(npc_data, dict) else str(npc_data).lower()
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
    
    def _extract_action_parameters(self, action_lower: str, action_type: str) -> Dict[str, Any]:
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
    
    def _calculate_confidence(self, action_type: str, entities: Dict[str, List[str]], parameters: Dict[str, Any]) -> float:
        """Calcule la confiance dans l'analyse de l'action"""
        confidence = 0.5  # Confiance de base
        
        # Bonus pour type d'action identifié
        if action_type != 'exploration':  # exploration est le type par défaut
            confidence += 0.2
        
        # Bonus pour entités identifiées
        total_entities = sum(len(entity_list) for entity_list in entities.values())
        confidence += min(total_entities * 0.1, 0.2)
        
        # Bonus pour paramètres identifiés
        confidence += min(len(parameters) * 0.05, 0.1)
        
        return min(confidence, 1.0)
    
    def _validate_combat_action(self, parsed_action: Dict[str, Any], context: Dict[str, Any], validation_result: Dict[str, Any]) -> Dict[str, Any]:
        """Valide une action de combat"""
        player_stats = context.get('player_stats', {})
        health = player_stats.get('health', 100)
        
        if health < 20:
            validation_result['warnings'].append('Santé faible - combat risqué')
            validation_result['confidence'] *= 0.7
        
        validation_result['consequences'].append('Possible dégâts subis')
        validation_result['consequences'].append('Expérience de combat gagnée')
        
        return validation_result
    
    def _validate_magic_action(self, parsed_action: Dict[str, Any], context: Dict[str, Any], validation_result: Dict[str, Any]) -> Dict[str, Any]:
        """Valide une action de magie"""
        player_stats = context.get('player_stats', {})
        mana = player_stats.get('mana', 100)
        
        complexity = parsed_action.get('complexity', 'simple')
        mana_cost = 15 if complexity == 'complex' else 8
        
        if mana < mana_cost:
            validation_result['feasible'] = False
            validation_result['requirements_met'] = False
            validation_result['warnings'].append('Mana insuffisant')
        else:
            validation_result['consequences'].append(f'Mana consommé: {mana_cost}')
        
        return validation_result
    
    def _validate_exploration_action(self, parsed_action: Dict[str, Any], context: Dict[str, Any], validation_result: Dict[str, Any]) -> Dict[str, Any]:
        """Valide une action d'exploration"""
        validation_result['consequences'].append('Découverte possible')
        validation_result['consequences'].append('Temps écoulé')
        
        return validation_result
    
    def _validate_dialogue_action(self, parsed_action: Dict[str, Any], context: Dict[str, Any], validation_result: Dict[str, Any]) -> Dict[str, Any]:
        """Valide une action de dialogue"""
        entities = parsed_action.get('entities', {})
        npcs = entities.get('npcs', [])
        
        if not npcs:
            validation_result['warnings'].append('Aucun PNJ identifié pour le dialogue')
            validation_result['confidence'] *= 0.8
        
        validation_result['consequences'].append('Changement de relation avec PNJ')
        
        return validation_result
    
    def _validate_inventory_action(self, parsed_action: Dict[str, Any], context: Dict[str, Any], validation_result: Dict[str, Any]) -> Dict[str, Any]:
        """Valide une action d'inventaire"""
        inventory = context.get('inventory', [])
        entities = parsed_action.get('entities', {})
        objects = entities.get('objects', [])
        
        if 'utilise' in parsed_action.get('raw_action', '').lower() and not objects:
            validation_result['warnings'].append('Objet à utiliser non spécifié')
            validation_result['confidence'] *= 0.7
        
        validation_result['consequences'].append('Modification de l\'inventaire')
        
        return validation_result
    
    def _validate_social_action(self, parsed_action: Dict[str, Any], context: Dict[str, Any], validation_result: Dict[str, Any]) -> Dict[str, Any]:
        """Valide une action sociale"""
        validation_result['consequences'].append('Changement de réputation')
        validation_result['consequences'].append('Influence sur les relations sociales')
        
        return validation_result