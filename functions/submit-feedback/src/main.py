from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.exception import AppwriteException
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
        # Get data from request body
        data = json.loads(context.req.body)
        user_id = data.get('userId')
        feedback_text = data.get('feedbackText')

        if not all([user_id, feedback_text]):
            return context.res.json({"success": False, "error": "userId and feedbackText are required"}, 400)

        # Create feedback document (assuming 'feedback' collection exists)
        feedback_doc = databases.create_document(
            database_id='synapse',
            collection_id='feedback',
            document_id='',  # Auto-generate ID
            data={
                'userId': user_id,
                'feedbackText': feedback_text
            },
            permissions=[
                f'read("user:{user_id}")',
                f'update("user:{user_id}")',
                f'delete("user:{user_id}")'
            ]
        )

        context.log(f"Created feedback {feedback_doc['$id']} for user {user_id}")
        return context.res.json({"success": True, "feedbackId": feedback_doc['$id']})

    except AppwriteException as err:
        context.error(f"Appwrite error: {repr(err)}")
        return context.res.json({"success": False, "error": str(err)}, 500)
    except Exception as err:
        context.error(f"Unexpected error: {repr(err)}")
        return context.res.json({"success": False, "error": str(err)}, 500)
