import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import { useGame } from '../contexts/GameContext'
import { ArrowLeft, Dice6, User, Sword, Zap, Heart } from 'lucide-react'

/**
 * Character creation page component
 * Allows players to create and customize their character
 */
const CharacterCreation = () => {
  const navigate = useNavigate()
  const { initializeGame, isLoading } = useGame()
  
  const [character, setCharacter] = useState({
    name: '',
    class: 'warrior',
    background: 'noble',
    stats: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    },
    appearance: {
      gender: 'male',
      race: 'human',
      hairColor: 'brown',
      eyeColor: 'brown'
    }
  })
  
  const [availablePoints, setAvailablePoints] = useState(27)
  
  const classes = [
    { id: 'warrior', name: 'Warrior', icon: Sword, description: 'Master of combat and weapons' },
    { id: 'mage', name: 'Mage', icon: Zap, description: 'Wielder of arcane magic' },
    { id: 'rogue', name: 'Rogue', icon: User, description: 'Stealthy and cunning' },
    { id: 'cleric', name: 'Cleric', icon: Heart, description: 'Divine healer and protector' }
  ]
  
  const races = [
    { id: 'human', name: 'Human', bonus: 'Versatile (+1 to all stats)' },
    { id: 'elf', name: 'Elf', bonus: 'Agile (+2 Dexterity)' },
    { id: 'dwarf', name: 'Dwarf', bonus: 'Hardy (+2 Constitution)' },
    { id: 'halfling', name: 'Halfling', bonus: 'Lucky (+2 Charisma)' }
  ]
  
  const backgrounds = [
    { id: 'noble', name: 'Noble', description: 'Born into privilege and power' },
    { id: 'commoner', name: 'Commoner', description: 'Humble origins, strong work ethic' },
    { id: 'scholar', name: 'Scholar', description: 'Devoted to learning and knowledge' },
    { id: 'criminal', name: 'Criminal', description: 'Life on the wrong side of the law' }
  ]
  
  /**
   * Handle stat point allocation
   */
  const adjustStat = (stat, change) => {
    const currentValue = character.stats[stat]
    const newValue = currentValue + change
    
    // Validate stat bounds (8-15 during creation)
    if (newValue < 8 || newValue > 15) return
    
    // Check if we have enough points
    if (change > 0 && availablePoints <= 0) return
    if (change < 0 && currentValue <= 8) return
    
    setCharacter(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        [stat]: newValue
      }
    }))
    
    setAvailablePoints(prev => prev - change)
  }
  
  /**
   * Randomize character stats
   */
  const randomizeStats = () => {
    const newStats = {
      strength: Math.floor(Math.random() * 8) + 8,
      dexterity: Math.floor(Math.random() * 8) + 8,
      constitution: Math.floor(Math.random() * 8) + 8,
      intelligence: Math.floor(Math.random() * 8) + 8,
      wisdom: Math.floor(Math.random() * 8) + 8,
      charisma: Math.floor(Math.random() * 8) + 8
    }
    
    const totalUsed = Object.values(newStats).reduce((sum, val) => sum + (val - 8), 0)
    setAvailablePoints(27 - totalUsed)
    
    setCharacter(prev => ({
      ...prev,
      stats: newStats
    }))
  }
  
  /**
   * Handle character creation submission
   */
  const handleCreateCharacter = async () => {
    if (!character.name.trim()) {
      alert('Please enter a character name')
      return
    }
    
    try {
      await initializeGame({
        character,
        startingLocation: 'tavern',
        difficulty: 'normal'
      })
      navigate('/game')
    } catch (error) {
      console.error('Failed to create character:', error)
      alert('Failed to create character. Please try again.')
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-4xl font-bold text-white ml-8">Create Your Character</h1>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Character Details */}
          <div className="space-y-6">
            {/* Name */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">Character Name</h2>
              <input
                type="text"
                value={character.name}
                onChange={(e) => setCharacter(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your character's name"
                className="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            
            {/* Class Selection */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">Choose Your Class</h2>
              <div className="grid grid-cols-2 gap-4">
                {classes.map((cls) => {
                  const Icon = cls.icon
                  return (
                    <button
                      key={cls.id}
                      onClick={() => setCharacter(prev => ({ ...prev, class: cls.id }))}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        character.class === cls.id
                          ? 'border-yellow-500 bg-yellow-500/20'
                          : 'border-white/30 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-8 h-8 text-white mx-auto mb-2" />
                      <h3 className="text-white font-semibold">{cls.name}</h3>
                      <p className="text-gray-300 text-sm">{cls.description}</p>
                    </button>
                  )
                })}
              </div>
            </div>
            
            {/* Race Selection */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">Choose Your Race</h2>
              <div className="space-y-2">
                {races.map((race) => (
                  <button
                    key={race.id}
                    onClick={() => setCharacter(prev => ({
                      ...prev,
                      appearance: { ...prev.appearance, race: race.id }
                    }))}
                    className={`w-full p-3 rounded-lg border transition-all text-left ${
                      character.appearance.race === race.id
                        ? 'border-yellow-500 bg-yellow-500/20'
                        : 'border-white/30 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-white font-semibold">{race.name}</span>
                      <span className="text-gray-300 text-sm">{race.bonus}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Stats and Background */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Ability Scores</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-white">Points: {availablePoints}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={randomizeStats}
                    className="text-white border-white/30"
                  >
                    <Dice6 className="w-4 h-4 mr-1" />
                    Random
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3">
                {Object.entries(character.stats).map(([stat, value]) => (
                  <div key={stat} className="flex items-center justify-between">
                    <span className="text-white capitalize font-medium">{stat}</span>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => adjustStat(stat, -1)}
                        disabled={value <= 8}
                        className="w-8 h-8 p-0 text-white border-white/30"
                      >
                        -
                      </Button>
                      <span className="text-white font-bold w-8 text-center">{value}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => adjustStat(stat, 1)}
                        disabled={value >= 15 || availablePoints <= 0}
                        className="w-8 h-8 p-0 text-white border-white/30"
                      >
                        +
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Background */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">Background</h2>
              <div className="space-y-2">
                {backgrounds.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => setCharacter(prev => ({ ...prev, background: bg.id }))}
                    className={`w-full p-3 rounded-lg border transition-all text-left ${
                      character.background === bg.id
                        ? 'border-yellow-500 bg-yellow-500/20'
                        : 'border-white/30 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-white font-semibold">{bg.name}</div>
                    <div className="text-gray-300 text-sm">{bg.description}</div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Create Button */}
            <Button
              size="lg"
              onClick={handleCreateCharacter}
              disabled={isLoading || !character.name.trim()}
              className="w-full bg-yellow-600 hover:bg-yellow-700"
            >
              {isLoading ? 'Creating Character...' : 'Begin Adventure'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CharacterCreation