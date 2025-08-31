// Client pour communiquer avec le backend - Architecture des 4 Moteurs

const API_BASE_URL = '/api';

// Types pour les requêtes et réponses
export interface LLMGenerateRequest {
  prompt: string;
  provider?: string;
  max_tokens?: number;
  temperature?: number;
}

export interface LLMGenerateResponse {
  success: boolean;
  response?: string;
  error?: string;
}

export interface ImageGenerateRequest {
  prompt: string;
  provider?: string;
}

export interface ImageGenerateResponse {
  success: boolean;
  image_url?: string;
  error?: string;
}

export interface ActionParseRequest {
  action: string;
  session_id: string;
}

export interface ActionValidateRequest {
  parsed_action: any;
  session_id: string;
}

export interface CompleteActionRequest {
  action: string;
  session_id: string;
}

export interface SessionCreateRequest {
  player_data: any;
  universe?: string;
  narrative_style?: string;
}

export interface StateUpdateRequest {
  session_id: string;
  updates: any;
}

export interface NarrativeGenerateRequest {
  session_id: string;
  parsed_action: any;
  validation_result: any;
}

export interface SimulationStepRequest {
  session_id: string;
  time_elapsed?: number;
}

class BackendClient {
  private async makeRequest(endpoint: string, method: string = 'GET', data?: any): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }
    
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Erreur lors de la requête ${method} ${url}:`, error);
      throw error;
    }
  }

  // ===== MOTEUR D'INTERACTION =====
  
  async processCompleteAction(request: CompleteActionRequest): Promise<any> {
    return this.makeRequest('/interaction/process_action', 'POST', request);
  }

  async parseAction(request: ActionParseRequest): Promise<any> {
    return this.makeRequest('/interaction/parse', 'POST', request);
  }

  async validateAction(request: ActionValidateRequest): Promise<any> {
    return this.makeRequest('/interaction/validate', 'POST', request);
  }

  // ===== MOTEUR D'ÉTAT =====
  
  async createSession(request: SessionCreateRequest): Promise<any> {
    return this.makeRequest('/state/sessions', 'POST', request);
  }

  async getSession(sessionId: string): Promise<any> {
    return this.makeRequest(`/state/sessions/${sessionId}`);
  }

  async updateSession(request: StateUpdateRequest): Promise<any> {
    return this.makeRequest(`/state/sessions/${request.session_id}`, 'PUT', request.updates);
  }

  async getGameState(sessionId: string): Promise<any> {
    return this.makeRequest(`/state/sessions/${sessionId}/state`);
  }

  async updateGameState(sessionId: string, updates: any): Promise<any> {
    return this.makeRequest(`/state/sessions/${sessionId}/state`, 'PUT', updates);
  }

  async saveSession(sessionId: string): Promise<any> {
    return this.makeRequest(`/state/sessions/${sessionId}/save`, 'POST');
  }

  async loadSession(sessionId: string): Promise<any> {
    return this.makeRequest(`/state/sessions/${sessionId}/load`, 'POST');
  }

  // ===== MOTEUR DE NARRATION =====
  
  async generateNarrative(request: NarrativeGenerateRequest): Promise<any> {
    return this.makeRequest('/narrative/generate', 'POST', request);
  }

  async getNarrativeStyles(): Promise<any> {
    return this.makeRequest('/narrative/styles');
  }

  async getNarrativeArcs(): Promise<any> {
    return this.makeRequest('/narrative/arcs');
  }

  // ===== MOTEUR DE SIMULATION =====
  
  async simulateWorldStep(request: SimulationStepRequest): Promise<any> {
    return this.makeRequest('/simulation/step', 'POST', request);
  }

  async getSimulationRules(): Promise<any> {
    return this.makeRequest('/simulation/rules');
  }

  async getNPCBehaviors(): Promise<any> {
    return this.makeRequest('/simulation/npc_behaviors');
  }

  // ===== LLM (Moteur de Narration Backend) =====
  
  async getLLMProviders(): Promise<any> {
    return this.makeRequest('/llm/providers');
  }

  async generateLLMText(request: LLMGenerateRequest): Promise<LLMGenerateResponse> {
    return this.makeRequest('/llm/generate', 'POST', request);
  }

  async testLLMProvider(provider: string): Promise<any> {
    return this.makeRequest('/llm/test', 'POST', { provider });
  }

  // ===== GÉNÉRATION D'IMAGES =====
  
  async generateImage(request: ImageGenerateRequest): Promise<ImageGenerateResponse> {
    return this.makeRequest('/images/generate', 'POST', request);
  }

  async getImageProviders(): Promise<any> {
    return this.makeRequest('/images/providers');
  }
}

export const backendClient = new BackendClient();

