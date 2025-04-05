from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Course, UserCourse, LearningPath, PathMilestone

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