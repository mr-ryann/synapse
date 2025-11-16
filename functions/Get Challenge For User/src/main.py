import os
import json
import random
from datetime import datetime
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.query import Query

def main(context):
    """
    Get Challenge For User - Manual Seeding Version
    Supports two modes:
    - "recommended": Challenges from user's selected topics (Home screen)
    - "all": All available challenges (Library screen)
    """
    try:
        # Validate required environment variables
        required_vars = [
            "APPWRITE_FUNCTION_API_ENDPOINT",
            "APPWRITE_DATABASE_ID",
            "APPWRITE_DATABASES_API_KEY"
        ]
        missing_vars = [var for var in required_vars if not os.environ.get(var)]
        if missing_vars:
            return context.res.json({
                "success": False,
                "error": f"Missing required environment variables: {', '.join(missing_vars)}"
            }, 500)

        # Initialize Appwrite (APPWRITE_FUNCTION_PROJECT_ID is automatically provided)
        project_id = os.environ.get("APPWRITE_FUNCTION_PROJECT_ID")
        client = Client()
        client.set_endpoint(os.environ.get("APPWRITE_FUNCTION_API_ENDPOINT"))
        client.set_project(project_id)
        client.set_key(os.environ.get("APPWRITE_DATABASES_API_KEY"))

        databases = Databases(client)
        database_id = os.environ.get("APPWRITE_DATABASE_ID")

        # Parse request
        data = json.loads(context.req.body) if context.req.body else {}
        user_id = data.get("userId")
        mode = data.get("mode", "recommended")  # "recommended" or "all"

        if not user_id:
            return context.res.json({"success": False, "error": "userId required"}, 400)

        # Get user profile
        user_doc = databases.get_document(
            database_id=database_id,
            collection_id="users",
            document_id=user_id
        )

        selected_topics = user_doc.get("selectedTopics", [])
        
        # For recommended mode, user MUST have selected topics
        if mode == "recommended" and not selected_topics:
            return context.res.json({"success": False, "error": "No topics selected. Please select topics first."}, 400)

        user_level = user_doc.get("level", 1)

        # Get challenge history to avoid duplicates
        try:
            history_response = databases.list_documents(
                database_id=database_id,
                collection_id="user_challenge_history",
                queries=[Query.equal("userId", [user_id])]
            )
            seen_challenge_ids = [doc.get("challengeId") for doc in history_response["documents"] if doc.get("challengeId")]
        except:
            seen_challenge_ids = []

        # Build query based on mode
        if mode == "recommended":
            # HOME SCREEN: Show only challenges in user's selected topics
            challenges_response = databases.list_documents(
                database_id=database_id,
                collection_id="challenges",
                queries=[
                    Query.equal("status", ["unused"]),
                    Query.limit(100)
                ]
            )
            
            # Filter by user's topics
            available_challenges = [
                c for c in challenges_response["documents"]
                if c.get("topicID") in selected_topics and c["$id"] not in seen_challenge_ids
            ]
        elif mode == "all":
            # LIBRARY SCREEN: Show ALL unused challenges
            challenges_response = databases.list_documents(
                database_id=database_id,
                collection_id="challenges",
                queries=[
                    Query.equal("status", ["unused"]),
                    Query.limit(100)
                ]
            )
            
            # Exclude only seen challenges (no topic filter)
            available_challenges = [
                c for c in challenges_response["documents"]
                if c["$id"] not in seen_challenge_ids
            ]
        else:
            return context.res.json({"success": False, "error": "Invalid mode. Use 'recommended' or 'all'"}, 400)

        # If we have challenges available, use one
        if available_challenges:
            challenge = random.choice(available_challenges)
            
            # Mark challenge as USED
            databases.update_document(
                database_id=database_id,
                collection_id="challenges",
                document_id=challenge["$id"],
                data={"status": "used"}
            )
            
            # Record in history
            databases.create_document(
                database_id=database_id,
                collection_id="user_challenge_history",
                document_id="unique()",
                data={
                    "userId": user_id,
                    "challengeId": challenge["$id"],
                    "startedAt": datetime.utcnow().isoformat(),
                    "status": "in_progress",
                    "source": mode  # "recommended" or "all"
                }
            )

            return context.res.json({
                "success": True,
                "data": {
                    "id": challenge["$id"],
                    "promptText": challenge.get("promptText", ""),
                    "topic": challenge.get("topicName", ""),
                    "topicID": challenge.get("topicID", ""),
                    "estimatedTime": challenge.get("estimatedTime", 8),
                    "difficulty": challenge.get("difficulty", 1),
                    "archetype": challenge.get("archetype", ""),
                    "mutator": challenge.get("mutator", ""),
                    "source": mode,
                    "mode": mode
                }
            })
        else:
            # No challenges available
            return context.res.json({
                "success": False,
                "error": f"No {'recommended' if mode == 'recommended' else ''} challenges available. Please check back later or try a different mode.",
                "mode": mode
            }, 404)

    except Exception as err:
        context.error(f"Error in getChallengeForUser: {str(err)}")
        return context.res.json({"success": False, "error": str(err)}, 500)
