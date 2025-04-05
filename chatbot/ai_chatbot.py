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
    Answer this question in 1-2 short sentences: {prompt}
    After your answer, suggest 3 related follow-up questions, each on a new line starting with '•'.
    """
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(formatted_prompt)
    return response.text

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