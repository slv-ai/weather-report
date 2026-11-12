const TEMP_RANGES = new Map([
    [80, { 'color': 'red', 'landscape': '🌵__🐍_🦂_🌵🌵__🐍_🏜_🦂' }],
    [70, { 'color': 'orange', 'landscape': '🌸🌿🌼__🌷🌻🌿_☘️🌱_🌻🌷' }],
    [60, { 'color': 'yellow', 'landscape': '🌾🌾_🍃_🪨__🛤_🌾🌾🌾_🍃' }],
    [50, { 'color': 'green', 'landscape': '🌲🌲⛄️🌲⛄️🍂🌲🍁🌲🌲⛄️🍂🌲' }],
    [-Infinity, { 'color': 'teal', 'landscape': '🌲🌲⛄️🌲⛄️🍂🌲🍁🌲🌲⛄️🍂🌲' }],
]);

const state = {
    tempValue: 70,
    headerCityName: 'Seattle',
    unit: 'F'
};

const render = () => {
    const displayTemp = state.unit === 'C'
        ? Math.round(fahrenheitToCelsius(state.tempValue))
        : Math.round(state.tempValue);

    document.getElementById('tempValue').textContent = `${displayTemp} °${state.unit}`;
    document.getElementById('tempInC').disabled = state.unit === 'C';
    document.getElementById('tempInF').disabled = state.unit === 'F';

    tempColorAndLandscapeChange();
    document.getElementById('headerCityName').textContent = state.headerCityName;
};

const changeTemp = (step) => {
    if (state.unit === 'C') {
        const currentC = Math.round(fahrenheitToCelsius(state.tempValue));
        state.tempValue = celsiusToFahrenheit(currentC + step);
    } else {
        state.tempValue = Math.round(state.tempValue) + 1;
    }
    render();
};

const increaseTemp = (event) => {
    changeTemp(1);
};

const decreaseTemp = (event) => {
    changeTemp(-1);
};

const updateCityName = (event) => {
    state.headerCityName = document.getElementById('cityNameInput').value;
    render();
};

const tempColorAndLandscapeChange = () => {
    const tempValEl = document.getElementById('tempValue');

    const temp = state.tempValue;
    const landscape = document.getElementById('landscape');
    tempValEl.classList.remove(...getColorsList());

    for (const lowestRangeTemp of TEMP_RANGES.keys()) {
        if (temp >= lowestRangeTemp) {
            const colorAndLandcape = TEMP_RANGES.get(lowestRangeTemp);
            tempValEl.classList.add(colorAndLandcape.color);
            landscape.textContent = colorAndLandcape.landscape;
            break;
        }
    }
};

const getLatLon = (place) => {
    return axios
        .get(LOCATION_URL, {
            params: {
                q: place,
            },
        })
        .then(response => {
            const { lat, lon } = response.data[0];
            return { lat, lon };
        })
        .catch(error => {
            console.log('Could not get location:', error);
        });
};

const getWeather = async () => {
    try {
        const location = await getLatLon(state.headerCityName);
        if (!location || location.lat == null || location.lon == null) {
            throw new Error(`Could not find coordinates for "${state.headerCityName}"`);
        }
        const { lat, lon } = location;


        const weatherResponse = await axios.get(WEATHER_URL, { params: { lat, lon } });

        const tempKelvin = weatherResponse.data.main.temp;
        if (!Number.isFinite(tempKelvin)) {
            throw new Error('Temperature not found');
        }
        state.tempValue = Math.round((tempKelvin - 273.15) * (9 / 5) + 32);
        render();
    } catch (error) {
        console.error('Error fetching weather data', error);
    }
};

const resetCityName = () => {
    document.getElementById('cityNameInput').value = "Seattle";
    updateCityName();
};

const switchToFahrenheit = () => {
    state.unit = 'F'
    render();
};

const switchToCelsius = () => {
    state.unit = 'C';
    render();
};

const registerEventHandler = (event) => {
    document.getElementById('increaseTempControl').addEventListener('click', increaseTemp);
    document.getElementById('decreaseTempControl').addEventListener('click', decreaseTemp);
    document.getElementById('cityNameInput').addEventListener('input', updateCityName);
    document.getElementById('currentTempButton').addEventListener('click', getWeather);
    document.getElementById('cityNameReset').addEventListener('click', resetCityName);
    document.getElementById('tempInC').addEventListener('click', switchToCelsius);
    document.getElementById('tempInF').addEventListener('click', switchToFahrenheit);
    render();
};

document.addEventListener('DOMContentLoaded', registerEventHandler);

const fahrenheitToCelsius = (f) => {
    return (f - 32) * 5 / 9;
};

const celsiusToFahrenheit = (c) => {
    return c * 9 / 5 + 32;
};

const getColorsList = () => [...TEMP_RANGES.values()].map(({ color }) => color);