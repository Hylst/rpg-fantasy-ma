import { createContext, useContext } from 'react'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { ApiService } from '../services/api'
import { NarrativeService } from '../services/narrativeService'
import { SimulationService } from '../services/simulationService'

/**
 * Game state store using Zustand for state management
 * Handles player data, world state, and game interactions
 */
const useGameStore = create(
  devtools(
    (set, get) => ({
      // Game state
      gameState: null,
      isLoading: false,
      error: null,
      
      // Services
      apiService: new ApiService(),
      narrativeService: new NarrativeService(),
      simulationService: new SimulationService(),
      
      // Player data
      player: null,
      
      // World state
      currentLocation: null,
      timeOfDay: 'day',
      weather: 'clear',
      
      // Narrative
      narrativeHistory: [],
      currentNarrative: '',
      
      // Actions
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      
      /**
       * Initialize a new game session
       */
      initializeGame: async (playerData) => {
        set({ isLoading: true, error: null })
        try {
          const { apiService } = get()
          const gameState = await apiService.post('/game/initialize', playerData)
          set({ 
            gameState,
            player: gameState.player,
            currentLocation: gameState.world_state.current_location,
            timeOfDay: gameState.world_state.time_of_day,
            weather: gameState.world_state.weather,
            isLoading: false
          })
          return gameState
        } catch (error) {
          set({ error: error.message, isLoading: false })
          throw error
        }
      },
      
      /**
       * Load existing game state
       */
      loadGameState: async (sessionId) => {
        set({ isLoading: true, error: null })
        try {
          const { apiService } = get()
          const gameState = await apiService.get(`/game/state/${sessionId}`)
          set({ 
            gameState,
            player: gameState.player,
            currentLocation: gameState.world_state.current_location,
            timeOfDay: gameState.world_state.time_of_day,
            weather: gameState.world_state.weather,
            narrativeHistory: gameState.narrative_history,
            isLoading: false
          })
          return gameState
        } catch (error) {
          set({ error: error.message, isLoading: false })
          throw error
        }
      },
      
      /**
       * Process player action and update game state
       */
      processAction: async (action) => {
        set({ isLoading: true, error: null })
        try {
          const { gameState, narrativeService } = get()
          const response = await narrativeService.processAction({
            gameState,
            action
          })
          
          set({ 
            gameState: response.gameState,
            currentNarrative: response.narrative,
            narrativeHistory: [...get().narrativeHistory, {
              type: 'user_action',
              content: action,
              timestamp: new Date().toISOString()
            }, {
              type: 'ai_response',
              content: response.narrative,
              timestamp: new Date().toISOString()
            }],
            isLoading: false
          })
          
          return response
        } catch (error) {
          set({ error: error.message, isLoading: false })
          throw error
        }
      },
      
      /**
       * Update player stats
       */
      updatePlayerStats: (stats) => {
        const { gameState } = get()
        if (gameState) {
          const updatedGameState = {
            ...gameState,
            player: {
              ...gameState.player,
              stats: { ...gameState.player.stats, ...stats }
            }
          }
          set({ gameState: updatedGameState, player: updatedGameState.player })
        }
      },
      
      /**
       * Clear game state (logout/reset)
       */
      clearGameState: () => {
        set({
          gameState: null,
          player: null,
          currentLocation: null,
          timeOfDay: 'day',
          weather: 'clear',
          narrativeHistory: [],
          currentNarrative: '',
          error: null
        })
      }
    }),
    {
      name: 'rpg-game-store'
    }
  )
)

// Context for providing the store
const GameContext = createContext(null)

/**
 * Game context provider component
 * Wraps the application to provide game state access
 */
export const GameProvider = ({ children }) => {
  const store = useGameStore()
  
  return (
    <GameContext.Provider value={store}>
      {children}
    </GameContext.Provider>
  )
}

/**
 * Hook to access game context
 * Provides access to game state and actions
 */
export const useGame = () => {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}

/**
 * Hook to access game store directly (alternative to context)
 */
export const useGameState = useGameStore

export default GameContext