from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.query import Query
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
        # Get userId from request body
        data = json.loads(context.req.body)
        user_id = data.get('userId')
        if not user_id:
            return context.res.json({"success": False, "error": "userId is required"}, 400)

        # Query user's responses
        responses = databases.list_documents(
            'synapse',
            'responses',
            queries=[Query.equal('userId', user_id)]
        )

        documents = responses['documents']
        total_responses = len(documents)

        if total_responses == 0:
            return context.res.json({
                "success": True,
                "analytics": {
                    "totalResponses": 0,
                    "averageThinkingTime": 0,
                    "totalThinkingTime": 0
                }
            })

        # Calculate metrics
        thinking_times = [doc['thinkingTime'] for doc in documents]
        average_thinking_time = sum(thinking_times) / len(thinking_times)
        total_thinking_time = sum(thinking_times)

        analytics = {
            "totalResponses": total_responses,
            "averageThinkingTime": average_thinking_time,
            "totalThinkingTime": total_thinking_time
        }

        context.log(f"Calculated analytics for user {user_id}: {total_responses} responses")
        return context.res.json({"success": True, "analytics": analytics})

    except AppwriteException as err:
        context.error(f"Appwrite error: {repr(err)}")
        return context.res.json({"success": False, "error": str(err)}, 500)
    except Exception as err:
        context.error(f"Unexpected error: {repr(err)}")
        return context.res.json({"success": False, "error": str(err)}, 500)
