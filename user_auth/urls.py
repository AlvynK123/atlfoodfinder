from django.urls import path
from . import views
from django.contrib.auth import views as auth_views

urlpatterns = [
    # User authentication routes
    path('register/', views.registerPage, name='register'),
    path('login/', views.loginPage, name='login'),
    path('logout/', views.logoutUser, name='logout'),
    path('profile/', views.profile, name='profile'),

    # Search and restaurant favorite routes
    path('search/', views.search_view, name='search'),
]
