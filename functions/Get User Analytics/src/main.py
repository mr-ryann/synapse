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
        # Initialize Appwrite client
        client = Client()
        client.set_endpoint(os.environ["APPWRITE_FUNCTION_API_ENDPOINT"])
        client.set_project(os.environ["APPWRITE_FUNCTION_PROJECT_ID"])
        client.set_key(os.environ.get("APPWRITE_DATABASES_API_KEY", context.req.headers.get("x-appwrite-key")))

        databases = Databases(client)
        database_id = os.environ["APPWRITE_DATABASE_ID"]

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

        # Calculate accuracy (for MCQs)
        mcq_responses = [r for r in response_docs if r.get("isCorrect") is not None]
        correct_count = sum(1 for r in mcq_responses if r.get("isCorrect"))
        accuracy = (correct_count / len(mcq_responses) * 100) if mcq_responses else 0

        # Calculate average time
        times = [r.get("timeTaken", 0) for r in response_docs if r.get("timeTaken", 0) > 0]
        avg_time = sum(times) / len(times) if times else 0

        # Topic progress
        topic_stats = {}
        for response in response_docs:
            question_id = response.get("questionId")
            try:
                question = databases.get_document(
                    database_id=database_id,
                    collection_id="questions",
                    document_id=question_id
                )
                topic_id = question.get("topicId")
                
                if topic_id not in topic_stats:
                    topic_stats[topic_id] = {"answered": 0, "correct": 0}
                
                topic_stats[topic_id]["answered"] += 1
                if response.get("isCorrect"):
                    topic_stats[topic_id]["correct"] += 1
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
                "accuracy": round(accuracy, 1),
                "averageTime": round(avg_time, 1),
                "topicProgress": topic_stats,
                "activityCalendar": activity_calendar,
                "trend": trend,
                "recentActivity": recent_count,
                "previousActivity": previous_count
            }
        })

    except Exception as err:
        context.error(f"Error in get-user-analytics: {str(err)}")
        return context.res.json({"success": False, "error": str(err)}, 500)
