// Storage Service - Handles all localStorage operations
export class StorageService {
  constructor(prefix = 'devhub_') {
    this.prefix = prefix;
  }

  // Get a value from localStorage
  get(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(this.prefix + key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error('Storage get error:', error);
      return defaultValue;
    }
  }

  // Set a value in localStorage
  set(key, value) {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  }

  // Remove a value from localStorage
  remove(key) {
    try {
      localStorage.removeItem(this.prefix + key);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  }

  // Clear all values with this prefix
  clear() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  }

  // Get all keys with this prefix
  getAllKeys() {
    const keys = Object.keys(localStorage);
    return keys.filter(key => key.startsWith(this.prefix));
  }

  // Get all data as an object
  getAll() {
    const data = {};
    this.getAllKeys().forEach(key => {
      const cleanKey = key.replace(this.prefix, '');
      data[cleanKey] = this.get(cleanKey);
    });
    return data;
  }
}