    basePrompt: string,
    type: 'character' | 'location' | 'combat' | 'item',
    style?: string
  ): Promise<string> {
    try {
      const response = await backendClient.enhancePrompt({
        prompt: basePrompt,
        type,
        style
      });
      
      if (response.success) {
        return response.enhanced_prompt;
      } else {
        // Fallback vers l'amélioration locale si le backend échoue
        return this.enhancePromptLocally(basePrompt, type, style);
      }
    } catch (error) {
      console.error('Erreur lors de l\'amélioration du prompt via le backend:', error);
      // Fallback vers l'amélioration locale