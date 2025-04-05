from django.urls import path
from . import views

urlpatterns = [
    # ...other URLs
    path('api/user/profile-image/', views.update_profile_image, name='update_profile_image'),
]