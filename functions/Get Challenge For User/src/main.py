import os
import json
import random
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.query import Query

def main(context):
    """
    Get Challenge For User - MVP Version
    Layer 1: Curated Database (no AI generation yet)
    Fetches a random unseen question from user's selected topics
    """
    try:
        # Initialize Appwrite client
        client = Client()
        client.set_endpoint(os.environ["APPWRITE_FUNCTION_API_ENDPOINT"])
        client.set_project(os.environ["APPWRITE_FUNCTION_PROJECT_ID"])
        client.set_key(context.req.headers["x-appwrite-key"])

        databases = Databases(client)
        database_id = os.environ["APPWRITE_DATABASE_ID"]

        # Parse request body
        data = json.loads(context.req.body) if context.req.body else {}
        user_id = data.get("userId")

        if not user_id:
            return context.res.json({"success": False, "error": "userId required"}, 400)

        # Get user's selected topics
        user_doc = databases.get_document(
            database_id=database_id,
            collection_id="users",
            document_id=user_id
        )

        selected_topics = user_doc.get("selectedTopics", [])
        if not selected_topics:
            return context.res.json({"success": False, "error": "No topics selected"}, 400)

        # Get user's challenge history to exclude seen questions
        history_response = databases.list_documents(
            database_id=database_id,
            collection_id="user_challenge_history",
            queries=[
                Query.equal("userId", user_id)
            ]
        )
        seen_question_ids = [doc["questionId"] for doc in history_response["documents"]]

        # Query questions from selected topics, excluding seen ones
        questions_response = databases.list_documents(
            database_id=database_id,
            collection_id="questions",
            queries=[
                Query.equal("topicId", selected_topics),  # This might need adjustment for array
                Query.not_equal("$id", seen_question_ids) if seen_question_ids else None
            ].filter(None)  # Remove None values
        )

        available_questions = questions_response["documents"]
        if not available_questions:
            return context.res.json({"success": False, "error": "No available questions"}, 404)

        # Select random question
        challenge = random.choice(available_questions)

        # Record in history (optional for MVP, but good practice)
        databases.create_document(
            database_id=database_id,
            collection_id="user_challenge_history",
            document_id="",  # Auto-generate ID
            data={
                "userId": user_id,
                "questionId": challenge["$id"],
                "startedAt": context.req.headers.get("x-appwrite-created-at", ""),
                "status": "in_progress"
            }
        )

        return context.res.json({
            "success": True,
            "data": {
                "id": challenge["$id"],
                "question": challenge["question"],
                "topicId": challenge["topicId"],
                "type": challenge.get("type", "text"),  # Assume text for MVP
                "options": challenge.get("options", []),  # For MCQs
                "correctAnswer": challenge.get("correctAnswer"),  # For validation
                "hints": challenge.get("hints", [])
            }
        })

    except Exception as err:
        context.error(f"Error in getChallengeForUser: {str(err)}")
        return context.res.json({"success": False, "error": str(err)}, 500)
