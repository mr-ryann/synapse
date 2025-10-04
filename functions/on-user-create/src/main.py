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
        # Parse the user event payload
        user = json.loads(context.req.body)
        user_id = user['$id']
        email = user['email']

        # Create user profile document
        databases.create_document(
            database_id='synapse',
            collection_id='users',
            document_id=user_id,
            data={'email': email},
            permissions=[
                f'read("user:{user_id}")',
                f'update("user:{user_id}")',
                f'delete("user:{user_id}")'
            ]
        )

        context.log(f"Created user profile for {user_id}")
        return context.res.json({"success": True, "message": "User profile created"})

    except AppwriteException as err:
        context.error(f"Appwrite error: {repr(err)}")
        return context.res.json({"success": False, "error": str(err)}, 500)
    except Exception as err:
        context.error(f"Unexpected error: {repr(err)}")
        return context.res.json({"success": False, "error": str(err)}, 500)
