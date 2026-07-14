// GitHub Service - Real GitHub API
export class GitHubService {
  constructor() {
    this.baseUrl = 'https://api.github.com';
    this.cache = {};
  }

  async analyzeUser(username) {
    const resultEl = document.getElementById('github-result');

    // Check cache (5 minute cache)
    const cacheKey = username.toLowerCase();
    if (
      this.cache[cacheKey] &&
      Date.now() - this.cache[cacheKey].timestamp < 300000
    ) {
      this.displayProfile(this.cache[cacheKey].data, resultEl);
      return;
    }

    resultEl.innerHTML =
      '<i class="fas fa-spinner fa-pulse"></i> Analyzing GitHub profile...';

    try {
      // Fetch user data
      const userResponse = await fetch(
        `${this.baseUrl}/users/${encodeURIComponent(username)}`
      );

      if (!userResponse.ok) {
        if (userResponse.status === 404) {
          throw new Error(`User "${username}" not found on GitHub.`);
        } else if (userResponse.status === 403) {
          throw new Error(
            "GitHub API rate limit exceeded. Please try again in about an hour."
          );
        } else {
          throw new Error(`GitHub API error: ${userResponse.status}`);
        }
      }

      const userData = await userResponse.json();

      // Fetch repositories
      const reposResponse = await fetch(
        `${this.baseUrl}/users/${encodeURIComponent(
          username
        )}/repos?per_page=100&sort=updated`
      );

      const reposData = reposResponse.ok
        ? await reposResponse.json()
        : [];

      // Fetch recent events
      const eventsResponse = await fetch(
        `${this.baseUrl}/users/${encodeURIComponent(
          username
        )}/events?per_page=30`
      );

      const eventsData = eventsResponse.ok
        ? await eventsResponse.json()
        : [];

      const profileData = {
        user: userData,
        repos: reposData,
        events: eventsData,
      };

      // Cache data
      this.cache[cacheKey] = {
        data: profileData,
        timestamp: Date.now(),
      };

      this.displayProfile(profileData, resultEl);
    } catch (error) {
      resultEl.innerHTML = `
        <div style="color:#ef4444;padding:.5rem;">
          <i class="fas fa-exclamation-circle"></i>
          <strong>Error:</strong> ${error.message}
        </div>
      `;
      console.error("GitHub error:", error);
    }
  }

  displayProfile(data, element) {
    const { user, repos, events } = data;

    const totalStars = repos.reduce(
      (sum, repo) => sum + repo.stargazers_count,
      0
    );

    const totalForks = repos.reduce(
      (sum, repo) => sum + repo.forks_count,
      0
    );

    const languages = this.getTopLanguages(repos);
    const contributions = this.countContributions(events);
    const achievements = this.getAchievements(repos);

    element.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:.8rem;">
        <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;">
          <img
            src="${user.avatar_url}"
            alt="${user.login}"
            style="width:60px;height:60px;border-radius:50%;border:3px solid #2563eb;"
          >

          <div>
            <strong style="font-size:1.2rem;">${user.name || user.login}</strong><br>
            <span style="opacity:.7;">@${user.login}</span>
            ${
              user.bio
                ? `<br><span style="font-size:.9rem;opacity:.8;">${user.bio}</span>`
                : ""
            }
          </div>
        </div>

        <div style="display:flex;gap:1rem;flex-wrap:wrap;font-size:.9rem;">
          <span>📁 ${user.public_repos} repos</span>
          <span>⭐ ${totalStars} stars</span>
          <span>🍴 ${totalForks} forks</span>
          <span>👥 ${user.followers} followers</span>
          <span>👤 ${user.following} following</span>
          <span>🏆 ${achievements}</span>
        </div>

        ${
          languages.length
            ? `
        <div style="display:flex;flex-wrap:wrap;gap:.3rem;">
          ${languages
            .slice(0, 8)
            .map(
              (lang) => `
            <span style="background:rgba(37,99,235,.12);padding:.2rem .8rem;border-radius:12px;font-size:.7rem;font-weight:500;">
              ${lang}
            </span>
          `
            )
            .join("")}
        </div>`
            : ""
        }

        <div style="font-size:.8rem;opacity:.7;border-top:1px solid #e2e8f0;padding-top:.5rem;">
          <span>📅 Joined ${new Date(user.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}</span>

          <span style="margin-left:.5rem;">🔄 ${contributions} recent contributions</span>

          ${
            user.location
              ? `<span style="margin-left:.5rem;">📍 ${user.location}</span>`
              : ""
          }
        </div>
      </div>
    `;
  }

  getTopLanguages(repos) {
    const langCount = {};

    repos.forEach((repo) => {
      if (repo.language) {
        langCount[repo.language] = (langCount[repo.language] || 0) + 1;
      }
    });

    return Object.entries(langCount)
      .sort((a, b) => b[1] - a[1])
      .map(([lang]) => lang);
  }

  countContributions(events) {
    return events.filter((event) => event.type === "PushEvent").length;
  }

  getAchievements(repos) {
    const repoCount = repos.length;

    const stars = repos.reduce(
      (sum, repo) => sum + repo.stargazers_count,
      0
    );

    if (repoCount > 100) return "💎 Legend";
    if (repoCount > 50 && stars > 100) return "🏅 Master";
    if (repoCount > 30) return "⭐ Expert";
    if (repoCount > 15) return "🚀 Active";
    if (repoCount > 5) return "🌱 Growing";

    return "🌱 Starter";
  }
}