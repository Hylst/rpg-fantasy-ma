import { useState, useEffect, useCallback } from 'react';
import { characterService } from '../services/characterService.js';

export const useCharacter = (sessionId) => {
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCharacter = useCallback(async () => {
    if (!sessionId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const characterData = await characterService.getCharacter(sessionId);
      setCharacter(characterData);
    } catch (err) {
      setError(err.message);
      console.error('Erreur lors de la récupération du personnage:', err);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const createCharacter = useCallback(async (characterData) => {
    setLoading(true);
    setError(null);
    
    try {
      const newCharacter = await characterService.createCharacter(characterData);
      setCharacter(newCharacter);
      return newCharacter;
    } catch (err) {
      setError(err.message);
      console.error('Erreur lors de la création du personnage:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateCharacter = useCallback(async (prompt) => {
    setLoading(true);
    setError(null);
    
    try {
      const generatedCharacter = await characterService.generateCharacter(prompt);
      setCharacter(generatedCharacter);
      return generatedCharacter;
    } catch (err) {
      setError(err.message);
      console.error('Erreur lors de la génération du personnage:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCharacter = useCallback(async (updates) => {
    if (!sessionId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedCharacter = await characterService.updateCharacter(sessionId, updates);
      setCharacter(updatedCharacter);
      return updatedCharacter;
    } catch (err) {
      setError(err.message);
      console.error('Erreur lors de la mise à jour du personnage:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const levelUp = useCallback(async () => {
    if (!sessionId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await characterService.levelUpCharacter(sessionId);
      // Rafraîchir les données du personnage
      await fetchCharacter();
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Erreur lors de la montée de niveau:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sessionId, fetchCharacter]);

  const addExperience = useCallback(async (amount) => {
    if (!sessionId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await characterService.addExperience(sessionId, amount);
      // Rafraîchir les données du personnage
      await fetchCharacter();
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Erreur lors de l\'ajout d\'expérience:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sessionId, fetchCharacter]);

  const manageInventory = useCallback(async (action, itemData) => {
    if (!sessionId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await characterService.manageInventory(sessionId, action, itemData);
      // Rafraîchir les données du personnage
      await fetchCharacter();
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Erreur lors de la gestion de l\'inventaire:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sessionId, fetchCharacter]);

  // Charger le personnage initial
  useEffect(() => {
    fetchCharacter();
  }, [fetchCharacter]);

  // Calculer les statistiques dérivées
  const derivedStats = character ? {
    healthPercentage: (character.stats?.health / character.stats?.max_health) * 100,
    manaPercentage: (character.stats?.mana / character.stats?.max_mana) * 100,
    experienceToNextLevel: character.stats?.level ? (character.stats.level * 100) - character.stats?.experience : 0,
    canLevelUp: character.stats?.experience >= (character.stats?.level * 100),
  } : {};

  return {
    character,
    loading,
    error,
    fetchCharacter,
    createCharacter,
    generateCharacter,
    updateCharacter,
    levelUp,
    addExperience,
    manageInventory,
    // Getters utiles
    stats: character?.stats,
    inventory: character?.inventory,
    equippedItems: character?.equipped_items,
    derivedStats,
  };
};

