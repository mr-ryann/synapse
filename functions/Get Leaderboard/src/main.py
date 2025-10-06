import os
import json
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.query import Query

def main(context):
    """
    Get Leaderboard - MVP Version
    Aggregates and returns rankings by XP and streak
    """
    try:
        # Initialize Appwrite client
        client = Client()
        client.set_endpoint(os.environ["APPWRITE_FUNCTION_API_ENDPOINT"])
        client.set_project(os.environ["APPWRITE_FUNCTION_PROJECT_ID"])
        client.set_key(os.environ.get("APPWRITE_DATABASES_API_KEY", context.req.headers.get("x-appwrite-key")))

        databases = Databases(client)
        database_id = os.environ["APPWRITE_DATABASE_ID"]

        # Parse request body
        data = json.loads(context.req.body) if context.req.body else {}
        leaderboard_type = data.get("type", "xp")  # xp, streak, or level
        limit = data.get("limit", 50)
        user_id = data.get("userId")  # Optional: to include current user's rank

        # Query users and sort by requested metric
        if leaderboard_type == "xp":
            order_field = "xp"
        elif leaderboard_type == "streak":
            order_field = "currentStreak"
        elif leaderboard_type == "level":
            order_field = "level"
        else:
            return context.res.json({"success": False, "error": "Invalid leaderboard type"}, 400)

        # Get top users
        users = databases.list_documents(
            database_id=database_id,
            collection_id="users",
            queries=[
                Query.order_desc(order_field),
                Query.limit(limit)
            ]
        )

        # Format leaderboard data
        leaderboard = []
        user_rank = None
        
        for idx, user in enumerate(users["documents"], start=1):
            entry = {
                "rank": idx,
                "userId": user["$id"],
                "username": user.get("username", "Anonymous"),
                "xp": user.get("xp", 0),
                "level": user.get("level", 1),
                "currentStreak": user.get("currentStreak", 0),
                "totalChallenges": user.get("totalChallengesCompleted", 0)
            }
            leaderboard.append(entry)
            
            # Track current user's rank
            if user_id and user["$id"] == user_id:
                user_rank = idx

        # If user not in top N, fetch their rank separately
        if user_id and not user_rank:
            user_doc = databases.get_document(
                database_id=database_id,
                collection_id="users",
                document_id=user_id
            )
            
            user_value = user_doc.get(order_field, 0)
            
            # Count how many users have higher value
            higher_users = databases.list_documents(
                database_id=database_id,
                collection_id="users",
                queries=[
                    Query.greater_than(order_field, user_value),
                    Query.limit(1)
                ]
            )
            
            user_rank = higher_users["total"] + 1

        return context.res.json({
            "success": True,
            "data": {
                "leaderboard": leaderboard,
                "userRank": user_rank,
                "type": leaderboard_type,
                "total": users["total"]
            }
        })

    except Exception as err:
        context.error(f"Error in get-leaderboard: {str(err)}")
        return context.res.json({"success": False, "error": str(err)}, 500)
