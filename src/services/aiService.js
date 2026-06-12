/**
 * AI Service - API client for connecting to the backend AI model
 * Handles all communication with the FastAPI backend
 */

// In development, use relative URLs (proxied by React dev server)
// In production, use absolute URL from environment variable
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';
const NETLIFY_TUTOR_FUNCTION_URL =
  process.env.REACT_APP_TUTOR_FUNCTION_URL || '/.netlify/functions/ask';

class AIService {
  constructor() {
    this.baseURL = API_BASE_URL;
    console.log('AI Service initialized with base URL:', this.baseURL || 'using proxy');
  }

  /**
   * Make API request with error handling
   */
  async makeRequest(endpoint, method = 'GET', data = null) {
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
      }

      const url = this.baseURL ? `${this.baseURL}${endpoint}` : endpoint;
      console.log(`Making ${method} request to:`, url);
      
      const response = await fetch(url, options);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      console.error('Request details:', {
        endpoint,
        method,
        baseURL: this.baseURL,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Check if API is online and model is loaded
   */
  async checkHealth() {
    try {
      const response = await this.makeRequest('/health');
      return {
        online: true,
        status: response.status,
        message: response.message,
      };
    } catch (error) {
      return {
        online: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate exam questions
   * @param {Object} params - Question generation parameters
   * @param {string} params.subject - Subject name
   * @param {string} params.topic - Topic name
   * @param {string} params.difficulty - Difficulty level (easy, medium, hard)
   * @param {string} params.question_type - Type of question
   * @param {number} params.num_questions - Number of questions to generate
   */
  async generateQuestion(params) {
    return await this.makeRequest('/api/generate-question', 'POST', params);
  }

  /**
   * Answer a student's question
   * @param {Object} params - Answer request parameters
   * @param {string} params.question - The question to answer
   * @param {string} params.context - Optional context for the question
   */
  async answerQuestion(params) {
    return await this.makeRequest('/api/answer-question', 'POST', params);
  }

  /**
   * Generate a complete exam
   * @param {Object} params - Exam generation parameters
   * @param {string} params.subject - Subject name
   * @param {Array<string>} params.topics - Array of topics
   * @param {number} params.num_questions - Number of questions
   * @param {string} params.difficulty - Difficulty level
   */
  async generateExam(params) {
    return await this.makeRequest('/api/generate-exam', 'POST', params);
  }

  /**
   * Chat with AI
   * @param {Object} params - Chat parameters
   * @param {string} params.message - User message
   * @param {Array} params.conversation_history - Previous messages
   * @param {string} params.user_name - User's name for personalization
   * @param {boolean} params.is_premium - Whether user has premium subscription
   * @param {string} params.user_id - User ID for tracking weaknesses
   */
  async chat(params) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    try {
      const response = await fetch(`${this.baseURL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
        signal: controller.signal,
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || error.message || `HTTP ${response.status}`);
      }
      return await response.json();
    } finally {
      clearTimeout(timeout);
    }
  }

  async uploadStudyDocuments(userId, files, subject = null) {
    const formData = new FormData();
    formData.append('user_id', userId);
    if (subject) formData.append('subject', subject);
    files.forEach((file) => formData.append('files', file));

    const response = await fetch(`${this.baseURL}/api/student/upload-documents`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || `Upload failed (${response.status})`);
    }
    return response.json();
  }

  async getStudentDocuments(userId) {
    return await this.makeRequest(`/api/student/documents/${encodeURIComponent(userId)}`);
  }

  async getStudentPerformance(userId) {
    return await this.makeRequest(`/api/student/performance/${encodeURIComponent(userId)}`);
  }

  async askTutor(params) {
    const question = (params && params.question) || '';
    const payload = { question };

    try {
      const response = await fetch(NETLIFY_TUTOR_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json().catch(() => ({}));
      if (data.answer) {
        return data.answer;
      }
      if (data.error) {
        throw new Error(data.error);
      }

      return 'Sorry, I could not generate a response.';
    } catch (error) {
      console.error('Tutor function request failed:', error);
      throw error;
    }
  }

  /**
   * Get API status
   */
  async getStatus() {
    return await this.makeRequest('/');
  }
}

// Export singleton instance
const aiService = new AIService();
export default aiService;
