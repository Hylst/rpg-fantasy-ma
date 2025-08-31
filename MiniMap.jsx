import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  MapPin, 
  Navigation, 
  Compass,
  Home,
  Trees,
  Castle,
  Swords
} from 'lucide-react';
import { useGame } from '../../contexts/GameContext';

const MiniMap = ({ gameState, className = "" }) => {
  const { processPlayerAction, loading } = useGame();
  const [hoveredLocation, setHoveredLocation] = useState(null);

  if (!gameState || !gameState.world_state) {
    return (
      <Card className={`bg-gray-800 border-gray-700 ${className}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center">
            <Compass className="mr-2 w-4 h-4" />
            Mini-Carte
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="text-gray-400 text-center text-xs">
            Chargement...
          </div>
        </CardContent>
      </Card>
    );
  }

  const { current_location, locations } = gameState.world_state;
  const currentLocationData = locations[current_location];

  const getLocationIcon = (type) => {
    switch (type) {
      case 'town': return <Home className="w-3 h-3" />;
      case 'wilderness': return <Trees className="w-3 h-3" />;
      case 'castle': return <Castle className="w-3 h-3" />;
      case 'dungeon': return <Swords className="w-3 h-3" />;
      default: return <MapPin className="w-3 h-3" />;
    }
  };

  const getLocationColor = (type, isCurrent = false) => {
    if (isCurrent) return 'bg-blue-500 border-blue-300';
    
    switch (type) {
      case 'town': return 'bg-green-600 border-green-400';
      case 'wilderness': return 'bg-emerald-600 border-emerald-400';
      case 'castle': return 'bg-purple-600 border-purple-400';
      case 'dungeon': return 'bg-red-600 border-red-400';
      default: return 'bg-gray-600 border-gray-400';
    }
  };

  const handleTravelTo = async (locationId) => {
    if (locationId === current_location) return;
    
    try {
      await processPlayerAction({
        type: 'travel',
        target: locationId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors du voyage:', error);
    }
  };

  // Créer une grille simple pour positionner les lieux
  const locationPositions = {
    'village_square': { x: 2, y: 2 },
    'forest_path': { x: 1, y: 1 },
    'mountain_pass': { x: 3, y: 1 },
    'ancient_ruins': { x: 1, y: 3 },
    'dark_cave': { x: 3, y: 3 },
    'royal_castle': { x: 2, y: 0 },
  };

  const gridSize = 4;

  return (
    <Card className={`bg-gray-800 border-gray-700 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-sm flex items-center justify-between">
          <div className="flex items-center">
            <Compass className="mr-2 w-4 h-4" />
            Mini-Carte
          </div>
          <Badge variant="outline" className="text-xs">
            {Object.keys(locations).length} lieux
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        {/* Grille de la carte */}
        <div className="relative bg-gray-900 rounded-lg p-2 mb-2">
          <div 
            className="grid gap-1"
            style={{ 
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              gridTemplateRows: `repeat(${gridSize}, 1fr)`,
              aspectRatio: '1'
            }}
          >
            {Array.from({ length: gridSize * gridSize }, (_, index) => {
              const x = index % gridSize;
              const y = Math.floor(index / gridSize);
              
              // Trouver le lieu à cette position
              const locationAtPosition = Object.entries(locations).find(([id, loc]) => {
                const pos = locationPositions[id] || { x: 0, y: 0 };
                return pos.x === x && pos.y === y;
              });

              if (locationAtPosition) {
                const [locationId, locationData] = locationAtPosition;
                const isCurrent = locationId === current_location;
                const isConnected = currentLocationData?.connections?.includes(locationId) || 
                                  locationId === 'village_square' || 
                                  isCurrent;

                return (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className={`
                      h-8 w-8 p-0 border-2 transition-all duration-200
                      ${getLocationColor(locationData.type, isCurrent)}
                      ${isConnected ? 'opacity-100 hover:scale-110' : 'opacity-50'}
                      ${hoveredLocation === locationId ? 'scale-110 shadow-lg' : ''}
                    `}
                    onClick={() => isConnected && handleTravelTo(locationId)}
                    onMouseEnter={() => setHoveredLocation(locationId)}
                    onMouseLeave={() => setHoveredLocation(null)}
                    disabled={loading || !isConnected}
                    title={locationData.name}
                  >
                    <div className="text-white">
                      {getLocationIcon(locationData.type)}
                    </div>
                  </Button>
                );
              }

              return (
                <div 
                  key={index} 
                  className="h-8 w-8 bg-gray-800 rounded border border-gray-700"
                />
              );
            })}
          </div>

          {/* Indicateur de position actuelle */}
          {currentLocationData && (
            <div className="absolute top-1 right-1">
              <div className="bg-blue-500 text-white text-xs px-1 py-0.5 rounded flex items-center">
                <Navigation className="w-3 h-3 mr-1" />
                Vous êtes ici
              </div>
            </div>
          )}
        </div>

        {/* Informations sur le lieu survolé */}
        {hoveredLocation && locations[hoveredLocation] && (
          <div className="bg-gray-700 rounded p-2 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-white font-medium">
                {locations[hoveredLocation].name}
              </span>
              <Badge 
                variant="secondary" 
                className={`text-xs ${getLocationColor(locations[hoveredLocation].type).split(' ')[0]} text-white`}
              >
                {locations[hoveredLocation].type}
              </Badge>
            </div>
            <p className="text-gray-300 text-xs">
              {locations[hoveredLocation].description}
            </p>
            {hoveredLocation !== current_location && (
              <div className="mt-1">
                {currentLocationData?.connections?.includes(hoveredLocation) || 
                 hoveredLocation === 'village_square' ? (
                  <span className="text-green-400 text-xs">✓ Accessible</span>
                ) : (
                  <span className="text-red-400 text-xs">✗ Non accessible</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Légende */}
        <div className="mt-2 text-xs">
          <div className="text-gray-400 mb-1">Légende:</div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-600 rounded mr-1"></div>
              <span className="text-gray-300">Ville</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-emerald-600 rounded mr-1"></div>
              <span className="text-gray-300">Nature</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-600 rounded mr-1"></div>
              <span className="text-gray-300">Château</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-600 rounded mr-1"></div>
              <span className="text-gray-300">Donjon</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MiniMap;

