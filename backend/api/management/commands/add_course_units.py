from django.core.management.base import BaseCommand
from api.models import Course, CourseUnit, UnitTopic

class Command(BaseCommand):
    help = 'Add sample units and topics to existing courses'

    def handle(self, *args, **options):
        # Get all courses
        courses = Course.objects.all()
        units_created = 0
        topics_created = 0
        
        for course in courses:
            # Create units for this course if none exist
            if CourseUnit.objects.filter(course=course).count() == 0:
                # Unit 1: Introduction
                unit1 = CourseUnit.objects.create(
                    course=course,
                    title="Introduction to the Course",
                    order=1
                )
                units_created += 1
                
                # Topics for Unit 1
                UnitTopic.objects.create(
                    unit=unit1,
                    title="Course Overview",
                    content=f"Welcome to {course.title}! This course will cover the fundamentals...",
                    order=1
                )
                topics_created += 1
                
                UnitTopic.objects.create(
                    unit=unit1,
                    title="Setting Up Your Environment",
                    content="In this section, we'll prepare your development environment for the course...",
                    order=2
                )
                topics_created += 1
                
                # Unit 2: Core Concepts
                unit2 = CourseUnit.objects.create(
                    course=course,
                    title="Core Concepts",
                    order=2
                )
                units_created += 1
                
                # Topics for Unit 2
                UnitTopic.objects.create(
                    unit=unit2,
                    title="Fundamental Principles",
                    content=f"The fundamental principles of {course.title} include...",
                    order=1
                )
                topics_created += 1
                
                UnitTopic.objects.create(
                    unit=unit2,
                    title="Practical Applications",
                    content="Now let's apply these concepts to real-world scenarios...",
                    order=2
                )
                topics_created += 1
                
                UnitTopic.objects.create(
                    unit=unit2,
                    title="Advanced Techniques",
                    content="For more complex scenarios, you'll need these advanced techniques...",
                    order=3
                )
                topics_created += 1
                
                UnitTopic.objects.create(
                    unit=unit2,
                    title="Best Practices",
                    content="Follow these best practices to ensure your code is maintainable and efficient...",
                    order=4
                )
                topics_created += 1
                
                # Unit 3: Project
                unit3 = CourseUnit.objects.create(
                    course=course,
                    title="Building Your First Project",
                    order=3
                )
                units_created += 1
                
                # Topics for Unit 3
                UnitTopic.objects.create(
                    unit=unit3,
                    title="Project Setup",
                    content="Let's start by setting up your project structure...",
                    order=1
                )
                topics_created += 1
                
                UnitTopic.objects.create(
                    unit=unit3,
                    title="Implementation",
                    content="Now we'll implement the core functionality...",
                    order=2
                )
                topics_created += 1
                
                UnitTopic.objects.create(
                    unit=unit3,
                    title="Testing & Debugging",
                    content="Learn how to test your application and fix common issues...",
                    order=3
                )
                topics_created += 1
                
                UnitTopic.objects.create(
                    unit=unit3,
                    title="Deployment",
                    content="Finally, let's deploy your project to a production environment...",
                    order=4
                )
                topics_created += 1
                
                self.stdout.write(self.style.SUCCESS(f'Created units and topics for: {course.title}'))
            else:
                self.stdout.write(f'Skipping {course.title}, units already exist')
                
        self.stdout.write(self.style.SUCCESS(f'Created {units_created} units and {topics_created} topics'))