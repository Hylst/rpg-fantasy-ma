import { useState, useEffect, useCallback } from 'react';
import { simulationService } from '../services/simulationService.js';

export const useGameState = (sessionId) => {
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchGameState = useCallback(async () => {
    if (!sessionId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const state = await simulationService.getWorldState(sessionId);
      setGameState(state);
    } catch (err) {
      setError(err.message);
      console.error('Erreur lors de la récupération de l\'état du jeu:', err);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const updateGameState = useCallback(async (updates) => {
    if (!sessionId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedState = await simulationService.updateWorldState(sessionId, updates);
      setGameState(updatedState);
      return updatedState;
    } catch (err) {
      setError(err.message);
      console.error('Erreur lors de la mise à jour de l\'état du jeu:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const processPlayerAction = useCallback(async (action) => {
    if (!sessionId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await simulationService.processPlayerAction(sessionId, action);
      // Rafraîchir l'état du jeu après l'action
      await fetchGameState();
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Erreur lors du traitement de l\'action:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sessionId, fetchGameState]);

  const advanceTime = useCallback(async (timeAmount = 1) => {
    if (!sessionId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await simulationService.advanceTime(sessionId, timeAmount);
      // Rafraîchir l'état du jeu après l'avancement du temps
      await fetchGameState();
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Erreur lors de l\'avancement du temps:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sessionId, fetchGameState]);

  // Charger l'état initial
  useEffect(() => {
    fetchGameState();
  }, [fetchGameState]);

  // Auto-refresh périodique (optionnel)
  useEffect(() => {
    if (!sessionId) return;
    
    const interval = setInterval(() => {
      fetchGameState();
    }, 30000); // Rafraîchir toutes les 30 secondes
    
    return () => clearInterval(interval);
  }, [sessionId, fetchGameState]);

  return {
    gameState,
    loading,
    error,
    fetchGameState,
    updateGameState,
    processPlayerAction,
    advanceTime,
    // Getters utiles
    currentLocation: gameState?.world_state?.current_location,
    worldState: gameState?.world_state,
    npcs: gameState?.world_state?.npcs,
    locations: gameState?.world_state?.locations,
    globalEvents: gameState?.world_state?.global_events,
  };
};

