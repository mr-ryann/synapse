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

        # Query questions matching selected topics
        questions = databases.list_documents(
            'synapse',
            'questions',
            queries=[Query.in_('topicId', selected_topics)]
        )

        if not questions['documents']:
            return context.res.json({"success": False, "error": "No questions found for selected topics"}, 404)

        # Select random question
        random_question = random.choice(questions['documents'])

        context.log(f"Returned question {random_question['$id']} for user {user_id}")
        return context.res.json({"success": True, "question": random_question})

    except AppwriteException as err:
        context.error(f"Appwrite error: {repr(err)}")
        return context.res.json({"success": False, "error": str(err)}, 500)
    except Exception as err:
        context.error(f"Unexpected error: {repr(err)}")
        return context.res.json({"success": False, "error": str(err)}, 500)
