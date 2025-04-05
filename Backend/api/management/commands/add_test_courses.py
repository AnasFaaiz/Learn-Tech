from django.core.management.base import BaseCommand
from api.models import Course
import random

class Command(BaseCommand):
    help = 'Add test courses across different domains to the database'

    def handle(self, *args, **options):
        # Define domains and their related courses
        domains = {
            'Web Development': [
                {
                    'title': 'Modern JavaScript Fundamentals',
                    'description': 'Master the core concepts of JavaScript ES6+ with practical examples and real-world applications.',
                    'difficulty': 'beginner',
                    'duration': '10h 15m',
                    'rating': 4.8,
                    'image_color': '#F7DF1E'
                },
                {
                    'title': 'React.js: Zero to Expert',
                    'description': 'Build professional React applications with hooks, context API, Redux, and advanced state management patterns.',
                    'difficulty': 'intermediate',
                    'duration': '15h 30m',
                    'rating': 4.9,
                    'image_color': '#61DAFB'
                },
                {
                    'title': 'Full-Stack Development with MERN',
                    'description': 'Learn to build scalable web applications using MongoDB, Express.js, React, and Node.js.',
                    'difficulty': 'advanced',
                    'duration': '22h 45m',
                    'rating': 4.7,
                    'image_color': '#3C873A'
                },
                {
                    'title': 'CSS Mastery: Advanced Layouts',
                    'description': 'Master modern CSS techniques including Grid, Flexbox, animations, and responsive design principles.',
                    'difficulty': 'intermediate',
                    'duration': '8h 20m',
                    'rating': 4.6,
                    'image_color': '#264DE4'
                },
                {
                    'title': 'Vue.js for Beginners',
                    'description': 'Comprehensive introduction to Vue.js framework with composition API and build tooling.',
                    'difficulty': 'beginner',
                    'duration': '12h 10m',
                    'rating': 4.5,
                    'image_color': '#42B883'
                }
            ],
            'Data Science': [
                {
                    'title': 'Python for Data Analysis',
                    'description': 'Learn how to use NumPy, Pandas, and Matplotlib to analyze and visualize complex datasets.',
                    'difficulty': 'intermediate',
                    'duration': '14h 20m',
                    'rating': 4.7,
                    'image_color': '#306998'
                },
                {
                    'title': 'Machine Learning Fundamentals',
                    'description': 'Introduction to core ML algorithms including regression, classification, clustering, and neural networks.',
                    'difficulty': 'intermediate',
                    'duration': '18h 45m',
                    'rating': 4.9,
                    'image_color': '#FF6F00'
                },
                {
                    'title': 'Deep Learning with TensorFlow',
                    'description': 'Build and deploy advanced neural networks for computer vision and natural language processing.',
                    'difficulty': 'advanced',
                    'duration': '20h 30m',
                    'rating': 4.8,
                    'image_color': '#FF6F00'
                },
                {
                    'title': 'Data Visualization Masterclass',
                    'description': 'Create compelling visual stories from data using Tableau, D3.js, and other visualization tools.',
                    'difficulty': 'intermediate',
                    'duration': '12h 15m',
                    'rating': 4.6,
                    'image_color': '#FF9A00'
                },
                {
                    'title': 'Introduction to AI Ethics',
                    'description': 'Explore the ethical implications of artificial intelligence and develop responsible AI frameworks.',
                    'difficulty': 'beginner',
                    'duration': '8h 30m',
                    'rating': 4.7,
                    'image_color': '#9C27B0'
                }
            ],
            'Mobile Development': [
                {
                    'title': 'Flutter Development Bootcamp',
                    'description': 'Build beautiful native apps for iOS and Android from a single codebase with Flutter and Dart.',
                    'difficulty': 'intermediate',
                    'duration': '16h 40m',
                    'rating': 4.8,
                    'image_color': '#54C5F8'
                },
                {
                    'title': 'iOS Development with Swift',
                    'description': 'Learn to build native iOS applications with Swift, UIKit, and the latest iOS design patterns.',
                    'difficulty': 'intermediate',
                    'duration': '19h 25m',
                    'rating': 4.7,
                    'image_color': '#F05138'
                },
                {
                    'title': 'Android Development with Kotlin',
                    'description': 'Master modern Android development with Kotlin, Jetpack Compose, and Material Design principles.',
                    'difficulty': 'intermediate',
                    'duration': '18h 15m',
                    'rating': 4.6,
                    'image_color': '#7F52FF'
                },
                {
                    'title': 'React Native for Beginners',
                    'description': 'Build cross-platform mobile apps using React Native and JavaScript with real-world projects.',
                    'difficulty': 'beginner',
                    'duration': '15h 10m',
                    'rating': 4.5,
                    'image_color': '#61DAFB'
                },
                {
                    'title': 'Advanced Mobile UX Design',
                    'description': 'Learn principles and practices for creating exceptional mobile user experiences across platforms.',
                    'difficulty': 'advanced',
                    'duration': '10h 30m',
                    'rating': 4.8,
                    'image_color': '#FF5722'
                }
            ],
            'DevOps & Cloud': [
                {
                    'title': 'Docker and Kubernetes Essentials',
                    'description': 'Master containerization with Docker and orchestration with Kubernetes for modern application deployment.',
                    'difficulty': 'intermediate',
                    'duration': '14h 50m',
                    'rating': 4.8,
                    'image_color': '#2496ED'
                },
                {
                    'title': 'AWS Certified Solutions Architect',
                    'description': 'Comprehensive preparation for the AWS Solutions Architect certification with hands-on projects.',
                    'difficulty': 'advanced',
                    'duration': '25h 15m',
                    'rating': 4.9,
                    'image_color': '#FF9900'
                },
                {
                    'title': 'CI/CD Pipeline Implementation',
                    'description': 'Build robust continuous integration and deployment pipelines with GitHub Actions, Jenkins, and GitLab.',
                    'difficulty': 'intermediate',
                    'duration': '12h 30m',
                    'rating': 4.7,
                    'image_color': '#F44D27'
                },
                {
                    'title': 'Azure DevOps Fundamentals',
                    'description': 'Learn to implement DevOps practices using Microsoft Azure DevOps services and tools.',
                    'difficulty': 'beginner',
                    'duration': '16h 20m',
                    'rating': 4.6,
                    'image_color': '#0078D7'
                },
                {
                    'title': 'Infrastructure as Code with Terraform',
                    'description': 'Manage infrastructure as code across multiple cloud providers using HashiCorp Terraform.',
                    'difficulty': 'advanced',
                    'duration': '13h 45m',
                    'rating': 4.8,
                    'image_color': '#7B42BC'
                }
            ],
            'Cybersecurity': [
                {
                    'title': 'Ethical Hacking: Penetration Testing',
                    'description': 'Master the art of ethical hacking and penetration testing to secure applications and systems.',
                    'difficulty': 'advanced',
                    'duration': '20h 30m',
                    'rating': 4.9,
                    'image_color': '#4CAF50'
                },
                {
                    'title': 'Network Security Fundamentals',
                    'description': 'Learn essential network security concepts, tools, and best practices for protecting organizational assets.',
                    'difficulty': 'intermediate',
                    'duration': '16h 15m',
                    'rating': 4.7,
                    'image_color': '#0D47A1'
                },
                {
                    'title': 'Secure Coding Practices',
                    'description': 'Write secure code by understanding common vulnerabilities and implementing proper defensive techniques.',
                    'difficulty': 'intermediate',
                    'duration': '12h 45m',
                    'rating': 4.6,
                    'image_color': '#F44336'
                },
                {
                    'title': 'Digital Forensics & Incident Response',
                    'description': 'Learn to investigate security breaches and respond effectively to cyber incidents.',
                    'difficulty': 'advanced',
                    'duration': '18h 20m',
                    'rating': 4.8,
                    'image_color': '#5E35B1'
                },
                {
                    'title': 'Introduction to Cryptography',
                    'description': 'Understand fundamental cryptographic principles and their applications in modern security systems.',
                    'difficulty': 'beginner',
                    'duration': '10h 10m',
                    'rating': 4.5,
                    'image_color': '#00BCD4'
                }
            ]
        }

        courses_created = 0
        
        # Delete existing courses if needed
        # Uncomment the next line to clear existing courses
        # Course.objects.all().delete()
        
        for domain, courses in domains.items():
            for course_data in courses:
                # Check if the course already exists
                if not Course.objects.filter(title=course_data['title']).exists():
                    course = Course.objects.create(
                        title=course_data['title'],
                        description=f"{domain}: {course_data['description']}",
                        difficulty=course_data['difficulty'],
                        duration=course_data['duration'],
                        rating=course_data['rating'],
                        image_color=course_data['image_color']
                    )
                    courses_created += 1
                    self.stdout.write(self.style.SUCCESS(f'Created course: {course.title}'))
        
        self.stdout.write(self.style.SUCCESS(f'Successfully added {courses_created} new courses'))