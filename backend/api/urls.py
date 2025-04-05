from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'courses', views.CourseViewSet)
router.register(r'user-courses', views.UserCourseViewSet, basename='user-course')
router.register(r'learning-paths', views.LearningPathViewSet, basename='learning-path')
router.register(r'milestones', views.MilestoneViewSet, basename='milestone')

course_router = routers.SimpleRouter()
course_router.register(r'courses', views.CourseDetailViewSet, basename='course-detail')

units_router = routers.NestedSimpleRouter(course_router, r'courses', lookup='course')
units_router.register(r'units', views.CourseUnitViewSet, basename='course-units')

topics_router = routers.NestedSimpleRouter(units_router, r'units', lookup='unit')
topics_router.register(r'topics', views.UnitTopicViewSet, basename='unit-topics')


urlpatterns = [
    path('', include(router.urls)),
    path('recommended/', views.recommended_courses, name='recommended-courses'),
    path('auth/', include('rest_framework.urls')),
    path('auth/user/', views.CurrentUserView.as_view(), name='current-user'),
    path('auth/login/', views.custom_login, name='custom-login'),
    path('auth/logout/', views.custom_logout, name='custom-logout'),
    path('auth/csrf-token/', views.get_csrf_token, name='csrf-token'),

    path('learning-profile/', views.get_learning_profile, name='learning-profile'),
    path('learning-profile/update/', views.update_learning_profile, name='update-learning-profile'),
    path('course-session/start/', views.start_course_session, name='start-course-session'),
    path('course-session/end/', views.end_course_session, name='end-course-session'),
    path('course/<int:course_id>/chat-history/', views.get_course_chat_history, name='course-chat-history'),
    path('learning-buddy/chat/', views.chat_with_learning_buddy, name='learning-buddy-chat'),
    path('learning-buddy/quiz-result/', views.save_quiz_result, name='save-quiz-result'),

    path('', include(course_router.urls)),
    path('', include(units_router.urls)),
    path('', include(topics_router.urls)),
    path('courses/<int:course_id>/progress/', views.get_course_progress, name='course-progress'),
    path('units/mark-completed/', views.mark_unit_completed, name='mark-unit-completed'),
    path('topics/mark-completed/', views.mark_topic_completed, name='mark-topic-completed'),
]