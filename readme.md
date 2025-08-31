# RPG Fantasy Web Application

> A modern web-based Role-Playing Game with AI-powered narrative generation

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download here](https://python.org/)
- **Git** - [Download here](https://git-scm.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Web App de Jeu de Rôle Fantasy"
   ```

2. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Configuration**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env with your actual configuration
   # Add your AI API keys and other settings
   ```

5. **Database Setup**
   ```bash
   # Initialize the database (if using SQLite)
   python -c "from src.models import init_db; init_db()"
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   # In one terminal
   python app.py
   # Backend will run on http://localhost:5000
   ```

2. **Start the Frontend Development Server**
   ```bash
   # In another terminal
   npm run dev
   # Frontend will run on http://localhost:5173
   ```

3. **Open your browser**
   Navigate to `http://localhost:5173` to start playing!

## 🔧 Configuration

### Environment Variables

Edit your `.env` file with the following configurations:

#### Frontend Configuration
```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=RPG Fantasy Web App
VITE_APP_VERSION=1.0.0
```

#### Backend Configuration
```env
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///rpg_game.db
```

#### AI API Keys (Required for AI features)
```env
# At least one API key is required
OPENAI_API_KEY=sk-your-openai-key
DEEPSEEK_API_KEY=your-deepseek-key
OPENROUTER_API_KEY=your-openrouter-key
GROK_API_KEY=your-grok-key
GEMINI_API_KEY=your-gemini-key
HUGGINGFACE_API_KEY=your-huggingface-key
```

### Getting AI API Keys

1. **OpenAI** (Recommended): [platform.openai.com](https://platform.openai.com/)
2. **DeepSeek**: [platform.deepseek.com](https://platform.deepseek.com/)
3. **OpenRouter**: [openrouter.ai](https://openrouter.ai/)
4. **Grok**: [console.groq.com](https://console.groq.com/)
5. **Gemini**: [makersuite.google.com](https://makersuite.google.com/)
6. **Hugging Face**: [huggingface.co](https://huggingface.co/)

## 📁 Project Structure

```
RPG Fantasy Web App/
├── 📁 src/                     # Frontend React application
│   ├── 📁 components/          # Reusable React components
│   ├── 📁 pages/              # Main application pages
│   │   ├── HomePage.jsx       # Landing page
│   │   ├── CharacterCreation.jsx # Character creation
│   │   └── GamePage.jsx       # Main game interface
│   ├── 📁 services/           # API service layer
│   │   ├── api.js            # HTTP client configuration
│   │   ├── narrativeService.js # AI narrative integration
│   │   └── simulationService.js # World simulation
│   ├── 📁 contexts/           # React context providers
│   │   └── GameContext.jsx    # Global game state
│   ├── 📁 ui/                 # UI component library
│   │   ├── button.jsx        # Button component
│   │   ├── card.jsx          # Card components
│   │   ├── input.jsx         # Input components
│   │   └── index.js          # Component exports
│   └── 📁 utils/              # Utility functions
│       └── cn.js             # CSS class utilities
├── 📁 Backend Python Files/    # Backend application
│   ├── app.py                # Flask application entry
│   ├── narrative.py          # Narrative engine
│   ├── simulation.py         # World simulation
│   └── interaction.py        # Player interactions
├── 📄 package.json            # Frontend dependencies
├── 📄 requirements.txt        # Backend dependencies
├── 📄 vite.config.js         # Vite configuration
├── 📄 tailwind.config.js     # Tailwind CSS config
└── 📄 .env.example           # Environment template
```

## 🎮 How to Play

### 1. Character Creation
- Choose your character's name
- Select a class (Warrior, Mage, Rogue, Cleric, Ranger)
- Pick a race (Human, Elf, Dwarf, Halfling, Orc)
- Choose a background for roleplay flavor
- Allocate ability scores (27-point buy system)

### 2. Game Interface
- **Narrative Panel**: Read the AI-generated story
- **Character Stats**: Monitor health, mana, and abilities
- **Inventory**: Manage items and equipment
- **Action Input**: Type commands or choose quick actions
- **Chat History**: Review previous interactions

### 3. Game Commands
- `look around` - Examine your surroundings
- `talk to [NPC name]` - Initiate dialogue
- `go [direction]` - Move to different locations
- `use [item]` - Use items from inventory
- `attack [target]` - Engage in combat
- `cast [spell]` - Use magical abilities

## 🛠️ Development

### Available Scripts

```bash
# Frontend development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Backend development
python app.py        # Start Flask server
python -m pytest    # Run tests
```

### Code Structure Guidelines

- **Components**: Keep components under 300 lines
- **Services**: Separate API logic from UI components
- **State Management**: Use Zustand for global state
- **Styling**: Use Tailwind CSS utility classes
- **Error Handling**: Implement comprehensive error boundaries

## 🔍 Troubleshooting

### Common Issues

1. **"Module not found" errors**
   ```bash
   # Clear node modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Backend connection errors**
   - Check if Flask server is running on port 5000
   - Verify CORS settings in backend
   - Ensure `.env` file has correct `VITE_API_URL`

3. **AI features not working**
   - Verify API keys in `.env` file
   - Check API key validity and quotas
   - Review backend logs for API errors

4. **Database errors**
   ```bash
   # Reset database
   rm rpg_game.db
   python -c "from src.models import init_db; init_db()"
   ```

### Debug Mode

Enable debug logging:
```env
FLASK_DEBUG=True
LOG_LEVEL=DEBUG
```

## 🚀 Deployment

### Production Build

1. **Frontend**
   ```bash
   npm run build
   # Files will be in dist/ directory
   ```

2. **Backend**
   ```bash
   # Use production WSGI server
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

### Environment Setup

- Set `FLASK_ENV=production`
- Use secure `SECRET_KEY`
- Configure production database
- Set up proper CORS origins
- Enable HTTPS in production

## 📝 API Documentation

### Narrative Engine Endpoints
- `POST /narrative/action` - Process player action
- `GET /narrative/location` - Get location description
- `POST /narrative/dialogue` - Handle NPC dialogue
- `GET /narrative/history` - Retrieve narrative history

### Simulation Engine Endpoints
- `POST /simulation/tick` - Process game tick
- `PUT /simulation/behaviors` - Update NPC behaviors
- `PUT /simulation/relationships` - Update relationships
- `GET /simulation/stats` - Get world statistics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is for educational and demonstration purposes.

## 🆘 Support

If you encounter issues:
1. Check this README for common solutions
2. Review the console logs for error messages
3. Ensure all dependencies are properly installed
4. Verify environment configuration

---

**Happy Gaming! 🎲✨**