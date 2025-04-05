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

class CourseUnit(models.Model):
    course = models.ForeignKey(Course, related_name='units', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order']
        unique_together = ['course', 'order']
    
    def __str__(self):
        return f"{self.course.title} - {self.title}"

# Add the Topic model
class UnitTopic(models.Model):
    unit = models.ForeignKey(CourseUnit, related_name='topics', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    content = models.TextField()
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order']
        unique_together = ['unit', 'order']
    
    def __str__(self):
        return f"{self.unit.title} - {self.title}"

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
    
# User's progress on individual units
class UserUnitProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    unit = models.ForeignKey(CourseUnit, on_delete=models.CASCADE)
    progress = models.IntegerField(default=0)  # Percentage of completion
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['user', 'unit']
    
    def __str__(self):
        return f"{self.user.username} - {self.unit.course.title} - {self.unit.title}"

# User's progress on individual topics
class UserTopicProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    topic = models.ForeignKey(UnitTopic, on_delete=models.CASCADE)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['user', 'topic']
    
    def __str__(self):
        return f"{self.user.username} - {self.topic.title}"

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
    
class UserLearningProfile(models.Model):
    LEARNING_STYLES = [
        ('visual', 'Visual Learner'),
        ('auditory', 'Auditory Learner'),
        ('reading', 'Reading/Writing Learner'),
        ('kinesthetic', 'Kinesthetic Learner'),
        ('undetermined', 'Undetermined')
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='learning_profile')
    learning_style = models.CharField(max_length=20, choices=LEARNING_STYLES, default='undetermined')
    preferred_study_time = models.IntegerField(default=30)  # in minutes
    focus_duration = models.IntegerField(default=30)  # average focus time in minutes
    last_interaction = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username}'s Learning Profile"

class CourseInteraction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    session_start = models.DateTimeField(auto_now_add=True)
    session_end = models.DateTimeField(null=True, blank=True)
    total_time = models.IntegerField(default=0)  # in seconds
    
    def __str__(self):
        return f"{self.user.username} - {self.course.title} - {self.session_start}"

class ChatMessage(models.Model):
    MESSAGE_TYPES = [
        ('question', 'Question'),
        ('answer', 'Answer'),
        ('quiz', 'Quiz'),
        ('suggestion', 'Suggestion'),
        ('general', 'General')
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES, default='general')
    content = models.TextField()
    is_from_ai = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        source = "AI" if self.is_from_ai else self.user.username
        return f"{source} in {self.course.title}: {self.content[:30]}..."

class UserQuizAttempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    quiz_topic = models.CharField(max_length=200)
    score = models.IntegerField(default=0)
    max_score = models.IntegerField(default=100)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.quiz_topic}: {self.score}/{self.max_score}"