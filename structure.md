# Project Structure Documentation

## 🏗️ Architecture Overview

This RPG Fantasy Web Application follows a modern full-stack architecture with clear separation between frontend and backend concerns.

```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐
│   React Frontend │ ◄──────────────► │  Python Backend │
│   (Port 5173)   │                 │   (Port 5000)   │
└─────────────────┘                 └─────────────────┘
         │                                   │
         ▼                                   ▼
┌─────────────────┐                 ┌─────────────────┐
│  Browser State  │                 │   SQLite DB     │
│   (Zustand)     │                 │  (Game Data)    │
└─────────────────┘                 └─────────────────┘
```

## 📁 Directory Structure

### Root Level
```
RPG Fantasy Web App/
├── 📄 package.json              # Frontend dependencies & scripts
├── 📄 requirements.txt          # Python backend dependencies
├── 📄 vite.config.js           # Vite build configuration
├── 📄 tailwind.config.js       # Tailwind CSS configuration
├── 📄 postcss.config.js        # PostCSS configuration
├── 📄 .env.example             # Environment variables template
├── 📄 .env                     # Environment variables (gitignored)
├── 📄 about.md                 # Project overview
├── 📄 readme.md                # Installation & usage guide
├── 📄 structure.md             # This file - architecture docs
├── 📄 changelog.md             # Version history & roadmap
└── 📄 index.html               # HTML entry point
```

### Frontend Structure (`src/`)
```
src/
├── 📄 main.jsx                 # React application entry point
├── 📄 App.jsx                  # Main app component with routing
├── 📄 index.css                # Global styles & Tailwind imports
│
├── 📁 components/              # Reusable React components
│   └── (Future components)
│
├── 📁 pages/                   # Main application pages
│   ├── 📄 HomePage.jsx         # Landing page with navigation
│   ├── 📄 CharacterCreation.jsx # Character creation interface
│   └── 📄 GamePage.jsx         # Main game interface
│
├── 📁 contexts/                # React Context providers
│   └── 📄 GameContext.jsx      # Global game state management
│
├── 📁 services/                # API communication layer
│   ├── 📄 api.js              # HTTP client configuration
│   ├── 📄 narrativeService.js  # AI narrative API integration
│   └── 📄 simulationService.js # World simulation API calls
│
├── 📁 ui/                      # Reusable UI component library
│   ├── 📄 button.jsx          # Button component variants
│   ├── 📄 card.jsx            # Card container components
│   ├── 📄 input.jsx           # Form input components
│   ├── 📄 label.jsx           # Form label components
│   ├── 📄 select.jsx          # Dropdown select components
│   ├── 📄 textarea.jsx        # Multi-line text input
│   └── 📄 index.js            # Component exports
│
└── 📁 utils/                   # Utility functions
    └── 📄 cn.js               # CSS class name utilities
```

### Backend Structure
```
Backend Python Files/
├── 📄 app.py                   # Flask application entry point
├── 📄 narrative.py             # AI narrative generation engine
├── 📄 simulation.py            # World simulation engine
├── 📄 interaction.py           # Player interaction handling
└── 📄 models.py                # Database models (if exists)
```

## 🔧 Component Architecture

### Frontend Components Hierarchy

```
App.jsx (Router)
├── HomePage.jsx
│   ├── Button (UI)
│   └── Icons (Lucide)
│
├── CharacterCreation.jsx
│   ├── Card (UI)
│   ├── Input (UI)
│   ├── Select (UI)
│   ├── Label (UI)
│   └── Button (UI)
│
└── GamePage.jsx
    ├── Card (UI)
    ├── Textarea (UI)
    ├── Button (UI)
    └── Icons (Lucide)
```

### State Management Flow

```
GameContext (Zustand Store)
├── Player State
│   ├── Character Data
│   ├── Stats & Attributes
│   └── Inventory
│
├── World State
│   ├── Current Location
│   ├── NPCs & Relationships
│   └── Environmental Data
│
├── Narrative State
│   ├── Story History
│   ├── Current Scene
│   └── Available Actions
│
└── Actions
    ├── initializeGame()
    ├── processPlayerAction()
    ├── updatePlayerStats()
    └── loadGameState()
```

## 🌐 API Architecture

### Service Layer Pattern

```
Frontend Services
├── ApiService (Base HTTP Client)
│   ├── Request Interceptors
│   ├── Response Interceptors
│   ├── Error Handling
│   └── Authentication
│
├── NarrativeService
│   ├── processAction()
│   ├── generateLocationNarrative()
│   ├── handleDialogue()
│   ├── generateQuestNarrative()
│   ├── processCombat()
│   ├── getNarrativeHistory()
│   └── generateRandomEncounter()
│
└── SimulationService
    ├── processTick()
    ├── updateNPCBehaviors()
    ├── updateRelationships()
    ├── processDailyRoutines()
    ├── simulateEconomy()
    ├── processWeather()
    ├── getWorldStats()
    └── startAutoSimulation()
```

### Backend API Endpoints

```
Flask Application
├── /narrative/* (Narrative Blueprint)
│   ├── POST /narrative/action
│   ├── GET  /narrative/location
│   ├── POST /narrative/dialogue
│   ├── GET  /narrative/quest
│   ├── POST /narrative/combat
│   ├── GET  /narrative/history
│   └── GET  /narrative/encounter
│
├── /simulation/* (Simulation Blueprint)
│   ├── POST /simulation/tick
│   ├── PUT  /simulation/behaviors
│   ├── PUT  /simulation/relationships
│   ├── POST /simulation/routines
│   ├── POST /simulation/economy
│   ├── POST /simulation/weather
│   ├── GET  /simulation/stats
│   └── POST /simulation/auto
│
└── /interaction/* (Interaction Blueprint)
    ├── POST /interaction/player-action
    ├── GET  /interaction/available-actions
    └── POST /interaction/validate-action
```

## 🎨 UI/UX Architecture

### Design System

```
Tailwind CSS Configuration
├── Color Palette
│   ├── Primary: Slate tones
│   ├── Secondary: Accent colors
│   ├── Success: Green variants
│   ├── Warning: Yellow variants
│   └── Error: Red variants
│
├── Typography Scale
│   ├── Headings: text-xl to text-4xl
│   ├── Body: text-sm to text-base
│   └── Captions: text-xs
│
├── Spacing System
│   ├── Margins: m-1 to m-16
│   ├── Padding: p-1 to p-16
│   └── Gaps: gap-1 to gap-8
│
└── Component Variants
    ├── Button: default, destructive, outline, ghost
    ├── Card: default with header/content/footer
    └── Input: default with focus states
```

### Responsive Breakpoints

```
Tailwind Breakpoints
├── sm: 640px   # Small tablets
├── md: 768px   # Tablets
├── lg: 1024px  # Small desktops
├── xl: 1280px  # Desktops
└── 2xl: 1536px # Large desktops
```

## 🔄 Data Flow Architecture

### Request/Response Cycle

```
1. User Interaction
   ↓
2. React Component Event
   ↓
3. Zustand Action Dispatch
   ↓
4. Service Layer API Call
   ↓
5. Flask Route Handler
   ↓
6. Business Logic Processing
   ↓
7. Database Operations (if needed)
   ↓
8. AI API Calls (if needed)
   ↓
9. Response Formation
   ↓
10. Frontend State Update
    ↓
11. Component Re-render
    ↓
12. UI Update
```

### Error Handling Flow

```
Error Sources
├── Network Errors
│   ├── Connection timeouts
│   ├── Server unavailable
│   └── CORS issues
│
├── API Errors
│   ├── 4xx Client errors
│   ├── 5xx Server errors
│   └── Validation errors
│
├── AI Service Errors
│   ├── API key issues
│   ├── Rate limiting
│   └── Model unavailable
│
└── Frontend Errors
    ├── Component errors
    ├── State management
    └── Routing issues
```

## 🗄️ Database Schema (Conceptual)

```sql
-- Player Data
CREATE TABLE players (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100),
    class VARCHAR(50),
    race VARCHAR(50),
    level INTEGER,
    experience INTEGER,
    stats JSON,
    created_at TIMESTAMP
);

-- Game Sessions
CREATE TABLE game_sessions (
    id INTEGER PRIMARY KEY,
    player_id INTEGER,
    world_state JSON,
    narrative_history JSON,
    last_action TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id)
);

-- NPCs and World Data
CREATE TABLE npcs (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100),
    personality JSON,
    relationships JSON,
    location VARCHAR(100)
);
```

## 🔐 Security Architecture

### Frontend Security
- Environment variable protection
- Input validation and sanitization
- XSS prevention through React's built-in protection
- HTTPS enforcement in production

### Backend Security
- CORS configuration
- Request rate limiting
- Input validation
- SQL injection prevention (SQLAlchemy ORM)
- API key protection
- Session management

## 📦 Build & Deployment Architecture

### Development Environment
```
Development Stack
├── Vite Dev Server (Frontend)
│   ├── Hot Module Replacement
│   ├── Fast refresh
│   └── Source maps
│
└── Flask Dev Server (Backend)
    ├── Auto-reload
    ├── Debug mode
    └── Error tracebacks
```

### Production Build
```
Production Stack
├── Static Assets (dist/)
│   ├── Minified JavaScript
│   ├── Optimized CSS
│   └── Compressed images
│
└── WSGI Server (Gunicorn)
    ├── Multiple workers
    ├── Load balancing
    └── Process management
```

## 🔧 Configuration Management

### Environment Variables
```
Configuration Layers
├── .env.example (Template)
├── .env (Local development)
├── .env.production (Production)
└── System environment (Deployment)
```

### Feature Flags
```
Feature Configuration
├── AI_ENABLED
├── DEBUG_MODE
├── SIMULATION_ENABLED
├── MULTIPLAYER_ENABLED
└── ANALYTICS_ENABLED
```

## 📊 Performance Considerations

### Frontend Optimization
- Code splitting with React.lazy()
- Component memoization
- Virtual scrolling for large lists
- Image lazy loading
- Bundle size optimization

### Backend Optimization
- Database query optimization
- Caching strategies
- API response compression
- Connection pooling
- Background task processing

## 🧪 Testing Architecture

### Frontend Testing
```
Testing Strategy
├── Unit Tests (Jest/Vitest)
│   ├── Component testing
│   ├── Utility function tests
│   └── Service layer tests
│
├── Integration Tests
│   ├── API integration
│   ├── State management
│   └── User workflows
│
└── E2E Tests (Cypress/Playwright)
    ├── User journeys
    ├── Cross-browser testing
    └── Performance testing
```

### Backend Testing
```
Python Testing
├── Unit Tests (pytest)
│   ├── Route testing
│   ├── Business logic
│   └── Database operations
│
├── Integration Tests
│   ├── API endpoints
│   ├── Database integration
│   └── External service mocks
│
└── Load Testing
    ├── Concurrent users
    ├── API performance
    └── Database stress
```

---

*This structure documentation provides a comprehensive overview of the RPG Fantasy Web Application architecture, serving as a reference for developers and maintainers.*