import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables from .env file
load_dotenv()

# Get API key from environment variables
api_key = os.getenv('GEMINI_API_KEY')

# Configure the API
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in .env file")

genai.configure(api_key=api_key)

# Function to query the Gemini API
def ask_gemini(prompt):
    formatted_prompt = f"""
    🎯 Main Response:
    Please provide a clear and concise answer to: {prompt}
    (Respond in 1-2 short sentences)

    🔍 Follow-up Questions:
    Generate 3 engaging follow-up questions that explore related topics.
    Format each question with a '→' bullet and add relevant emojis.
    """
    
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(formatted_prompt)
    
    # Format the response with line breaks and styling
    raw_response = response.text
    parts = raw_response.split('\n')
    
    # Clean and format the response with markdown
    formatted_response = "\n".join([
        "## \n",
        parts[0].strip(),
        "\n---\n",
        "## \n📚 Related Questions\n",
        *[f"• {q.strip().strip('•').strip()}\n" for q in parts[1:] if q.strip()],
        "\n---\n"
    ])
    
    return formatted_response

# Example usage
if __name__ == "__main__":
    print("Welcome to the AI Chatbot!")
    while True:
        question = input("❓ Your question (or 'exit' to quit): ")
        if question.lower() == 'exit':  # Fix: Correct indentation
            break
        
        print("\n🤖 Response:")
        print(ask_gemini(question))
        print("\n" + "─" * 50 + "\n")