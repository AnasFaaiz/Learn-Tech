from django.core.management.base import BaseCommand
from api.models import Course, Unit, Topic
import random
import lorem

class Command(BaseCommand):
    help = 'Generate units and topics for existing courses'

    def handle(self, *args, **options):
        courses = Course.objects.all()
        
        if not courses:
            self.stdout.write(self.style.WARNING('No courses found. Please run add_test_courses first.'))
            return
        
        units_created = 0
        topics_created = 0
        
        for course in courses:
            # Check if course already has units
            if Unit.objects.filter(course=course).exists():
                self.stdout.write(f'Skipping {course.title} - already has units')
                continue
                
            self.stdout.write(f'Generating content for course: {course.title}')
            
            # Determine number of units based on difficulty
            if course.difficulty == 'beginner':
                unit_count = random.randint(3, 5)
            elif course.difficulty == 'intermediate':
                unit_count = random.randint(5, 7)
            else:  # advanced
                unit_count = random.randint(7, 10)
                
            # Generate units
            units = []
            for i in range(1, unit_count + 1):
                unit = self.create_unit_for_course(course, i)
                units.append(unit)
                units_created += 1
                
            # Generate topics for each unit
            for unit in units:
                topic_count = random.randint(3, 6)
                for j in range(1, topic_count + 1):
                    self.create_topic_for_unit(unit, j)
                    topics_created += 1
        
        self.stdout.write(self.style.SUCCESS(f'Successfully created {units_created} units and {topics_created} topics'))

    def create_unit_for_course(self, course, order):
        domain = course.description.split(':')[0] if ':' in course.description else ''
        
        # Generate unit title based on course domain and order
        if domain == 'Web Development':
            unit_titles = [
                'Introduction to Web Development',
                'HTML and CSS Fundamentals',
                'JavaScript Essentials',
                'Responsive Design',
                'Frontend Frameworks',
                'Backend Development',
                'APIs and Data Handling',
                'Authentication and Security',
                'Testing and Deployment',
                'Advanced Techniques'
            ]
        elif domain == 'Data Science':
            unit_titles = [
                'Introduction to Data Science',
                'Data Collection and Cleaning',
                'Exploratory Data Analysis',
                'Statistical Foundations',
                'Machine Learning Basics',
                'Supervised Learning',
                'Unsupervised Learning',
                'Time Series Analysis',
                'Natural Language Processing',
                'Deep Learning'
            ]
        elif domain == 'Mobile Development':
            unit_titles = [
                'Mobile Development Fundamentals',
                'User Interface Design',
                'Navigation and Routing',
                'Data Management',
                'Network Requests',
                'State Management',
                'Native Features Integration',
                'Testing on Devices',
                'App Store Deployment',
                'Performance Optimization'
            ]
        elif domain == 'DevOps & Cloud':
            unit_titles = [
                'DevOps Principles',
                'Infrastructure as Code',
                'Containerization Basics',
                'Orchestration with Kubernetes',
                'CI/CD Pipelines',
                'Cloud Service Models',
                'Monitoring and Logging',
                'Security Best Practices',
                'Scaling Applications',
                'Disaster Recovery'
            ]
        elif domain == 'Cybersecurity':
            unit_titles = [
                'Cybersecurity Fundamentals',
                'Threat Modeling',
                'Network Security',
                'Web Application Security',
                'Cryptography',
                'Security Auditing',
                'Incident Response',
                'Ethical Hacking',
                'Security Governance',
                'Advanced Defense Strategies'
            ]
        else:
            unit_titles = [
                f'Unit {order}: Introduction',
                f'Unit {order}: Core Concepts',
                f'Unit {order}: Advanced Techniques',
                f'Unit {order}: Practical Applications',
                f'Unit {order}: Case Studies',
                f'Unit {order}: Best Practices',
                f'Unit {order}: Final Project',
                f'Unit {order}: Future Directions',
                f'Unit {order}: Review and Extension',
                f'Unit {order}: Mastering the Craft'
            ]
        
        # Select title (ensure we don't go out of range)
        title_index = min(order - 1, len(unit_titles) - 1)
        unit_title = unit_titles[title_index]
        
        # Create unit
        unit = Unit.objects.create(
            course=course,
            title=unit_title,
            order=order,
            description=lorem.paragraph()
        )
        
        self.stdout.write(f'  Created unit: {unit.title}')
        return unit

    def create_topic_for_unit(self, unit, order):
        # Generate topic name based on unit title
        if 'Introduction' in unit.title:
            topic_types = ['Overview', 'Getting Started', 'Key Concepts', 'Environment Setup', 'First Steps']
        elif 'Fundamental' in unit.title or 'Basics' in unit.title:
            topic_types = ['Core Principles', 'Basic Techniques', 'Foundational Patterns', 'Essential Tools', 'Building Blocks']
        elif 'Advanced' in unit.title:
            topic_types = ['Advanced Concepts', 'Expert Techniques', 'Optimization', 'Edge Cases', 'Performance Tuning']
        else:
            topic_types = ['Understanding', 'Implementing', 'Analyzing', 'Working with', 'Mastering']
        
        # Get a topic suffix based on the unit title and course domain
        domain = unit.course.description.split(':')[0] if ':' in unit.course.description else ''
        
        if domain == 'Web Development':
            topic_suffixes = ['HTML Elements', 'CSS Styling', 'JavaScript Functions', 'Responsive Design', 'API Integration']
        elif domain == 'Data Science':
            topic_suffixes = ['Data Cleaning', 'Visualization', 'Statistical Models', 'Feature Engineering', 'Model Evaluation']
        elif domain == 'Mobile Development':
            topic_suffixes = ['UI Components', 'Navigation', 'State Management', 'Device Features', 'Deployment']
        elif domain == 'DevOps & Cloud':
            topic_suffixes = ['Infrastructure', 'CI/CD Pipelines', 'Docker Containers', 'Kubernetes', 'Monitoring']
        elif domain == 'Cybersecurity':
            topic_suffixes = ['Threat Assessment', 'Encryption', 'Vulnerability Testing', 'Security Policies', 'Incident Response']
        else:
            topic_suffixes = [unit.title, 'Concepts', 'Methods', 'Applications', 'Tools']
        
        # Generate the topic title
        if order <= len(topic_types):
            prefix = topic_types[order - 1]
        else:
            prefix = random.choice(topic_types)
            
        if order <= len(topic_suffixes):
            suffix = topic_suffixes[order - 1]
        else:
            suffix = random.choice(topic_suffixes)
            
        topic_title = f"{prefix} {suffix}"
        
        # Generate code example based on domain
        code_examples = {
            'Web Development': """function createComponent() {
  // This is a sample code snippet
  const element = document.createElement('div');
  element.className = 'container';
  element.textContent = 'Hello, World!';
  return element;
}""",
            'Data Science': """import pandas as pd
import matplotlib.pyplot as plt

# Load and analyze data
def analyze_data(filepath):
    df = pd.read_csv(filepath)
    summary = df.describe()
    
    plt.figure(figsize=(10, 6))
    df.hist()
    plt.tight_layout()
    
    return summary""",
            'Mobile Development': """import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to the App!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default HomeScreen;""",
            'DevOps & Cloud': """apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
    spec:
      containers:
      - name: web-app
        image: nginx:latest
        ports:
        - containerPort: 80""",
            'Cybersecurity': """def check_password_strength(password):
    import re
    
    # Check length
    if len(password) < 8:
        return "Password is too short (minimum 8 characters)"
    
    # Check for uppercase, lowercase, numbers and special chars
    if not re.search(r'[A-Z]', password):
        return "Password must contain at least one uppercase letter"
        
    if not re.search(r'[a-z]', password):
        return "Password must contain at least one lowercase letter"
        
    if not re.search(r'[0-9]', password):
        return "Password must contain at least one number"
        
    if not re.search(r'[!@#$%^&*()]', password):
        return "Password must contain at least one special character"
        
    return "Password is strong"
"""
        }
        
        # Get the appropriate code example or a default
        code_example = code_examples.get(domain, code_examples['Web Development'])
        
        # Generate HTML-like content
        content = f"""
<div class="topic-content">
    <h2>{topic_title}</h2>
    
    <p>{lorem.paragraph()}</p>
    
    <h3>Key Concepts</h3>
    <ul>
        <li>{lorem.sentence()}</li>
        <li>{lorem.sentence()}</li>
        <li>{lorem.sentence()}</li>
        <li>{lorem.sentence()}</li>
    </ul>
    
    <p>{lorem.paragraph()}</p>
    
    <div class="info-box">
        <h4>Important Note</h4>
        <p>{lorem.sentence()}</p>
    </div>
    
    <h3>Practical Application</h3>
    <p>{lorem.paragraph()}</p>
    
    <p>{lorem.paragraph()}</p>
</div>
"""
        
        # Create the topic
        topic = Topic.objects.create(
            unit=unit,
            title=topic_title,
            order=order,
            content=content,
            code_example=code_example
        )
        
        self.stdout.write(f'    Created topic: {topic.title}')
        return topic