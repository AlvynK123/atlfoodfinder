let map;
let service;
let infowindow;
let markers = [];
let autocomplete; 
let resultsPage = 0;

document.addEventListener('DOMContentLoaded', function() {
    if (typeof google !== 'undefined') {
        initMap();
        getUserLocation();
    } else {
        console.error("Google Maps API is not available.");
    }
});

function initMap() {
    const location = { lat: 33.749, lng: -84.388 };

    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 11,
        center: location,
    });

    infowindow = new google.maps.InfoWindow();
    service = new google.maps.places.PlacesService(map);

    const locationInput = document.getElementById("location");
    autocomplete = new google.maps.places.Autocomplete(locationInput, {
        types: ['geocode'], // Search for addresses, neighborhoods, postal codes
        componentRestrictions: { country: "us" }, // Restrict to US
    });
    
    // Bias autocomplete results to Atlanta, GA
    autocomplete.setBounds(new google.maps.LatLngBounds(
        { lat: 33.5, lng: -84.6 }, // Southwest boundary
        { lat: 34.0, lng: -84.0 }  // Northeast boundary
    ));
    
    autocomplete.addListener('place_changed', onPlaceChanged);

    document.getElementById("search-form").addEventListener("submit", function(event) {
        event.preventDefault(); // Prevent page reload
    
        const name = document.getElementById("name").value;
        const cuisine = document.getElementById("cuisine").value;
        const minRating = document.getElementById("min-rating").value;
        const distance = document.getElementById("distance").value; 
        const locationInputValue = locationInput.value;
    
        if (!name && !cuisine && !locationInput) {
            alert("Please provide at least one search parameter.");
            return;
        }

        if (locationInputValue) {
            const selectedPlace = autocomplete.getPlace();
            const location = selectedPlace ? selectedPlace.geometry.location : null;
            if (location) {
                searchNearbyRestaurants(location, name, cuisine, minRating, distance);
            }
        } 
        else if (userLocation) {
            searchNearbyRestaurants(userLocation, name, cuisine, minRating, distance);
        } else {
            alert("Please enable location services or enter a location.");
        }

    });
}

function onPlaceChanged() {
    const place = autocomplete.getPlace();
    if (!place.geometry) {
        alert("No details available for input: '" + place.name + "'");
        return;
    }

    map.setCenter(place.geometry.location);
    map.setZoom(13);
}

function searchNearbyRestaurants(location, name, cuisine, minRating, distance) {
    const radius = (distance === "Nearby" || distance === "Distance") ? "10000" : distance;
    
    const request = {
        location: location,
        radius: radius, 
        type: ['restaurant'],
        keyword: `${name} ${cuisine}`
    };

    service.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
            clearMarkers();

            const filteredResults = results.filter(restaurant => {
                return (restaurant.rating || 0) >= minRating;
            });

            if (filteredResults.length === 0) {
                document.getElementById('search-results').innerHTML = '<p>No restaurants found matching the criteria.</p>';
                return;
            }

            const sortOrder = document.getElementById("min-rating").value;
            let sortedResults;

            sortedResults = filteredResults;
            
            if (sortOrder === 0 || sortOrder == 1) {
                sortedResults = filteredResults;
            } else if (sortOrder == 2) {
                sortedResults = filteredResults.sort((a, b) => b.rating - a.rating);
            } 

            sortedResults.forEach((place, index) => {
                createMarker(place, index + 1);
            });

            displaySearchResults(sortedResults);

        } else {
            alert("No restaurants found.");
        }
    });
}

function clearMarkers() {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
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
                <br><a href="https://www.google.com/maps/place/?q=place_id:${place.place_id}" target="_blank">
                    <button class="info-button">View on Google Maps</button>
                </a>
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

// Function to add/remove favorites with detailed information
function toggleFavorite(restaurant) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    const index = favorites.findIndex(fav => fav.place_id === restaurant.place_id);

    if (index !== -1) {
        // If the restaurant is already in favorites, remove it
        favorites.splice(index, 1);
        alert(`${restaurant.name} removed from favorites.`);
    } else {
        // Extract cuisine types from the restaurant's types array
        const cuisineTypes = restaurant.types ? restaurant.types.filter(type =>
            !['point_of_interest', 'establishment'].includes(type)
        ) : [];
        
        const cuisine = cuisineTypes.length > 0 ? cuisineTypes.map(type => type.replace(/_/g, ' ')).join(', ') : 'Cuisine not available';

        // Fetch additional details including reviews and website from Google Places API
        const service = new google.maps.places.PlacesService(document.createElement('div'));
        const request = {
            placeId: restaurant.place_id,
            fields: ['name', 'formatted_address', 'rating', 'website', 'reviews', 'photos']
        };

        service.getDetails(request, (place, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                favorites.push({
                    name: place.name,
                    cuisine: cuisine,  // Use extracted cuisine information
                    location: place.formatted_address || restaurant.vicinity || 'Location not available',
                    imageUrl: (place.photos && place.photos.length > 0) ? place.photos[0].getUrl({ maxWidth: 16000, maxHeight: 1200 }) : 'https://www.groupestate.gr/images/joomlart/demo/default.jpg',
                    rating: place.rating || 0,
                    place_id: restaurant.place_id,
                    website: place.website || 'Website not available',
                    reviews: place.reviews || []  // Save reviews for later display
                });

                alert(`${place.name} added to favorites.`);
                // Save the updated favorites list back to localStorage
                localStorage.setItem('favorites', JSON.stringify(favorites));
            } else {
                console.error('Error fetching restaurant details:', status);
            }
        });
    }
}


// Function to check if restaurant is in favorites
function isFavorite(placeId) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    return favorites.some(fav => fav.place_id === placeId);
}

function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            map.setCenter(userLocation);
        }, () => {
            console.error('Error fetching geolocation.');
        });
    } else {
        console.error('Geolocation not supported by this browser.');
    }
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

        let photoUrl = '';
        if (restaurant.photos && restaurant.photos.length > 0) {
            photoUrl = restaurant.photos[0].getUrl({ maxWidth: 800, maxHeight: 600 });
        } else {
            photoUrl = 'https://www.groupestate.gr/images/joomlart/demo/default.jpg'; //default iamge
        }

        const cuisineTypes = restaurant.types.filter(type =>
            !['point_of_interest', 'establishment'].includes(type)
        );
        const cuisineText = cuisineTypes.map(type => type.replace(/_/g, ' ')).join(', ') || 'Cuisine not available';

        const starRatingHtml = getStarRating(restaurant.rating || 0);

        const isFav = isFavorite(restaurant.place_id);

        resultItem.innerHTML = `
        <img class="restaurant-img" src="${photoUrl}" alt="${restaurant.name}">
        <div class="result-item-details">
            <strong>${index + 1}. ${restaurant.name}</strong>
            <div class="star-rating">${starRatingHtml}</div>
            <div class="cuisine">Cuisine: ${cuisineText}</div>
            <div class="address">Address: ${restaurant.vicinity}</div>

            <button class="info-button" data-place-id="${restaurant.place_id}">More Info</button>

            <button class="favorite-button ${isFav ? 'favorited' : ''}" data-place-id="${restaurant.place_id}">
                <i class="fa${isFav ? ' fa-solid' : ' fa-regular'} fa-heart"></i> <!-- Heart Icon -->
            </button>
        </div>
    `;
        resultsDiv.appendChild(resultItem);
    });

    document.querySelectorAll('.info-button').forEach(button => {
        button.addEventListener('click', function() {
            const placeId = this.getAttribute('data-place-id');
            showPopup(placeId);
        });
    });
    
    document.querySelectorAll('.favorite-button').forEach(button => {
        button.addEventListener('click', function() {
            const placeId = this.getAttribute('data-place-id');
            const restaurant = restaurants.find(res => res.place_id === placeId);
            toggleFavorite(restaurant);

            // Update the button state
            this.classList.toggle('favorited');
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-solid');
            icon.classList.toggle('fa-regular');
        });
    });
}


function showPopup(placeId) {

    const request = {
        placeId: placeId,
        fields: ['name', 'formatted_address', 'formatted_phone_number', 'rating', 'website', 'reviews'],
        reviews_sort: 'most_relevant', // Optional: to sort the reviews in a specific way
        reviews_max: 10 // Request up to 10 reviews
    };

    service.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            const popup = document.getElementById("restaurant-popup");
            const popupDetails = document.getElementById("popup-details");

            let reviewsHtml = '';
            if (place.reviews && place.reviews.length > 0) {
                reviewsHtml = place.reviews.slice(0, 10).map(review => `
                    <div class="review">
                        <strong>${review.author_name}</strong>
                        <div class="star-rating">${getStarRating(review.rating)}</div>
                        <p>${review.text}</p>
                    </div>
                `).join('');
            } else {
                reviewsHtml = '<p>No reviews available.</p>';
            }


            popupDetails.innerHTML = `
                <h2>${place.name}</h2>
                <p>Address: ${place.formatted_address}</p>
                <p>Phone: ${place.formatted_phone_number || 'N/A'}</p>
                <p>Rating: ${place.rating || 'N/A'}</p>
                <p>Website: ${place.website ? `<a href="${place.website}" target="_blank">${place.website}</a>` : 'N/A'}</p>
                <br><a href="https://www.google.com/maps/place/?q=place_id=${place.place_id}" target="_blank">
                    <button class="info-button">View on Google Maps</button>
                </a>
                <h3>Reviews:</h3>
                <div class="reviews" style="max-height: 200px; overflow-y: auto;">
                    ${reviewsHtml}
                </div>
            `;

            popup.classList.remove("hidden");
            popup.classList.add("show");

            document.querySelector('.close-popup-btn').addEventListener('click', closePopup);
        }
    });
}

function closePopup() {
    const popup = document.getElementById('restaurant-popup');
    popup.classList.add('hidden');
    popup.classList.remove('show');
}
