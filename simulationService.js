import { apiClient } from './api';

class SimulationService {
  constructor() {
    this.baseUrl = '/simulation';
  }

  // Simuler le passage du temps dans le monde
  async simulateTimeStep(context) {
    try {
      const response = await apiClient.post(`${this.baseUrl}/time-step`, {
        session_id: context.sessionId,
        time_delta: context.timeDelta || 1,
        world_state: context.worldState,
        player_actions: context.playerActions || [],
        timestamp: context.timestamp || new Date().toISOString()
      });

      return response.data;
    } catch (error) {
      console.error('Erreur lors de la simulation temporelle:', error);
      throw error;
    }
  }

  // Simuler les interactions entre PNJ
  async simulateNPCInteractions(context) {
    try {
      const response = await apiClient.post(`${this.baseUrl}/npc-interactions`, {
        session_id: context.sessionId,
        location: context.location,
        npcs_involved: context.npcsInvolved || [],
        interaction_type: context.interactionType || 'social',
        world_context: context.worldContext,
        timestamp: context.timestamp || new Date().toISOString()
      });

      return response.data;
    } catch (error) {
      console.error('Erreur lors de la simulation d\'interactions PNJ:', error);
      throw error;
    }
  }

  // Mettre à jour les routines quotidiennes des PNJ
  async updateNPCRoutines(sessionId, timeOfDay) {
    try {
      const response = await apiClient.post(`${this.baseUrl}/npc-routines`, {
        session_id: sessionId,
        time_of_day: timeOfDay,
        timestamp: new Date().toISOString()
      });

      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des routines PNJ:', error);
      throw error;
    }
  }

  // Simuler l'économie locale
  async simulateEconomy(context) {
    try {
      const response = await apiClient.post(`${this.baseUrl}/economy`, {
        session_id: context.sessionId,
        location: context.location,
        market_events: context.marketEvents || [],
        player_transactions: context.playerTransactions || [],
        time_period: context.timePeriod || 'day',
        timestamp: context.timestamp || new Date().toISOString()
      });

      return response.data;
    } catch (error) {
      console.error('Erreur lors de la simulation économique:', error);
      throw error;
    }
  }

  // Gérer les relations entre factions
  async updateFactionRelations(context) {
    try {
      const response = await apiClient.post(`${this.baseUrl}/faction-relations`, {
        session_id: context.sessionId,
        faction_events: context.factionEvents || [],
        player_actions: context.playerActions || [],
        world_events: context.worldEvents || [],
        timestamp: context.timestamp || new Date().toISOString()
      });

      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des relations de faction:', error);
      throw error;
    }
  }

  // Simuler les événements météorologiques
  async simulateWeather(context) {
    try {
      const response = await apiClient.post(`${this.baseUrl}/weather`, {
        session_id: context.sessionId,
        current_weather: context.currentWeather,
        season: context.season || 'spring',
        location: context.location,
        time_delta: context.timeDelta || 1,
        timestamp: context.timestamp || new Date().toISOString()
      });

      return response.data;
    } catch (error) {
      console.error('Erreur lors de la simulation météorologique:', error);
      throw error;
    }
  }

  // Obtenir l'état actuel de la simulation
  async getSimulationState(sessionId) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/state/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'état de simulation:', error);
      throw error;
    }
  }

  // Analyser l'impact des actions du joueur
  async analyzePlayerImpact(context) {
    try {
      const response = await apiClient.post(`${this.baseUrl}/player-impact`, {
        session_id: context.sessionId,
        player_actions: context.playerActions,
        time_period: context.timePeriod || 'recent',
        analysis_type: context.analysisType || 'comprehensive',
        timestamp: context.timestamp || new Date().toISOString()
      });

      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'analyse d\'impact:', error);
      throw error;
    }
  }

  // Prédire les conséquences futures
  async predictConsequences(context) {
    try {
      const response = await apiClient.post(`${this.baseUrl}/predict-consequences`, {
        session_id: context.sessionId,
        proposed_action: context.proposedAction,
        current_state: context.currentState,
        prediction_horizon: context.predictionHorizon || 'short',
        timestamp: context.timestamp || new Date().toISOString()
      });

      return response.data;
    } catch (error) {
      console.error('Erreur lors de la prédiction de conséquences:', error);
      throw error;
    }
  }

  // Générer des événements aléatoires
  async generateRandomEvents(context) {
    try {
      const response = await apiClient.post(`${this.baseUrl}/random-events`, {
        session_id: context.sessionId,
        location: context.location,
        event_probability: context.eventProbability || 'normal',
        event_types: context.eventTypes || ['social', 'economic', 'environmental'],
        world_state: context.worldState,
        timestamp: context.timestamp || new Date().toISOString()
      });

      return response.data;
    } catch (error) {
      console.error('Erreur lors de la génération d\'événements aléatoires:', error);
      throw error;
    }
  }

  // Mettre à jour les paramètres de simulation
  async updateSimulationSettings(sessionId, settings) {
    try {
      const response = await apiClient.put(`${this.baseUrl}/settings/${sessionId}`, settings);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres de simulation:', error);
      throw error;
    }
  }

  // Obtenir les statistiques de simulation
  async getSimulationStats(sessionId, timeRange = 'day') {
    try {
      const response = await apiClient.get(`${this.baseUrl}/stats/${sessionId}?range=${timeRange}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  // Réinitialiser certains aspects de la simulation
  async resetSimulationAspect(sessionId, aspect) {
    try {
      const response = await apiClient.post(`${this.baseUrl}/reset/${sessionId}`, {
        aspect: aspect,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
      throw error;
    }
  }
}

export const simulationService = new SimulationService();

