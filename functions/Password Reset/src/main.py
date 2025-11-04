import os
import json
from appwrite.client import Client
from appwrite.services.account import Account

def main(context):
    """
    Password Reset - MVP Version
    Handles password reset requests
    """
    try:
        # Validate required environment variables
        required_vars = [
            "APPWRITE_FUNCTION_API_ENDPOINT",
            "APPWRITE_DATABASES_API_KEY"
        ]
        missing_vars = [var for var in required_vars if not os.environ.get(var)]
        if missing_vars:
            return context.res.json({
                "success": False,
                "error": f"Missing required environment variables: {', '.join(missing_vars)}"
            }, 500)

        # Initialize Appwrite client (APPWRITE_FUNCTION_PROJECT_ID is automatically provided)
        project_id = os.environ.get("APPWRITE_FUNCTION_PROJECT_ID")
        client = Client()
        client.set_endpoint(os.environ.get("APPWRITE_FUNCTION_API_ENDPOINT"))
        client.set_project(project_id)
        client.set_key(os.environ.get("APPWRITE_DATABASES_API_KEY"))

        account = Account(client)

        # Parse request
        data = json.loads(context.req.body) if context.req.body else {}
        action = data.get("action")  # "request" or "confirm"
        
        if action == "request":
            # Request password reset
            email = data.get("email")
            reset_url = data.get("resetUrl", "https://yourapp.com/reset-password")
            
            if not email:
                return context.res.json({"success": False, "error": "email required"}, 400)
            
            try:
                account.create_recovery(email=email, url=reset_url)
                return context.res.json({
                    "success": True,
                    "data": {"message": "Password reset email sent"}
                })
            except Exception as e:
                return context.res.json({
                    "success": False,
                    "error": f"Failed to send reset email: {str(e)}"
                }, 400)
                
        elif action == "confirm":
            # Confirm password reset with token
            user_id = data.get("userId")
            secret = data.get("secret")
            password = data.get("password")
            password_confirm = data.get("passwordConfirm")
            
            if not all([user_id, secret, password, password_confirm]):
                return context.res.json({
                    "success": False,
                    "error": "userId, secret, password, and passwordConfirm required"
                }, 400)
            
            if password != password_confirm:
                return context.res.json({
                    "success": False,
                    "error": "Passwords do not match"
                }, 400)
            
            try:
                account.update_recovery(
                    user_id=user_id,
                    secret=secret,
                    password=password
                )
                return context.res.json({
                    "success": True,
                    "data": {"message": "Password reset successful"}
                })
            except Exception as e:
                return context.res.json({
                    "success": False,
                    "error": f"Password reset failed: {str(e)}"
                }, 400)
        else:
            return context.res.json({
                "success": False,
                "error": "Invalid action. Use 'request' or 'confirm'"
            }, 400)

    except Exception as err:
        context.error(f"Error in password-reset: {str(err)}")
        return context.res.json({"success": False, "error": str(err)}, 500)
