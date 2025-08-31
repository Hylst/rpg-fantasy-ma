import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const InteractionPanel = ({ onPlayerAction, onDecisionMade, onMicroQuestCompleted, narrativeOutput }) => {
  const [playerInput, setPlayerInput] = useState('');

  const handleSendAction = () => {
    if (playerInput.trim()) {
      onPlayerAction(playerInput);
      setPlayerInput('');
    }
  };

  const handleDecisionClick = (decisionId, choice) => {
    onDecisionMade(decisionId, choice);
  };

  const handleMicroQuestCompleteClick = (questId) => {
    onMicroQuestCompleted(questId);
  };

  return (
    <Card className="w-full bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Interactions et Narration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="narrative-output bg-gray-700 p-4 rounded-md h-64 overflow-y-auto text-gray-200">
          {narrativeOutput ? narrativeOutput : "Bienvenue dans le monde. Que voulez-vous faire ?"}
        </div>
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Votre action..."
            value={playerInput}
            onChange={(e) => setPlayerInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendAction();
              }
            }}
            className="flex-grow bg-gray-700 border-gray-600 text-white placeholder-gray-400"
          />
          <Button onClick={handleSendAction} className="bg-blue-600 hover:bg-blue-700 text-white">
            Envoyer
          </Button>
        </div>

        {/* Placeholder for dynamic decisions and micro-quests */}
        {narrativeOutput && narrativeOutput.includes('Un choix s\'offre à vous:') && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">Décision:</h3>
            <Button onClick={() => handleDecisionClick('d1', 'Examiner les marchandises')} className="w-full bg-green-600 hover:bg-green-700 text-white">Examiner les marchandises</Button>
            <Button onClick={() => handleDecisionClick('d1', 'Passer mon chemin')} className="w-full bg-red-600 hover:bg-red-700 text-white">Passer mon chemin</Button>
          </div>
        )}

        {narrativeOutput && narrativeOutput.includes('Une nouvelle micro-quête apparaît:') && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">Micro-Quête:</h3>
            <Button onClick={() => handleMicroQuestCompleteClick('mq1')} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">Compléter la micro-quête (Retrouver le chat perdu)</Button>
          </div>
        )}

      </CardContent>
    </Card>
  );
};

export default InteractionPanel;


