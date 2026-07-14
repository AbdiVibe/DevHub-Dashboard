// Main Application - DevHub Dashboard
import { StorageService } from './services/storage.js';
import { WeatherService } from './services/weather.js';
import { GitHubService } from './services/github.js';

class DevHubApp {
  constructor() {
    // Initialize services
    this.storage = new StorageService();
    this.weather = new WeatherService();
    this.github = new GitHubService();
    
    // State
    this.tasks = this.storage.get('tasks') || [];
    this.notes = this.storage.get('notes') || [];
    this.skills = this.storage.get('skills') || [];
    this.username = this.storage.get('username') || 'Developer';
    this.streak = this.storage.get('streak') || 0;
    this.darkMode = this.storage.get('dark') || false;
    
    // DOM refs
    this.els = {};
    this.initDOM();
    this.init();
  }

  initDOM() {
    const $ = (id) => document.getElementById(id);
    this.els = {
      username: $('username'),
      datetime: $('datetime'),
      quote: $('quote'),
      projectsCount: $('projects-count'),
      codingHours: $('coding-hours'),
      learningGoal: $('learning-goal'),
      githubRepos: $('github-repos'),
      taskList: $('task-list'),
      taskProgress: $('task-progress'),
      notesContainer: $('notes-container'),
      skillsContainer: $('skills-container'),
      calendar: $('calendar'),
      streakCount: $('streak-count'),
      weatherResult: $('weather-result'),
      githubResult: $('github-result'),
      cityInput: $('city-input'),
      githubUsername: $('github-username'),
      taskInput: $('task-input'),
      taskCategory: $('task-category'),
      noteSearch: $('note-search'),
      skillName: $('skill-name'),
      skillProgress: $('skill-progress'),
      changeUsername: $('change-username'),
      passwordOutput: $('password-output'),
      jsonOutput: $('json-output'),
      charInput: $('char-input'),
      charCount: $('char-count'),
      mdInput: $('md-input'),
      mdPreview: $('md-preview')
    };
  }

  init() {
    this.applyTheme();
    this.renderTasks();
    this.renderNotes();
    this.renderSkills();
    this.renderCalendar();
    this.updateWelcome();
    this.setupEventListeners();
    this.generatePassword();
    this.formatJson();
    this.countChars();
    this.renderMarkdown();
    this.startClock();
  }

  setupEventListeners() {
    // Weather
    document.getElementById('weather-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.weather.fetchWeather(this.els.cityInput.value || 'London');
    });

    // GitHub
    document.getElementById('github-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.github.analyzeUser(this.els.githubUsername.value || 'octocat');
    });

    // Tasks
    document.getElementById('task-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.addTask();
    });

    // Notes
    document.getElementById('add-note').addEventListener('click', () => {
      this.addNote();
    });
    this.els.noteSearch.addEventListener('input', () => {
      this.renderNotes();
    });

    // Skills
    document.getElementById('skill-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.addSkill();
    });

    // Settings
    document.getElementById('save-username').addEventListener('click', () => {
      this.updateUsername();
    });
    document.getElementById('toggle-theme').addEventListener('click', () => {
      this.toggleTheme();
    });
    document.getElementById('reset-data').addEventListener('click', () => {
      this.resetData();
    });

    // Tools
    document.getElementById('gen-password').addEventListener('click', () => {
      this.generatePassword();
    });
    document.getElementById('format-json').addEventListener('click', () => {
      this.formatJson();
    });
    this.els.charInput.addEventListener('input', () => {
      this.countChars();
    });
    this.els.mdInput.addEventListener('input', () => {
      this.renderMarkdown();
    });

    // Sidebar navigation
    document.querySelectorAll('.sidebar a').forEach(link => {
      link.addEventListener('click', function(e) {
        document.querySelectorAll('.sidebar a').forEach(a => a.classList.remove('active'));
        this.classList.add('active');
      });
    });
  }

  // ===== TASKS =====
  addTask() {
    const text = this.els.taskInput.value.trim();
    const category = this.els.taskCategory.value;
    if (text) {
      this.tasks.push({ text, category, done: false, created: Date.now() });
      this.saveAndRender('tasks');
      this.els.taskInput.value = '';
    }
  }

  renderTasks() {
    this.els.taskList.innerHTML = '';
    let done = 0;
    this.tasks.forEach((t, i) => {
      const li = document.createElement('li');
      li.className = 'task-item' + (t.done ? ' completed' : '');
      li.innerHTML = `
        <span>${t.text} <small style="opacity:0.6;">${t.category}</small></span>
        <span>
          <button class="delete-btn" data-index="${i}" data-action="toggle"><i class="fas fa-check"></i></button>
          <button class="delete-btn" data-index="${i}" data-action="delete"><i class="fas fa-trash"></i></button>
        </span>
      `;
      this.els.taskList.appendChild(li);
      if (t.done) done++;
    });
    const total = this.tasks.length || 1;
    this.els.taskProgress.textContent = Math.round((done / total) * 100) + '%';
    
    this.els.taskList.querySelectorAll('[data-action="toggle"]').forEach(btn => {
      btn.onclick = () => {
        this.tasks[btn.dataset.index].done = !this.tasks[btn.dataset.index].done;
        this.saveAndRender('tasks');
      };
    });
    this.els.taskList.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.onclick = () => {
        this.tasks.splice(btn.dataset.index, 1);
        this.saveAndRender('tasks');
      };
    });
  }

  // ===== NOTES =====
  addNote() {
    const text = prompt('Enter your note:');
    if (text && text.trim()) {
      this.notes.push({ text: text.trim(), created: Date.now() });
      this.saveAndRender('notes');
    }
  }

  renderNotes() {
    this.els.notesContainer.innerHTML = '';
    const search = this.els.noteSearch.value.toLowerCase();
    const filtered = this.notes.filter(n => n.text.toLowerCase().includes(search));
    filtered.forEach((n, i) => {
      const div = document.createElement('div');
      div.className = 'note-item';
      div.innerHTML = `<span>${n.text}</span><button class="delete-btn" data-note="${i}"><i class="fas fa-times"></i></button>`;
      this.els.notesContainer.appendChild(div);
      div.querySelector('.delete-btn').onclick = () => {
        const idx = this.notes.indexOf(n);
        if (idx > -1) {
          this.notes.splice(idx, 1);
          this.saveAndRender('notes');
        }
      };
    });
  }

  // ===== SKILLS =====
  addSkill() {
    const name = this.els.skillName.value.trim();
    const progress = parseInt(this.els.skillProgress.value);
    if (name && !isNaN(progress) && progress >= 0 && progress <= 100) {
      const existing = this.skills.find(s => s.name.toLowerCase() === name.toLowerCase());
      if (existing) {
        existing.progress = progress;
      } else {
        this.skills.push({ name, progress });
      }
      this.saveAndRender('skills');
      this.els.skillName.value = '';
      this.els.skillProgress.value = '';
    }
  }

  renderSkills() {
    this.els.skillsContainer.innerHTML = '';
    this.skills.forEach((s, i) => {
      const div = document.createElement('div');
      div.className = 'skill-item';
      div.innerHTML = `
        <span>
          <strong>${s.name}</strong> ${s.progress}%
          <div style="background:#e2e8f0;height:4px;border-radius:2px;margin-top:4px;">
            <div style="background:#2563eb;height:4px;border-radius:2px;width:${s.progress}%;"></div>
          </div>
        </span>
        <button class="delete-btn" data-skill="${i}"><i class="fas fa-trash"></i></button>
      `;
      this.els.skillsContainer.appendChild(div);
      div.querySelector('.delete-btn').onclick = () => {
        this.skills.splice(i, 1);
        this.saveAndRender('skills');
      };
    });
  }

  // ===== CALENDAR =====
  renderCalendar() {
    this.els.calendar.innerHTML = '';
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    
    for (let i = 0; i < firstDay; i++) {
      const d = document.createElement('div');
      d.className = 'day';
      d.style.background = 'transparent';
      this.els.calendar.appendChild(d);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dayDiv = document.createElement('div');
      dayDiv.className = 'day';
      dayDiv.textContent = d;
      if (d === today.getDate()) dayDiv.classList.add('active');
      this.els.calendar.appendChild(dayDiv);
    }
    this.els.streakCount.textContent = this.streak;
  }

  // ===== THEME =====
  applyTheme() {
    document.body.classList.toggle('dark', this.darkMode);
    const toggleBtn = document.getElementById('toggle-theme');
    if (toggleBtn) {
      toggleBtn.innerHTML = this.darkMode ? 
        '<i class="fas fa-sun"></i> Light Mode' : 
        '<i class="fas fa-moon"></i> Toggle Theme';
    }
  }

  toggleTheme() {
    this.darkMode = !this.darkMode;
    this.applyTheme();
    this.storage.set('dark', this.darkMode);
  }

  // ===== SETTINGS =====
  updateUsername() {
    const val = this.els.changeUsername.value.trim();
    if (val) {
      this.username = val;
      this.storage.set('username', this.username);
      this.updateWelcome();
      this.els.changeUsername.value = '';
      this.showToast('Username updated! ✅');
    }
  }

  resetData() {
    if (confirm('Are you sure you want to reset all data? This cannot be undone!')) {
      this.storage.clear();
      this.tasks = [];
      this.notes = [];
      this.skills = [];
      this.username = 'Developer';
      this.streak = 0;
      this.darkMode = false;
      this.applyTheme();
      this.saveAndRender('all');
      this.updateWelcome();
      this.showToast('Data reset successfully 🔄');
    }
  }

  // ===== TOOLS =====
  generatePassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
    let pwd = '';
    for (let i = 0; i < 16; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.els.passwordOutput.textContent = pwd;
  }

  formatJson() {
    const sample = {
      name: "DevHub",
      version: "1.0.0",
      features: ["Tasks", "Notes", "Weather", "GitHub"],
      active: true,
      timestamp: new Date().toISOString()
    };
    this.els.jsonOutput.textContent = JSON.stringify(sample, null, 2);
  }

  countChars() {
    this.els.charCount.textContent = this.els.charInput.value.length;
  }

  renderMarkdown() {
    const val = this.els.mdInput.value;
    let preview = val;
    preview = preview.replace(/^# (.*)/gm, '<strong>$1</strong>');
    preview = preview.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    preview = preview.replace(/\*(.*?)\*/g, '<em>$1</em>');
    preview = preview.replace(/`(.*?)`/g, '<code>$1</code>');
    this.els.mdPreview.innerHTML = preview || 'Enter markdown...';
  }

  // ===== HELPERS =====
  saveAndRender(type) {
    if (type === 'tasks' || type === 'all') {
      this.storage.set('tasks', this.tasks);
      this.renderTasks();
    }
    if (type === 'notes' || type === 'all') {
      this.storage.set('notes', this.notes);
      this.renderNotes();
    }
    if (type === 'skills' || type === 'all') {
      this.storage.set('skills', this.skills);
      this.renderSkills();
      this.updateWelcome();
    }
    if (type === 'all') {
      this.renderCalendar();
    }
  }

  updateWelcome() {
    this.els.username.textContent = this.username;
    this.els.learningGoal.textContent = this.skills.length ? this.skills[0].name : 'JavaScript';
    this.els.projectsCount.textContent = Math.floor(Math.random() * 6) + 2;
    this.els.codingHours.textContent = Math.floor(Math.random() * 80) + 20;
    this.els.githubRepos.textContent = Math.floor(Math.random() * 15) + 1;
    const quotes = [
      '"Code is poetry."',
      '"First, solve the problem. Then, write the code."',
      '"Simplicity is the ultimate sophistication."',
      '"Talk is cheap. Show me the code."',
      '"Make it work, make it right, make it fast."'
    ];
    this.els.quote.textContent = quotes[Math.floor(Math.random() * quotes.length)];
  }

  startClock() {
    const update = () => {
      const now = new Date();
      this.els.datetime.textContent = now.toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    };
    update();
    setInterval(update, 1000);
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #2563eb;
      color: white;
      padding: 12px 24px;
      border-radius: 40px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  window.app = new DevHubApp();
});

console.log('🚀 DevHub Dashboard initialized!');
console.log('📦 Using real APIs for Weather and GitHub');
console.log('💡 Get your free API key at: https://openweathermap.org/api');