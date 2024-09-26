from django.shortcuts import render
from restaurant_search.models import Restaurant

def search_view(request):
    # Fetch all restaurants without fetching favorites (handled client-side now)
    restaurants = Restaurant.objects.all()  
    
    return render(request, 'restaurant_search/search.html', {
        'restaurants': restaurants
    })
