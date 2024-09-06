from django.shortcuts import render

def login_view(request):
    return render(request, 'user_auth/login.html')