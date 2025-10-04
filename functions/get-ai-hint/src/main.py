from appwrite.client import Client
from appwrite.exception import AppwriteException
import google.generativeai as genai
import json
import os

def main(context):
    try:
        # Get questionText from request body
        data = json.loads(context.req.body)
        question_text = data.get('questionText')
        if not question_text:
            return context.res.json({"success": False, "error": "questionText is required"}, 400)

        # Configure Gemini API
        genai.configure(api_key=os.environ["GEMINI_API_KEY"])
        model = genai.GenerativeModel('gemini-1.5-flash')

        # Create prompt for hint generation
        prompt = f"""You are a tool for sparking critical thinking. Based on this question: '{question_text}', provide a brief hint (2-3 sentences) that encourages deeper reflection without giving away the answer. Focus on guiding the user to think more profoundly about the topic."""

        # Generate hint
        response = model.generate_content(prompt)
        hint = response.text.strip()

        context.log(f"Generated hint for question: {question_text[:50]}...")
        return context.res.json({"success": True, "hint": hint})

    except Exception as err:
        context.error(f"Error generating hint: {repr(err)}")
        return context.res.json({"success": False, "error": str(err)}, 500)
