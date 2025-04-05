from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Course, UserCourse, LearningPath, PathMilestone, UserLearningProfile, CourseInteraction, ChatMessage, UserQuizAttempt, CourseUnit, UnitTopic, UserUnitProgress, UserTopicProgress

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'

class UserCourseSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    
    class Meta:
        model = UserCourse
        fields = ['id', 'course', 'progress', 'last_accessed', 'is_completed']

class PathMilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = PathMilestone
        fields = ['id', 'title', 'description', 'order', 'is_completed', 'completed_date']

class LearningPathSerializer(serializers.ModelSerializer):
    milestones = PathMilestoneSerializer(many=True, read_only=True)
    
    class Meta:
        model = LearningPath
        fields = ['id', 'name', 'description', 'milestones']

class UserLearningProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserLearningProfile
        fields = ['learning_style', 'preferred_study_time', 'focus_duration', 'last_interaction']

class CourseInteractionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseInteraction
        fields = ['id', 'course', 'session_start', 'session_end', 'total_time']

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'message_type', 'content', 'is_from_ai', 'timestamp']
        
class UserQuizAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserQuizAttempt
        fields = ['id', 'quiz_topic', 'score', 'max_score', 'timestamp']

class UnitTopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = UnitTopic
        fields = ['id', 'title', 'content', 'order']

class CourseUnitSerializer(serializers.ModelSerializer):
    topics = UnitTopicSerializer(many=True, read_only=True)
    
    class Meta:
        model = CourseUnit
        fields = ['id', 'title', 'order', 'topics']

class CourseDetailSerializer(serializers.ModelSerializer):
    units = CourseUnitSerializer(many=True, read_only=True)
    
    class Meta:
        model = Course
        fields = '__all__'

class UserTopicProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserTopicProgress
        fields = ['id', 'topic', 'is_completed', 'completed_at']

class UserUnitProgressSerializer(serializers.ModelSerializer):
    completed_topics_count = serializers.SerializerMethodField()
    total_topics_count = serializers.SerializerMethodField()
    
    class Meta:
        model = UserUnitProgress
        fields = ['id', 'unit', 'progress', 'is_completed', 'completed_at', 
                  'completed_topics_count', 'total_topics_count']
    
    def get_completed_topics_count(self, obj):
        return UserTopicProgress.objects.filter(
            user=obj.user, 
            topic__unit=obj.unit, 
            is_completed=True
        ).count()
    
    def get_total_topics_count(self, obj):
        return obj.unit.topics.count()