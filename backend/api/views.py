from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from .models import Course, UserCourse, LearningPath, PathMilestone, UserLearningProfile, CourseInteraction, ChatMessage, UserQuizAttempt, CourseUnit, UnitTopic, UserUnitProgress, UserTopicProgress
from .serializers import (
    UserSerializer, CourseSerializer, UserCourseSerializer,
    LearningPathSerializer, PathMilestoneSerializer,
    UserLearningProfileSerializer, CourseInteractionSerializer,
    ChatMessageSerializer, UserQuizAttemptSerializer, UserUnitProgressSerializer,
    UserTopicProgressSerializer, CourseUnitSerializer, UnitTopicSerializer, CourseDetailSerializer
)
from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from django.http import JsonResponse
import google.generativeai as genai

def ask_gemini(prompt):
    formatted_prompt = prompt
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(formatted_prompt)
    return response.text
    
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


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def start_course_session(request):
    """Record the start of a user's course session."""
    course_id = request.data.get('course_id')
    
    try:
        course = Course.objects.get(id=course_id)
        interaction = CourseInteraction.objects.create(
            user=request.user,
            course=course
        )
        return Response({'session_id': interaction.id})
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=404)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def end_course_session(request):
    """Record the end of a user's course session and calculate duration."""
    session_id = request.data.get('session_id')
    
    try:
        interaction = CourseInteraction.objects.get(id=session_id, user=request.user)
        if not interaction.session_end:
            interaction.session_end = datetime.datetime.now()
            # Calculate session duration in seconds
            duration = (interaction.session_end - interaction.session_start).total_seconds()
            interaction.total_time = int(duration)
            interaction.save()
        
        return Response({
            'session_id': interaction.id,
            'duration': interaction.total_time
        })
    except CourseInteraction.DoesNotExist:
        return Response({'error': 'Session not found'}, status=404)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_learning_profile(request):
    """Get the user's learning profile or create one if it doesn't exist."""
    profile, created = UserLearningProfile.objects.get_or_create(user=request.user)
    serializer = UserLearningProfileSerializer(profile)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([permissions.IsAuthenticated])
def update_learning_profile(request):
    """Update the user's learning profile."""
    profile, created = UserLearningProfile.objects.get_or_create(user=request.user)
    serializer = UserLearningProfileSerializer(profile, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_course_chat_history(request, course_id):
    """Get chat history for a specific course."""
    try:
        course = Course.objects.get(id=course_id)
        messages = ChatMessage.objects.filter(
            user=request.user, 
            course=course
        ).order_by('timestamp')
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=404)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def chat_with_learning_buddy(request):
    """Send a message to the learning buddy and get a response."""
    course_id = request.data.get('course_id')
    message_content = request.data.get('message')
    
    if not course_id or not message_content:
        return Response({'error': 'Course ID and message are required'}, status=400)
    
    try:
        course = Course.objects.get(id=course_id)
        
        # Save user message
        user_message = ChatMessage.objects.create(
            user=request.user,
            course=course,
            content=message_content,
            is_from_ai=False,
            message_type='general'
        )
        
        # Get user's learning data
        profile, created = UserLearningProfile.objects.get_or_create(user=request.user)
        
        # Get recent course interactions
        interactions = CourseInteraction.objects.filter(
            user=request.user,
            course=course
        ).order_by('-session_start')[:5]
        
        # Get quiz attempts
        quizzes = UserQuizAttempt.objects.filter(
            user=request.user,
            course=course
        ).order_by('-timestamp')[:3]
        
        # Calculate stats
        total_time = sum(i.total_time for i in interactions if i.total_time)
        avg_session = total_time / max(1, interactions.count())
        
        # Build context for the AI
        context = {
            "user": request.user.username,
            "course_title": course.title,
            "learning_style": profile.learning_style,
            "course_difficulty": course.difficulty,
            "total_time_spent": f"{total_time // 60} minutes",
            "average_session": f"{avg_session // 60} minutes",
            "recent_quizzes": [
                {"topic": q.quiz_topic, "score": f"{q.score}/{q.max_score}"} for q in quizzes
            ]
        }
        
        # Format the prompt for the AI
        ai_prompt = f"""
        You are a learning buddy AI named "Leo" for a student taking the course "{course.title}".
        
        USER DATA:
        - Learning style: {profile.learning_style}
        - Time spent on this course: {total_time // 60} minutes
        - Average session length: {avg_session // 60} minutes
        - Course difficulty level: {course.difficulty}
        
        Provide a helpful, conversational response to the student's message. If they ask a question about the course content, 
        try to answer it based on general knowledge of {course.title}. If they're struggling, offer encouragement and study tips 
        aligned with their learning style.
        
        The student's message is: "{message_content}"
        """
        
        # Get AI response using the chatbot module
        ai_response = ask_gemini(ai_prompt)
        
        # Determine message type based on content analysis
        message_type = 'general'
        if '?' in message_content:
            message_type = 'question'
        if any(keyword in ai_response.lower() for keyword in ['quiz', 'test', 'question']):
            message_type = 'quiz'
        if any(keyword in ai_response.lower() for keyword in ['suggest', 'recommend', 'try']):
            message_type = 'suggestion'
        
        # Save AI response
        ai_message = ChatMessage.objects.create(
            user=request.user,
            course=course,
            content=ai_response,
            is_from_ai=True,
            message_type=message_type
        )
        
        return Response({
            'user_message': ChatMessageSerializer(user_message).data,
            'ai_response': ChatMessageSerializer(ai_message).data
        })
        
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=404)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def save_quiz_result(request):
    """Save a quiz attempt initiated by the learning buddy."""
    course_id = request.data.get('course_id')
    quiz_topic = request.data.get('quiz_topic')
    score = request.data.get('score')
    max_score = request.data.get('max_score', 100)
    
    try:
        course = Course.objects.get(id=course_id)
        quiz = UserQuizAttempt.objects.create(
            user=request.user,
            course=course,
            quiz_topic=quiz_topic,
            score=score,
            max_score=max_score
        )
        return Response(UserQuizAttemptSerializer(quiz).data)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=404)
    

class CourseDetailViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for detailed course information including units and topics"""
    serializer_class = CourseDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Course.objects.all()

class CourseUnitViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for course units"""
    serializer_class = CourseUnitSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        course_id = self.kwargs.get('course_pk')
        return CourseUnit.objects.filter(course_id=course_id)

class UnitTopicViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for unit topics"""
    serializer_class = UnitTopicSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        unit_id = self.kwargs.get('unit_pk')
        return UnitTopic.objects.filter(unit_id=unit_id)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_course_progress(request, course_id):
    """Get user's progress for a specific course"""
    try:
        course = Course.objects.get(id=course_id)
        
        # Get or create user-course relationship
        user_course, created = UserCourse.objects.get_or_create(
            user=request.user,
            course=course
        )
        
        # Get all units for this course
        units = CourseUnit.objects.filter(course=course)
        
        # Get user progress for each unit
        units_progress = []
        for unit in units:
            unit_progress, created = UserUnitProgress.objects.get_or_create(
                user=request.user,
                unit=unit
            )
            
            # Get topics for this unit
            topics = UnitTopic.objects.filter(unit=unit)
            
            # Get user progress for each topic
            topics_progress = []
            for topic in topics:
                topic_progress, created = UserTopicProgress.objects.get_or_create(
                    user=request.user,
                    topic=topic
                )
                topics_progress.append({
                    'id': topic.id,
                    'title': topic.title,
                    'is_completed': topic_progress.is_completed
                })
            
            units_progress.append({
                'id': unit.id,
                'title': unit.title,
                'progress': unit_progress.progress,
                'is_completed': unit_progress.is_completed,
                'topics': topics_progress
            })
        
        return Response({
            'course_id': course.id,
            'progress': user_course.progress,
            'is_completed': user_course.is_completed,
            'units': units_progress
        })
        
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=404)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_topic_completed(request):
    """Mark a topic as completed"""
    topic_id = request.data.get('topic_id')
    
    try:
        topic = UnitTopic.objects.get(id=topic_id)
        topic_progress, created = UserTopicProgress.objects.get_or_create(
            user=request.user,
            topic=topic
        )
        
        if not topic_progress.is_completed:
            topic_progress.is_completed = True
            topic_progress.completed_at = timezone.now()
            topic_progress.save()
            
            # Update unit progress
            update_unit_progress(request.user, topic.unit)
            
        return Response({
            'success': True,
            'topic_id': topic.id,
            'is_completed': True
        })
        
    except UnitTopic.DoesNotExist:
        return Response({'error': 'Topic not found'}, status=404)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_unit_completed(request):
    """Mark a unit as completed (e.g., after passing a quiz)"""
    unit_id = request.data.get('unit_id')
    
    try:
        unit = CourseUnit.objects.get(id=unit_id)
        unit_progress, created = UserUnitProgress.objects.get_or_create(
            user=request.user,
            unit=unit
        )
        
        if not unit_progress.is_completed:
            unit_progress.is_completed = True
            unit_progress.progress = 100
            unit_progress.completed_at = timezone.now()
            unit_progress.save()
            
            # Mark all topics as completed
            topics = UnitTopic.objects.filter(unit=unit)
            for topic in topics:
                topic_progress, created = UserTopicProgress.objects.get_or_create(
                    user=request.user,
                    topic=topic
                )
                topic_progress.is_completed = True
                topic_progress.completed_at = timezone.now()
                topic_progress.save()
            
            # Update course progress
            update_course_progress(request.user, unit.course)
            
        return Response({
            'success': True,
            'unit_id': unit.id,
            'is_completed': True
        })
        
    except CourseUnit.DoesNotExist:
        return Response({'error': 'Unit not found'}, status=404)

def update_unit_progress(user, unit):
    """Update a unit's progress based on completed topics"""
    total_topics = UnitTopic.objects.filter(unit=unit).count()
    completed_topics = UserTopicProgress.objects.filter(
        user=user, 
        topic__unit=unit,
        is_completed=True
    ).count()
    
    if total_topics > 0:
        progress_percentage = (completed_topics / total_topics) * 100
    else:
        progress_percentage = 0
    
    unit_progress, created = UserUnitProgress.objects.get_or_create(
        user=user,
        unit=unit
    )
    
    unit_progress.progress = int(progress_percentage)
    if progress_percentage == 100:
        unit_progress.is_completed = True
        unit_progress.completed_at = timezone.now()
    unit_progress.save()
    
    # Update course progress
    update_course_progress(user, unit.course)

def update_course_progress(user, course):
    """Update a course's progress based on completed units"""
    total_units = CourseUnit.objects.filter(course=course).count()
    completed_units = UserUnitProgress.objects.filter(
        user=user,
        unit__course=course,
        is_completed=True
    ).count()
    
    if total_units > 0:
        progress_percentage = (completed_units / total_units) * 100
    else:
        progress_percentage = 0
    
    user_course, created = UserCourse.objects.get_or_create(
        user=user,
        course=course
    )
    
    user_course.progress = int(progress_percentage)
    if progress_percentage == 100:
        user_course.is_completed = True
    user_course.save()