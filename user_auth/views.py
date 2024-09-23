from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth.forms import UserCreationForm
from .forms import CreateUserForm
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from restaurant_search.models import Restaurant


# Login view
def loginPage(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return redirect('search')
        else:
            messages.info(request, 'Username OR Password Incorrect')

    context = {}
    return render(request, "user_auth/login.html", context)

# Registration view
def registerPage(request):
    form = CreateUserForm()

    if request.method == 'POST':
        form = CreateUserForm(request.POST)
        if form.is_valid():
            form.save()
            user = form.cleaned_data.get('username')
            messages.success(request, 'Account Created for ' + user)
            return redirect('login')

    context = {'form': form}
    return render(request, "user_auth/register.html", context)

# Logout view
def logoutUser(request):
    logout(request)
    return redirect('search')

# Search view to display restaurants
def search_view(request):
    restaurants = Restaurant.objects.all()  # Fetch all restaurants
    user_favorites = request.user.profile.favorites.all() if request.user.is_authenticated else []
    
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

# Profile view to display user details and favorite restaurants
@login_required
def profile(request):
    profile = request.user.profile
    favorites = profile.favorites.all()  # Get all favorite restaurants for the user
    
    return render(request, 'user_auth/profile.html', {
        'user': request.user,
        'favorites': favorites
    })
