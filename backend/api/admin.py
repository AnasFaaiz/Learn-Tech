from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import Course, UserCourse, LearningPath, PathMilestone, Unit, Topic, UserTopic

# Register models with the admin interface
@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'difficulty', 'duration', 'rating')
    search_fields = ('title', 'description')
    list_filter = ('difficulty',)

@admin.register(Unit)
class UnitAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order')
    list_filter = ('course',)
    search_fields = ('title', 'description')

@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ('title', 'unit', 'order')
    list_filter = ('unit__course', 'unit')
    search_fields = ('title', 'content')

@admin.register(UserTopic)
class UserTopicAdmin(admin.ModelAdmin):
    list_display = ('user', 'topic', 'is_completed', 'completed_at')
    list_filter = ('is_completed', 'topic__unit__course')
    search_fields = ('user__username', 'topic__title')

@admin.register(UserCourse)
class UserCourseAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'progress', 'is_completed')
    search_fields = ('user__username', 'course__title')
    list_filter = ('is_completed',)

@admin.register(LearningPath)
class LearningPathAdmin(admin.ModelAdmin):
    list_display = ('name', 'user')
    search_fields = ('name', 'description', 'user__username')

@admin.register(PathMilestone)
class PathMilestoneAdmin(admin.ModelAdmin):
    list_display = ('title', 'learning_path', 'order', 'is_completed')
    search_fields = ('title', 'description')
    list_filter = ('is_completed',)