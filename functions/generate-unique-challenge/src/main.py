from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.exception import AppwriteException
import google.generativeai as genai
import json
import os

def main(context):
    # Initialize Appwrite client
    client = (
        Client()
        .set_endpoint(os.environ["APPWRITE_FUNCTION_API_ENDPOINT"])
        .set_project(os.environ["APPWRITE_FUNCTION_PROJECT_ID"])
        .set_key(context.req.headers["x-appwrite-key"])
    )
    databases = Databases(client)

    try:
        # Get userId from request body
        data = json.loads(context.req.body)
        user_id = data.get('userId')
        if not user_id:
            return context.res.json({"success": False, "error": "userId is required"}, 400)

        # Fetch user document to get selected topics
        user_doc = databases.get_document('synapse', 'users', user_id)
        selected_topics = user_doc.get('selectedTopics', [])
        if not selected_topics:
            return context.res.json({"success": False, "error": "User has no selected topics"}, 400)

        # Configure Gemini API
        genai.configure(api_key=os.environ["GEMINI_API_KEY"])
        model = genai.GenerativeModel('gemini-1.5-flash')

        # Create prompt for question generation
        topics_str = "', '".join(selected_topics)
        prompt = f"""You are a tool for sparking critical thinking. The user's interests are '{topics_str}'. Generate one single, novel, thought-provoking question that connects these topics. The question must be open-ended and encourage deep reflection. Do not use common or cliché examples. Keep the question concise (under 200 characters)."""

        # Generate question
        response = model.generate_content(prompt)
        question = response.text.strip()

        context.log(f"Generated unique challenge for user {user_id}: {question[:50]}...")
        return context.res.json({"success": True, "question": question})

    except AppwriteException as err:
        context.error(f"Appwrite error: {repr(err)}")
        return context.res.json({"success": False, "error": str(err)}, 500)
    except Exception as err:
        context.error(f"Unexpected error: {repr(err)}")
        return context.res.json({"success": False, "error": str(err)}, 500)
