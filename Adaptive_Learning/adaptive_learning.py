import os
from dotenv import load_dotenv
import google.generativeai as genai
import json
import re

# Load API Key
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in .env file")

genai.configure(api_key=api_key)


user_data = {
    "user_id": 101,
    "performance": [
        {"name": "Intro to Python", "score": 85},
        {"name": "OOP with Python", "score": 78},
        {"name": "Basic Projects", "score": 59}
    ],
    "course_flow": {
        "Intro to Python": {
            "next": ["OOP with Python"],
            "level": "Easy",
            "projects": ["Calculator", "Todo List", "Number Guessing Game"]
        },
        "OOP with Python": {
            "next": ["Basic Projects"],
            "level": "Medium",
            "projects": ["Library Management", "Bank Account System", "Student Database"]
        },
        "Basic Projects": {
            "next": ["Advanced Projects"],
            "level": "Medium",
            "projects": ["Weather App", "File Organizer", "URL Shortener"]
        },
        "Advanced Projects": {
            "next": [],
            "level": "Hard",
            "projects": ["Web Scraper", "Chat Application", "REST API"]
        }
    }
}

# Prompt Generator
def build_prompt(data):
    return f"""
You are an AI course advisor. Recommend what course or project the student should take next based on their past scores and course structure.

Performance:
{json.dumps(data['performance'], indent=2)}

Course Flow:
{json.dumps(data['course_flow'], indent=2)}

Rules:
- If score < 60 → Recommend revisiting the same topic with easier material or review.
- If score between 60 and 80 → Recommend repeating the same course with specific practice projects.
- If score > 80 → Recommend the next course/project if available.

Return JSON like this:
{{
  "recommended": "Next Course or Project",
  "reason": "Short reasoning",
  "suggested_projects": ["Project1", "Project2"]
}}
"""

# Get AI Recommendation
# Get AI Recommendation
def get_recommendation(data):
    prompt = build_prompt(data)
    model = genai.GenerativeModel("gemini-1.5-flash")
    try:
        # Generate and process response
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Try to extract JSON from response
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if not json_match:
            raise ValueError("No valid JSON found in response")
            
        # Parse JSON response
        recommendation = json.loads(json_match.group())
        
        # Add completed courses to the output
        completed_courses = [
            f"✓ {course['name']} (Score: {course['score']}%)"
            for course in data['performance']
        ]
        
        # Format final output
        output = {
            "completed_courses": completed_courses,
            "recommended": recommendation.get('recommended', "Review Current Topic"),
            "reason": recommendation.get('reason', "Unable to determine reason"),
            "suggested_projects": recommendation.get('suggested_projects', [])
        }
        
        return json.dumps(output, indent=2)  # Uncommented the return statement
        
    except json.JSONDecodeError:
        return json.dumps({
            "completed_courses": [f"✓ {c['name']} (Score: {c['score']}%)" for c in data['performance']],
            "recommended": "Review Current Topic",
            "reason": "Unable to parse recommendation",
            "suggested_projects": []
        }, indent=2)
    except Exception as e:
        return json.dumps({
            "completed_courses": [f"✓ {c['name']} (Score: {c['score']}%)" for c in data['performance']],
            "recommended": "Continue Current Course",
            "reason": f"System message: {str(e)}",
            "suggested_projects": []
        }, indent=2)

# Update main execution
if __name__ == "__main__":
    print("\n📚 Learning Path Analysis")
    print("─" * 50)
    
    try:
        result = json.loads(get_recommendation(user_data))
        
        print("\n🎓 Completed Courses:")
        for course in result['completed_courses']:
            print(course)
            
        print("\n📋 Recommendation:")
        print(f"Next Step: {result['recommended']}")
        print(f"Reason: {result['reason']}")
        
        if result.get('suggested_projects'):
            print("\n🛠️ Suggested Projects:")
            for project in result['suggested_projects']:
                print(f"• {project}")
        
    except Exception as e:
        print("\n❌ Error:")
        print(f"Failed to process recommendation: {str(e)}")
    
    print("\n" + "─" * 50 + "\n")