"""
Moteur de Narration Avancé - Architecture des 4 Moteurs
Génération narrative adaptative, cohérence temporelle et gestion des arcs narratifs
"""

import json
import re
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
from dataclasses import asdict

from src.engines.state_engine import state_engine
from src.routes.llm import call_openai_compatible_api, call_gemini_api, LLM_PROVIDERS

class NarrativeEngine:
    """
    Moteur de Narration Avancé - Responsabilités:
    1. Génération narrative adaptative basée sur l'état du jeu
    2. Maintien de la cohérence temporelle et causale
    3. Gestion des arcs narratifs à long terme
    4. Adaptation du style narratif selon le contexte
    5. Compression et résumé des événements passés
    """
    
    def __init__(self):
        self.narrative_templates = self._load_narrative_templates()
        self.style_profiles = self._load_style_profiles()
        self.arc_patterns = self._load_arc_patterns()
        
    def generate_narrative_response(self, session_id: str, parsed_action: Dict[str, Any], 
                                  validation_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Génère une réponse narrative adaptative basée sur l'action et l'état du jeu
        """
        try:
            # Récupérer le contexte complet depuis le moteur d'état
            context = state_engine.get_full_context(session_id)
            
            # Analyser l'arc narratif actuel
            current_arc = self._analyze_current_arc(context)
            
            # Déterminer le style narratif approprié
            narrative_style = self._determine_narrative_style(context, parsed_action)
            
            # Construire le prompt narratif
            narrative_prompt = self._build_narrative_prompt(
                context, parsed_action, validation_result, current_arc, narrative_style
            )
            
            # Générer la réponse via LLM
            llm_response = self._generate_llm_response(narrative_prompt, context)
            
            # Post-traiter la réponse
            processed_response = self._post_process_narrative(llm_response, context, parsed_action)
            
            # Mettre à jour l'arc narratif
            self._update_narrative_arc(session_id, processed_response, parsed_action)
            
            return {
                'success': True,
                'narrative_response': processed_response['text'],
                'narrative_metadata': {
                    'style': narrative_style,
                    'arc_phase': current_arc['phase'],
                    'tension_level': processed_response['tension_level'],
                    'emotional_tone': processed_response['emotional_tone'],
                    'suggested_consequences': processed_response.get('consequences', [])
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Erreur dans la génération narrative: {str(e)}',
                'fallback_response': self._generate_fallback_response(parsed_action)
            }
    
    def _load_narrative_templates(self) -> Dict[str, Any]:
        """Charge les templates narratifs pour différents types d'actions"""
        return {
            'exploration': {
                'discovery': "Vous découvrez {discovery}. {description} {atmosphere}",
                'movement': "Vous vous dirigez vers {destination}. {transition} {new_environment}",
                'observation': "Vous examinez {target}. {details} {implications}"
            },
            'combat': {
                'initiation': "Le combat commence ! {enemy_description} {tactical_situation}",
                'action': "Votre {action} {result}. {enemy_reaction} {battle_state}",
                'resolution': "Le combat se termine. {outcome} {consequences}"
            },
            'dialogue': {
                'greeting': "{npc_name} {greeting_style}. {npc_mood} {conversation_opener}",
                'exchange': "{npc_name} {response_style} : \"{dialogue}\" {npc_reaction}",
                'conclusion': "La conversation {conclusion_type}. {relationship_change} {future_implications}"
            },
            'magic': {
                'casting': "Vous invoquez {spell_name}. {magical_effects} {environmental_impact}",
                'success': "Le sort réussit ! {spell_effects} {magical_consequences}",
                'failure': "Le sort échoue. {failure_reason} {magical_backlash}"
            },
            'social': {
                'persuasion': "Vous tentez de {persuasion_type}. {target_reaction} {social_outcome}",
                'reputation': "Votre réputation {reputation_change}. {social_consequences}",
                'relationship': "Votre relation avec {target} {relationship_change}."
            }
        }
    
    def _load_style_profiles(self) -> Dict[str, Any]:
        """Charge les profils de style narratif"""
        return {
            'epic': {
                'tone': 'grandiose et héroïque',
                'vocabulary': 'soutenu et dramatique',
                'pacing': 'rythmé avec des moments de tension',
                'perspective': 'focalisé sur les enjeux importants'
            },
            'gritty': {
                'tone': 'sombre et réaliste',
                'vocabulary': 'direct et cru',
                'pacing': 'lent et contemplatif',
                'perspective': 'focalisé sur les détails viscéraux'
            },
            'whimsical': {
                'tone': 'léger et fantaisiste',
                'vocabulary': 'coloré et imaginatif',
                'pacing': 'vif et enjoué',
                'perspective': 'focalisé sur l\'émerveillement'
            },
            'mysterious': {
                'tone': 'énigmatique et intriguant',
                'vocabulary': 'évocateur et ambigu',
                'pacing': 'progressif avec des révélations',
                'perspective': 'focalisé sur l\'inconnu'
            }
        }
    
    def _load_arc_patterns(self) -> Dict[str, Any]:
        """Charge les patterns d'arcs narratifs"""
        return {
            'hero_journey': {
                'phases': ['call_to_adventure', 'refusal', 'mentor', 'threshold', 'trials', 'revelation', 'transformation', 'return'],
                'transitions': {
                    'call_to_adventure': 'refusal',
                    'refusal': 'mentor',
                    'mentor': 'threshold',
                    'threshold': 'trials',
                    'trials': 'revelation',
                    'revelation': 'transformation',
                    'transformation': 'return'
                }
            },
            'mystery': {
                'phases': ['setup', 'investigation', 'complications', 'revelation', 'resolution'],
                'transitions': {
                    'setup': 'investigation',
                    'investigation': 'complications',
                    'complications': 'revelation',
                    'revelation': 'resolution'
                }
            },
            'exploration': {
                'phases': ['departure', 'discovery', 'challenges', 'mastery', 'return'],
                'transitions': {
                    'departure': 'discovery',
                    'discovery': 'challenges',
                    'challenges': 'mastery',
                    'mastery': 'return'
                }
            }
        }
    
    def _analyze_current_arc(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Analyse l'arc narratif actuel basé sur l'historique"""
        narrative_history = context.get('narrative_history', [])
        
        if not narrative_history:
            return {
                'type': 'exploration',
                'phase': 'departure',
                'progress': 0.0,
                'tension_level': 0.3
            }
        
        # Analyser les patterns dans l'historique
        action_types = [entry.get('parsed', {}).get('action_type', 'exploration') 
                       for entry in narrative_history if entry.get('type') == 'user_action']
        
        # Déterminer le type d'arc basé sur les actions dominantes
        arc_type = self._determine_arc_type(action_types)
        
        # Calculer la progression dans l'arc
        progress = min(len(narrative_history) / 20.0, 1.0)  # 20 actions = arc complet
        
        # Déterminer la phase actuelle
        arc_pattern = self.arc_patterns[arc_type]
        phase_index = int(progress * len(arc_pattern['phases']))
        current_phase = arc_pattern['phases'][min(phase_index, len(arc_pattern['phases']) - 1)]
        
        # Calculer le niveau de tension
        tension_level = self._calculate_tension_level(progress, current_phase, action_types)
        
        return {
            'type': arc_type,
            'phase': current_phase,
            'progress': progress,
            'tension_level': tension_level
        }
    
    def _determine_arc_type(self, action_types: List[str]) -> str:
        """Détermine le type d'arc narratif basé sur les actions"""
        if not action_types:
            return 'exploration'
        
        action_counts = {}
        for action_type in action_types:
            action_counts[action_type] = action_counts.get(action_type, 0) + 1
        
        dominant_action = max(action_counts, key=action_counts.get)
        
        if dominant_action == 'combat':
            return 'hero_journey'
        elif dominant_action == 'dialogue':
            return 'mystery'
        else:
            return 'exploration'
    
    def _calculate_tension_level(self, progress: float, phase: str, action_types: List[str]) -> float:
        """Calcule le niveau de tension narratif"""
        base_tension = progress * 0.5  # Tension augmente avec la progression
        
        # Ajustements basés sur la phase
        phase_modifiers = {
            'call_to_adventure': 0.2,
            'threshold': 0.6,
            'trials': 0.8,
            'revelation': 0.9,
            'complications': 0.7,
            'challenges': 0.6
        }
        
        phase_tension = phase_modifiers.get(phase, 0.3)
        
        # Ajustements basés sur les actions récentes
        recent_actions = action_types[-5:] if len(action_types) >= 5 else action_types
        combat_ratio = recent_actions.count('combat') / len(recent_actions) if recent_actions else 0
        
        action_tension = combat_ratio * 0.3
        
        return min(base_tension + phase_tension + action_tension, 1.0)
    
    def _determine_narrative_style(self, context: Dict[str, Any], parsed_action: Dict[str, Any]) -> str:
        """Détermine le style narratif approprié"""
        session = context.get('session', {})
        base_style = session.get('narrative_style', 'epic')
        
        # Ajustements basés sur l'action
        action_type = parsed_action.get('action_type', 'exploration')
        complexity = parsed_action.get('complexity', 'simple')
        
        if action_type == 'combat' and complexity == 'complex':
            return 'epic'
        elif action_type == 'dialogue':
            return 'mysterious'
        elif action_type == 'exploration':
            return base_style
        
        return base_style
    
    def _build_narrative_prompt(self, context: Dict[str, Any], parsed_action: Dict[str, Any], 
                               validation_result: Dict[str, Any], current_arc: Dict[str, Any], 
                               narrative_style: str) -> str:
        """Construit le prompt pour la génération narrative"""
        
        # Informations de base
        session = context.get('session', {})
        player = context.get('player', {})
        world_state = context.get('world_state', {})
        
        # Contexte narratif récent
        recent_history = self._get_recent_narrative_context(context, 3)
        
        # Style et arc
        style_profile = self.style_profiles.get(narrative_style, self.style_profiles['epic'])
        
        prompt = f"""Tu es un Maître du Jeu expert pour un RPG {session.get('universe', 'fantasy')}. 

CONTEXTE DU JEU:
- Joueur: {player.get('name', 'Aventurier')} (Niveau {player.get('level', 1)})
- Lieu actuel: {world_state.get('current_location', {}).get('name', 'Lieu inconnu')}
- Arc narratif: {current_arc['type']} - Phase: {current_arc['phase']}
- Niveau de tension: {current_arc['tension_level']:.1f}/1.0

STYLE NARRATIF ({narrative_style}):
- Ton: {style_profile['tone']}
- Vocabulaire: {style_profile['vocabulary']}
- Rythme: {style_profile['pacing']}
- Perspective: {style_profile['perspective']}

HISTORIQUE RÉCENT:
{recent_history}

ACTION DU JOUEUR:
Type: {parsed_action.get('action_type', 'exploration')}
Action: {parsed_action.get('raw_action', '')}
Complexité: {parsed_action.get('complexity', 'simple')}
Entités impliquées: {', '.join(parsed_action.get('entities', {}).get('npcs', []) + parsed_action.get('entities', {}).get('objects', []))}

VALIDATION:
Faisabilité: {validation_result.get('feasible', True)}
Conséquences: {', '.join(validation_result.get('consequences', []))}

INSTRUCTIONS:
1. Génère une réponse narrative immersive de 2-3 paragraphes
2. Respecte le style narratif demandé
3. Intègre les conséquences de l'action
4. Maintiens la cohérence avec l'historique
5. Adapte le niveau de tension à la phase narrative
6. Termine par une question ou situation qui invite à l'action

Réponse narrative:"""

        return prompt
    
    def _get_recent_narrative_context(self, context: Dict[str, Any], num_entries: int) -> str:
        """Récupère le contexte narratif récent"""
        narrative_history = context.get('narrative_history', [])
        
        if not narrative_history:
            return "Début de l'aventure."
        
        recent_entries = narrative_history[-num_entries:]
        context_lines = []
        
        for entry in recent_entries:
            if entry.get('type') == 'user_action':
                context_lines.append(f"Joueur: {entry.get('content', '')}")
            elif entry.get('type') == 'narrative_response':
                # Résumer la réponse narrative si elle est trop longue
                response = entry.get('content', '')
                if len(response) > 200:
                    response = response[:200] + "..."
                context_lines.append(f"MJ: {response}")
        
        return "\n".join(context_lines) if context_lines else "Début de l'aventure."
    
    def _generate_llm_response(self, prompt: str, context: Dict[str, Any]) -> str:
        """Génère la réponse via LLM"""
        try:
            # Utiliser le fournisseur configuré par défaut
            import os
            provider = os.getenv('DEFAULT_LLM_PROVIDER', 'deepseek')
            
            if provider not in LLM_PROVIDERS:
                provider = 'deepseek'
            
            provider_config = LLM_PROVIDERS[provider]
            api_key = provider_config['api_key']
            
            if not api_key:
                raise Exception(f'Clé API manquante pour {provider}')
            
            # Appel à l'API
            if provider == 'gemini':
                response = call_gemini_api(api_key, prompt)
            else:
                messages = [{"role": "user", "content": prompt}]
                response = call_openai_compatible_api(
                    provider_config['base_url'],
                    api_key,
                    provider_config['model'],
                    messages,
                    2000,
                    0.8,
                    provider
                )
            
            return response.get('response', '')
            
        except Exception as e:
            raise Exception(f'Erreur LLM: {str(e)}')
    
    def _post_process_narrative(self, llm_response: str, context: Dict[str, Any], 
                               parsed_action: Dict[str, Any]) -> Dict[str, Any]:
        """Post-traite la réponse narrative"""
        try:
            # Nettoyer la réponse
            cleaned_response = llm_response.strip()
            
            # Analyser le ton émotionnel
            emotional_tone = self._analyze_emotional_tone(cleaned_response)
            
            # Calculer le niveau de tension
            tension_level = self._calculate_response_tension(cleaned_response, parsed_action)
            
            return {
                'text': cleaned_response,
                'emotional_tone': emotional_tone,
                'tension_level': tension_level,
                'word_count': len(cleaned_response.split())
            }
            
        except Exception as e:
            return {
                'text': llm_response,
                'emotional_tone': 'neutral',
                'tension_level': 0.5,
                'word_count': len(llm_response.split()) if llm_response else 0
            }
    
    def _analyze_emotional_tone(self, text: str) -> str:
        """Analyse le ton émotionnel du texte"""
        positive_words = ['succès', 'victoire', 'joie', 'espoir', 'triomphe']
        negative_words = ['échec', 'défaite', 'peur', 'danger', 'mort']
        
        text_lower = text.lower()
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        if positive_count > negative_count:
            return 'positive'
        elif negative_count > positive_count:
            return 'negative'
        else:
            return 'neutral'
    
    def _calculate_response_tension(self, text: str, parsed_action: Dict[str, Any]) -> float:
        """Calcule le niveau de tension de la réponse"""
        base_tension = 0.3
        
        # Ajustement basé sur le type d'action
        action_type = parsed_action.get('action_type', 'exploration')
        if action_type == 'combat':
            base_tension += 0.4
        elif action_type == 'dialogue':
            base_tension += 0.1
        
        # Ajustement basé sur le contenu
        tension_words = ['danger', 'combat', 'mort', 'peur', 'urgence']
        text_lower = text.lower()
        tension_count = sum(1 for word in tension_words if word in text_lower)
        
        return min(base_tension + (tension_count * 0.1), 1.0)
    
    def _update_narrative_arc(self, session_id: str, processed_response: Dict[str, Any], 
                             parsed_action: Dict[str, Any]) -> None:
        """Met à jour l'arc narratif"""
        try:
            # Récupérer l'état actuel
            context = state_engine.get_full_context(session_id)
            current_arc = self._analyze_current_arc(context)
            
            # Déterminer si une transition d'arc est nécessaire
            if self._should_transition_arc(current_arc, processed_response, parsed_action):
                self._transition_narrative_arc(session_id, current_arc)
                
        except Exception as e:
            print(f"Erreur lors de la mise à jour de l'arc narratif: {e}")
    
    def _should_transition_arc(self, current_arc: Dict[str, Any], 
                              processed_response: Dict[str, Any], 
                              parsed_action: Dict[str, Any]) -> bool:
        """Détermine si une transition d'arc est nécessaire"""
        # Transition basée sur la progression
        if current_arc['progress'] > 0.8:
            return True
        
        # Transition basée sur le niveau de tension
        if processed_response['tension_level'] > 0.9:
            return True
        
        return False
    
    def _transition_narrative_arc(self, session_id: str, current_arc: Dict[str, Any]) -> None:
        """Effectue une transition d'arc narratif"""
        arc_type = current_arc['type']
        current_phase = current_arc['phase']
        
        arc_pattern = self.arc_patterns.get(arc_type, self.arc_patterns['exploration'])
        transitions = arc_pattern.get('transitions', {})
        
        next_phase = transitions.get(current_phase)
        if next_phase:
            # Mettre à jour la phase dans l'état du jeu
            state_engine.update_narrative_phase(session_id, next_phase)
    
    def _generate_fallback_response(self, parsed_action: Dict[str, Any]) -> str:
        """Génère une réponse de secours en cas d'erreur"""
        action_type = parsed_action.get('action_type', 'exploration')
        
        fallback_responses = {
            'exploration': "Vous explorez les environs avec attention.",
            'combat': "Le combat fait rage autour de vous.",
            'dialogue': "La conversation se poursuit.",
            'magic': "Vous ressentez l'énergie magique qui vous entoure.",
            'social': "Vous interagissez avec votre entourage."
        }
        
        return fallback_responses.get(action_type, "Vous continuez votre aventure.")

# Instance globale
narrative_engine = NarrativeEngine()