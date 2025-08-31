import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import { useGame } from '../contexts/GameContext'
import { 
  Home, 
  User, 
  Backpack, 
  Map, 
  Send, 
  Dice6,
  Heart,
  Shield,
  Zap,
  Coins
} from 'lucide-react'

/**
 * Main game page component
 * Provides the primary game interface with narrative, actions, and character info
 */
const GamePage = () => {
  const navigate = useNavigate()
  const { 
    gameState, 
    player, 
    currentNarrative, 
    narrativeHistory, 
    processAction, 
    isLoading, 
    error 
  } = useGame()
  
  const [playerInput, setPlayerInput] = useState('')
  const [activeTab, setActiveTab] = useState('story')
  
  // Redirect if no game state
  useEffect(() => {
    if (!gameState && !isLoading) {
      navigate('/')
    }
  }, [gameState, isLoading, navigate])
  
  /**
   * Handle player action submission
   */
  const handleSubmitAction = async () => {
    if (!playerInput.trim()) return
    
    try {
      await processAction(playerInput)
      setPlayerInput('')
    } catch (error) {
      console.error('Failed to process action:', error)
    }
  }
  
  /**
   * Handle quick action buttons
   */
  const handleQuickAction = async (action) => {
    try {
      await processAction(action)
    } catch (error) {
      console.error('Failed to process quick action:', error)
    }
  }
  
  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Loading your adventure...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-black/30 backdrop-blur-sm border-r border-white/20 flex flex-col">
          {/* Character Info */}
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="ml-3">
                <h2 className="text-white font-bold">{player?.name || 'Adventurer'}</h2>
                <p className="text-gray-300 text-sm capitalize">
                  {player?.class || 'Warrior'} • Level {player?.level || 1}
                </p>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center text-red-400">
                <Heart className="w-4 h-4 mr-1" />
                <span>{player?.stats?.hp || 100}/{player?.stats?.max_hp || 100}</span>
              </div>
              <div className="flex items-center text-blue-400">
                <Zap className="w-4 h-4 mr-1" />
                <span>{player?.stats?.mp || 50}/{player?.stats?.max_mp || 50}</span>
              </div>
              <div className="flex items-center text-gray-400">
                <Shield className="w-4 h-4 mr-1" />
                <span>AC {player?.stats?.armor_class || 15}</span>
              </div>
              <div className="flex items-center text-yellow-400">
                <Coins className="w-4 h-4 mr-1" />
                <span>{player?.inventory?.gold || 0}g</span>
              </div>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex border-b border-white/20">
            {[
              { id: 'story', label: 'Story', icon: Map },
              { id: 'inventory', label: 'Items', icon: Backpack },
              { id: 'character', label: 'Stats', icon: User }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 p-3 flex items-center justify-center transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white/20 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-1" />
                  <span className="text-xs">{tab.label}</span>
                </button>
              )
            })}
          </div>
          
          {/* Tab Content */}
          <div className="flex-1 p-4 overflow-y-auto">
            {activeTab === 'story' && (
              <div className="space-y-4">
                <h3 className="text-white font-semibold mb-2">Current Location</h3>
                <p className="text-gray-300 text-sm">
                  {gameState?.world_state?.current_location || 'Unknown Location'}
                </p>
                
                <h3 className="text-white font-semibold mb-2 mt-4">Quick Actions</h3>
                <div className="space-y-2">
                  {[
                    'Look around',
                    'Check inventory',
                    'Rest',
                    'Search for items'
                  ].map((action) => (
                    <Button
                      key={action}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction(action)}
                      className="w-full justify-start text-white border-white/30 hover:bg-white/10"
                      disabled={isLoading}
                    >
                      {action}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'inventory' && (
              <div className="space-y-4">
                <h3 className="text-white font-semibold mb-2">Inventory</h3>
                <div className="space-y-2">
                  {player?.inventory?.items?.length > 0 ? (
                    player.inventory.items.map((item, index) => (
                      <div key={index} className="bg-white/10 rounded p-2">
                        <div className="text-white text-sm font-medium">{item.name}</div>
                        <div className="text-gray-400 text-xs">{item.description}</div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">Your inventory is empty.</p>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'character' && (
              <div className="space-y-4">
                <h3 className="text-white font-semibold mb-2">Ability Scores</h3>
                <div className="space-y-2">
                  {player?.stats && Object.entries(player.stats)
                    .filter(([key]) => !['hp', 'mp', 'max_hp', 'max_mp', 'armor_class'].includes(key))
                    .map(([stat, value]) => (
                      <div key={stat} className="flex justify-between text-sm">
                        <span className="text-gray-300 capitalize">{stat}</span>
                        <span className="text-white font-medium">{value}</span>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </div>
          
          {/* Settings */}
          <div className="p-4 border-t border-white/20">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="w-full justify-start text-white hover:bg-white/10"
            >
              <Home className="w-4 h-4 mr-2" />
              Return to Home
            </Button>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Narrative Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-4">
              {/* Current Narrative */}
              {currentNarrative && (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                  <p className="text-white leading-relaxed">{currentNarrative}</p>
                </div>
              )}
              
              {/* Narrative History */}
              {narrativeHistory.map((entry, index) => (
                <div key={index} className={`rounded-lg p-4 ${
                  entry.type === 'user_action'
                    ? 'bg-blue-500/20 border border-blue-500/30 ml-8'
                    : 'bg-white/10 border border-white/20 mr-8'
                }`}>
                  <div className="flex items-start space-x-3">
                    {entry.type === 'user_action' ? (
                      <User className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                    ) : (
                      <Dice6 className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                    )}
                    <p className="text-white leading-relaxed">{entry.content}</p>
                  </div>
                </div>
              ))}
              
              {/* Error Display */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                  <p className="text-red-200">Error: {error}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Input Area */}
          <div className="p-6 border-t border-white/20 bg-black/20">
            <div className="max-w-4xl mx-auto">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={playerInput}
                  onChange={(e) => setPlayerInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmitAction()}
                  placeholder="What do you want to do?"
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSubmitAction}
                  disabled={isLoading || !playerInput.trim()}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GamePage