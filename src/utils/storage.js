/**
 * Safe localStorage wrapper with error handling and fallback
 * Handles cases where localStorage is unavailable or quota exceeded
 */

class SafeStorage {
  constructor() {
    this.isAvailable = this.checkAvailability();
    this.memoryStorage = new Map(); // Fallback storage
  }

  /**
   * Check if localStorage is available
   */
  checkAvailability() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.warn('localStorage is not available, using memory storage fallback');
      return false;
    }
  }

  /**
   * Get item from storage
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if key doesn't exist
   * @returns {*} Retrieved value or default
   */
  getItem(key, defaultValue = null) {
    try {
      if (this.isAvailable) {
        const item = localStorage.getItem(key);
        return item !== null ? item : defaultValue;
      } else {
        return this.memoryStorage.get(key) ?? defaultValue;
      }
    } catch (error) {
      console.error(`Error getting item "${key}" from storage:`, error);
      return defaultValue;
    }
  }

  /**
   * Get and parse JSON from storage
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if key doesn't exist or parsing fails
   * @returns {*} Parsed value or default
   */
  getJSON(key, defaultValue = null) {
    try {
      const item = this.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (error) {
      console.error(`Error parsing JSON for key "${key}":`, error);
      return defaultValue;
    }
  }

  /**
   * Set item in storage
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @returns {boolean} Success status
   */
  setItem(key, value) {
    try {
      if (this.isAvailable) {
        localStorage.setItem(key, value);
      } else {
        this.memoryStorage.set(key, value);
      }
      return true;
    } catch (error) {
      console.error(`Error setting item "${key}" in storage:`, error);
      
      // Handle quota exceeded
      if (error.name === 'QuotaExceededError') {
        console.warn('Storage quota exceeded, attempting to clear old data');
        this.clearOldData();
        // Try one more time
        try {
          if (this.isAvailable) {
            localStorage.setItem(key, value);
          } else {
            this.memoryStorage.set(key, value);
          }
          return true;
        } catch (retryError) {
          console.error('Failed to set item after clearing old data:', retryError);
          return false;
        }
      }
      return false;
    }
  }

  /**
   * Set JSON in storage
   * @param {string} key - Storage key
   * @param {*} value - Value to stringify and store
   * @returns {boolean} Success status
   */
  setJSON(key, value) {
    try {
      const jsonString = JSON.stringify(value);
      return this.setItem(key, jsonString);
    } catch (error) {
      console.error(`Error stringifying value for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Remove item from storage
   * @param {string} key - Storage key
   * @returns {boolean} Success status
   */
  removeItem(key) {
    try {
      if (this.isAvailable) {
        localStorage.removeItem(key);
      } else {
        this.memoryStorage.delete(key);
      }
      return true;
    } catch (error) {
      console.error(`Error removing item "${key}" from storage:`, error);
      return false;
    }
  }

  /**
   * Clear all storage
   * @returns {boolean} Success status
   */
  clear() {
    try {
      if (this.isAvailable) {
        localStorage.clear();
      } else {
        this.memoryStorage.clear();
      }
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  /**
   * Clear old data to free up space
   * Removes items older than 30 days
   */
  clearOldData() {
    if (!this.isAvailable) return;

    try {
      const now = Date.now();
      const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
      
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        try {
          const item = localStorage.getItem(key);
          const data = JSON.parse(item);
          
          // Check if item has timestamp and is old
          if (data && data.timestamp && data.timestamp < thirtyDaysAgo) {
            localStorage.removeItem(key);
            console.log(`Removed old item: ${key}`);
          }
        } catch (e) {
          // Skip items that can't be parsed
        }
      });
    } catch (error) {
      console.error('Error clearing old data:', error);
    }
  }

  /**
   * Get all keys in storage
   * @returns {string[]} Array of keys
   */
  keys() {
    try {
      if (this.isAvailable) {
        return Object.keys(localStorage);
      } else {
        return Array.from(this.memoryStorage.keys());
      }
    } catch (error) {
      console.error('Error getting storage keys:', error);
      return [];
    }
  }

  /**
   * Check if key exists
   * @param {string} key - Storage key
   * @returns {boolean} True if key exists
   */
  has(key) {
    try {
      if (this.isAvailable) {
        return localStorage.getItem(key) !== null;
      } else {
        return this.memoryStorage.has(key);
      }
    } catch (error) {
      console.error(`Error checking if key "${key}" exists:`, error);
      return false;
    }
  }
}

// Export singleton instance
const storage = new SafeStorage();
export default storage;
