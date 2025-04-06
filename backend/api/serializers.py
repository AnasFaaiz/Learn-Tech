from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Course, UserCourse, LearningPath, PathMilestone, Unit, Topic, UserTopic

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = ['id', 'title', 'order', 'content', 'video_url', 'code_example']

class TopicDetailSerializer(serializers.ModelSerializer):
    is_completed = serializers.SerializerMethodField()
    
    class Meta:
        model = Topic
        fields = ['id', 'title', 'order', 'content', 'video_url', 'code_example', 'is_completed']
    
    def get_is_completed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserTopic.objects.filter(user=request.user, topic=obj, is_completed=True).exists()
        return False

class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = ['id', 'title', 'order', 'description']

class UnitDetailSerializer(serializers.ModelSerializer):
    topics = TopicDetailSerializer(many=True, read_only=True)
    progress = serializers.SerializerMethodField()
    is_completed = serializers.SerializerMethodField()
    
    class Meta:
        model = Unit
        fields = ['id', 'title', 'order', 'description', 'topics', 'progress', 'is_completed']
    
    def get_progress(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            total_topics = obj.topics.count()
            if total_topics == 0:
                return 0
            completed_topics = UserTopic.objects.filter(
                user=request.user, 
                topic__unit=obj,
                is_completed=True
            ).count()
            return int((completed_topics / total_topics) * 100)
        return 0
    
    def get_is_completed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            total_topics = obj.topics.count()
            if total_topics == 0:
                return False
            completed_topics = UserTopic.objects.filter(
                user=request.user, 
                topic__unit=obj,
                is_completed=True
            ).count()
            return total_topics == completed_topics
        return False

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'

class CourseDetailSerializer(serializers.ModelSerializer):
    units = UnitDetailSerializer(many=True, read_only=True)
    overall_progress = serializers.SerializerMethodField()
    completed_units = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'difficulty', 'duration', 'rating', 
                 'image_color', 'units', 'overall_progress', 'completed_units']
    
    def get_overall_progress(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            total_topics = Topic.objects.filter(unit__course=obj).count()
            if total_topics == 0:
                return 0
            completed_topics = UserTopic.objects.filter(
                user=request.user, 
                topic__unit__course=obj,
                is_completed=True
            ).count()
            return int((completed_topics / total_topics) * 100)
        return 0
    
    def get_completed_units(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            completed_units = 0
            for unit in obj.units.all():
                total_topics = unit.topics.count()
                if total_topics == 0:
                    continue
                    
                completed_topics = UserTopic.objects.filter(
                    user=request.user, 
                    topic__unit=unit,
                    is_completed=True
                ).count()
                
                if total_topics == completed_topics:
                    completed_units += 1
            
            return completed_units
        return 0

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

class UserTopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserTopic
        fields = ['id', 'topic', 'is_completed', 'completed_at']