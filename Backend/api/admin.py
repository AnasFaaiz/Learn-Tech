from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import Course, UserCourse, LearningPath, PathMilestone

# Register models with the admin interface
@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'difficulty', 'duration', 'rating')
    search_fields = ('title', 'description')
    list_filter = ('difficulty',)

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