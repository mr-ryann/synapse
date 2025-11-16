import os
import json
import google.generativeai as genai
from appwrite.client import Client
from appwrite.services.databases import Databases

def main(context):
    """
    Get AI Hint - MVP Version
    Generates Socratic hints using Gemini API without revealing the answer
    """
    try:
        # Validate required environment variables
        required_vars = [
            "APPWRITE_FUNCTION_API_ENDPOINT",
            "APPWRITE_DATABASE_ID",
            "APPWRITE_DATABASES_API_KEY",
            "GEMINI_API_KEY"
        ]
        missing_vars = [var for var in required_vars if not os.environ.get(var)]
        if missing_vars:
            return context.res.json({
                "success": False,
                "error": f"Missing required environment variables: {', '.join(missing_vars)}"
            }, 500)

        # Initialize Appwrite client (APPWRITE_FUNCTION_PROJECT_ID is automatically provided)
        project_id = os.environ.get("APPWRITE_FUNCTION_PROJECT_ID")
        client = Client()
        client.set_endpoint(os.environ.get("APPWRITE_FUNCTION_API_ENDPOINT"))
        client.set_project(project_id)
        client.set_key(os.environ.get("APPWRITE_DATABASES_API_KEY"))

        databases = Databases(client)
        database_id = os.environ.get("APPWRITE_DATABASE_ID")

        # Parse request body
        data = json.loads(context.req.body) if context.req.body else {}
        challenge_id = data.get("questionId")  # Keep as questionId for backward compatibility
        user_query = data.get("userQuery", "")  # User's question/confusion

        if not challenge_id:
            return context.res.json({"success": False, "error": "questionId required"}, 400)

        # Get challenge details from challenges collection
        challenge = databases.get_document(
            database_id=database_id,
            collection_id="challenges",
            document_id=challenge_id
        )

        challenge_text = challenge.get("promptText", "")
        topic_name = challenge.get("topicName", "")
        
        # Combine topic and prompt for context
        context_info = f"Topic: {topic_name}\n{challenge_text}"

        # Initialize Gemini
        genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
        model = genai.GenerativeModel('gemini-pro')

        # Enhanced prompt with user's response context
        if user_query and user_query != "Can you give me a hint?" and user_query != "I need a hint":
            context_addition = f"\n\nThe student has written: \"{user_query}\"\n\nProvide a hint that builds on their current thinking and guides them further."
        else:
            context_addition = ""

        # Construct Socratic prompt for critical thinking challenge
        prompt = f"""You are a Socratic tutor helping a student develop critical thinking skills through a thought-provoking challenge.

{context_info}

The student is working on this critical thinking challenge.{context_addition}

Your task:
1. DO NOT reveal any direct answers or solutions
2. Ask guiding questions that help them think more deeply about the challenge
3. Encourage them to break down the problem and consider different perspectives
4. Be supportive and encouraging, fostering intellectual curiosity
5. Keep your hint brief (2-3 sentences) and focused on developing thinking skills
6. If they've shared their thoughts, acknowledge what they're exploring and guide them further
7. Use the Socratic method: ask questions rather than give statements

Provide a Socratic hint:"""

        response = model.generate_content(prompt)
        hint_text = response.text.strip()

        return context.res.json({
            "success": True,
            "data": {
                "hint": hint_text,
                "questionId": challenge_id  # Keep for backward compatibility
            }
        })

    except Exception as err:
        context.error(f"Error in get-ai-hint: {str(err)}")
        return context.res.json({"success": False, "error": str(err)}, 500)
