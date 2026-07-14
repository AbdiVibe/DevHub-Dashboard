// Weather Service - Real OpenWeatherMap API
export class WeatherService {
  constructor() {
    this.apiKey = 'f044b5b2abda34fe99d1f2dadeaf6f35';
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
    this.cache = {};
  }

  async fetchWeather(city) {
    const resultEl = document.getElementById('weather-result');
    
    // Check cache first (5 minute cache)
    const cacheKey = city.toLowerCase();
    if (this.cache[cacheKey] && (Date.now() - this.cache[cacheKey].timestamp < 300000)) {
      this.displayWeather(this.cache[cacheKey].data, resultEl);
      return;
    }

    resultEl.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Fetching weather...';

    try {
      // Get current weather
      const currentResponse = await fetch(
        `${this.baseUrl}/weather?q=${encodeURIComponent(city)}&units=metric&appid=${this.apiKey}`
      );

      if (!currentResponse.ok) {
        if (currentResponse.status === 404) {
          throw new Error(`City "${city}" not found. Please check the spelling.`);
        } else if (currentResponse.status === 401) {
          throw new Error('Invalid API key. Please check your OpenWeatherMap API key.');
        } else {
          throw new Error(`Weather API error: ${currentResponse.status}`);
        }
      }

      const weatherData = await currentResponse.json();

      // Get forecast
      const forecastResponse = await fetch(
        `${this.baseUrl}/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${this.apiKey}`
      );
      
      let forecastData = null;
      if (forecastResponse.ok) {
        forecastData = await forecastResponse.json();
      }

      // Cache the data
      this.cache[cacheKey] = {
        data: { weather: weatherData, forecast: forecastData },
        timestamp: Date.now()
      };

      this.displayWeather({ weather: weatherData, forecast: forecastData }, resultEl);
    } catch (error) {
      resultEl.innerHTML = `
        <div style="color: #ef4444; padding: 0.5rem;">
          <i class="fas fa-exclamation-circle"></i> 
          <strong>Error:</strong> ${error.message}
          <br><small>Please try again later.</small>
        </div>
      `;
      console.error('Weather error:', error);
    }
  }

  displayWeather(data, element) {
    const { weather, forecast } = data;
    const { name, main, weather: weatherDetails, wind } = weather;
    const icon = this.getWeatherIcon(weatherDetails[0].icon);
    const description = weatherDetails[0].description;

    let forecastHTML = '';
    if (forecast) {
      const todayForecast = forecast.list.slice(0, 5);
      forecastHTML = `
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.5rem;padding-top:0.5rem;border-top:1px solid #e2e8f0;">
          ${todayForecast.map(item => `
            <div style="background:rgba(37,99,235,0.08);padding:0.3rem 0.6rem;border-radius:12px;text-align:center;font-size:0.7rem;min-width:50px;">
              <div>${new Date(item.dt * 1000).getHours()}:00</div>
              <div style="font-size:1.2rem;">${this.getWeatherIcon(item.weather[0].icon)}</div>
              <div><strong>${Math.round(item.main.temp)}°</strong></div>
            </div>
          `).join('')}
        </div>
      `;
    }

    element.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:0.3rem;">
        <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;">
          <div style="font-size:3rem;">${icon}</div>
          <div>
            <strong style="font-size:1.2rem;">${name}</strong>
            <span style="opacity:0.7;font-size:0.9rem;"> · ${description}</span>
            <br>
            <span style="font-size:1.8rem;font-weight:700;">${Math.round(main.temp)}°C</span>
            <span style="opacity:0.6;font-size:0.9rem;">feels like ${Math.round(main.feels_like)}°C</span>
          </div>
        </div>
        <div style="display:flex;gap:1rem;flex-wrap:wrap;font-size:0.85rem;opacity:0.8;">
          <span>💧 ${main.humidity}% humidity</span>
          <span>💨 ${Math.round(wind.speed)} m/s wind</span>
          <span>🌡️ Min: ${Math.round(main.temp_min)}°C · Max: ${Math.round(main.temp_max)}°C</span>
        </div>
        ${forecastHTML}
      </div>
    `;
  }

  getWeatherIcon(iconCode) {
    const icons = {
      '01d': '☀️', '01n': '🌙',
      '02d': '⛅', '02n': '☁️',
      '03d': '☁️', '03n': '☁️',
      '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️',
      '10d': '🌦️', '10n': '🌧️',
      '11d': '⛈️', '11n': '⛈️',
      '13d': '❄️', '13n': '❄️',
      '50d': '🌫️', '50n': '🌫️'
    };
    return icons[iconCode] || '🌡️';
  }
}