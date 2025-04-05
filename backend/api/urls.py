from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'courses', views.CourseViewSet)
router.register(r'user-courses', views.UserCourseViewSet, basename='user-course')
router.register(r'learning-paths', views.LearningPathViewSet, basename='learning-path')
router.register(r'milestones', views.MilestoneViewSet, basename='milestone')

urlpatterns = [
    path('', include(router.urls)),
    path('recommended/', views.recommended_courses, name='recommended-courses'),
    path('auth/', include('rest_framework.urls')),
    path('auth/user/', views.CurrentUserView.as_view(), name='current-user'),
    path('auth/login/', views.custom_login, name='custom-login'),
    path('auth/logout/', views.custom_logout, name='custom-logout'),
    path('auth/csrf-token/', views.get_csrf_token, name='csrf-token'),
]