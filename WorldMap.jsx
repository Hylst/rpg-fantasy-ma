import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { MapPin, Users, Box } from 'lucide-react';

const WorldMap = ({ gameState }) => {
  if (!gameState || !gameState.world_state) {
    return (
      <Card className="w-full bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Chargement du Monde...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const { current_location, locations, npcs, global_events } = gameState.world_state;
  const currentLocationData = locations[current_location];

  if (!currentLocationData) {
    return (
      <Card className="w-full bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Localisation Inconnue</CardTitle>
          <CardContent className="text-gray-400">Impossible de trouver les données pour la localisation actuelle.</CardContent>
        </CardHeader>
      </Card>
    );
  }

  const npcsInLocation = Object.values(npcs).filter(npc => npc.location === current_location);
  const itemsInLocation = currentLocationData.items || [];

  return (
    <Card className="w-full bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <MapPin className="mr-2" /> {currentLocationData.name}
        </CardTitle>
        <p className="text-gray-400 text-sm">{currentLocationData.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Personnages (PNJ)</h3>
          {npcsInLocation.length > 0 ? (
            <ul className="list-disc list-inside text-gray-300">
              {npcsInLocation.map(npc => (
                <li key={npc.id} className="flex items-center">
                  <Users className="mr-2 w-4 h-4" /> {npc.name} ({npc.type})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">Aucun PNJ visible ici.</p>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Objets</h3>
          {itemsInLocation.length > 0 ? (
            <ul className="list-disc list-inside text-gray-300">
              {itemsInLocation.map(item => (
                <li key={item.id} className="flex items-center">
                  <Box className="mr-2 w-4 h-4" /> {item.name} ({item.type})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">Aucun objet visible ici.</p>
          )}
        </div>

        {global_events && global_events.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Événements Mondiaux</h3>
            <ul className="list-disc list-inside text-gray-300">
              {global_events.map((event, index) => (
                <li key={index}>{event.description}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorldMap;


