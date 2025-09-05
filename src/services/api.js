import axios from 'axios';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 60000, // 60 seconds timeout for audio processing
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status);
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          throw new Error(data.message || 'Bad request. Please check your audio file.');
        case 413:
          throw new Error('File too large. Please use a smaller audio file.');
        case 415:
          throw new Error('Unsupported file format. Please use a supported audio format.');
        case 500:
          throw new Error('Server error. Please try again later.');
        default:
          throw new Error(data.message || `Server error (${status}). Please try again.`);
      }
    } else if (error.request) {
      // Network error
      throw new Error('Network error. Please check your connection and try again.');
    } else {
      // Other error
      throw new Error(error.message || 'An unexpected error occurred.');
    }
  }
);

/**
 * Transcribe audio using the backend API
 * @param {FormData} formData - FormData containing the audio file
 * @returns {Promise<Object>} Transcription result
 */
export const transcribeAudio = async (formData) => {
  try {
    const response = await api.post('/api/speech-to-text', formData);
    
    if (response.data.success) {
      return {
        text: response.data.data.text,
        confidence: response.data.data.confidence,
        language: response.data.data.language,
        filename: response.data.data.filename,
        timestamp: response.data.data.timestamp,
        duration: response.data.data.duration
      };
    } else {
      throw new Error(response.data.message || 'Transcription failed');
    }
  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
};

/**
 * Get supported languages from the backend
 * @returns {Promise<Array>} Array of supported languages
 */
export const getSupportedLanguages = async () => {
  try {
    const response = await api.get('/api/supported-languages');
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch supported languages');
    }
  } catch (error) {
    console.error('Error fetching supported languages:', error);
    throw error;
  }
};

/**
 * Check if the backend API is healthy
 * @returns {Promise<Object>} Health check result
 */
export const healthCheck = async () => {
  try {
    const response = await api.get('/');
    return response.data;
  } catch (error) {
    console.error('Health check error:', error);
    throw error;
  }
};

/**
 * Upload audio file with progress tracking
 * @param {FormData} formData - FormData containing the audio file
 * @param {Function} onProgress - Progress callback function
 * @returns {Promise<Object>} Transcription result
 */
export const transcribeAudioWithProgress = async (formData, onProgress) => {
  try {
    const response = await api.post('/api/speech-to-text', formData, {
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        if (onProgress) {
          onProgress(percentCompleted);
        }
      },
    });
    
    if (response.data.success) {
      return {
        text: response.data.data.text,
        confidence: response.data.data.confidence,
        language: response.data.data.language,
        filename: response.data.data.filename,
        timestamp: response.data.data.timestamp,
        duration: response.data.data.duration
      };
    } else {
      throw new Error(response.data.message || 'Transcription failed');
    }
  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
};

export default api;


