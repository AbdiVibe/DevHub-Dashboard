export class WeatherService {
  constructor() {
    // Replace with your actual API key
    this.apiKey = 'f044b5b2abda34fe99d1f2dadeaf6f35';
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
  }

  async fetchWeather(city) {
    const resultEl = document.getElementById('weather-result');
    resultEl.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Loading weather...';

    try {
      // Get current weather
      const response = await fetch(
        `${this.baseUrl}/weather?q=${city}&units=metric&appid=${this.apiKey}`
      );
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your OpenWeather API key.');
        }
        throw new Error('City not found');
      }
      
      const data = await response.json();
      
      // Get 5-day forecast
      const forecastResponse = await fetch(
        `${this.baseUrl}/forecast?q=${city}&units=metric&appid=${this.apiKey}`
      );
      const forecastData = await forecastResponse.json();
      
      this.displayWeather(data, forecastData, resultEl);
    } catch (error) {
      resultEl.innerHTML = `
        <div style="color: #ef4444; padding: 0.5rem;">
          <i class="fas fa-exclamation-circle"></i> 
          Error: ${error.message}
          <br><small>Tip: Make sure your API key is valid</small>
        </div>
      `;
    }
  }

  displayWeather(data, forecast, element) {
    const { name, main, weather, wind } = data;
    const icon = this.getWeatherIcon(weather[0].icon);
    
    // Get today's forecast
    const todayForecast = forecast.list.slice(0, 5);
    
    element.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:0.5rem;">
        <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;">
          <div style="font-size:3rem;">${icon}</div>
          <div>
            <strong style="font-size:1.2rem;">${name}</strong><br>
            <span style="font-size:1.5rem;font-weight:700;">${Math.round(main.temp)}°C</span>
            <span style="opacity:0.7;"> · ${weather[0].description}</span>
          </div>
        </div>
        <div style="display:flex;gap:1rem;flex-wrap:wrap;font-size:0.9rem;opacity:0.8;">
          <span>💧 ${main.humidity}% humidity</span>
          <span>💨 ${Math.round(wind.speed)} m/s wind</span>
          <span>🌡️ Feels like ${Math.round(main.feels_like)}°C</span>
        </div>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.3rem;">
          ${todayForecast.map(item => `
            <div style="background:rgba(255,255,255,0.1);padding:0.3rem 0.6rem;border-radius:12px;text-align:center;font-size:0.7rem;">
              <div>${new Date(item.dt * 1000).getHours()}:00</div>
              <div>${this.getWeatherIcon(item.weather[0].icon)}</div>
              <div>${Math.round(item.main.temp)}°</div>
            </div>
          `).join('')}
        </div>
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