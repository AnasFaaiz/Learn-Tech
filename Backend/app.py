from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import logging
from pathlib import Path
import os
from dotenv import load_dotenv
from recommendation_service import get_course_recommendations

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Add chatbot directory to path
chatbot_path = str(Path(__file__).parent.parent / "chatbot")
sys.path.append(chatbot_path)

try:
    from ai_chatbot import ask_gemini
except ImportError as e:
    logger.error(f"Failed to import ai_chatbot: {e}")
    raise

app = Flask(__name__)

# Configure CORS
CORS(app, resources={
    r"/api/*": {
        "origins": os.getenv('ALLOWED_ORIGINS', 'http://localhost:5173').split(','),
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})


@app.route('/api/recommend', methods=['POST'])
def recommend():
    try:
        data = request.get_json()
        user_progress = data.get('userProgress', {})
        
        # Get recommendations using the service
        result = get_course_recommendations(user_progress)
        
        if result['status'] == 'success':
            return jsonify({'response': result['recommendations']})
        else:
            raise Exception(result['message'])
            
    except Exception as e:
        logging.error(f"Recommendation error: {e}")
        return jsonify({'error': str(e)}), 500
    
    
@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        # Validate request
        if not request.is_json:
            logger.warning("Received non-JSON request")
            return jsonify({'error': 'Request must be JSON'}), 400

        data = request.get_json()
        if not data or 'message' not in data:
            logger.warning("Received request without message")
            return jsonify({'error': 'No message provided'}), 400

        message = data['message'].strip()
        if not message:
            logger.warning("Received empty message")
            return jsonify({'error': 'Message cannot be empty'}), 400

        # Process the message
        logger.info(f"Processing message: {message[:50]}...")
        response = ask_gemini(message)
        
        if not response:
            logger.error("Empty response from Gemini API")
            return jsonify({'error': 'Failed to get response from AI'}), 500

        return jsonify({'response': response})

    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}", exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/health', methods=['GET'])
def health():
    try:
        # Basic health check
        return jsonify({
            'status': 'healthy',
            'version': '1.0.0',
            'environment': os.getenv('FLASK_ENV', 'development')
        })
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}", exc_info=True)
        return jsonify({'status': 'unhealthy', 'error': str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({'error': 'Method not allowed'}), 405

if __name__ == '__main__':
    # Get port from environment variable or default to 5000
    port = int(os.getenv('PORT', 5000))
    # Get environment from environment variable or default to development
    env = os.getenv('FLASK_ENV', 'development')
    
    logger.info(f"Starting server in {env} mode on port {port}")
    app.run(
        host='0.0.0.0',
        port=port,
        debug=(env == 'development')
    )