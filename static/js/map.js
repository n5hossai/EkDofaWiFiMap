let map;

function initMap() {
    map = L.map('map').setView([23.7273, 90.3973], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
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

document.addEventListener('DOMContentLoaded', function() {
    initMap();
    
    document.getElementById('search-button').addEventListener('click', function() {
        const query = document.getElementById('search-input').value;
        searchLocation(query);
    });
});