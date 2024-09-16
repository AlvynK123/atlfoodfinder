let map;
let service;
let infowindow;
let markers = [];

function initMap() {
    const location = { lat: 33.7756, lng: -84.3963 };

    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 11,
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
            results.forEach((place, index) => createMarker(place, index + 1));
            displaySearchResults(results);
        } else {
            alert("No restaurants found.");
        }
    });
}

function createMarker(place, number) {
    const marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location,
        label: number.toString(),
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

function getStarRating(rating) {
    const maxStars = 5;
    let starHtml = '<div class="star-rating">';

    for (let i =  1; i <= maxStars; i++) {
        if (i <= rating) {
            starHtml += '<i class="fa-solid fa-star" style="color: #ffd95a;"></i>'; // Full star
        } else if (i - rating <= 0.5) {
            starHtml += '<i class="fa-regular fa-star-half-stroke" style="color: #ffd95a;"></i>'; // Half star
        } else {
            starHtml += '<i class="fa-regular fa-star" style="color: #ffd95a;"></i>'; // Empty star
        }

    }
    return starHtml;
}

function displaySearchResults(restaurants) {
    const resultsDiv = document.getElementById("search-results");
    resultsDiv.innerHTML = '';

    if (restaurants.length === 0) {
        resultsDiv.innerHTML = '<p>No restaurants found.</p>';
        return;
    }

    restaurants.forEach((restaurant, index) => {
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

        const starRatingHtml = getStarRating(restaurant.rating || 0);

        resultItem.innerHTML = `
        <img class="restaurant-img" src="${photoUrl}" alt="${restaurant.name}">
        <div class="result-item-details">
            <strong>${index + 1}. ${restaurant.name}</strong>
            <div class="star-rating">${starRatingHtml}</div>
            <div>Cuisine: ${cuisineText}</div>
            <div>Address: ${restaurant.vicinity}</div>
        </div>
    `;
        resultsDiv.appendChild(resultItem);
    });
}
