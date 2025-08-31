import { ApiService } from './api'

/**
 * Narrative service for handling story generation and player interactions
 * Manages communication with the narrative engine backend
 */
export class NarrativeService {
  constructor() {
    this.apiService = new ApiService()
  }
  
  /**
   * Process player action and generate narrative response
   * @param {Object} params - Action parameters
   * @param {Object} params.gameState - Current game state
   * @param {string} params.action - Player action description
   * @returns {Promise<Object>} Updated game state and narrative
   */
  async processAction({ gameState, action }) {
    try {
      const response = await this.apiService.post('/narrative/process_action', {
        game_state: gameState,
        action: action
      })
      
      return {
        gameState: response.game_state,
        narrative: response.narrative,
        choices: response.choices || [],
        consequences: response.consequences || []
      }
    } catch (error) {
      console.error('Error processing action:', error)
      throw new Error(`Failed to process action: ${error.message}`)
    }
  }
  
  /**
   * Generate initial narrative for a location
   * @param {Object} gameState - Current game state
   * @param {string} locationId - Location identifier
   * @returns {Promise<Object>} Location narrative and available actions
   */
  async generateLocationNarrative(gameState, locationId) {
    try {
      const response = await this.apiService.post('/narrative/location', {
        game_state: gameState,
        location_id: locationId
      })
      
      return {
        narrative: response.narrative,
        availableActions: response.available_actions || [],
        npcs: response.npcs || [],
        items: response.items || []
      }
    } catch (error) {
      console.error('Error generating location narrative:', error)
      throw new Error(`Failed to generate location narrative: ${error.message}`)
    }
  }
  
  /**
   * Handle dialogue with NPCs
   * @param {Object} params - Dialogue parameters
   * @param {Object} params.gameState - Current game state
   * @param {string} params.npcId - NPC identifier
   * @param {string} params.playerMessage - Player's message to NPC
   * @returns {Promise<Object>} NPC response and updated relationship
   */
  async handleDialogue({ gameState, npcId, playerMessage }) {
    try {
      const response = await this.apiService.post('/narrative/dialogue', {
        game_state: gameState,
        npc_id: npcId,
        player_message: playerMessage
      })
      
      return {
        npcResponse: response.npc_response,
        relationshipChange: response.relationship_change,
        gameState: response.game_state,
        questUpdates: response.quest_updates || []
      }
    } catch (error) {
      console.error('Error handling dialogue:', error)
      throw new Error(`Failed to handle dialogue: ${error.message}`)
    }
  }
  
  /**
   * Generate quest narrative and objectives
   * @param {Object} gameState - Current game state
   * @param {string} questId - Quest identifier
   * @returns {Promise<Object>} Quest narrative and objectives
   */
  async generateQuestNarrative(gameState, questId) {
    try {
      const response = await this.apiService.post('/narrative/quest', {
        game_state: gameState,
        quest_id: questId
      })
      
      return {
        narrative: response.narrative,
        objectives: response.objectives || [],
        rewards: response.rewards || [],
        difficulty: response.difficulty || 'medium'
      }
    } catch (error) {
      console.error('Error generating quest narrative:', error)
      throw new Error(`Failed to generate quest narrative: ${error.message}`)
    }
  }
  
  /**
   * Process combat encounter
   * @param {Object} params - Combat parameters
   * @param {Object} params.gameState - Current game state
   * @param {string} params.enemyId - Enemy identifier
   * @param {string} params.action - Combat action
   * @returns {Promise<Object>} Combat result and narrative
   */
  async processCombat({ gameState, enemyId, action }) {
    try {
      const response = await this.apiService.post('/narrative/combat', {
        game_state: gameState,
        enemy_id: enemyId,
        action: action
      })
      
      return {
        narrative: response.narrative,
        combatResult: response.combat_result,
        gameState: response.game_state,
        rewards: response.rewards || [],
        isComplete: response.is_complete || false
      }
    } catch (error) {
      console.error('Error processing combat:', error)
      throw new Error(`Failed to process combat: ${error.message}`)
    }
  }
  
  /**
   * Get narrative history for a game session
   * @param {string} sessionId - Game session identifier
   * @returns {Promise<Array>} Narrative history entries
   */
  async getNarrativeHistory(sessionId) {
    try {
      const response = await this.apiService.get(`/narrative/history/${sessionId}`)
      return response.history || []
    } catch (error) {
      console.error('Error fetching narrative history:', error)
      throw new Error(`Failed to fetch narrative history: ${error.message}`)
    }
  }
  
  /**
   * Generate random encounter
   * @param {Object} gameState - Current game state
   * @param {string} encounterType - Type of encounter (combat, social, environmental)
   * @returns {Promise<Object>} Random encounter details
   */
  async generateRandomEncounter(gameState, encounterType = 'random') {
    try {
      const response = await this.apiService.post('/narrative/random_encounter', {
        game_state: gameState,
        encounter_type: encounterType
      })
      
      return {
        narrative: response.narrative,
        encounterType: response.encounter_type,
        choices: response.choices || [],
        difficulty: response.difficulty || 'medium'
      }
    } catch (error) {
      console.error('Error generating random encounter:', error)
      throw new Error(`Failed to generate random encounter: ${error.message}`)
    }
  }
}

// Export singleton instance
export const narrativeService = new NarrativeService()
export default NarrativeService