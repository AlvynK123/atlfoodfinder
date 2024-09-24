from django.urls import path
from . import views

urlpatterns = [
    path('search/', views.search_view, name='search'),
    path('favorite/<int:restaurant_id>/', views.toggle_favorite_view, name='toggle_favorite'),
]
