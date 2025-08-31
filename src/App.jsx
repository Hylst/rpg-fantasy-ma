import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { GameProvider } from './contexts/GameContext'
import HomePage from './pages/HomePage'
import CharacterCreation from './pages/CharacterCreation'
import GamePage from './pages/GamePage'
import './App.css'

/**
 * Main App component that handles routing and provides game context
 * Includes toast notifications for user feedback
 */
function App() {
  return (
    <GameProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/character-creation" element={<CharacterCreation />} />
          <Route path="/game" element={<GamePage />} />
        </Routes>
        <Toaster 
          position="top-right" 
          richColors 
          closeButton 
          duration={4000}
        />
      </div>
    </GameProvider>
  )
}

export default App