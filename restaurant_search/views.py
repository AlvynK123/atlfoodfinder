from django.shortcuts import render

def search_view(request):
    return render(request, 'restaurant_search/search.html')