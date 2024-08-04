let map;

function initMap() {
    map = L.map('map').setView([23.7273, 90.3973], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
    fetch('/static/data/wifiHotspots.json')
        .then(response => response.json())
        .then(wifiHotspots => {
            wifiHotspots.forEach(addHotspotWifi);
        })
        .catch(error => console.error('Error loading WiFi hotspots:', error));

    fetch('/static/data/reliefHotspots.json')
        .then(response => response.json())
        .then(reliefHotspots => {
            reliefHotspots.forEach(addHotspotRelief);
        })
        .catch(error => console.error('Error loading relief hotspots:', error));
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
    
    searchButton.addEventListener('click', performSearch);

    searchInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            performSearch();
        }
    });

    document.getElementById('live-location-button').addEventListener('click', getLiveLocation);
});