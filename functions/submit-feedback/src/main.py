from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.id import ID
from appwrite.exception import AppwriteException
from datetime import datetime
import json
import os

def main(context):
    """
    Submit feedback for a question or challenge.
    
    Expected request body:
    {
        "userId": "string",
        "questionId": "string",
        "feedbackType": "like" | "dislike" | "report" | "comment",
        "feedbackText": "string" (optional)
    }
    
    Returns:
    {
        "success": true,
        "feedbackId": "string"
    }
    """
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
        feedback_type = data.get('feedbackType')
        feedback_text = data.get('feedbackText')

        # Validate required fields
        if not all([user_id, question_id, feedback_type]):
            return context.res.json({
                "success": False, 
                "error": "userId, questionId, and feedbackType are required"
            }, 400)

        # Validate feedbackType
        valid_types = ['like', 'dislike', 'report', 'comment']
        if feedback_type not in valid_types:
            return context.res.json({
                "success": False,
                "error": f"feedbackType must be one of: {', '.join(valid_types)}"
            }, 400)

        # Create feedback document
        feedback_doc = databases.create_document(
            database_id='synapse',
            collection_id='feedback',
            document_id=ID.unique(),
            data={
                'userId': user_id,
                'questionId': question_id,
                'feedbackType': feedback_type,
                'feedbackText': feedback_text or None,
                'timestamp': datetime.utcnow().isoformat() + 'Z'
            },
            permissions=[
                f'read("user:{user_id}")',
                f'update("user:{user_id}")',
                f'delete("user:{user_id}")'
            ]
        )

        context.log(f"Created feedback {feedback_doc['$id']} for user {user_id} on question {question_id}")
        return context.res.json({"success": True, "feedbackId": feedback_doc['$id']})

    except AppwriteException as err:
        context.error(f"Appwrite error: {repr(err)}")
        return context.res.json({"success": False, "error": str(err)}, 500)
    except Exception as err:
        context.error(f"Unexpected error: {repr(err)}")
        return context.res.json({"success": False, "error": str(err)}, 500)
