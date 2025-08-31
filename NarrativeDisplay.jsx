import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { 
  BookOpen, 
  Play, 
  Pause,
  SkipForward,
  Volume2,
  VolumeX,
  Settings,
  Feather,
  Clock,
  User,
  MapPin
} from 'lucide-react';
import { useGame } from '../../contexts/GameContext';

const NarrativeDisplay = ({ gameState }) => {
  const { 
    narrative, 
    generateNarrative,
    gameSettings,
    updateSettings,
    loading 
  } = useGame();
  
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(gameSettings?.soundEnabled ?? true);
  const [narrativeSpeed, setNarrativeSpeed] = useState(gameSettings?.narrativeSpeed ?? 'normal');
  const scrollRef = useRef(null);

  const speedSettings = {
    slow: { delay: 3000, label: 'Lent' },
    normal: { delay: 2000, label: 'Normal' },
    fast: { delay: 1000, label: 'Rapide' }
  };

  useEffect(() => {
    if (narrative && narrative.length > 0) {
      setCurrentIndex(narrative.length - 1);
    }
  }, [narrative]);

  useEffect(() => {
    let interval;
    if (isAutoPlay && isPlaying && narrative && currentIndex < narrative.length - 1) {
      interval = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev < narrative.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, speedSettings[narrativeSpeed].delay);
    }
    return () => clearInterval(interval);
  }, [isAutoPlay, isPlaying, currentIndex, narrative, narrativeSpeed]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentIndex]);

  const handlePlayPause = () => {
    if (!narrative || narrative.length === 0) return;
    
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      if (currentIndex >= narrative.length - 1) {
        setCurrentIndex(0);
      }
    }
  };

  const handleNext = () => {
    if (narrative && currentIndex < narrative.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSpeedChange = (speed) => {
    setNarrativeSpeed(speed);
    updateSettings({ narrativeSpeed: speed });
  };

  const handleSoundToggle = () => {
    const newSoundEnabled = !soundEnabled;
    setSoundEnabled(newSoundEnabled);
    updateSettings({ soundEnabled: newSoundEnabled });
  };

  const handleGenerateNarrative = async () => {
    try {
      await generateNarrative({
        location: gameState?.world_state?.current_location,
        context: 'player_exploration',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de la génération narrative:', error);
    }
  };

  const formatNarrativeText = (text) => {
    if (!text) return '';
    
    // Ajouter des effets de style pour certains mots-clés
    return text
      .replace(/\*([^*]+)\*/g, '<em class="text-yellow-400 italic">$1</em>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-blue-400 font-bold">$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="text-green-400 bg-gray-700 px-1 rounded">$1</code>');
  };

  const NarrativeEntry = ({ entry, index, isActive = false, isVisible = true }) => {
    const entryText = entry.content || entry.description || entry.text || '';
    const entryType = entry.type || 'narrative';
    
    return (
      <div 
        className={`transition-all duration-500 ${
          isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
        } ${isActive ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
      >
        <Card className={`bg-gray-700 border-gray-600 mb-4 ${isActive ? 'bg-gray-650' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  entryType === 'dialogue' ? 'bg-green-600' :
                  entryType === 'action' ? 'bg-red-600' :
                  entryType === 'description' ? 'bg-purple-600' :
                  'bg-blue-600'
                }`}>
                  {entryType === 'dialogue' ? <User className="w-4 h-4 text-white" /> :
                   entryType === 'action' ? <Play className="w-4 h-4 text-white" /> :
                   entryType === 'description' ? <MapPin className="w-4 h-4 text-white" /> :
                   <Feather className="w-4 h-4 text-white" />}
                </div>
              </div>
              
              <div className="flex-1">
                <div 
                  className="text-gray-100 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: formatNarrativeText(entryText) }}
                />
                
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        entryType === 'dialogue' ? 'text-green-400 border-green-600' :
                        entryType === 'action' ? 'text-red-400 border-red-600' :
                        entryType === 'description' ? 'text-purple-400 border-purple-600' :
                        'text-blue-400 border-blue-600'
                      }`}
                    >
                      {entryType}
                    </Badge>
                    
                    {entry.location && (
                      <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
                        <MapPin className="w-3 h-3 mr-1" />
                        {entry.location}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>
                      {entry.timestamp 
                        ? new Date(entry.timestamp).toLocaleTimeString()
                        : `Entrée ${index + 1}`
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <Card className="w-full h-full bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <BookOpen className="mr-2" />
            Récit Narratif
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            {/* Contrôles de vitesse */}
            <div className="flex items-center space-x-1">
              {Object.entries(speedSettings).map(([speed, config]) => (
                <Button
                  key={speed}
                  variant={narrativeSpeed === speed ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSpeedChange(speed)}
                  className={`text-xs ${
                    narrativeSpeed === speed 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'text-gray-300 border-gray-600 hover:bg-gray-700'
                  }`}
                >
                  {config.label}
                </Button>
              ))}
            </div>
            
            {/* Contrôle du son */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSoundToggle}
              className="text-gray-300 border-gray-600 hover:bg-gray-700"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="h-[calc(100%-80px)] flex flex-col">
        {/* Zone d'affichage narratif */}
        <div className="flex-1 mb-4">
          <ScrollArea className="h-full" ref={scrollRef}>
            {narrative && narrative.length > 0 ? (
              <div className="space-y-2">
                {narrative.map((entry, index) => (
                  <NarrativeEntry
                    key={index}
                    entry={entry}
                    index={index}
                    isActive={index === currentIndex}
                    isVisible={!isAutoPlay || index <= currentIndex}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucun récit disponible</p>
                <p className="text-sm mt-2">Générez du contenu narratif pour commencer</p>
              </div>
            )}
          </ScrollArea>
        </div>
        
        {/* Contrôles de lecture */}
        <div className="border-t border-gray-600 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                onClick={handlePlayPause}
                disabled={!narrative || narrative.length === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              
              <Button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                variant="outline"
                className="text-gray-300 border-gray-600 hover:bg-gray-700"
              >
                ←
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={!narrative || currentIndex >= narrative.length - 1}
                variant="outline"
                className="text-gray-300 border-gray-600 hover:bg-gray-700"
              >
                →
              </Button>
              
              <Button
                onClick={() => setIsAutoPlay(!isAutoPlay)}
                variant="outline"
                className={`text-gray-300 border-gray-600 hover:bg-gray-700 ${
                  isAutoPlay ? 'bg-gray-700' : ''
                }`}
              >
                <SkipForward className="w-4 h-4 mr-2" />
                Auto
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              {narrative && narrative.length > 0 && (
                <span className="text-gray-400 text-sm">
                  {currentIndex + 1} / {narrative.length}
                </span>
              )}
              
              <Button
                onClick={handleGenerateNarrative}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Feather className="w-4 h-4 mr-2" />
                Générer
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NarrativeDisplay;

