from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from .models import Course, UserCourse, LearningPath, PathMilestone, Unit, Topic, UserTopic
from .serializers import (
    UserSerializer, CourseSerializer, UserCourseSerializer,
    LearningPathSerializer, PathMilestoneSerializer, UnitSerializer,
    UnitDetailSerializer, TopicSerializer, TopicDetailSerializer, UserTopicSerializer, CourseDetailSerializer
)
import datetime
from django.utils import timezone
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
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CourseDetailSerializer
        return CourseSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context
    
    @action(detail=True, methods=['get'])
    def progress(self, request, pk=None):
        course = self.get_object()
        serializer = CourseDetailSerializer(course, context={'request': request})
        return Response({
            'overall_progress': serializer.data['overall_progress'],
            'completed_units': serializer.data['completed_units'],
            'units': serializer.data['units']
        })

class UnitViewSet(viewsets.ModelViewSet):
    queryset = Unit.objects.all()
    serializer_class = UnitSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return UnitDetailSerializer
        return UnitSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

class TopicViewSet(viewsets.ModelViewSet):
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return TopicDetailSerializer
        return TopicSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

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


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_topic_completed(request):
    """Mark a topic as completed for the current user."""
    topic_id = request.data.get('topic_id')
    
    if not topic_id:
        return Response({'error': 'topic_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        topic = Topic.objects.get(id=topic_id)
    except Topic.DoesNotExist:
        return Response({'error': 'Topic not found'}, status=status.HTTP_404_NOT_FOUND)
    
    user_topic, created = UserTopic.objects.get_or_create(
        user=request.user,
        topic=topic,
        defaults={'is_completed': True, 'completed_at': timezone.now()}
    )
    
    if not created and not user_topic.is_completed:
        user_topic.is_completed = True
        user_topic.completed_at = timezone.now()
        user_topic.save()
    
    # Update user's course progress
    course = topic.unit.course
    total_topics = Topic.objects.filter(unit__course=course).count()
    completed_topics = UserTopic.objects.filter(
        user=request.user, 
        topic__unit__course=course,
        is_completed=True
    ).count()
    
    progress = int((completed_topics / total_topics) * 100) if total_topics > 0 else 0
    
    user_course, _ = UserCourse.objects.get_or_create(
        user=request.user,
        course=course,
        defaults={'progress': progress}
    )
    
    user_course.progress = progress
    user_course.is_completed = (progress == 100)
    user_course.save()
    
    return Response({
        'status': 'success',
        'message': f'Topic {topic.title} marked as completed',
        'progress': progress
    })

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_unit_completed(request):
    """Mark all topics in a unit as completed for the current user."""
    unit_id = request.data.get('unit_id')
    
    if not unit_id:
        return Response({'error': 'unit_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        unit = Unit.objects.get(id=unit_id)
    except Unit.DoesNotExist:
        return Response({'error': 'Unit not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Mark all topics in the unit as completed
    current_time = timezone.now()
    topics = unit.topics.all()
    
    for topic in topics:
        UserTopic.objects.update_or_create(
            user=request.user,
            topic=topic,
            defaults={'is_completed': True, 'completed_at': current_time}
        )
    
    # Update user's course progress
    course = unit.course
    total_topics = Topic.objects.filter(unit__course=course).count()
    completed_topics = UserTopic.objects.filter(
        user=request.user, 
        topic__unit__course=course,
        is_completed=True
    ).count()
    
    progress = int((completed_topics / total_topics) * 100) if total_topics > 0 else 0
    
    user_course, _ = UserCourse.objects.get_or_create(
        user=request.user,
        course=course,
        defaults={'progress': progress}
    )
    
    user_course.progress = progress
    user_course.is_completed = (progress == 100)
    user_course.save()
    
    return Response({
        'status': 'success',
        'message': f'Unit {unit.title} and all its topics marked as completed',
        'progress': progress
    })