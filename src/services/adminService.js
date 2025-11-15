// Admin Service - API client for admin panel functionality
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

class AdminService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method for making API requests
  async makeRequest(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const defaultOptions = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const response = await fetch(url, { ...defaultOptions, ...options });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Admin API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Get training status
  async getTrainingStatus() {
    return await this.makeRequest('/api/admin/training-status');
  }

  // Start training with files
  async startTraining(files) {
    const filesData = await Promise.all(
      files.map(async (file) => {
        const content = await this.readFileContent(file);
        return {
          name: file.name,
          content: content,
          size: file.size,
        };
      })
    );

    return await this.makeRequest('/api/admin/start-training', {
      method: 'POST',
      body: JSON.stringify({ files: filesData }),
    });
  }

  // Stop training
  async stopTraining() {
    return await this.makeRequest('/api/admin/stop-training', {
      method: 'POST',
    });
  }

  // Get model information
  async getModelInfo() {
    return await this.makeRequest('/api/admin/model-info');
  }

  // Upload files for training (alternative method using FormData)
  async uploadFiles(files) {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch(`${this.baseURL}/api/admin/upload-training-files`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Upload failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }

  // Helper method to read file content
  async readFileContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        resolve(event.target.result);
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      // Read as text for most file types
      if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
        reader.readAsText(file);
      } else {
        // For other files, read as text with UTF-8 encoding
        reader.readAsText(file, 'UTF-8');
      }
    });
  }

  // Validate files before upload
  validateFiles(files) {
    const errors = [];
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    files.forEach((file, index) => {
      // Check file size
      if (file.size > maxFileSize) {
        errors.push(`File ${file.name} is too large (max 10MB)`);
      }

      // Check file type (relaxed check)
      const isTextFile = file.name.endsWith('.txt') || 
                        file.name.endsWith('.md') || 
                        file.name.endsWith('.csv') ||
                        file.type.startsWith('text/');
      
      const isDocFile = allowedTypes.includes(file.type) || 
                       file.name.endsWith('.doc') || 
                       file.name.endsWith('.docx') ||
                       file.name.endsWith('.pdf');

      if (!isTextFile && !isDocFile) {
        errors.push(`File ${file.name} type not supported. Use .txt, .pdf, .doc, or .docx files`);
      }

      // Check for empty files
      if (file.size === 0) {
        errors.push(`File ${file.name} is empty`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  // Get system health status
  async getSystemHealth() {
    try {
      return await this.makeRequest('/api/admin/system-health');
    } catch (error) {
      return {
        success: false,
        data: {
          backend_status: 'error',
          model_status: 'unknown',
          training_status: 'unknown',
          error: error.message,
          last_check: new Date().toISOString(),
        }
      };
    }
  }

  // Get live statistics for real-time tracking
  async getLiveStats() {
    return await this.makeRequest('/api/admin/live-stats');
  }

  // Get user analytics
  async getUserAnalytics() {
    return await this.makeRequest('/api/admin/user-analytics');
  }

  // Format file size for display
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Format training time
  formatTrainingTime(startTime) {
    if (!startTime) return 'N/A';
    
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now - start;
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  // Estimate training time based on file count and sizes
  estimateTrainingTime(files) {
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const avgProcessingTime = 2; // seconds per MB
    const estimatedSeconds = (totalSize / (1024 * 1024)) * avgProcessingTime;
    
    const minutes = Math.ceil(estimatedSeconds / 60);
    
    if (minutes < 1) {
      return 'Less than 1 minute';
    } else if (minutes < 60) {
      return `About ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `About ${hours}h ${remainingMinutes}m`;
    }
  }

  // Get list of stored training data
  async getTrainingDataList() {
    return await this.makeRequest('/api/admin/training-data');
  }

  // Delete selected training data
  async deleteTrainingData(fileIds) {
    return await this.makeRequest('/api/admin/delete-training-data', {
      method: 'POST',
      body: JSON.stringify({ file_ids: fileIds }),
    });
  }

/**
* Get storage statistics for training data
*/
async getStorageStats() {
return await this.makeRequest('/api/admin/storage-stats');
}

/**
* Upload text content for training
* @param {Object} textData - Text content data
*/
async uploadTextContent(textData) {
return await this.makeRequest('/api/admin/upload-text-content', {
  method: 'POST',
  body: JSON.stringify(textData),
});
}

// Check if training is supported
async checkTrainingSupport() {
try {
const modelInfo = await this.getModelInfo();
return {
supported: true,
model_exists: modelInfo.model_exists,
model_size: modelInfo.model_size,
requirements_met: true,
};
} catch (error) {
return {
supported: false,
error: error.message,
requirements_met: false,
};
}
}
}

// Create and export a singleton instance
const adminService = new AdminService();
export default adminService;
