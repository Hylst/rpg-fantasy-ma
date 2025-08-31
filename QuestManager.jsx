import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { 
  Scroll, 
  CheckCircle, 
  Clock, 
  Star,
  Target,
  Gift,
  AlertTriangle,
  Trophy,
  MapPin,
  Users,
  Zap
} from 'lucide-react';
import { useGame } from '../../contexts/GameContext';

const QuestManager = ({ gameState }) => {
  const { 
    generateMicroQuest,
    processPlayerAction,
    loading 
  } = useGame();
  
  const [activeTab, setActiveTab] = useState('active');
  const [selectedQuest, setSelectedQuest] = useState(null);

  // Simuler des quêtes pour la démonstration
  const [quests, setQuests] = useState([
    {
      id: 'quest_1',
      title: 'Bienvenue au Village',
      description: 'Explorez le village et rencontrez ses habitants pour vous familiariser avec votre nouvel environnement.',
      type: 'main',
      status: 'active',
      progress: 60,
      objectives: [
        { id: 'obj_1', text: 'Parler au garde du village', completed: true },
        { id: 'obj_2', text: 'Visiter le marché', completed: true },
        { id: 'obj_3', text: 'Rencontrer le maire', completed: false },
        { id: 'obj_4', text: 'Explorer la taverne', completed: false }
      ],
      rewards: {
        experience: 100,
        gold: 50,
        items: ['Potion de soin']
      },
      location: 'village_square',
      giver: 'npc_guard',
      timeLimit: null,
      priority: 'high'
    },
    {
      id: 'quest_2',
      title: 'Collecte d\'Herbes',
      description: 'Le guérisseur du village a besoin d\'herbes médicinales qui poussent dans la forêt proche.',
      type: 'side',
      status: 'active',
      progress: 25,
      objectives: [
        { id: 'obj_5', text: 'Collecter 5 herbes de guérison', completed: false, current: 1, target: 5 },
        { id: 'obj_6', text: 'Retourner voir le guérisseur', completed: false }
      ],
      rewards: {
        experience: 50,
        gold: 25,
        items: ['Potion de mana', 'Recette de potion']
      },
      location: 'forest_path',
      giver: 'npc_healer',
      timeLimit: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
      priority: 'medium'
    },
    {
      id: 'quest_3',
      title: 'Le Mystère des Ruines',
      description: 'Des bruits étranges proviennent des anciennes ruines. Enquêtez sur ce phénomène mystérieux.',
      type: 'main',
      status: 'available',
      progress: 0,
      objectives: [
        { id: 'obj_7', text: 'Se rendre aux ruines anciennes', completed: false },
        { id: 'obj_8', text: 'Enquêter sur les bruits étranges', completed: false },
        { id: 'obj_9', text: 'Rapporter vos découvertes', completed: false }
      ],
      rewards: {
        experience: 200,
        gold: 100,
        items: ['Artefact mystérieux', 'Clé ancienne']
      },
      location: 'ancient_ruins',
      giver: 'npc_scholar',
      timeLimit: null,
      priority: 'high'
    }
  ]);

  const getQuestTypeColor = (type) => {
    switch (type) {
      case 'main': return 'bg-yellow-600';
      case 'side': return 'bg-blue-600';
      case 'daily': return 'bg-green-600';
      case 'event': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  const getQuestPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400 border-red-600';
      case 'medium': return 'text-yellow-400 border-yellow-600';
      case 'low': return 'text-green-400 border-green-600';
      default: return 'text-gray-400 border-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <Clock className="w-4 h-4 text-blue-400" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'available': return <Star className="w-4 h-4 text-yellow-400" />;
      default: return <Scroll className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleAcceptQuest = async (questId) => {
    try {
      setQuests(prev => prev.map(quest => 
        quest.id === questId 
          ? { ...quest, status: 'active' }
          : quest
      ));
      
      await processPlayerAction({
        type: 'accept_quest',
        target: questId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de l\'acceptation de la quête:', error);
    }
  };

  const handleAbandonQuest = async (questId) => {
    try {
      setQuests(prev => prev.map(quest => 
        quest.id === questId 
          ? { ...quest, status: 'available', progress: 0 }
          : quest
      ));
      
      await processPlayerAction({
        type: 'abandon_quest',
        target: questId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de l\'abandon de la quête:', error);
    }
  };

  const handleCompleteQuest = async (questId) => {
    try {
      setQuests(prev => prev.map(quest => 
        quest.id === questId 
          ? { ...quest, status: 'completed', progress: 100 }
          : quest
      ));
      
      await processPlayerAction({
        type: 'complete_quest',
        target: questId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de la finalisation de la quête:', error);
    }
  };

  const handleGenerateNewQuest = async () => {
    try {
      const newQuest = await generateMicroQuest({
        location: gameState?.world_state?.current_location,
        difficulty: 'medium',
        type: 'side'
      });
      
      if (newQuest) {
        setQuests(prev => [...prev, {
          ...newQuest,
          id: `quest_${Date.now()}`,
          status: 'available',
          progress: 0
        }]);
      }
    } catch (error) {
      console.error('Erreur lors de la génération de quête:', error);
    }
  };

  const QuestCard = ({ quest, showActions = true }) => {
    const completedObjectives = quest.objectives.filter(obj => obj.completed).length;
    const totalObjectives = quest.objectives.length;
    const isCompleted = quest.status === 'completed';
    const isActive = quest.status === 'active';
    const isAvailable = quest.status === 'available';

    return (
      <Card className={`bg-gray-700 border-gray-600 ${isCompleted ? 'opacity-75' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                {getStatusIcon(quest.status)}
                <CardTitle className="text-white text-lg">{quest.title}</CardTitle>
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${getQuestTypeColor(quest.type)} text-white`}
                >
                  {quest.type}
                </Badge>
              </div>
              <p className="text-gray-300 text-sm">{quest.description}</p>
            </div>
            {quest.priority && (
              <Badge 
                variant="outline" 
                className={`text-xs ${getQuestPriorityColor(quest.priority)}`}
              >
                {quest.priority}
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Progression */}
          {isActive && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300 text-sm">Progression</span>
                <span className="text-white text-sm">{completedObjectives}/{totalObjectives}</span>
              </div>
              <Progress value={quest.progress} className="h-2" />
            </div>
          )}

          {/* Objectifs */}
          <div className="mb-4">
            <h4 className="text-gray-300 font-medium mb-2 flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Objectifs
            </h4>
            <div className="space-y-2">
              {quest.objectives.map(objective => (
                <div key={objective.id} className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    objective.completed 
                      ? 'bg-green-600 border-green-600' 
                      : 'border-gray-400'
                  }`}>
                    {objective.completed && (
                      <CheckCircle className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className={`text-sm flex-1 ${
                    objective.completed ? 'text-green-400 line-through' : 'text-gray-300'
                  }`}>
                    {objective.text}
                    {objective.current !== undefined && objective.target !== undefined && (
                      <span className="ml-2 text-xs">
                        ({objective.current}/{objective.target})
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Récompenses */}
          <div className="mb-4">
            <h4 className="text-gray-300 font-medium mb-2 flex items-center">
              <Gift className="w-4 h-4 mr-2" />
              Récompenses
            </h4>
            <div className="flex flex-wrap gap-2">
              {quest.rewards.experience && (
                <Badge variant="outline" className="text-blue-400 border-blue-600">
                  +{quest.rewards.experience} XP
                </Badge>
              )}
              {quest.rewards.gold && (
                <Badge variant="outline" className="text-yellow-400 border-yellow-600">
                  +{quest.rewards.gold} Or
                </Badge>
              )}
              {quest.rewards.items?.map((item, index) => (
                <Badge key={index} variant="outline" className="text-purple-400 border-purple-600">
                  {item}
                </Badge>
              ))}
            </div>
          </div>

          {/* Informations supplémentaires */}
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 mb-4">
            <div className="flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              {quest.location}
            </div>
            <div className="flex items-center">
              <Users className="w-3 h-3 mr-1" />
              {quest.giver}
            </div>
            {quest.timeLimit && (
              <div className="flex items-center col-span-2">
                <Clock className="w-3 h-3 mr-1" />
                Expire: {quest.timeLimit.toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex space-x-2">
              {isAvailable && (
                <Button
                  onClick={() => handleAcceptQuest(quest.id)}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Accepter
                </Button>
              )}
              {isActive && quest.progress === 100 && (
                <Button
                  onClick={() => handleCompleteQuest(quest.id)}
                  disabled={loading}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Terminer
                </Button>
              )}
              {isActive && (
                <Button
                  onClick={() => handleAbandonQuest(quest.id)}
                  disabled={loading}
                  variant="destructive"
                >
                  Abandonner
                </Button>
              )}
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedQuest(quest)}
                    className="text-gray-300 border-gray-600 hover:bg-gray-700"
                  >
                    Détails
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                      {getStatusIcon(quest.status)}
                      <span>{quest.title}</span>
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                      {quest.description}
                    </DialogDescription>
                  </DialogHeader>
                  <QuestCard quest={quest} showActions={false} />
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const activeQuests = quests.filter(q => q.status === 'active');
  const availableQuests = quests.filter(q => q.status === 'available');
  const completedQuests = quests.filter(q => q.status === 'completed');

  return (
    <Card className="w-full h-full bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <Scroll className="mr-2" />
            Gestionnaire de Quêtes
          </CardTitle>
          <Button
            onClick={handleGenerateNewQuest}
            disabled={loading}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Zap className="w-4 h-4 mr-2" />
            Nouvelle quête
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="h-[calc(100%-80px)]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-700">
            <TabsTrigger value="active" className="data-[state=active]:bg-blue-600">
              <Clock className="w-4 h-4 mr-2" />
              Actives ({activeQuests.length})
            </TabsTrigger>
            <TabsTrigger value="available" className="data-[state=active]:bg-blue-600">
              <Star className="w-4 h-4 mr-2" />
              Disponibles ({availableQuests.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-blue-600">
              <Trophy className="w-4 h-4 mr-2" />
              Terminées ({completedQuests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4 h-[calc(100%-60px)]">
            <ScrollArea className="h-full">
              {activeQuests.length > 0 ? (
                <div className="space-y-4">
                  {activeQuests.map(quest => (
                    <QuestCard key={quest.id} quest={quest} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune quête active</p>
                  <p className="text-sm mt-2">Consultez les quêtes disponibles pour commencer</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="available" className="space-y-4 h-[calc(100%-60px)]">
            <ScrollArea className="h-full">
              {availableQuests.length > 0 ? (
                <div className="space-y-4">
                  {availableQuests.map(quest => (
                    <QuestCard key={quest.id} quest={quest} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune quête disponible</p>
                  <p className="text-sm mt-2">Explorez le monde pour découvrir de nouvelles quêtes</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="completed" className="space-y-4 h-[calc(100%-60px)]">
            <ScrollArea className="h-full">
              {completedQuests.length > 0 ? (
                <div className="space-y-4">
                  {completedQuests.map(quest => (
                    <QuestCard key={quest.id} quest={quest} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune quête terminée</p>
                  <p className="text-sm mt-2">Complétez des quêtes pour les voir ici</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default QuestManager;

