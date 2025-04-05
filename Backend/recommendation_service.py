from flask import jsonify
import logging
import sys
from pathlib import Path
from datetime import datetime

# Add chatbot directory to path
sys.path.append(str(Path(__file__).parent.parent / "chatbot"))
from ai_chatbot import ask_gemini

def get_course_recommendations(user_progress):
    """
    Generate personalized course recommendations based on user progress
    using the Gemini AI model.
    """
    try:
        # Format the prompt for Gemini
        prompt = f"""
        Based on the user's learning journey:
        • Completed: {', '.join(user_progress['completedCourses'])}
        • Current: {user_progress['currentCourse']} ({user_progress['progress']}% complete)
        • Level: {user_progress['skillLevel']}

        Provide 3 personalized recommendations. Format each as:

        ─────────────────────

        🎯 Recommendation #[number]:
        • Course: [name]
        • Description: [2-line description]
        • Relevance: [why it fits their journey]
        • Duration: [estimated time]
        • Difficulty: [level]

        ─────────────────────

        Keep responses concise and well-formatted with bullet points.
        """
        
        # Get recommendations from Gemini
        response = ask_gemini(prompt)
        
        # Format the response for better display
        formatted_response = {
            'status': 'success',
            'recommendations': response.strip(),
            'metadata': {
                'generated_at': datetime.now().isoformat(),
                'source': 'Gemini AI',
                'user_level': user_progress['skillLevel']
            }
        }
        
        return formatted_response

    except Exception as e:
        logging.error(f"Failed to generate recommendations: {e}")
        return {
            'status': 'error',
            'message': str(e)
        }