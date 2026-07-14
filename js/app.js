// DevHub Dashboard - Main Application

class DevHubApp {
  constructor() {
    this.initializeState();
    this.setupEventListeners();
    this.loadSavedData();
    this.updateUI();
    this.startClock();
  }

  initializeState() {
    this.tasks = JSON.parse(localStorage.getItem('devhub_tasks')) || [];
    this.notes = JSON.parse(localStorage.getItem('devhub_notes')) || [];
    this.skills = JSON.parse(localStorage.getItem('devhub_skills')) || [];
    this.username = localStorage.getItem('devhub_username') || 'Developer';
    this.streak = parseInt(localStorage.getItem('devhub_streak')) || 7;
    this.darkMode = localStorage.getItem('devhub_dark') === 'true';
  }

  setupEventListeners() {
    // Task Form
    document.getElementById('task-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.addTask();
    });

    // Notes Search
    document.getElementById('note-search').addEventListener('input', () => {
      this.renderNotes();
    });

    // Add Note Button
    document.getElementById('add-note').addEventListener('click', () => {
      this.addNote();
    });

    // Skill Form
    document.getElementById('skill-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.addSkill();
    });

    // Weather Form
    document.getElementById('weather-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.fetchWeather();
    });

    // GitHub Form
    document.getElementById('github-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.fetchGitHub();
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
      this.formatJSON();
    });

    document.getElementById('char-input').addEventListener('input', () => {
      this.updateCharCount();
    });

    document.getElementById('md-input').addEventListener('input', () => {
      this.updateMarkdown();
    });

    // Sidebar navigation
    document.querySelectorAll('.sidebar a').forEach(link => {
      link.addEventListener('click', function() {
        document.querySelectorAll('.sidebar a').forEach(a => a.classList.remove('active'));
        this.classList.add('active');
      });
    });
  }

  loadSavedData() {
    // Apply dark mode
    if (this.darkMode) {
      document.body.classList.add('dark');
    }

    // Update username
    document.getElementById('username').textContent = this.username;

    // Render all sections
    this.renderTasks();
    this.renderNotes();
    this.renderSkills();
    this.renderCalendar();
    this.updateStats();
  }

  updateUI() {
    // Update quotes
    this.updateQuote();
    
    // Initialize tools
    this.generatePassword();
    this.formatJSON();
    this.updateCharCount();
    this.updateMarkdown();
  }

  // ===== TASK MANAGEMENT =====
  addTask() {
    const input = document.getElementById('task-input');
    const category = document.getElementById('task-category').value;
    
    if (input.value.trim()) {
      this.tasks.push({
        text: input.value.trim(),
        category: category,
        done: false,
        created: new Date().toISOString()
      });
      
      this.saveAndRender();
      input.value = '';
    }
  }

  renderTasks() {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    
    let completed = 0;
    
    this.tasks.forEach((task, index) => {
      const li = document.createElement('li');
      li.className = 'task-item' + (task.done ? ' completed' : '');
      li.innerHTML = `
        <span>
          ${task.text}
          <small style="opacity:0.6;margin-left:0.5rem;">${task.category}</small>
        </span>
        <span>
          <button class="delete-btn" data-index="${index}" data-action="toggle">
            <i class="fas fa-check"></i>
          </button>
          <button class="delete-btn" data-index="${index}" data-action="delete">
            <i class="fas fa-trash"></i>
          </button>
        </span>
      `;
      
      taskList.appendChild(li);
      
      if (task.done) completed++;
    });
    
    // Update progress
    const total = this.tasks.length || 1;
    const progress = Math.round((completed / total) * 100);
    document.getElementById('task-progress').textContent = progress + '%';
    
    // Add event listeners to task buttons
    taskList.querySelectorAll('[data-action="toggle"]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.tasks[btn.dataset.index].done = !this.tasks[btn.dataset.index].done;
        this.saveAndRender();
      });
    });
    
    taskList.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.tasks.splice(btn.dataset.index, 1);
        this.saveAndRender();
      });
    });
  }

  // ===== NOTES MANAGEMENT =====
  addNote() {
    const text = prompt('Enter your note:');
    if (text && text.trim()) {
      this.notes.push({
        text: text.trim(),
        created: new Date().toISOString()
      });
      this.saveAndRender();
    }
  }

  renderNotes() {
    const container = document.getElementById('notes-container');
    const search = document.getElementById('note-search').value.toLowerCase();
    
    const filtered = this.notes.filter(note => 
      note.text.toLowerCase().includes(search)
    );
    
    container.innerHTML = '';
    
    filtered.forEach((note, index) => {
      const div = document.createElement('div');
      div.className = 'note-item';
      div.innerHTML = `
        <span>${note.text}</span>
        <button class="delete-btn" data-note="${index}">
          <i class="fas fa-times"></i>
        </button>
      `;
      
      container.appendChild(div);
      
      div.querySelector('.delete-btn').addEventListener('click', () => {
        const realIndex = this.notes.indexOf(note);
        if (realIndex > -1) {
          this.notes.splice(realIndex, 1);
          this.saveAndRender();
        }
      });
    });
  }

  // ===== SKILLS MANAGEMENT =====
  addSkill() {
    const name = document.getElementById('skill-name').value.trim();
    const progress = parseInt(document.getElementById('skill-progress').value);
    
    if (name && !isNaN(progress) && progress >= 0 && progress <= 100) {
      const existing = this.skills.find(s => 
        s.name.toLowerCase() === name.toLowerCase()
      );
      
      if (existing) {
        existing.progress = progress;
      } else {
        this.skills.push({ name, progress });
      }
      
      this.saveAndRender();
      document.getElementById('skill-name').value = '';
      document.getElementById('skill-progress').value = '';
    }
  }

  renderSkills() {
    const container = document.getElementById('skills-container');
    container.innerHTML = '';
    
    this.skills.forEach((skill, index) => {
      const div = document.createElement('div');
      div.className = 'skill-item';
      div.innerHTML = `
        <span>
          <strong>${skill.name}</strong>
          <span style="margin-left:0.5rem;">${skill.progress}%</span>
          <div style="background:#e2e8f0;height:4px;border-radius:2px;margin-top:4px;">
            <div style="background:#2563eb;height:4px;border-radius:2px;width:${skill.progress}%;"></div>
          </div>
        </span>
        <button class="delete-btn" data-skill="${index}">
          <i class="fas fa-trash"></i>
        </button>
      `;
      
      container.appendChild(div);
      
      div.querySelector('.delete-btn').addEventListener('click', () => {
        this.skills.splice(index, 1);
        this.saveAndRender();
      });
    });
  }

  // ===== CALENDAR / STREAK =====
  renderCalendar() {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';
    
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    
    // Empty cells for days before first day of month
    for (let i = 0; i < firstDay; i++) {
      const div = document.createElement('div');
      div.className = 'day';
      div.style.background = 'transparent';
      calendar.appendChild(div);
    }
    
    // Days of the month
    for (let d = 1; d <= daysInMonth; d++) {
      const div = document.createElement('div');
      div.className = 'day';
      div.textContent = d;
      
      // Highlight today
      if (d === today.getDate()) {
        div.classList.add('active');
      }
      
      // Randomly mark some days as active for demo
      if (d < today.getDate() && d % 3 === 0) {
        div.classList.add('active');
      }
      
      calendar.appendChild(div);
    }
    
    // Update streak count
    document.getElementById('streak-count').textContent = this.streak;
  }

  // ===== WEATHER =====
  fetchWeather() {
    const city = document.getElementById('city-input').value || 'London';
    const result = document.getElementById('weather-result');
    
    result.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Loading weather...';
    
    // Simulate API call
    setTimeout(() => {
      const temp = (Math.random() * 30 + 5).toFixed(1);
      const conditions = ['☀️ Sunny', '⛅ Partly cloudy', '🌧️ Light rain', '🌤️ Clear', '🌦️ Showers'];
      const condition = conditions[Math.floor(Math.random() * conditions.length)];
      
      result.innerHTML = `
        <div style="display:flex;align-items:center;gap:1rem;">
          <div style="font-size:2rem;">${condition.split(' ')[0]}</div>
          <div>
            <strong>${city}</strong><br>
            ${temp}°C · ${condition.split(' ').slice(1).join(' ')}<br>
            💧 ${Math.floor(Math.random() * 60 + 30)}% · 💨 ${Math.floor(Math.random() * 20 + 5)} m/s
          </div>
        </div>
      `;
    }, 800);
  }

  // ===== GITHUB =====
  fetchGitHub() {
    const username = document.getElementById('github-username').value || 'octocat';
    const result = document.getElementById('github-result');
    
    result.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Analyzing profile...';
    
    // Simulate API call
    setTimeout(() => {
      const repos = Math.floor(Math.random() * 30) + 5;
      const followers = Math.floor(Math.random() * 200) + 10;
      const stars = Math.floor(Math.random() * 500) + 20;
      
      result.innerHTML = `
        <div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:center;">
          <div style="display:flex;align-items:center;gap:0.5rem;">
            <i class="fab fa-github" style="font-size:2rem;"></i>
            <div>
              <strong>${username}</strong><br>
              <span style="opacity:0.7;">GitHub User</span>
            </div>
          </div>
          <div style="display:flex;gap:1rem;flex-wrap:wrap;">
            <div>📁 ${repos} repos</div>
            <div>⭐ ${stars} stars</div>
            <div>👥 ${followers} followers</div>
            <div>🏆 ${repos > 20 ? '💎 Legend' : repos > 10 ? '⭐ Active' : '🚀 Starter'}</div>
          </div>
        </div>
        <div style="margin-top:0.5rem;opacity:0.7;">
          <strong>Top Languages:</strong> JavaScript, Python, TypeScript, HTML, CSS
        </div>
      `;
    }, 800);
  }

  // ===== SETTINGS =====
  updateUsername() {
    const input = document.getElementById('change-username');
    if (input.value.trim()) {
      this.username = input.value.trim();
      localStorage.setItem('devhub_username', this.username);
      document.getElementById('username').textContent = this.username;
      input.value = '';
      
      // Show feedback
      this.showToast('Username updated! ✅');
    }
  }

  toggleTheme() {
    this.darkMode = !this.darkMode;
    document.body.classList.toggle('dark', this.darkMode);
    localStorage.setItem('devhub_dark', String(this.darkMode));
    
    // Update icon
    const btn = document.getElementById('toggle-theme');
    btn.innerHTML = this.darkMode ? 
      '<i class="fas fa-sun"></i> Light Mode' : 
      '<i class="fas fa-moon"></i> Dark Mode';
  }

  resetData() {
    if (confirm('Are you sure you want to reset all data? This cannot be undone!')) {
      localStorage.clear();
      this.tasks = [];
      this.notes = [];
      this.skills = [];
      this.username = 'Developer';
      this.streak = 0;
      this.darkMode = false;
      
      document.body.classList.remove('dark');
      document.getElementById('username').textContent = 'Developer';
      document.getElementById('toggle-theme').innerHTML = '<i class="fas fa-moon"></i> Toggle Theme';
      
      this.saveAndRender();
      this.showToast('Data reset successfully 🔄');
    }
  }

  // ===== TOOLS =====
  generatePassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
    let password = '';
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    document.getElementById('password-output').textContent = password;
  }

  formatJSON() {
    const sample = {
      name: "DevHub Dashboard",
      version: "1.0.0",
      features: ["Tasks", "Notes", "Weather", "GitHub"],
      active: true
    };
    document.getElementById('json-output').textContent = JSON.stringify(sample, null, 2);
  }

  updateCharCount() {
    const input = document.getElementById('char-input');
    document.getElementById('char-count').textContent = input.value.length;
  }

  updateMarkdown() {
    const input = document.getElementById('md-input');
    const preview = document.getElementById('md-preview');
    let text = input.value;
    
    // Simple markdown-like conversion
    text = text.replace(/^# (.*)/gm, '<strong>$1</strong>');
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    text = text.replace(/`(.*?)`/g, '<code>$1</code>');
    
    preview.innerHTML = text || 'Enter markdown...';
  }

  // ===== UTILITY FUNCTIONS =====
  saveAndRender() {
    localStorage.setItem('devhub_tasks', JSON.stringify(this.tasks));
    localStorage.setItem('devhub_notes', JSON.stringify(this.notes));
    localStorage.setItem('devhub_skills', JSON.stringify(this.skills));
    localStorage.setItem('devhub_streak', String(this.streak));
    
    this.renderTasks();
    this.renderNotes();
    this.renderSkills();
    this.renderCalendar();
    this.updateStats();
  }

  updateStats() {
    document.getElementById('projects-count').textContent = 
      Math.floor(Math.random() * 10) + 3;
    document.getElementById('coding-hours').textContent = 
      Math.floor(Math.random() * 100) + 20;
    document.getElementById('learning-goal').textContent = 
      this.skills.length > 0 ? this.skills[0].name : 'JavaScript';
    document.getElementById('github-repos').textContent = 
      Math.floor(Math.random() * 20) + 5;
  }

  updateQuote() {
    const quotes = [
      '“Code is poetry in motion.”',
      '“First, solve the problem. Then, write the code.”',
      '“Simplicity is the ultimate sophistication.”',
      '“Talk is cheap. Show me the code.”',
      '“Any fool can write code a computer can understand.”',
      '“Make it work, make it right, make it fast.”'
    ];
    document.getElementById('quote').textContent = 
      quotes[Math.floor(Math.random() * quotes.length)];
  }

  startClock() {
    setInterval(() => {
      const now = new Date();
      document.getElementById('datetime').textContent = 
        now.toLocaleString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
    }, 1000);
  }

  showToast(message) {
    // Create a simple toast notification
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
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new DevHubApp();
  window.app = app; // Make available in console
});

console.log('🚀 DevHub Dashboard initialized!');