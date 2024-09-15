let map;
let service;
let infowindow;
let markers = [];

function initMap() {
    const location = { lat: 33.7756, lng: -84.3963 };

    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 15,
        center: location,
    });

    infowindow = new google.maps.InfoWindow();
    service = new google.maps.places.PlacesService(map);

    document.getElementById("search-form").addEventListener("submit", function(event) {
        event.preventDefault(); // Prevent page reload

        const name = document.getElementById("name").value;
        const cuisine = document.getElementById("cuisine").value;
        const locationInput = document.getElementById("location").value;

        // Validate search inputs
        if (!name && !cuisine && !locationInput) {
            alert("Please provide at least one search parameter.");
            return;
        }
        searchNearbyRestaurants(location, name, cuisine);
    });
}

function searchNearbyRestaurants(location, name, cuisine) {
    const request = {
        location: location,
        radius: '10000',
        type: ['restaurant'],
        keyword: name + ' ' + cuisine
    };

    service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            clearMarkers();
            results.forEach(place => createMarker(place));
            displaySearchResults(results);
        } else {
            alert("No restaurants found.");
        }
    });
}

function createMarker(place) {
    const marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location,
    });

    markers.push(marker);

    google.maps.event.addListener(marker, 'click', () => {
        infowindow.setContent(`
            <div>
                <strong>${place.name}</strong><br>
                Address: ${place.vicinity}<br>
                Rating: ${place.rating ? place.rating : 'N/A'}
            </div>
        `);
        infowindow.open(map, marker);
    });
}

function clearMarkers() {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
}

function displaySearchResults(restaurants) {
    const resultsDiv = document.getElementById("search-results");
    resultsDiv.innerHTML = '';

    if (restaurants.length === 0) {
        resultsDiv.innerHTML = '<p>No restaurants found.</p>';
        return;
    }

    restaurants.forEach(restaurant => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';

        // Check for photos
        let photoUrl = '';
        if (restaurant.photos && restaurant.photos.length > 0) {
            photoUrl = restaurant.photos[0].getUrl({ maxWidth: 200, maxHeight: 200 });
        } else {
            photoUrl = 'default-image.jpg'; // I need to change
        }

        // Filter cuisine types and turns them into text
        const cuisineTypes = restaurant.types.filter(type =>
            !['point_of_interest', 'establishment'].includes(type)
        );
        const cuisineText = cuisineTypes.map(type => type.replace(/_/g, ' ')).join(', ') || 'Cuisine not available';

        resultItem.innerHTML = `
            <img class="restaurant-img" src="${photoUrl}" alt="${restaurant.name}"><br>
            <strong>${restaurant.name}</strong><br>
            Cuisine: ${cuisineText}<br>
            Address: ${restaurant.vicinity}<br>
            Rating: ${restaurant.rating ? restaurant.rating : 'N/A'}
        `;
        resultsDiv.appendChild(resultItem);
    });
}
