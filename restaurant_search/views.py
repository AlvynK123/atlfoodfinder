from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Restaurant

# Search view to display restaurants
def search_view(request):
    restaurants = Restaurant.objects.all()  # Fetch all restaurants
    user_favorites = []
    if request.user.is_authenticated:
        user_favorites = request.user.profile.favorites.all()
    
    return render(request, 'restaurant_search/search.html', {
        'restaurants': restaurants,
        'user_favorites': user_favorites
    })

# Handles the toggling of favorite status
@login_required
def toggle_favorite_view(request, restaurant_id):
    restaurant = get_object_or_404(Restaurant, id=restaurant_id)
    profile = request.user.profile

    if restaurant in profile.favorites.all():
        profile.favorites.remove(restaurant)  # Remove from favorites
    else:
        profile.favorites.add(restaurant)  # Add to favorites

    return redirect('search')  # Redirect back to the search view after the toggle

# User authentication view
def user_auth(request):
    return render(request, 'user_auth/login.html')
