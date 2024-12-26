 
const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const weatherDiv = document.querySelector(".weather-data")
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardDiv = document.querySelector(".weather-cards");
const API_key = "7e53052afe63c8813279ebef313a2509";

const createWeatherCard = (cityName, weatherItem, index) => {
  weatherDiv.classList.add("active")
  if (index === 0) {
    //HTML FOR CURRENT DAY WEATHER
    return `<div class="details">
                    <h2>${cityName} ${weatherItem.dt_txt.split(" ")[0]}</h2>
                    <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(
                      2
                    )}°C</h4>
                    <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${
                      weatherItem.weather[0].icon
                    }@2x.png" alt="weather">
                    <h4>${weatherItem.weather[0].description}</h4>
                </div>`;
  } else {
    // HTML FOR THE NEXT 5 DAY WEATHER
    return `<li class="card">
                    <h3>${weatherItem.dt_txt.split(" ")[0]}</h3>
                    <img src="https://openweathermap.org/img/wn/${
                      weatherItem.weather[0].icon
                    }@2x.png" alt="weather">
                    <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(
                      2
                    )}°C</h4>
                    <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </li>`;
  }
};

const getWeatherDetails = (cityName, lat, lon) => {
  const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_key}`;

  fetch(WEATHER_API_URL)
    .then((res) => res.json())
    .then((data) => {
      const uniqueForcastDays = [];
      const fiveDaysForcast = data.list.filter((forecast) => {   
        const forecastDate = new Date(forecast.dt_txt).getDate(); //getting the date and adding to the array
        if (!uniqueForcastDays.includes(forecastDate)) {
          return uniqueForcastDays.push(forecastDate); //when any existing date is found it is filtered out
        }
      });

      //clearing previous weather data
      cityInput.value = "";
      currentWeatherDiv.innerHTML = "";
      weatherCardDiv.innerHTML = "";

      fiveDaysForcast.forEach((weatherItem, index) => {
        if (index === 0) {
          currentWeatherDiv.insertAdjacentHTML(
            "beforeend",
            createWeatherCard(cityName, weatherItem, index)
          );
        } else {
          weatherCardDiv.insertAdjacentHTML(
            "beforeend",
            createWeatherCard(cityName, weatherItem, index)
          );
        }
      });
    })
    .catch(() => {
      alert("An error occured while fetching the weather forecast!");
    });
};

const getCityCoordinates = () => {
  const cityName = cityInput.value.trim();
  if (!cityName) return;
  const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_key}`;

  fetch(GEOCODING_API_URL)
    .then((res) => res.json())
    .then((data) => {
      if (!data.length) return alert(`No Coordinates found for ${cityName}`);
      const { name, lat, lon } = data[0]; //destructuring first element
      getWeatherDetails(name, lat, lon);
    })
    .catch(() => {
      alert("An error occured while fetching the coordinates!");
    });
};


const getUserCoordinates = () => {
  navigator.geolocation.getCurrentPosition(
    position => {
        const { latitude, longitude } = position.coords;
        const REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_key}`;

        fetch(REVERSE_GEOCODING_URL)
          .then((res) => res.json())
          .then((data) => {
            const { name, lat, lon } = data[0]; //destructuring first element
            getWeatherDetails(name, lat, lon);
          })
          .catch(() => {
            alert("An error occured while fetching the city!");
          });
    },
    error => {
        console.log(error)
        if(error.code === error.PERMISSION_DENIED){
            alert("User denied Geolocation. Please reset location permission to grant access again.");
        }
    }
  );
};

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener(
  "keyup",
  (e) => e.key === "Enter" && getCityCoordinates());


// Workflow of Weather app

// Events: 
// locationButton -> click -> getUserCoordinates
// searchButton -> click -> getCityCoordinates
// cityInput -> enter -> getCityCoordinates

// Functions flow: 
// getUserCoordinates -> getWeatherDetails -> createWeatherCard 

// getCityCoordinates -> getWeatherDetails -> createWeatherCard


// Functions details:
// getCityCoordinates - is responsible for fetching weather details for a city based on the city's name

// getUserCoordinates -  handle the geolocation API, construct the API URL, and handle the response from the OpenWeatherMap API.

// getWeatherDetails - is responsible for fetching weather details from the API and updating the DOM with the fetched data.

// createWeatherCard - responsible for generating the HTML