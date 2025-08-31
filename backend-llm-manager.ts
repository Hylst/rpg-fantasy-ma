import { backendClient, LLMGenerateRequest, LLMGenerateResponse } from './backend-client';

// Types pour le gestionnaire LLM backend
export type BackendLLMProvider = 'deepseek' | 'openrouter' | 'gemini' | 'grok';

interface BackendLLMSettings {
  activeProvider: BackendLLMProvider;
  useEmojis: boolean;
}

// Classe pour gérer les LLM via le backend
class BackendLLMManager {
  private settings: BackendLLMSettings;
  private providers: any = {};
  
  constructor() {
    // Initialiser les paramètres par défaut
    this.settings = {
      activeProvider: 'deepseek',
      useEmojis: true
    };
    
    // Charger les paramètres depuis localStorage si disponibles
    this.loadSettings();
    
    // Charger les fournisseurs disponibles
    this.loadProviders();
  }

  // Charger les paramètres depuis localStorage
  private loadSettings(): void {
    try {
      const savedSettings = localStorage.getItem('backend-llm-settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        this.settings = { ...this.settings, ...parsed };
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres LLM:', error);
    }
  }

  // Sauvegarder les paramètres dans localStorage
  private saveSettings(): void {
    try {
      localStorage.setItem('backend-llm-settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres LLM:', error);
    }
  }

  // Charger les fournisseurs disponibles depuis le backend
  private async loadProviders(): Promise<void> {
    try {
      const response = await backendClient.getLLMProviders();
      this.providers = response.providers || {};
      
      // Mettre à jour le fournisseur actif si celui par défaut n'est pas disponible
      if (!this.providers[this.settings.activeProvider]?.available) {
        const availableProviders = Object.keys(this.providers).filter(
          provider => this.providers[provider].available
        );
        if (availableProviders.length > 0) {
          this.settings.activeProvider = availableProviders[0] as BackendLLMProvider;
          this.saveSettings();
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des fournisseurs:', error);
    }
  }

  // Générer du texte via le backend
  async generateText(
    prompt: string,
    options?: {
      provider?: BackendLLMProvider;
      maxTokens?: number;
      temperature?: number;
    }
  ): Promise<string> {
    try {
      const provider = options?.provider || this.settings.activeProvider;
      
      const request: LLMGenerateRequest = {
        provider,
        prompt,
        max_tokens: options?.maxTokens || 2000,
        temperature: options?.temperature || 0.7
      };

      const response: LLMGenerateResponse = await backendClient.generateLLMText(request);
      
      if (response.success) {
        return response.response || '';
      } else {
        throw new Error('Échec de la génération de texte');
      }
    } catch (error) {
      console.error('Erreur lors de la génération de texte:', error);
      throw error;
    }
  }

  // Générer une réponse avec contexte (interface compatible avec l'ancien système)
  async generateResponse(prompt: string, _universe: string = 'fantasy', _style: string = 'epic'): Promise<string> {
    // Le prompt système sera géré côté backend
    return this.generateText(prompt);
  }

  // Tester un fournisseur
  async testProvider(provider: BackendLLMProvider): Promise<{ success: boolean; message: string }> {
    try {
      // Test simple en générant une réponse courte
      const testResponse = await this.generateText(
        'Réponds simplement "Test réussi"',
        { provider: provider, maxTokens: 10 }
      );
      
      return {
        success: true,
        message: 'Test réussi - ' + testResponse.substring(0, 50)
      };
    } catch (error) {
      return {
        success: false,
        message: `Erreur lors du test: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      };
    }
  }

  // Obtenir les fournisseurs disponibles
  getProviders(): any {
    return this.providers;
  }

  // Obtenir le fournisseur actif
  getActiveProvider(): BackendLLMProvider {
    return this.settings.activeProvider;
  }

  // Définir le fournisseur actif
  setActiveProvider(provider: BackendLLMProvider): void {
    if (this.providers[provider]?.available) {
      this.settings.activeProvider = provider;
      this.saveSettings();
    } else {
      throw new Error(`Fournisseur ${provider} non disponible`);
    }
  }

  // Obtenir l'état d'utilisation des émojis
  getUseEmojis(): boolean {
    return this.settings.useEmojis;
  }

  // Définir l'utilisation des émojis
  setUseEmojis(useEmojis: boolean): void {
    this.settings.useEmojis = useEmojis;
    this.saveSettings();
  }

  // Obtenir un résumé de la configuration
  getConfigSummary(): { provider: string; model: string; hasKey: boolean } {
    const provider = this.settings.activeProvider;
    const providerInfo = this.providers[provider] || {};
    
    return {
      provider,
      model: providerInfo.model || 'Inconnu',
      hasKey: providerInfo.available || false
    };
  }

  // Méthodes de compatibilité avec l'ancienne interface
  addUserMessage(message: string): void {
    // Cette méthode était utilisée pour maintenir l'historique
    // Dans la nouvelle architecture, l'historique sera géré par le moteur d'état
    console.log('Message utilisateur ajouté:', message);
  }

  setNarrativeSettings(universe: string, style: string): void {
    // Ces paramètres seront maintenant passés directement dans les appels
    console.log(`Paramètres narratifs définis: ${universe}, ${style}`);
  }

  generateContextSummary(): string {
    // Cette fonctionnalité sera déplacée vers le moteur d'état
    return 'Résumé du contexte (à implémenter dans le moteur d\'état)';
  }

  saveContextToLocalStorage(): void {
    // Cette fonctionnalité sera déplacée vers le moteur d'état
    console.log('Sauvegarde du contexte (à implémenter dans le moteur d\'état)');
  }

  loadContextFromLocalStorage(): void {
    // Cette fonctionnalité sera déplacée vers le moteur d'état
    console.log('Chargement du contexte (à implémenter dans le moteur d\'état)');
  }
}

// Instance singleton du gestionnaire LLM backend
export const backendLLMManager = new BackendLLMManager();

