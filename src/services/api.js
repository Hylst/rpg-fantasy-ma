import axios from 'axios'

/**
 * Base API service class for handling HTTP requests
 * Provides centralized configuration and error handling
 */
export class ApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('auth_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )
    
    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        return response.data
      },
      (error) => {
        // Handle common errors
        if (error.response?.status === 401) {
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('auth_token')
          window.location.href = '/login'
        }
        
        const errorMessage = error.response?.data?.message || 
                           error.response?.data?.error || 
                           error.message || 
                           'An unexpected error occurred'
        
        return Promise.reject(new Error(errorMessage))
      }
    )
  }
  
  /**
   * GET request
   */
  async get(url, config = {}) {
    return this.client.get(url, config)
  }
  
  /**
   * POST request
   */
  async post(url, data = {}, config = {}) {
    return this.client.post(url, data, config)
  }
  
  /**
   * PUT request
   */
  async put(url, data = {}, config = {}) {
    return this.client.put(url, data, config)
  }
  
  /**
   * DELETE request
   */
  async delete(url, config = {}) {
    return this.client.delete(url, config)
  }
  
  /**
   * PATCH request
   */
  async patch(url, data = {}, config = {}) {
    return this.client.patch(url, data, config)
  }
  
  /**
   * Upload file
   */
  async uploadFile(url, file, onProgress = null) {
    const formData = new FormData()
    formData.append('file', file)
    
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
    
    if (onProgress) {
      config.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        onProgress(percentCompleted)
      }
    }
    
    return this.client.post(url, formData, config)
  }
  
  /**
   * Set authentication token
   */
  setAuthToken(token) {
    localStorage.setItem('auth_token', token)
  }
  
  /**
   * Clear authentication token
   */
  clearAuthToken() {
    localStorage.removeItem('auth_token')
  }
  
  /**
   * Get current auth token
   */
  getAuthToken() {
    return localStorage.getItem('auth_token')
  }
}

// Export singleton instance
export const apiService = new ApiService()
export default ApiService