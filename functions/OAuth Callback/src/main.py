import os
import json
from appwrite.client import Client
from appwrite.services.account import Account
from appwrite.services.databases import Databases

def main(context):
    """
    OAuth Callback - MVP Version
    Handles OAuth callback and creates/updates user profile
    """
    try:
        # Initialize Appwrite client
        client = Client()
        client.set_endpoint(os.environ["APPWRITE_FUNCTION_API_ENDPOINT"])
        client.set_project(os.environ["APPWRITE_FUNCTION_PROJECT_ID"])
        
        # Parse request
        data = json.loads(context.req.body) if context.req.body else {}
        user_id = data.get("userId")
        session = data.get("session")
        
        if not user_id:
            return context.res.json({"success": False, "error": "userId required"}, 400)

        # Set session for authenticated requests
        if session:
            client.set_session(session)

        account = Account(client)
        
        # Get user account details
        try:
            user_account = account.get()
        except:
            return context.res.json({"success": False, "error": "Invalid session"}, 401)

        # Initialize database client with API key
        db_client = Client()
        db_client.set_endpoint(os.environ["APPWRITE_FUNCTION_API_ENDPOINT"])
        db_client.set_project(os.environ["APPWRITE_FUNCTION_PROJECT_ID"])
        db_client.set_key(os.environ.get("APPWRITE_DATABASES_API_KEY", context.req.headers.get("x-appwrite-key")))
        
        databases = Databases(db_client)
        database_id = os.environ["APPWRITE_DATABASE_ID"]

        # Check if user profile exists
        try:
            user_profile = databases.get_document(
                database_id=database_id,
                collection_id="users",
                document_id=user_id
            )
            # User exists, return profile
            return context.res.json({
                "success": True,
                "data": {
                    "isNewUser": False,
                    "userId": user_id,
                    "profile": user_profile
                }
            })
        except:
            # User doesn't exist, create new profile
            user_profile = databases.create_document(
                database_id=database_id,
                collection_id="users",
                document_id=user_id,
                data={
                    "email": user_account.get("email", ""),
                    "username": user_account.get("name", "User"),
                    "xp": 0,
                    "level": 1,
                    "currentStreak": 0,
                    "longestStreak": 0,
                    "selectedTopics": [],
                    "totalChallengesCompleted": 0,
                    "onboardingCompleted": False
                },
                permissions=[
                    f"read(\"user:{user_id}\")",
                    f"update(\"user:{user_id}\")",
                    f"delete(\"user:{user_id}\")"
                ]
            )
            
            return context.res.json({
                "success": True,
                "data": {
                    "isNewUser": True,
                    "userId": user_id,
                    "profile": user_profile
                }
            })

    except Exception as err:
        context.error(f"Error in oauth-callback: {str(err)}")
        return context.res.json({"success": False, "error": str(err)}, 500)
