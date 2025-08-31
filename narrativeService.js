import { apiClient } from './api';

class NarrativeService {
  constructor() {
    this.baseUrl = '/narrative';
  }

  // Générer du contenu narratif basé sur le contexte
  async generateNarrative(context) {
    try {
      const response = await apiClient.post(`${this.baseUrl}/generate`, {
        session_id: context.sessionId,
        location: context.location,
        npcs_present: context.npcsPresent || [],
        recent_actions: context.recentActions || [],
        narrative_type: context.narrativeType || 'exploration',
        player_state: context.playerState,
        world_context: context.worldContext,
        timestamp: context.timestamp || new Date().toISOString()
      });

      return response.data;
    } catch (error) {
      console.error('Erreur lors de la génération narrative:', error);
      throw error;
    }
  }

  // Générer une micro-quête contextuelle
  async generateMicroQuest(context) {
    try {
      const response = await apiClient.post(`${this.baseUrl}/micro-quest`, {
        session_id: context.sessionId,
        location: context.location,
        available_npcs: context.availableNpcs || [],
        player_level: context.playerLevel || 1,
        difficulty: context.difficulty || 'medium',
        quest_type: context.questType || 'side',
        world_state: context.worldState,
        timestamp: context.timestamp || new Date().toISOString()
      });

      return response.data;
    } catch (error) {
      console.error('Erreur lors de la génération de micro-quête:', error);
      throw error;
    }
  }

  // Traiter une décision narrative
  async processDecision(decisionData) {
    try {
      const response = await apiClient.post(`${this.baseUrl}/decision`, {
        session_id: decisionData.sessionId,
        decision_id: decisionData.decisionId,
        choice: decisionData.choice,
        context: decisionData.context,
        timestamp: decisionData.timestamp || new Date().toISOString()
      });

      return response.data;
    } catch (error) {
      console.error('Erreur lors du traitement de la décision:', error);
      throw error;
    }
  }

  // Générer du dialogue pour un PNJ
  async generateDialogue(npcId, playerMessage, context = {}) {
    try {
      const response = await apiClient.post(`${this.baseUrl}/dialogue`, {
        session_id: context.sessionId,
        npc_id: npcId,
        player_message: playerMessage,
        conversation_history: context.conversationHistory || [],
        world_context: context.worldContext,
        relationship_level: context.relationshipLevel,
        timestamp: context.timestamp || new Date().toISOString()
      });

      return response.data;
    } catch (error) {
      console.error('Erreur lors de la génération de dialogue:', error);
      throw error;
    }
  }

  // Obtenir l'historique narratif
  async getNarrativeHistory(sessionId, options = {}) {
    try {
      const params = new URLSearchParams({
        session_id: sessionId,
        limit: options.limit || 50,
        offset: options.offset || 0,
        type: options.type || 'all'
      });

      const response = await apiClient.get(`${this.baseUrl}/history?${params}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      throw error;
    }
  }

  // Analyser l'arc narratif actuel
  async analyzeNarrativeArc(sessionId) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/arc-analysis/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'analyse de l\'arc narratif:', error);
      throw error;
    }
  }

  // Obtenir les décisions en attente
  async getPendingDecisions(sessionId) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/pending-decisions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des décisions:', error);
      throw error;
    }
  }

  // Mettre à jour les paramètres narratifs
  async updateNarrativeSettings(sessionId, settings) {
    try {
      const response = await apiClient.put(`${this.baseUrl}/settings/${sessionId}`, settings);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres:', error);
      throw error;
    }
  }

  // Générer un événement narratif spécial
  async generateSpecialEvent(context) {
    try {
      const response = await apiClient.post(`${this.baseUrl}/special-event`, {
        session_id: context.sessionId,
        event_type: context.eventType,
        trigger_conditions: context.triggerConditions,
        world_state: context.worldState,
        player_actions: context.playerActions,
        timestamp: context.timestamp || new Date().toISOString()
      });

      return response.data;
    } catch (error) {
      console.error('Erreur lors de la génération d\'événement spécial:', error);
      throw error;
    }
  }

  // Valider une action narrative
  async validateNarrativeAction(sessionId, action) {
    try {
      const response = await apiClient.post(`${this.baseUrl}/validate-action`, {
        session_id: sessionId,
        action: action,
        timestamp: new Date().toISOString()
      });

      return response.data;
    } catch (error) {
      console.error('Erreur lors de la validation de l\'action:', error);
      throw error;
    }
  }
}

export const narrativeService = new NarrativeService();

