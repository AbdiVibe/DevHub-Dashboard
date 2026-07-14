export class StorageService {
  constructor() {
    this.prefix = 'devhub_';
  }

  set(key, value) {
    localStorage.setItem(this.prefix + key, JSON.stringify(value));
  }

  get(key) {
    const data = localStorage.getItem(this.prefix + key);
    return data ? JSON.parse(data) : null;
  }

  remove(key) {
    localStorage.removeItem(this.prefix + key);
  }

  clear() {
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
      .forEach(key => localStorage.removeItem(key));
  }
}