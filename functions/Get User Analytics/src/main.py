import os
import json
from datetime import datetime, timedelta
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.query import Query

def main(context):
    """
    Get User Analytics - MVP Version
    Computes streaks, trends, topic progress from user responses
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

        # Initialize Appwrite client (APPWRITE_FUNCTION_PROJECT_ID is automatically provided)
        project_id = os.environ.get("APPWRITE_FUNCTION_PROJECT_ID")
        client = Client()
        client.set_endpoint(os.environ.get("APPWRITE_FUNCTION_API_ENDPOINT"))
        client.set_project(project_id)
        client.set_key(os.environ.get("APPWRITE_DATABASES_API_KEY"))

        databases = Databases(client)
        database_id = os.environ.get("APPWRITE_DATABASE_ID")

        # Parse request body
        data = json.loads(context.req.body) if context.req.body else {}
        user_id = data.get("userId")

        if not user_id:
            return context.res.json({"success": False, "error": "userId required"}, 400)

        # Get user data
        user = databases.get_document(
            database_id=database_id,
            collection_id="users",
            document_id=user_id
        )

        # Get all user responses
        responses = databases.list_documents(
            database_id=database_id,
            collection_id="responses",
            queries=[
                Query.equal("userId", user_id),
                Query.order_desc("$createdAt"),
                Query.limit(100)
            ]
        )

        total_responses = responses["total"]
        response_docs = responses["documents"]

        # Calculate average thinking time
        times = [r.get("thinkingTime", 0) for r in response_docs if r.get("thinkingTime", 0) > 0]
        avg_thinking_time = sum(times) / len(times) if times else 0
        
        # Calculate quality metrics
        quality_bonuses = [r.get("thinkingQualityBonus", 0) for r in response_docs]
        avg_quality_bonus = sum(quality_bonuses) / len(quality_bonuses) if quality_bonuses else 0

        # Topic progress
        topic_stats = {}
        for response in response_docs:
            challenge_id = response.get("challengeId")
            try:
                challenge = databases.get_document(
                    database_id=database_id,
                    collection_id="challenges",
                    document_id=challenge_id
                )
                topic_id = challenge.get("topicID")
                topic_name = challenge.get("topicName", "Unknown")
                
                if topic_id not in topic_stats:
                    topic_stats[topic_id] = {
                        "topicName": topic_name,
                        "completed": 0,
                        "totalXp": 0
                    }
                
                topic_stats[topic_id]["completed"] += 1
                topic_stats[topic_id]["totalXp"] += response.get("xpEarned", 0)
            except:
                continue

        # Activity calendar (last 30 days)
        activity_calendar = {}
        today = datetime.utcnow().date()
        
        for response in response_docs:
            created_at = response.get("$createdAt")
            if created_at:
                date = datetime.fromisoformat(created_at.replace("Z", "+00:00")).date()
                date_str = date.isoformat()
                
                if date_str not in activity_calendar:
                    activity_calendar[date_str] = 0
                activity_calendar[date_str] += 1

        # Recent trend (last 7 days vs previous 7 days)
        seven_days_ago = today - timedelta(days=7)
        fourteen_days_ago = today - timedelta(days=14)
        
        recent_count = sum(1 for r in response_docs 
                          if datetime.fromisoformat(r.get("$createdAt", "").replace("Z", "+00:00")).date() >= seven_days_ago)
        previous_count = sum(1 for r in response_docs 
                           if fourteen_days_ago <= datetime.fromisoformat(r.get("$createdAt", "").replace("Z", "+00:00")).date() < seven_days_ago)
        
        trend = "up" if recent_count > previous_count else "down" if recent_count < previous_count else "stable"

        return context.res.json({
            "success": True,
            "data": {
                "xp": user.get("xp", 0),
                "level": user.get("level", 1),
                "currentStreak": user.get("currentStreak", 0),
                "longestStreak": user.get("longestStreak", 0),
                "totalChallenges": user.get("totalChallengesCompleted", 0),
                "totalResponses": total_responses,
                "averageThinkingTime": round(avg_thinking_time, 1),
                "averageQualityBonus": round(avg_quality_bonus, 1),
                "topicProgress": topic_stats,
                "activityCalendar": activity_calendar,
                "trend": trend,
                "recentActivity": recent_count,
                "previousActivity": previous_count,
                "selectedTopics": user.get("selectedTopics", [])
            }
        })

    except Exception as err:
        context.error(f"Error in get-user-analytics: {str(err)}")
        return context.res.json({"success": False, "error": str(err)}, 500)
