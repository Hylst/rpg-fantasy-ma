import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';

const CharacterSheet = ({ character }) => {
  if (!character) {
    return (
      <Card className="w-[300px] bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Aucun Personnage</CardTitle>
          <CardDescription className="text-gray-400">Créez un personnage pour commencer</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { name, character_class, stats } = character;

  return (
    <Card className="w-[300px] bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">{name}</CardTitle>
        <CardDescription className="text-gray-400">
          <Badge variant="secondary" className="bg-blue-600 text-white">{character_class}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300">Santé</span>
            <span className="text-white">{stats.health}/{stats.max_health}</span>
          </div>
          <Progress value={(stats.health / stats.max_health) * 100} className="h-2" />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300">Mana</span>
            <span className="text-white">{stats.mana}/{stats.max_mana}</span>
          </div>
          <Progress value={(stats.mana / stats.max_mana) * 100} className="h-2 bg-blue-200" />
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Force:</span>
            <span className="text-white">{stats.strength}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Dextérité:</span>
            <span className="text-white">{stats.dexterity}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Intelligence:</span>
            <span className="text-white">{stats.intelligence}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Charisme:</span>
            <span className="text-white">{stats.charisma}</span>
          </div>
        </div>

        <div className="border-t border-gray-600 pt-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Niveau:</span>
            <span className="text-white">{stats.level}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Expérience:</span>
            <span className="text-white">{stats.experience}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CharacterSheet;

