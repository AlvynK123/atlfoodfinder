from django.urls import path
from . import views

urlpatterns = [
    path('search/', views.search_view, name='search'),
    path('toggle_favorite/<int:restaurant_id>/', views.toggle_favorite, name='toggle_favorite'),
]
