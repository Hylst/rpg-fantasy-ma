import { apiService } from './api.js';

class CharacterService {
  async createCharacter(characterData) {
    try {
      const response = await apiService.post('/user/create_character', characterData);
      return response;
    } catch (error) {
      console.error('Erreur lors de la création du personnage:', error);
      throw error;
    }
  }

  async generateCharacter(prompt) {
    try {
      const response = await apiService.post('/user/generate_character', { prompt });
      return response;
    } catch (error) {
      console.error('Erreur lors de la génération du personnage:', error);
      throw error;
    }
  }

  async getCharacter(sessionId) {
    try {
      const response = await apiService.get(`/user/character/${sessionId}`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération du personnage:', error);
      throw error;
    }
  }

  async updateCharacter(sessionId, updates) {
    try {
      const response = await apiService.put(`/user/character/${sessionId}`, updates);
      return response;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du personnage:', error);
      throw error;
    }
  }

  async levelUpCharacter(sessionId) {
    try {
      const response = await apiService.post(`/user/character/${sessionId}/level_up`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la montée de niveau:', error);
      throw error;
    }
  }

  async addExperience(sessionId, amount) {
    try {
      const response = await apiService.post(`/user/character/${sessionId}/add_experience`, { amount });
      return response;
    } catch (error) {
      console.error('Erreur lors de l\'ajout d\'expérience:', error);
      throw error;
    }
  }

  async manageInventory(sessionId, action, itemData) {
    try {
      const response = await apiService.post(`/user/character/${sessionId}/inventory`, {
        action,
        ...itemData
      });
      return response;
    } catch (error) {
      console.error('Erreur lors de la gestion de l\'inventaire:', error);
      throw error;
    }
  }
}

export const characterService = new CharacterService();
export default characterService;

