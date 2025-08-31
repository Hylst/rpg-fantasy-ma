import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Image, Send, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import MarkdownRenderer from '../common/MarkdownRenderer';
import { backendLLMManager } from '../../lib/backend-llm-manager';
import { createBackendIllustrationGenerator } from '../../lib/backend-illustration-generator';
import { backendClient } from '../../lib/backend-client';

// Types pour l'interface
interface Message {
  type: 'system' | 'user' | 'ai';
  content: string;
  timestamp: Date;
  image?: string;
}

interface GameState {
  player: any;
  world: any;
  quests: any[];
  inventory: any[];
  stats: any;
}

interface BackendGameInterfaceProps {
  playerData: any;
  initialUniverse?: string;
  initialStyle?: string;
}

const BackendGameInterface: React.FC<BackendGameInterfaceProps> = ({
  playerData,
  initialUniverse = 'fantasy',
  initialStyle = 'epic'
}) => {
  // État du jeu
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [universe, setUniverse] = useState<string>(initialUniverse);
  const [narrativeStyle, setNarrativeStyle] = useState<string>(initialStyle);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [useEmojis, setUseEmojis] = useState<boolean>(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    player: playerData,
    world: { location: 'Début de l\'aventure', npcs: [], events: [] },
    quests: [],
    inventory: [],
    stats: { health: 100, mana: 100, experience: 0 }
  });
  
  // Références
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const illustrationGenerator = createBackendIllustrationGenerator();
  
  // Styles narratifs disponibles
  const styles = [
    { id: 'epic', name: 'Épique', description: 'Style grandiose avec des enjeux importants' },
    { id: 'dark', name: 'Sombre', description: 'Ambiance inquiétante et menaçante' },
    { id: 'humorous', name: 'Humoristique', description: 'Ton léger avec des touches d\'humour' },
    { id: 'poetic', name: 'Poétique', description: 'Descriptions lyriques et métaphoriques' },
    { id: 'realistic', name: 'Réaliste', description: 'Style direct et concret' },
    { id: 'mysterious', name: 'Mystérieux', description: 'Ambiance énigmatique et intrigante' }
  ];
  
  // Univers disponibles
  const universes = [
    { id: 'fantasy', name: 'Fantasy', description: 'Monde magique avec créatures fantastiques' },
    { id: 'sci-fi', name: 'Science-Fiction', description: 'Futur technologique et spatial' },
    { id: 'cyberpunk', name: 'Cyberpunk', description: 'Futur dystopique et technologique' },
    { id: 'steampunk', name: 'Steampunk', description: 'Époque victorienne avec technologie à vapeur' },
    { id: 'horror', name: 'Horreur', description: 'Ambiance terrifiante et surnaturelle' },
    { id: 'western', name: 'Western', description: 'Far West américain' },
    { id: 'modern', name: 'Moderne', description: 'Époque contemporaine' },
    { id: 'historical', name: 'Historique', description: 'Périodes historiques réelles' }
  ];

  // Effet pour faire défiler vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialisation du jeu
  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = async () => {
    // Créer une session backend
    try {
      const sessionResponse = await backendClient.createSession({
        player_data: {
          name: playerData?.name || 'Aventurier',
          level: playerData?.level || 1,
          class: playerData?.class || 'Aventurier',
          stats: playerData?.stats || { health: 100, mana: 100, strength: 10, dexterity: 10, intelligence: 10 }
        },
        universe: 'fantasy',
        narrative_style: narrativeStyle
      });

      if (sessionResponse.success && sessionResponse.session_id) {
        setSessionId(sessionResponse.session_id);
      } else {
        console.error('Erreur lors de la création de la session:', sessionResponse.error);
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la session:', error);
    }

    const welcomeMessage: Message = {
      type: 'system',
      content: `🎮 **Bienvenue dans votre aventure, ${playerData.name}!**\n\nVous êtes ${playerData.description}.\n\n*Tapez votre première action pour commencer l'aventure...*`,
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
    
    // Générer une image d'introduction
    try {
      setIsGeneratingImage(true);
      const introImage = await illustrationGenerator.generateCharacterPortrait(
        `${playerData.name}, ${playerData.description}`,
        { style: narrativeStyle }
      );
      setCurrentImage(introImage);
    } catch (error) {
      console.error('Erreur lors de la génération de l\'image d\'introduction:', error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isProcessing) return;

    const userMessage: Message = {
      type: 'user',
      content: userInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      if (!sessionId) {
        throw new Error('Session non initialisée');
      }

      // Étape 1: Parser l'action via le moteur d'interaction
      const parseResponse = await backendClient.parseAction({
        action: userInput,
        session_id: sessionId
      });

      if (!parseResponse.success) {
        throw new Error(parseResponse.error || 'Erreur lors du parsing');
      }

      const parsedAction = parseResponse.parsed_action;
      console.log('Action parsée:', parsedAction);

      // Étape 2: Valider l'action
      const validateResponse = await backendClient.validateAction({
        parsed_action: parsedAction,
        session_id: sessionId
      });

      if (!validateResponse.success) {
        throw new Error(validateResponse.error || 'Erreur lors de la validation');
      }

      const validation = validateResponse.validation;
      console.log('Validation:', validation);

      // Étape 3: Générer la réponse narrative
      const narrativePrompt = buildNarrativePrompt(userInput, parsedAction, validation);
      const aiResponse = await backendLLMManager.generateResponse(
        narrativePrompt,
        universe,
        narrativeStyle
      );

      const aiMessage: Message = {
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Étape 4: Générer une image si approprié
      if (shouldGenerateImage(parsedAction)) {
        await generateContextualImage(parsedAction, aiResponse);
      }

      // Étape 5: Mettre à jour l'état du jeu (simplifié pour cette phase)
      updateGameState(parsedAction);

    } catch (error) {
      console.error('Erreur lors du traitement de l\'action:', error);
      
      const errorMessage: Message = {
        type: 'system',
        content: `❌ **Erreur:** ${error instanceof Error ? error.message : 'Une erreur inattendue s\'est produite.'}`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
      setUserInput('');
    }
  };

  const buildNarrativePrompt = (userInput: string, parsedAction: any, validation: any): string => {
    let prompt = `Action du joueur: "${userInput}"\n`;
    prompt += `Type d'action: ${parsedAction.action_type}\n`;
    prompt += `Complexité: ${parsedAction.complexity}\n`;
    
    if (!validation.valid) {
      prompt += `Problèmes détectés: ${validation.issues.join(', ')}\n`;
      prompt += `Suggestions: ${validation.suggestions.join(', ')}\n`;
    }
    
    prompt += `\nContexte du joueur: ${JSON.stringify(gameState.player)}\n`;
    prompt += `Contexte du monde: ${JSON.stringify(gameState.world)}\n`;
    
    prompt += `\nGénère une réponse narrative immersive qui:
    1. Décrit les conséquences de l'action
    2. Fait progresser l'histoire
    3. Propose des choix ou des opportunités
    4. Maintient la cohérence avec l'univers ${universe} et le style ${narrativeStyle}`;
    
    return prompt;
  };

  const shouldGenerateImage = (parsedAction: any): boolean => {
    // Générer une image pour certains types d'actions
    return ['combat', 'exploration'].includes(parsedAction.action_type) && 
           Math.random() > 0.5; // 50% de chance pour éviter trop d'images
  };

  const generateContextualImage = async (parsedAction: any, aiResponse: string) => {
    try {
      setIsGeneratingImage(true);
      
      let imagePrompt = '';
      
      switch (parsedAction.action_type) {
        case 'combat':
          imagePrompt = `${gameState.player.name} in combat, ${universe} style`;
          break;
        case 'exploration':
          imagePrompt = `${gameState.player.name} exploring, ${gameState.world.location}, ${universe} environment`;
          break;
        default:
          imagePrompt = `${gameState.player.name}, ${aiResponse.substring(0, 100)}`;
      }
      
      const image = await illustrationGenerator.generateCharacterPortrait(
        imagePrompt,
        { style: narrativeStyle }
      );
      
      setCurrentImage(image);
    } catch (error) {
      console.error('Erreur lors de la génération d\'image contextuelle:', error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const updateGameState = (parsedAction: any) => {
    // Mise à jour simplifiée de l'état du jeu
    // Dans une implémentation complète, ceci serait géré par le moteur d'état
    setGameState(prev => ({
      ...prev,
      world: {
        ...prev.world,
        lastAction: parsedAction.action_type,
        lastActionTime: new Date()
      }
    }));
  };

  const handleSettingsChange = (setting: string, value: any) => {
    switch (setting) {
      case 'universe':
        setUniverse(value);
        break;
      case 'style':
        setNarrativeStyle(value);
        break;
      case 'emojis':
        setUseEmojis(value);
        backendLLMManager.setUseEmojis(value);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* En-tête */}
      <div className="flex items-center justify-between p-4 bg-black/20 backdrop-blur-sm border-b border-purple-500/20">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="text-purple-300 hover:text-white hover:bg-purple-500/20"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        
        <h1 className="text-xl font-bold text-white">
          {gameState.player.name} - {universes.find(u => u.id === universe)?.name}
        </h1>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          className="text-purple-300 hover:text-white hover:bg-purple-500/20"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Panneau principal */}
        <div className="flex-1 flex flex-col">
          {/* Zone des messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <Card key={index} className={`${
                message.type === 'user' 
                  ? 'ml-auto max-w-md bg-blue-600/20 border-blue-500/30' 
                  : message.type === 'ai'
                  ? 'mr-auto max-w-4xl bg-purple-600/20 border-purple-500/30'
                  : 'mx-auto max-w-2xl bg-green-600/20 border-green-500/30'
              } backdrop-blur-sm`}>
                <CardContent className="p-4">
                  <div className="text-sm text-gray-400 mb-2">
                    {message.type === 'user' ? '👤 Vous' : 
                     message.type === 'ai' ? '🎭 Maître du Jeu' : '🎮 Système'}
                    <span className="ml-2">{message.timestamp.toLocaleTimeString()}</span>
                  </div>
                  <MarkdownRenderer content={message.content} />
                </CardContent>
              </Card>
            ))}
            
            {isProcessing && (
              <Card className="mr-auto max-w-md bg-purple-600/20 border-purple-500/30 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                    <span className="text-purple-300">Le Maître du Jeu réfléchit...</span>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Zone de saisie */}
          <div className="p-4 bg-black/20 backdrop-blur-sm border-t border-purple-500/20">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Décrivez votre action..."
                disabled={isProcessing}
                className="flex-1 bg-slate-800/50 border-purple-500/30 text-white placeholder-gray-400"
              />
              <Button 
                type="submit" 
                disabled={isProcessing || !userInput.trim()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Panneau latéral */}
        <div className="w-80 bg-black/20 backdrop-blur-sm border-l border-purple-500/20 p-4 space-y-4">
          {/* Image actuelle */}
          <Card className="bg-slate-800/50 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center">
                <Image className="w-4 h-4 mr-2" />
                Illustration
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isGeneratingImage ? (
                <div className="aspect-square bg-slate-700 rounded-lg flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                </div>
              ) : currentImage ? (
                <img 
                  src={currentImage} 
                  alt="Illustration du jeu" 
                  className="w-full aspect-square object-cover rounded-lg"
                />
              ) : (
                <div className="aspect-square bg-slate-700 rounded-lg flex items-center justify-center text-gray-400">
                  Aucune image
                </div>
              )}
            </CardContent>
          </Card>

          {/* État du joueur */}
          <Card className="bg-slate-800/50 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white text-sm">État du Joueur</CardTitle>
            </CardHeader>
     
(Content truncated due to size limit. Use line ranges to read in chunks)