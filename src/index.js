const DELAY = 1000;

const TEMP_RANGES = new Map([
    [80, { 'color': 'red', 'landscape': '🌵__🐍_🦂_🌵🌵__🐍_🏜_🦂' }],
    [70, { 'color': 'orange', 'landscape': '🌸🌿🌼__🌷🌻🌿_☘️🌱_🌻🌷' }],
    [60, { 'color': 'yellow', 'landscape': '🌾🌾_🍃_🪨__🛤_🌾🌾🌾_🍃' }],
    [50, { 'color': 'green', 'landscape': '🌲🌲⛄️🌲⛄️🍂🌲🍁🌲🌲⛄️🍂🌲' }],
    [-Infinity, { 'color': 'teal', 'landscape': '🌲🌲⛄️🌲⛄️🍂🌲🍁🌲🌲⛄️🍂🌲' }],
]);

const state = {
    tempValue: 70,
    cityName: 'Seattle'
};

const render = () => {
    document.getElementById('tempValue').textContent = `${state.tempValue} °F`;
    tempColorAndLandscapeChange();
    document.getElementById('headerCityName').textContent = state.cityName;
};

const increaseTemp = (event) => {
    state.tempValue++;
    render();
};

const decreaseTemp = (event) => {
    state.tempValue--;
    render();
};

const updateCityName = (event) => {
    state.cityName = event.target.value;
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

const getWeather = async () => {
    try {
        const location = await getLatLon(state.cityName);
        if (!location || location.lat == null || location.lon == null) {
            throw new Error(`Could not find coordinates for "${state.cityName}"`);
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

const registerEventHandler = (event) => {
    document.getElementById('increaseTempControl').addEventListener('click', increaseTemp);
    document.getElementById('decreaseTempControl').addEventListener('click', decreaseTemp);
    document.getElementById('cityNameInput').addEventListener('input', updateCityName);
    document.getElementById('currentTempButton').addEventListener('click', getWeather);
    render();
};

document.addEventListener('DOMContentLoaded', registerEventHandler);

const fahrenheitToCelsius = (f) => {
    return (f - 32) * 5 / 9;
};

const getColorsList = () => [...TEMP_RANGES.values()].map(({ color }) => color);

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

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
