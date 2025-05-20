// API Key - Replace with your own
var API_KEY = "df29bf7a3f4b56d97cadb840e4e18964";

// DOM Elements
var cityInput = document.getElementById("city-input");
var searchBtn = document.getElementById("search-btn");
var currentWeather = document.getElementById("current-weather");
var forecast = document.getElementById("forecast");
var errorMessage = document.getElementById("error-message");
var historyList = document.getElementById("history-list");

// Store search history
var searchHistory = JSON.parse(localStorage.getItem("weatherSearchHistory")) || [];

// Initialize the app
function init() {
    renderSearchHistory();
    searchBtn.addEventListener("click", handleSearch);
}

// Handle search button click
function handleSearch() {
    var city = cityInput.value.trim();
    if (city) {
        fetchWeatherData(city);
    }
}

// Fetch weather data from OpenWeatherMap API
function fetchWeatherData(city) {
    var currentWeatherUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=metric&appid=" + API_KEY;
    var forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=metric&appid=" + API_KEY;

    // Fetch current weather
    fetch(currentWeatherUrl)
        .then(function(response) {
            if (!response.ok) throw new Error("City not found");
            return response.json();
        })
        .then(function(data) {
            displayCurrentWeather(data);
            addToSearchHistory(city);
            return fetch(forecastUrl);
        })
        .then(function(response) {
            if (!response.ok) throw new Error("Forecast not available");
            return response.json();
        })
        .then(function(data) {
            displayForecast(data);
            errorMessage.classList.add("hidden");
        })
        .catch(function(error) {
            errorMessage.classList.remove("hidden");
            currentWeather.classList.add("hidden");
            forecast.classList.add("hidden");
        });
}

// Display current weather
function displayCurrentWeather(data) {
    var cityName = data.name;
    var temp = Math.round(data.main.temp);
    var description = data.weather[0].description;
    var humidity = data.main.humidity;
    var windSpeed = data.wind.speed;
    var iconCode = data.weather[0].icon;
    var iconUrl = "https://openweathermap.org/img/w/" + iconCode + ".png";

    document.getElementById("current-city").textContent = cityName;
    document.getElementById("current-temp").textContent = "Temperature: " + temp + "°C";
    document.getElementById("current-description").textContent = "Conditions: " + description;
    document.getElementById("current-humidity").textContent = "Humidity: " + humidity + "%";
    document.getElementById("current-wind").textContent = "Wind: " + windSpeed + " km/h";
    document.getElementById("current-icon").src = iconUrl;

    currentWeather.classList.remove("hidden");
}

// Display 3-day forecast
function displayForecast(data) {
    var forecastContainer = document.getElementById("forecast-container");
    forecastContainer.innerHTML = "";

    // Filter to get one forecast per day (every 24 hours)
    var dailyForecasts = data.list.filter(function(forecast, index) {
        return index % 8 === 0 && index < 24; // 3 days (8 forecasts per day)
    });

    dailyForecasts.forEach(function(day) {
        var date = new Date(day.dt * 1000).toLocaleDateString();
        var temp = Math.round(day.main.temp);
        var description = day.weather[0].description;
        var iconCode = day.weather[0].icon;
        var iconUrl = "https://openweathermap.org/img/w/" + iconCode + ".png";

        var forecastCard = document.createElement("div");
        forecastCard.className = "forecast-card";
        forecastCard.innerHTML = `
            <p><strong>${date}</strong></p>
            <img src="${iconUrl}" alt="Weather Icon">
            <p>${temp}°C</p>
            <p>${description}</p>
        `;
        forecastContainer.appendChild(forecastCard);
    });

    forecast.classList.remove("hidden");
}

// Add city to search history
function addToSearchHistory(city) {
    if (!searchHistory.includes(city)) {
        searchHistory.push(city);
        localStorage.setItem("weatherSearchHistory", JSON.stringify(searchHistory));
        renderSearchHistory();
    }
}

// Render search history
function renderSearchHistory() {
    historyList.innerHTML = "";
    searchHistory.forEach(function(city) {
        var li = document.createElement("li");
        li.textContent = city;
        li.addEventListener("click", function() {
            cityInput.value = city;
            fetchWeatherData(city);
        });
        historyList.appendChild(li);
    });
}

// Initialize the app
init();