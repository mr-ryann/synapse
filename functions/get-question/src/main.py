from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.query import Query
from appwrite.exception import AppwriteException
import json
import random
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

        # Get user's question history to filter out already-seen questions
        history = databases.list_documents(
            'synapse',
            'user_challenge_history',
            queries=[Query.equal('userId', user_id)]
        )
        seen_question_ids = [doc['questionId'] for doc in history['documents']]
        context.log(f"User {user_id} has seen {len(seen_question_ids)} questions")

        # Query questions matching selected topics
        questions = databases.list_documents(
            'synapse',
            'questions',
            queries=[Query.in_('topicId', selected_topics)]
        )

        if not questions['documents']:
            return context.res.json({"success": False, "error": "No questions found for selected topics"}, 404)

        # Filter out already-seen questions
        unseen_questions = [q for q in questions['documents'] if q['$id'] not in seen_question_ids]
        
        if not unseen_questions:
            return context.res.json({
                "success": False, 
                "error": "No more unseen questions available",
                "code": "NO_MORE_QUESTIONS"
            }, 404)

        # Select random unseen question
        random_question = random.choice(unseen_questions)

        context.log(f"Returned question {random_question['$id']} for user {user_id}")
        return context.res.json({"success": True, "question": random_question})

    except AppwriteException as err:
        context.error(f"Appwrite error: {repr(err)}")
        return context.res.json({"success": False, "error": str(err)}, 500)
    except Exception as err:
        context.error(f"Unexpected error: {repr(err)}")
        return context.res.json({"success": False, "error": str(err)}, 500)
