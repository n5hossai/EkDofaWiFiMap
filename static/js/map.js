let map;

function initMap() {
    map = L.map('map').setView([23.685, 90.3563], 12);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        updateWhenIdle: true,
        updateWhenZooming: false
    }).addTo(map);

    loadHotspots();
}


function addHotspotWifi(hotspot) {
    L.marker([hotspot.location.latitude, hotspot.location.longitude])
        .addTo(map)
        .bindPopup(`<b>WiFi Hotspot</b><br>SSID: ${hotspot.wifiCredential.ssid}<br>Password: ${hotspot.wifiCredential.password}<br>Message: ${hotspot.message}`);
}

function addHotspotRelief(hotspot) {
    L.marker([hotspot.location.latitude, hotspot.location.longitude])
        .addTo(map)
        .bindPopup(`<b>${hotspot.type} Relief</b><br>Contact: ${hotspot.contactNumber}<br>Message: ${hotspot.message}`);
}

function loadHotspots() {
    Promise.all([
        fetch('/static/data/wifiHotspots.json').then(response => response.json()),
        fetch('/static/data/reliefHotspots.json').then(response => response.json())
    ])
    .then(([wifiHotspots, reliefHotspots]) => {
        wifiHotspots.forEach(addHotspotWifi);
        reliefHotspots.forEach(addHotspotRelief);
    })
    .catch(error => console.error('Error loading hotspots:', error));
}

function searchLocation(query) {
    fetch(`/search?q=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            if (data.lat && data.lon) {
                map.setView([data.lat, data.lon], 13);
                L.marker([data.lat, data.lon]).addTo(map)
                    .bindPopup(query)
                    .openPopup();
            } else {
                alert('Location not found');
            }
        })
        .catch(error => console.error('Error:', error));
}

function getLiveLocation() {
    alert("Getting live location..."); // Add this alert for debugging
    console.log("getLiveLocation function called");
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            map.setView([lat, lon], 13);
            L.marker([lat, lon]).addTo(map)
                .bindPopup("You are here")
                .openPopup();
        }, function(error) {
            alert("Error getting location: " + error.message);
        });
    } else {
        alert("Geolocation is not supported by your browser");
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initMap();
    
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    function performSearch() {
        const query = searchInput.value;
        searchLocation(query);
    }
    
    searchButton.addEventListener('click', performSearch)

    searchInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            performSearch();
        }
    });

    document.getElementById('live-location-button').addEventListener('click', getLiveLocation);
});

document.addEventListener('DOMContentLoaded', function() {
    const addWifiHotspotBtn = document.getElementById('addWifiHotspotBtn');
    const addReliefHotspotBtn = document.getElementById('addReliefHotspotBtn');
    const wifiForm = document.getElementById('addWifiHotspotForm');
    const reliefForm = document.getElementById('addReliefHotspotForm');
    const wifiGetLocationBtn = document.getElementById('wifiGetLocation');
    const reliefGetLocationBtn = document.getElementById('reliefGetLocation');

    addWifiHotspotBtn.addEventListener('click', () => {
        wifiForm.style.display = 'block';
        reliefForm.style.display = 'none';
    });

    addReliefHotspotBtn.addEventListener('click', () => {
        reliefForm.style.display = 'block';
        wifiForm.style.display = 'none';
    });

    wifiGetLocationBtn.addEventListener('click', () => getLocation('wifi'));
    reliefGetLocationBtn.addEventListener('click', () => getLocation('relief'));

    document.getElementById('wifiHotspotForm').addEventListener('submit', submitWifiHotspot);
    document.getElementById('reliefHotspotForm').addEventListener('submit', submitReliefHotspot);
});

function getLocation(type) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            document.getElementById(`${type}Lat`).value = position.coords.latitude.toFixed(6);
            document.getElementById(`${type}Lon`).value = position.coords.longitude.toFixed(6);
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function submitWifiHotspot(event) {
    event.preventDefault();
    const lat = document.getElementById('wifiLat').value;
    const lon = document.getElementById('wifiLon').value;
    
    if (!validateCoordinates(lat, lon)) {
        return;
    }

    const hotspot = {
        id: Date.now(),
        location: {
            latitude: parseFloat(lat),
            longitude: parseFloat(lon)
        },
        wifiCredential: {
            ssid: document.getElementById('wifiSSID').value,
            password: document.getElementById('wifiPassword').value
        },
        message: document.getElementById('wifiMessage').value || null
    };
    
    const number = document.getElementById('wifiNumber').value;
    if (number) hotspot.number = number;

    sendHotspotData('/api/hotspots/wifi', hotspot);
}

function submitReliefHotspot(event) {
    event.preventDefault();
    const lat = document.getElementById('reliefLat').value;
    const lon = document.getElementById('reliefLon').value;
    
    if (!validateCoordinates(lat, lon)) {
        return;
    }

    const hotspot = {
        id: Date.now(),
        type: document.getElementById('reliefType').value,
        location: {
            latitude: parseFloat(lat),
            longitude: parseFloat(lon)
        },
        contactNumber: document.getElementById('reliefContactNumber').value || null,
        message: document.getElementById('reliefMessage').value || null
    };

    sendHotspotData('/api/hotspots/relief', hotspot);
}

function sendHotspotData(url, data) {
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data); // Log the entire response
        if (data.location) {
            map.setView([data.location.latitude, data.location.longitude], 13);
            console.log('Hotspot data:', data.location.latitude);
        } else {
            console.error('Location data is missing:', data);
        }
        // Clear existing markers
        map.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });
        // Reload all hotspots
        loadHotspots();
    })
    .catch((error) => {
        console.error('Error:', error);
        if (data && data.location) {
            console.log('Hotspot error:', data.location.latitude);
        } else {
            console.error('Location data is missing in error:', data);
        }
    });
}

function isValidCoordinate(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}

function validateCoordinates(lat, lon) {
    if (!isValidCoordinate(lat) || !isValidCoordinate(lon)) {
        alert("Please enter valid latitude and longitude values.");
        return false;
    }
    const latValue = parseFloat(lat);
    const lonValue = parseFloat(lon);
    if (latValue < -90 || latValue > 90 || lonValue < -180 || lonValue > 180) {
        alert("Latitude must be between -90 and 90, and longitude must be between -180 and 180.");
        return false;
    }
    return true;
}