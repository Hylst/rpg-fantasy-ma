import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/home/HomePage';
import CharacterCreation from './components/character/CharacterCreation';
import GameInterface from './components/game/GameInterface';
import BackendGameInterface from './components/game/BackendGameInterface';
import AdventureSelection from './components/adventures/AdventureSelection';
import './App.css';

// Type pour les données du personnage
interface PlayerData {
  id?: string;
  name: string;
  race: string;
  gender: string;
  age: number;
  class: string;
  level: number;
  history?: string;
  alignment?: string;
  traits?: string[];
  skills?: string[];
  appearance?: string;
  aspirations?: string;
  avatarUrl?: string;
  inventory?: any[];
  quests?: any[];
}

const App: React.FC = () => {
  // État pour stocker les données du personnage actif
  const [playerData, setPlayerData] = useState<PlayerData>({
    name: 'Aventurier',
    race: 'Humain',
    gender: 'Masculin',
    age: 25,
    class: 'Guerrier',
    level: 1,
    inventory: [],
    quests: []
  });
  
  // État pour suivre si un personnage a été créé
  const [characterCreated, setCharacterCreated] = useState(false);
  
  // Fonction pour gérer la création d'un personnage
  const handleCharacterCreated = (character: any) => {
    setPlayerData({
      ...character,
      level: 1,
      inventory: [],
      quests: []
    });
    setCharacterCreated(true);
  };
  
  // Fonction pour démarrer une aventure
  const handleStartAdventure = (adventureId: string) => {
    console.log(`Démarrage de l'aventure: ${adventureId}`);
    // Stocker l'ID de l'aventure sélectionnée
    localStorage.setItem('selectedAdventureId', adventureId);
    
    // Récupérer les détails de l'aventure depuis le localStorage ou utiliser des valeurs par défaut
    const defaultAdventure = {
      id: adventureId,
      title: 'Aventure mystérieuse',
      initial_story: 'Vous vous lancez dans une aventure inconnue...'
    };
    
    try {
      const adventures = JSON.parse(localStorage.getItem('adventures') || '[]');
      const selectedAdventure = adventures.find((adv: any) => adv.id === adventureId) || defaultAdventure;
      localStorage.setItem('currentAdventure', JSON.stringify(selectedAdventure));
    } catch (error) {
      console.error('Erreur lors du chargement de l\'aventure:', error);
      localStorage.setItem('currentAdventure', JSON.stringify(defaultAdventure));
    }
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route 
            path="/character" 
            element={<CharacterCreation onCharacterCreated={handleCharacterCreated} />} 
          />
          <Route 
            path="/adventures" 
            element={
              <AdventureSelection 
                onStartAdventure={handleStartAdventure}
                playerData={playerData}
              />
            } 
          />
          <Route 
            path="/game" 
            element={
              characterCreated ? 
                <GameInterface playerData={playerData} /> : 
                <Navigate to="/character" replace />
            } 
          />
          <Route 
            path="/backend-game" 
            element={<BackendGameInterface playerData={playerData} />} 
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
