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
        question_id = data.get('questionId')
        response_text = data.get('responseText')
        thinking_time = data.get('thinkingTime')

        if not all([user_id, question_id, response_text, thinking_time is not None]):
            return context.res.json({"success": False, "error": "userId, questionId, responseText, and thinkingTime are required"}, 400)

        # Create response document
        response_doc = databases.create_document(
            database_id='synapse',
            collection_id='responses',
            document_id='',  # Auto-generate ID
            data={
                'userId': user_id,
                'questionId': question_id,
                'responseText': response_text,
                'thinkingTime': thinking_time
            },
            permissions=[
                f'read("user:{user_id}")',
                f'update("user:{user_id}")',
                f'delete("user:{user_id}")'
            ]
        )

        context.log(f"Created response {response_doc['$id']} for user {user_id}")
        return context.res.json({"success": True, "responseId": response_doc['$id']})

    except AppwriteException as err:
        context.error(f"Appwrite error: {repr(err)}")
        return context.res.json({"success": False, "error": str(err)}, 500)
    except Exception as err:
        context.error(f"Unexpected error: {repr(err)}")
        return context.res.json({"success": False, "error": str(err)}, 500)
