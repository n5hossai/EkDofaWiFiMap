let map;

function initMap() {
    map = L.map('map').setView([23.685, 90.3563], 12);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        updateWhenIdle: true,
        updateWhenZooming: false

    }).addTo(map);

    // Set bounds for Bangladesh
    const bounds = [
        [20.0, 88.0], // Southwest corner
        [27.0, 93.0]  // Northeast corner
    ];

    map.setMaxBounds(bounds);
    map.fitBounds(bounds);

    loadHotspots();
}


// In map.js

// Add these lines to define custom marker icons with Font Awesome
const wifiIcon = L.divIcon({
    className: 'custom-icon',
    html: '<i class="fa fa-map-marker" style="font-size:24px;color:orange"></i>', // change color to yellow for WiFi
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

const reliefIcon = L.divIcon({
    className: 'custom-icon',
    html: '<i class="fa fa-map-marker" style="font-size:24px;color:green"></i>', // change color to green for Relief
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

const starIcon = L.divIcon({
    className: 'custom-icon',
    html: '<i class="fa fa-star" style="font-size:24px;color:red"></i>', // Red star icon
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

function addHotspotWifi(hotspot) {
    L.marker([hotspot.location.latitude, hotspot.location.longitude], { icon: wifiIcon })
        .addTo(map)
        .bindPopup(`<b>WiFi Hotspot</b><br>SSID: ${hotspot.wifiCredential.ssid}<br>Password: ${hotspot.wifiCredential.password}<br>Message: ${hotspot.message}`);
}

function addHotspotRelief(hotspot) {
    L.marker([hotspot.location.latitude, hotspot.location.longitude], { icon: reliefIcon })
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

let isAddingHotspot = false; // Flag to track if a hotspot is being added
document.addEventListener('DOMContentLoaded', function() {
    const addWifiHotspotBtn = document.getElementById('addWifiHotspotBtn');
    const addReliefHotspotBtn = document.getElementById('addReliefHotspotBtn');
    const wifiForm = document.getElementById('addWifiHotspotForm');
    const reliefForm = document.getElementById('addReliefHotspotForm');
    const wifiGetLocationBtn = document.getElementById('wifiGetLocation');
    const reliefGetLocationBtn = document.getElementById('reliefGetLocation');

    addWifiHotspotBtn.addEventListener('click', () => {
        if (isAddingHotspot) {
            alert("Please reload the page to add another hotspot.");
            return;
        }
        isAddingHotspot = true; // Set the flag
        wifiForm.style.display = 'block';
        reliefForm.style.display = 'none';
        map.getContainer().classList.add('pin-cursor');
        map.once('click', (e) => {
            document.getElementById('wifiLat').value = e.latlng.lat.toFixed(6);
            document.getElementById('wifiLon').value = e.latlng.lng.toFixed(6);
            L.marker([e.latlng.lat, e.latlng.lng], { icon: starIcon }).addTo(map); // Add star icon
            map.getContainer().classList.remove('pin-cursor');
        });
    });
    
    addReliefHotspotBtn.addEventListener('click', () => {
        if (isAddingHotspot) {
            alert("Please reload the page to add another hotspot.");
            return;
        }
        isAddingHotspot = true; // Set the flag
        reliefForm.style.display = 'block';
        wifiForm.style.display = 'none';
        map.getContainer().classList.add('pin-cursor');
        map.once('click', (e) => {
            document.getElementById('reliefLat').value = e.latlng.lat.toFixed(6);
            document.getElementById('reliefLon').value = e.latlng.lng.toFixed(6);
            L.marker([e.latlng.lat, e.latlng.lng], { icon: starIcon }).addTo(map); // Add star icon
            map.getContainer().classList.remove('pin-cursor');
        });
    });

    wifiGetLocationBtn.addEventListener('click', () => getLocation('wifi'));
    reliefGetLocationBtn.addEventListener('click', () => getLocation('relief'));

    document.getElementById('wifiHotspotForm').addEventListener('submit', (event) => {
        submitWifiHotspot(event);
        isAddingHotspot = false; // Reset the flag after submission
    });

    document.getElementById('reliefHotspotForm').addEventListener('submit', (event) => {
        submitReliefHotspot(event);
        isAddingHotspot = false; // Reset the flag after submission
    });
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

    sendHotspotData('/api/hotspots/wifi', hotspot).then(() => {
        // Clear existing markers
        map.eachLayer((layer) => {
            if (layer instanceof L.Marker && layer.options.icon === starIcon) {
                map.removeLayer(layer); // Remove the star icon
            }
        });
        loadHotspots(); // Reload hotspots
    });
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

    sendHotspotData('/api/hotspots/relief', hotspot).then(() => {
        // Clear existing markers
        map.eachLayer((layer) => {
            if (layer instanceof L.Marker && layer.options.icon === starIcon) {
                map.removeLayer(layer); // Remove the star icon
            }
        });
        loadHotspots(); // Reload hotspots
    });
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
        showAlertAndReload(url);
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

function showAlertAndReload(path) {
    let message = "Data added successfully!";
    if (path.endsWith('wifi')) {
        message = "WiFi Data added successfully!";
    } else if (path.endsWith('relief')) {
        message = "Relief Data added successfully!";
    }
    alert(message);
    setTimeout(function() {
        location.reload();
    }, 100);
}
