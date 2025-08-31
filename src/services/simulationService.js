import { ApiService } from './api'

/**
 * Simulation service for handling world state updates and NPC behaviors
 * Manages communication with the simulation engine backend
 */
export class SimulationService {
  constructor() {
    this.apiService = new ApiService()
  }
  
  /**
   * Process simulation tick - updates world state and NPC behaviors
   * @param {Object} gameState - Current game state
   * @param {number} deltaTime - Time elapsed since last tick (in minutes)
   * @returns {Promise<Object>} Updated game state
   */
  async processTick(gameState, deltaTime = 1) {
    try {
      const response = await this.apiService.post('/simulation/tick', {
        game_state: gameState,
        delta_time: deltaTime
      })
      
      return {
        gameState: response.game_state,
        events: response.events || [],
        notifications: response.notifications || []
      }
    } catch (error) {
      console.error('Error processing simulation tick:', error)
      throw new Error(`Failed to process simulation tick: ${error.message}`)
    }
  }
  
  /**
   * Update NPC behaviors based on current world state
   * @param {Object} gameState - Current game state
   * @param {Array} npcIds - Optional array of specific NPC IDs to update
   * @returns {Promise<Object>} Updated NPC states and behaviors
   */
  async updateBehaviors(gameState, npcIds = []) {
    try {
      const response = await this.apiService.post('/simulation/update_behaviors', {
        game_state: gameState,
        npc_ids: npcIds
      })
      
      return {
        updatedNpcs: response.updated_npcs || [],
        behaviorChanges: response.behavior_changes || [],
        gameState: response.game_state
      }
    } catch (error) {
      console.error('Error updating NPC behaviors:', error)
      throw new Error(`Failed to update NPC behaviors: ${error.message}`)
    }
  }
  
  /**
   * Update relationships between NPCs and with the player
   * @param {Object} gameState - Current game state
   * @param {Object} relationshipChanges - Changes to apply to relationships
   * @returns {Promise<Object>} Updated relationship matrix
   */
  async updateRelationships(gameState, relationshipChanges = {}) {
    try {
      const response = await this.apiService.post('/simulation/update_relationships', {
        game_state: gameState,
        relationship_changes: relationshipChanges
      })
      
      return {
        relationships: response.relationships || {},
        socialEvents: response.social_events || [],
        gameState: response.game_state
      }
    } catch (error) {
      console.error('Error updating relationships:', error)
      throw new Error(`Failed to update relationships: ${error.message}`)
    }
  }
  
  /**
   * Process daily routines for all NPCs
   * @param {Object} gameState - Current game state
   * @param {string} timeOfDay - Current time of day (morning, afternoon, evening, night)
   * @returns {Promise<Object>} Updated NPC positions and activities
   */
  async processDailyRoutines(gameState, timeOfDay) {
    try {
      const response = await this.apiService.post('/simulation/process_daily_routines', {
        game_state: gameState,
        time_of_day: timeOfDay
      })
      
      return {
        npcUpdates: response.npc_updates || [],
        locationChanges: response.location_changes || [],
        gameState: response.game_state,
        routineEvents: response.routine_events || []
      }
    } catch (error) {
      console.error('Error processing daily routines:', error)
      throw new Error(`Failed to process daily routines: ${error.message}`)
    }
  }
  
  /**
   * Simulate economic changes in the world
   * @param {Object} gameState - Current game state
   * @param {Object} economicFactors - Factors affecting the economy
   * @returns {Promise<Object>} Updated economic state
   */
  async simulateEconomy(gameState, economicFactors = {}) {
    try {
      const response = await this.apiService.post('/simulation/economy', {
        game_state: gameState,
        economic_factors: economicFactors
      })
      
      return {
        priceChanges: response.price_changes || {},
        marketEvents: response.market_events || [],
        gameState: response.game_state
      }
    } catch (error) {
      console.error('Error simulating economy:', error)
      throw new Error(`Failed to simulate economy: ${error.message}`)
    }
  }
  
  /**
   * Process weather and environmental changes
   * @param {Object} gameState - Current game state
   * @param {number} timeElapsed - Time elapsed in game hours
   * @returns {Promise<Object>} Updated weather and environment
   */
  async processWeather(gameState, timeElapsed = 1) {
    try {
      const response = await this.apiService.post('/simulation/weather', {
        game_state: gameState,
        time_elapsed: timeElapsed
      })
      
      return {
        weather: response.weather,
        environmentalEffects: response.environmental_effects || [],
        gameState: response.game_state
      }
    } catch (error) {
      console.error('Error processing weather:', error)
      throw new Error(`Failed to process weather: ${error.message}`)
    }
  }
  
  /**
   * Get current world statistics and metrics
   * @param {Object} gameState - Current game state
   * @returns {Promise<Object>} World statistics
   */
  async getWorldStats(gameState) {
    try {
      const response = await this.apiService.post('/simulation/stats', {
        game_state: gameState
      })
      
      return {
        population: response.population || {},
        economy: response.economy || {},
        relationships: response.relationships || {},
        events: response.recent_events || []
      }
    } catch (error) {
      console.error('Error fetching world stats:', error)
      throw new Error(`Failed to fetch world stats: ${error.message}`)
    }
  }
  
  /**
   * Start automatic simulation updates
   * @param {Object} gameState - Current game state
   * @param {number} intervalMinutes - Update interval in minutes
   * @returns {Promise<string>} Simulation session ID
   */
  async startAutoSimulation(gameState, intervalMinutes = 5) {
    try {
      const response = await this.apiService.post('/simulation/start_auto', {
        game_state: gameState,
        interval_minutes: intervalMinutes
      })
      
      return response.session_id
    } catch (error) {
      console.error('Error starting auto simulation:', error)
      throw new Error(`Failed to start auto simulation: ${error.message}`)
    }
  }
  
  /**
   * Stop automatic simulation updates
   * @param {string} sessionId - Simulation session ID
   * @returns {Promise<boolean>} Success status
   */
  async stopAutoSimulation(sessionId) {
    try {
      const response = await this.apiService.post('/simulation/stop_auto', {
        session_id: sessionId
      })
      
      return response.success || false
    } catch (error) {
      console.error('Error stopping auto simulation:', error)
      throw new Error(`Failed to stop auto simulation: ${error.message}`)
    }
  }
}

// Export singleton instance
export const simulationService = new SimulationService()
export default SimulationService