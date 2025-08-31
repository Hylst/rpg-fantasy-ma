import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { 
  MessageCircle, 
  Send, 
  User, 
  Bot,
  Heart,
  Angry,
  Smile,
  Meh,
  X,
  Loader2
} from 'lucide-react';
import { useGame } from '../../contexts/GameContext';

const NPCDialog = ({ npc, isOpen, onClose }) => {
  const { generateDialogue, loading } = useGame();
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && npc && messages.length === 0) {
      // Générer un message d'accueil initial
      handleInitialGreeting();
    }
  }, [isOpen, npc]);

  const handleInitialGreeting = async () => {
    if (!npc) return;
    
    setIsTyping(true);
    try {
      const response = await generateDialogue(npc.id, '');
      if (response && response.dialogue) {
        setMessages([{
          id: Date.now(),
          sender: 'npc',
          content: response.dialogue,
          timestamp: new Date(),
          emotion: response.emotion || 'neutral'
        }]);
      }
    } catch (error) {
      console.error('Erreur lors du dialogue initial:', error);
      setMessages([{
        id: Date.now(),
        sender: 'npc',
        content: `Bonjour ! Je suis ${npc.name}. Comment puis-je vous aider ?`,
        timestamp: new Date(),
        emotion: 'friendly'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim() || !npc) return;

    const playerMessage = {
      id: Date.now(),
      sender: 'player',
      content: currentInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, playerMessage]);
    setCurrentInput('');
    setIsTyping(true);

    try {
      const response = await generateDialogue(npc.id, currentInput);
      
      if (response && response.dialogue) {
        const npcMessage = {
          id: Date.now() + 1,
          sender: 'npc',
          content: response.dialogue,
          timestamp: new Date(),
          emotion: response.emotion || 'neutral',
          relationshipChange: response.relationship_change
        };

        setMessages(prev => [...prev, npcMessage]);
      }
    } catch (error) {
      console.error('Erreur lors du dialogue:', error);
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'npc',
        content: "Désolé, je n'ai pas bien compris. Pouvez-vous répéter ?",
        timestamp: new Date(),
        emotion: 'confused'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getEmotionIcon = (emotion) => {
    switch (emotion) {
      case 'happy':
      case 'friendly': return <Smile className="w-4 h-4 text-green-400" />;
      case 'angry':
      case 'hostile': return <Angry className="w-4 h-4 text-red-400" />;
      case 'love':
      case 'romantic': return <Heart className="w-4 h-4 text-pink-400" />;
      case 'sad':
      case 'disappointed': return <Meh className="w-4 h-4 text-blue-400" />;
      default: return <MessageCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getDispositionColor = (disposition) => {
    switch (disposition) {
      case 'friendly': return 'text-green-400 border-green-600';
      case 'hostile': return 'text-red-400 border-red-600';
      case 'neutral': return 'text-gray-400 border-gray-600';
      case 'romantic': return 'text-pink-400 border-pink-600';
      default: return 'text-gray-400 border-gray-600';
    }
  };

  if (!isOpen || !npc) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl h-[600px] bg-gray-800 border-gray-700 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-blue-600 text-white">
                  {npc.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-white text-lg">{npc.name}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {npc.type}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getDispositionColor(npc.disposition)}`}
                  >
                    {npc.disposition}
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-4">
          {/* Zone de messages */}
          <ScrollArea className="flex-1 mb-4 pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'player' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender === 'player'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-100'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.sender === 'npc' && (
                        <div className="flex-shrink-0 mt-1">
                          {getEmotionIcon(message.emotion)}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm">{message.content}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs opacity-70">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                          {message.relationshipChange && (
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                message.relationshipChange > 0 
                                  ? 'text-green-400 border-green-600' 
                                  : 'text-red-400 border-red-600'
                              }`}
                            >
                              {message.relationshipChange > 0 ? '+' : ''}{message.relationshipChange}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {message.sender === 'player' && (
                        <div className="flex-shrink-0 mt-1">
                          <User className="w-4 h-4 text-blue-200" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-700 text-gray-100 rounded-lg p-3 max-w-[80%]">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-4 h-4 text-gray-400" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Zone de saisie */}
          <div className="flex space-x-2">
            <Input
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tapez votre message..."
              className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              disabled={loading || isTyping}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!currentInput.trim() || loading || isTyping}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading || isTyping ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Actions rapides */}
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentInput("Bonjour, comment allez-vous ?")}
              className="text-gray-300 border-gray-600 hover:bg-gray-700"
              disabled={loading || isTyping}
            >
              Saluer
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentInput("Avez-vous des quêtes pour moi ?")}
              className="text-gray-300 border-gray-600 hover:bg-gray-700"
              disabled={loading || isTyping}
            >
              Demander une quête
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentInput("Que pouvez-vous me dire sur cet endroit ?")}
              className="text-gray-300 border-gray-600 hover:bg-gray-700"
              disabled={loading || isTyping}
            >
              Informations
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentInput("Au revoir !")}
              className="text-gray-300 border-gray-600 hover:bg-gray-700"
              disabled={loading || isTyping}
            >
              Dire au revoir
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NPCDialog;

