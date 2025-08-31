import { useNavigate, Link } from 'react-router-dom';
import { storageManager } from '../../lib/storage/StorageManager';
import { supabase } from '../../lib/supabase';

// Import des images d'aventure
import dragonQuestImg from './dragon_quest.png';
import parisRevolutionImg from './paris_revolution.png';
import eldervikMagicImg from './eldervik_magic.png';

// Définition du type Adventure
interface Adventure {
  id: string;
  title: string;
  description: string;
  image_url: string;
  difficulty: string;
  type: string;
  mode: string;
  initial_story: string;
  created_at: string;
  updated_at: string;
}

interface AdventureSelectionProps {
  onStartAdventure: (adventureId: string) => void;
  playerData?: any; // Ajout de la prop playerData comme optionnelle
}

const AdventureSelection: React.FC<AdventureSelectionProps> = ({ onStartAdventure, playerData }) => {