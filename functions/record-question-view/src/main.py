from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.id import ID
from appwrite.exception import AppwriteException
from datetime import datetime
import json
import os

def main(context):
    """
    Record when a user views a question to prevent showing it again.
    
    Expected request body:
    {
        "userId": "string",
        "questionId": "string"
    }
    
    Returns:
    {
        "success": true,
        "historyId": "string"
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
        # Parse request body
        data = json.loads(context.req.body)
        user_id = data.get('userId')
        question_id = data.get('questionId')
        
        if not user_id or not question_id:
            return context.res.json({
                "success": False, 
                "error": "userId and questionId are required"
            }, 400)

        # Create history record
        history_doc = databases.create_document(
            'synapse',
            'user_challenge_history',
            ID.unique(),
            {
                'userId': user_id,
                'questionId': question_id,
                'timestamp': datetime.utcnow().isoformat() + 'Z',
                'responseId': None
            },
            permissions=[
                f'read("user:{user_id}")',
                f'update("user:{user_id}")',
                f'delete("user:{user_id}")'
            ]
        )

        context.log(f"Recorded question view: user={user_id}, question={question_id}")
        
        return context.res.json({
            "success": True,
            "historyId": history_doc['$id']
        })

    except AppwriteException as err:
        context.error(f"Appwrite error: {repr(err)}")
        return context.res.json({
            "success": False, 
            "error": str(err)
        }, 500)
    except Exception as err:
        context.error(f"Unexpected error: {repr(err)}")
        return context.res.json({
            "success": False, 
            "error": str(err)
        }, 500)
