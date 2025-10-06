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
        # Initialize Appwrite client
        client = Client()
        client.set_endpoint(os.environ["APPWRITE_FUNCTION_API_ENDPOINT"])
        client.set_project(os.environ["APPWRITE_FUNCTION_PROJECT_ID"])
        client.set_key(os.environ.get("APPWRITE_DATABASES_API_KEY", context.req.headers.get("x-appwrite-key")))

        databases = Databases(client)
        database_id = os.environ["APPWRITE_DATABASE_ID"]

        # Parse request body
        data = json.loads(context.req.body) if context.req.body else {}
        question_id = data.get("questionId")
        user_query = data.get("userQuery", "")  # User's question/confusion

        if not question_id:
            return context.res.json({"success": False, "error": "questionId required"}, 400)

        # Get question details
        question = databases.get_document(
            database_id=database_id,
            collection_id="questions",
            document_id=question_id
        )

        question_text = question.get("question", "")
        question_type = question.get("type", "text")
        
        # For MCQs, don't reveal the correct answer
        context_info = f"Question: {question_text}\n"
        if question_type == "mcq":
            options = question.get("options", [])
            context_info += f"Options: {', '.join(options)}\n"

        # Initialize Gemini
        genai.configure(api_key=os.environ["GEMINI_API_KEY"])
        model = genai.GenerativeModel('gemini-pro')

        # Construct Socratic prompt
        prompt = f"""You are a Socratic tutor helping a student think critically. 

{context_info}

The student is working on this question and has asked: "{user_query if user_query else 'Can you give me a hint?'}"

Your task:
1. DO NOT reveal the answer directly
2. Ask guiding questions that help them discover the answer themselves
3. Encourage them to break down the problem
4. Be supportive and encouraging
5. Keep your hint brief (2-3 sentences)

Provide a Socratic hint:"""

        response = model.generate_content(prompt)
        hint_text = response.text.strip()

        return context.res.json({
            "success": True,
            "data": {
                "hint": hint_text,
                "questionId": question_id
            }
        })

    except Exception as err:
        context.error(f"Error in get-ai-hint: {str(err)}")
        return context.res.json({"success": False, "error": str(err)}, 500)
