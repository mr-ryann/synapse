import os
import json
from appwrite.client import Client
from appwrite.services.account import Account
from appwrite.services.databases import Databases

def main(context):
    """
    Verify Email - MVP Version
    Verifies user email with token
    """
    try:
        # Initialize Appwrite client
        client = Client()
        client.set_endpoint(os.environ["APPWRITE_FUNCTION_API_ENDPOINT"])
        client.set_project(os.environ["APPWRITE_FUNCTION_PROJECT_ID"])

        # Parse request
        data = json.loads(context.req.body) if context.req.body else {}
        user_id = data.get("userId")
        secret = data.get("secret")
        
        if not all([user_id, secret]):
            return context.res.json({"success": False, "error": "userId and secret required"}, 400)

        # Use API key for verification
        client.set_key(os.environ.get("APPWRITE_DATABASES_API_KEY", context.req.headers.get("x-appwrite-key")))
        
        account = Account(client)
        
        # Verify email with token
        try:
            result = account.update_verification(user_id=user_id, secret=secret)
            
            # Update user profile if needed
            databases = Databases(client)
            database_id = os.environ["APPWRITE_DATABASE_ID"]
            
            try:
                databases.update_document(
                    database_id=database_id,
                    collection_id="users",
                    document_id=user_id,
                    data={"emailVerified": True}
                )
            except:
                pass  # Profile might not exist yet
            
            return context.res.json({
                "success": True,
                "data": {
                    "verified": True,
                    "userId": user_id
                }
            })
        except Exception as verify_err:
            return context.res.json({
                "success": False,
                "error": f"Verification failed: {str(verify_err)}"
            }, 400)

    except Exception as err:
        context.error(f"Error in verify-email: {str(err)}")
        return context.res.json({"success": False, "error": str(err)}, 500)
