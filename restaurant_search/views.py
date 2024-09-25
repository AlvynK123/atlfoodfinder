from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Restaurant, UserFavorite

def search_view(request):
    # Fetch all restaurants
    restaurants = Restaurant.objects.all()

    # Fetch user's favorite restaurant IDs if they are authenticated
    user_favorites = []
    if request.user.is_authenticated:
        # Get only the restaurant IDs that the user has favorited
        user_favorites = list(UserFavorite.objects.filter(user=request.user).values_list('restaurant_id', flat=True))

    # Pass restaurant data along with favorite status to the template
    return render(request, 'restaurant_search/search.html', {
        'restaurants': restaurants,       # All restaurants
        'user_favorites': user_favorites  # List of restaurant IDs that the user has favorited
    })


@login_required
def toggle_favorite(request, restaurant_id):
    restaurant = get_object_or_404(Restaurant, id=restaurant_id)
    user = request.user

    # Check if the restaurant is already in the user's favorites
    favorite_exists = UserFavorite.objects.filter(user=user, restaurant=restaurant).exists()

    if favorite_exists:
        # Remove from favorites if it already exists
        UserFavorite.objects.filter(user=user, restaurant=restaurant).delete()
    else:
        # Add to favorites if it doesn't exist
        UserFavorite.objects.create(user=user, restaurant=restaurant)

    # Redirect back to the referring page
    return redirect(request.META.get('HTTP_REFERER', '/'))

