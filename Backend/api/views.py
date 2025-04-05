from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from .models import Course, UserCourse, LearningPath, PathMilestone
from .serializers import (
    UserSerializer, CourseSerializer, UserCourseSerializer,
    LearningPathSerializer, PathMilestoneSerializer
)
from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from django.http import JsonResponse

class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]

class UserCourseViewSet(viewsets.ModelViewSet):
    serializer_class = UserCourseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return UserCourse.objects.filter(user=self.request.user)

class LearningPathViewSet(viewsets.ModelViewSet):
    serializer_class = LearningPathSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return LearningPath.objects.filter(user=self.request.user)

class MilestoneViewSet(viewsets.ModelViewSet):
    serializer_class = PathMilestoneSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user_paths = LearningPath.objects.filter(user=self.request.user).values_list('id', flat=True)
        return PathMilestone.objects.filter(learning_path__in=user_paths)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def recommended_courses(request):
    # This would eventually be your AI recommendation logic
    # For now, just return some courses
    user_courses = UserCourse.objects.filter(user=request.user)
    taken_course_ids = [uc.course.id for uc in user_courses]
    
    # Get courses the user hasn't taken yet
    recommended = Course.objects.exclude(id__in=taken_course_ids)[:4]
    serializer = CourseSerializer(recommended, many=True)
    
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def custom_login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    print("Login attempted")
    
    user = authenticate(request, username=username, password=password)
    
    if user is not None:
        login(request, user)
        serializer = UserSerializer(user)
        return Response(serializer.data)
    else:
        return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def custom_logout(request):
    logout(request)
    print("Successful Logout")
    return Response({'detail': 'Successfully logged out'})

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_csrf_token(request):
    csrf_token = get_token(request)
    return Response({'csrfToken': csrf_token})