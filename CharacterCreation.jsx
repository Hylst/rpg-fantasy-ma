import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

const CharacterCreation = ({ onCharacterCreated }) => {
  const [characterName, setCharacterName] = useState('');
  const [characterClass, setCharacterClass] = useState('');
  const [stats, setStats] = useState({
    health: 100,
    max_health: 100,
    mana: 50,
    max_mana: 50,
    strength: 10,
    dexterity: 10,
    intelligence: 10,
    charisma: 10,
    level: 1,
    experience: 0,
  });

  const handleStatChange = (stat, value) => {
    setStats(prevStats => ({
      ...prevStats,
      [stat]: parseInt(value, 10),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newCharacter = {
      name: characterName,
      character_class: characterClass,
      stats: stats,
      inventory: [],
      equipped_items: {},
    };
    onCharacterCreated(newCharacter);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
      <Card className="w-[400px] bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Création de Personnage</CardTitle>
          <CardDescription className="text-center text-gray-400">Donnez vie à votre héros !</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="characterName" className="text-gray-300">Nom du Personnage</Label>
              <Input
                id="characterName"
                type="text"
                placeholder="Entrez le nom de votre personnage"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
            <div>
              <Label htmlFor="characterClass" className="text-gray-300">Classe</Label>
              <Select onValueChange={setCharacterClass} value={characterClass}>
                <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Sélectionnez une classe" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 text-white border-gray-600">
                  <SelectItem value="Warrior">Guerrier</SelectItem>
                  <SelectItem value="Mage">Mage</SelectItem>
                  <SelectItem value="Rogue">Voleur</SelectItem>
                  <SelectItem value="Cleric">Clerc</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(stats).filter(([stat]) => !['health', 'max_health', 'mana', 'max_mana', 'level', 'experience'].includes(stat)).map(([stat, value]) => (
                <div key={stat}>
                  <Label htmlFor={stat} className="capitalize text-gray-300">{stat}</Label>
                  <Input
                    id={stat}
                    type="number"
                    value={value}
                    onChange={(e) => handleStatChange(stat, e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    min="1"
                    max="20"
                  />
                </div>
              ))}
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Créer le Personnage
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CharacterCreation;


