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
    headerCityName: 'Seattle',
    lat: 47.6038321,
    long: -122.3300624 
};

const render = () => {
    document.getElementById('tempValue').textContent = `${state.tempValue} °F`;
    tempColorAndLandscapeChange();
    document.getElementById('headerCityName').textContent = state.headerCityName;
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
    state.headerCityName = event.target.value;
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

const registerEventHandler = (event) => {
    document.getElementById('increaseTempControl').addEventListener('click', increaseTemp);
    document.getElementById('decreaseTempControl').addEventListener('click', decreaseTemp);
    document.getElementById('cityNameInput').addEventListener('input', updateCityName);
    render();
};

document.addEventListener('DOMContentLoaded', registerEventHandler);

const fahrenheitToCelsius = (f) => {
    return (f - 32) * 5 / 9;
};

const getColorsList = () => [...TEMP_RANGES.values()].map(({ color }) => color);

const getLatLon = (place) => {
  return axios
    .get(LOCATIONIQ_URL, {
      params: {
        key: LOCATIONIQ_API_KEY,
        q: place,
        format: 'json',
      },
    })
    .then(response => {
      const { lat, lon } = response.data[0];
      return { lat, lon };
    });
};

const updateLatLong = (place) => {
    getLatLon(place)
    .then(({ lat, lon }) => {
        state.lat = lat;
        state.long = lon;
    })
    .catch(error => {
        console.log('Could not get location:', error);
    });
};

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
