from django.shortcuts import render

def search_view(request):
    return render(request, 'restaurant_search/search.html')

def user_auth(request):
    return render(request, 'user_auth\login.html')