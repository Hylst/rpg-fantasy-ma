import { useState, useEffect, useCallback } from 'react';
import { narrativeService } from '../services/narrativeService.js';

export const useNarrative = (sessionId) => {
  const [narrativeHistory, setNarrativeHistory] = useState([]);
  const [currentNarrative, setCurrentNarrative] = useState(null);
  const [currentDecision, setCurrentDecision] = useState(null);
  const [currentMicroQuest, setCurrentMicroQuest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNarrativeHistory = useCallback(async (limit = 10) => {
    if (!sessionId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const history = await narrativeService.getNarrativeHistory(sessionId, limit);
      setNarrativeHistory(history);
    } catch (err) {
      setError(err.message);
      console.error('Erreur lors de la récupération de l\'historique narratif:', err);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const generateNarrative = useCallback(async (context = {}) => {
    if (!sessionId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const narrative = await narrativeService.generateNarrative(sessionId, context);
      setCurrentNarrative(narrative);
      // Ajouter à l'historique
      setNarrativeHistory(prev => [narrative, ...prev]);
      return narrative;
    } catch (err) {
      setError(err.message);
      console.error('Erreur lors de la génération narrative:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const createDecisionPoint = useCallback(async (situation) => {
    if (!sessionId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const decision = await narrativeService.createDecisionPoint(sessionId, situation);
      setCurrentDecision(decision);
      return decision;
    } catch (err) {
      setError(err.message);
      console.error('Erreur lors de la création du point de décision:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const processDecision = useCallback(async (decisionData) => {
    if (!sessionId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await narrativeService.processDecision(sessionId, decisionData);
      setCurrentDecision(null); // Effacer la décision actuelle
      // Générer une nouvelle narrative basée sur la décision
      if (result.narrative) {
        setCurrentNarrative(result.narrative);
        setNarrativeHistory(prev => [result.narrative, ...prev]);
      }
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Erreur lors du traitement de la décision:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const generateMicroQuest = useCallback(async (context = {}) => {
    if (!sessionId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const microQuest = await narrativeService.generateMicroQuest(sessionId, context);
      setCurrentMicroQuest(microQuest);
      return microQuest;
    } catch (err) {
      setError(err.message);
      console.error('Erreur lors de la génération de micro-quête:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const generateDialogue = useCallback(async (npcId, playerInput = '') => {
    if (!sessionId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const dialogue = await narrativeService.generateDialogue(sessionId, npcId, playerInput);
      return dialogue;
    } catch (err) {
      setError(err.message);
      console.error('Erreur lors de la génération de dialogue:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const updateNarrativeContext = useCallback(async (contextUpdates) => {
    if (!sessionId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await narrativeService.updateNarrativeContext(sessionId, contextUpdates);
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Erreur lors de la mise à jour du contexte narratif:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  // Charger l'historique initial
  useEffect(() => {
    fetchNarrativeHistory();
  }, [fetchNarrativeHistory]);

  // Fonctions utilitaires
  const clearCurrentDecision = useCallback(() => {
    setCurrentDecision(null);
  }, []);

  const clearCurrentMicroQuest = useCallback(() => {
    setCurrentMicroQuest(null);
  }, []);

  const addToHistory = useCallback((narrativeItem) => {
    setNarrativeHistory(prev => [narrativeItem, ...prev]);
  }, []);

  return {
    narrativeHistory,
    currentNarrative,
    currentDecision,
    currentMicroQuest,
    loading,
    error,
    fetchNarrativeHistory,
    generateNarrative,
    createDecisionPoint,
    processDecision,
    generateMicroQuest,
    generateDialogue,
    updateNarrativeContext,
    clearCurrentDecision,
    clearCurrentMicroQuest,
    addToHistory,
    // États dérivés
    hasActiveDecision: !!currentDecision,
    hasActiveMicroQuest: !!currentMicroQuest,
    latestNarrative: narrativeHistory[0] || null,
  };
};

