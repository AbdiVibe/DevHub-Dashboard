export class GitHubService {
  constructor() {
    this.baseUrl = 'https://api.github.com';
    // Optional: Add your token for higher rate limits
    this.headers = {
      'Accept': 'application/vnd.github.v3+json'
    };
    // Uncomment if you have a token:
    // this.headers['Authorization'] = 'token YOUR_GITHUB_TOKEN';
  }

  async analyzeUser(username) {
    const resultEl = document.getElementById('github-result');
    resultEl.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Analyzing profile...';

    try {
      const [userData, reposData, eventsData] = await Promise.all([
        this.fetchUser(username),
        this.fetchRepos(username),
        this.fetchEvents(username)
      ]);

      this.displayProfile(userData, reposData, eventsData, resultEl);
    } catch (error) {
      resultEl.innerHTML = `
        <div style="color: #ef4444; padding: 0.5rem;">
          <i class="fas fa-exclamation-circle"></i> 
          Error: ${error.message}
        </div>
      `;
    }
  }

  async fetchUser(username) {
    const response = await fetch(`${this.baseUrl}/users/${username}`, {
      headers: this.headers
    });
    if (!response.ok) {
      if (response.status === 404) throw new Error('User not found');
      if (response.status === 403) throw new Error('Rate limit exceeded. Try again later.');
      throw new Error('Failed to fetch user data');
    }
    return response.json();
  }

  async fetchRepos(username) {
    const response = await fetch(
      `${this.baseUrl}/users/${username}/repos?per_page=100&sort=updated`,
      { headers: this.headers }
    );
    return response.json();
  }

  async fetchEvents(username) {
    const response = await fetch(
      `${this.baseUrl}/users/${username}/events?per_page=30`,
      { headers: this.headers }
    );
    return response.json();
  }

  displayProfile(user, repos, events, element) {
    const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
    const languages = this.getTopLanguages(repos);
    const contributions = this.countContributions(events);
    const achievements = this.getAchievements(repos, user);

    element.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:0.8rem;">
        <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;">
          <img src="${user.avatar_url}" alt="${user.login}" 
               style="width:60px;height:60px;border-radius:50%;border:3px solid #2563eb;">
          <div>
            <strong style="font-size:1.2rem;">${user.name || user.login}</strong>
            <br>
            <span style="opacity:0.7;">@${user.login}</span>
            ${user.bio ? `<br><span style="font-size:0.9rem;opacity:0.8;">${user.bio}</span>` : ''}
          </div>
        </div>
        
        <div style="display:flex;gap:1rem;flex-wrap:wrap;font-size:0.9rem;">
          <span>📁 ${user.public_repos} repos</span>
          <span>⭐ ${totalStars} stars</span>
          <span>🍴 ${totalForks} forks</span>
          <span>👥 ${user.followers} followers</span>
          <span>👤 ${user.following} following</span>
          <span>🏆 ${achievements}</span>
        </div>
        
        <div style="display:flex;flex-wrap:wrap;gap:0.3rem;">
          ${languages.slice(0, 8).map(lang => `
            <span style="background:#e2e8f0;padding:0.2rem 0.6rem;border-radius:12px;font-size:0.7rem;font-weight:500;">
              ${lang}
            </span>
          `).join('')}
        </div>
        
        <div style="font-size:0.8rem;opacity:0.7;border-top:1px solid #e2e8f0;padding-top:0.5rem;">
          <span>📅 Joined ${new Date(user.created_at).toLocaleDateString()}</span>
          <span style="margin-left:0.5rem;">🔄 ${contributions} recent contributions</span>
        </div>
      </div>
    `;
  }

  getTopLanguages(repos) {
    const langCount = {};
    repos.forEach(repo => {
      if (repo.language) {
        langCount[repo.language] = (langCount[repo.language] || 0) + 1;
      }
    });
    return Object.entries(langCount)
      .sort((a, b) => b[1] - a[1])
      .map(([lang]) => lang);
  }

  countContributions(events) {
    const pushEvents = events.filter(e => e.type === 'PushEvent');
    return pushEvents.length;
  }

  getAchievements(repos, user) {
    const count = repos.length;
    const stars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
    
    if (count > 100) return '💎 Legend';
    if (count > 50 && stars > 100) return '🏅 Master';
    if (count > 30) return '⭐ Expert';
    if (count > 15) return '🚀 Active';
    if (count > 5) return '🌱 Growing';
    return '🌱 Starter';
  }
}