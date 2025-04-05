from django.db import models
from django.contrib.auth.models import User

class Course(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    difficulty = models.CharField(max_length=20, choices=[
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced')
    ])
    duration = models.CharField(max_length=20)  # e.g., "8h 30m"
    rating = models.DecimalField(max_digits=3, decimal_places=1)
    image_color = models.CharField(max_length=20, blank=True)  # For frontend styling
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class UserCourse(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    progress = models.IntegerField(default=0)  # Percentage of completion
    last_accessed = models.DateTimeField(auto_now=True)
    is_completed = models.BooleanField(default=False)

    class Meta:
        unique_together = ['user', 'course']

    def __str__(self):
        return f"{self.user.username} - {self.course.title}"

class LearningPath(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    
    def __str__(self):
        return self.name

class PathMilestone(models.Model):
    learning_path = models.ForeignKey(LearningPath, related_name='milestones', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField()
    order = models.IntegerField()
    is_completed = models.BooleanField(default=False)
    completed_date = models.DateField(null=True, blank=True)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return self.title