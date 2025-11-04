import os
import json
from datetime import datetime
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.query import Query

# MVP Configuration
XP_PER_ANSWER = 10
XP_BONUS_CORRECT = 5
THINKING_TIME_BONUS_THRESHOLD = 120  # 2 minutes
THINKING_TIME_BONUS_XP = 5
SUBSTANTIAL_RESPONSE_LENGTH = 200  # characters
SUBSTANTIAL_RESPONSE_BONUS_XP = 5

def main(context):
    """
    Submit Challenge Step - MVP Version
    Handles user response submission, validates answers, calculates XP
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
        question_id = data.get("questionId")
        user_answer = data.get("answer")
        response_text = data.get("responseText", user_answer)
        time_taken = data.get("timeTaken", 0)  # seconds

        if not all([user_id, question_id, user_answer]):
            return context.res.json({"success": False, "error": "userId, questionId, and answer required"}, 400)

        # Get question details for validation
        question = databases.get_document(
            database_id=database_id,
            collection_id="questions",
            document_id=question_id
        )

        # Validate answer (for MCQs)
        is_correct = False
        question_type = question.get("type", "text")
        
        if question_type == "mcq":
            correct_answer = question.get("correctAnswer")
            is_correct = str(user_answer).strip().lower() == str(correct_answer).strip().lower()
        
        # Calculate XP with quality bonuses
        xp_earned = XP_PER_ANSWER
        thinking_quality_bonus = 0
        
        # Bonus for thoughtful time spent (at least 2 minutes)
        if time_taken >= THINKING_TIME_BONUS_THRESHOLD:
            thinking_quality_bonus += THINKING_TIME_BONUS_XP
        
        # Bonus for substantial response (more than 200 characters)
        if response_text and len(str(response_text)) >= SUBSTANTIAL_RESPONSE_LENGTH:
            thinking_quality_bonus += SUBSTANTIAL_RESPONSE_BONUS_XP
        
        # Add quality bonus
        xp_earned += thinking_quality_bonus
        
        # Correctness bonus for MCQs
        if is_correct and question_type == "mcq":
            xp_earned += XP_BONUS_CORRECT

        # Store response
        response_doc = databases.create_document(
            database_id=database_id,
            collection_id="responses",
            document_id="unique()",
            data={
                "userId": user_id,
                "questionId": question_id,
                "answer": user_answer,
                "responseText": response_text,
                "isCorrect": is_correct,
                "timeTaken": time_taken,
                "thinkingQualityBonus": thinking_quality_bonus,
                "xpEarned": xp_earned,
                "submittedAt": datetime.utcnow().isoformat()
            },
            permissions=[
                f"read(\"user:{user_id}\")",
                f"update(\"user:{user_id}\")",
                f"delete(\"user:{user_id}\")"
            ]
        )

        # Update user's challenge history if historyId provided
        history_id = data.get("historyId")
        if history_id:
            try:
                databases.update_document(
                    database_id=database_id,
                    collection_id="user_challenge_history",
                    document_id=history_id,
                    data={
                        "status": "completed",
                        "completedAt": datetime.utcnow().isoformat(),
                        "responseId": response_doc["$id"]
                    }
                )
            except Exception as e:
                context.log(f"Could not update challenge history: {str(e)}")

        # Get current user data for gamification update
        user = databases.get_document(
            database_id=database_id,
            collection_id="users",
            document_id=user_id
        )

        current_xp = user.get("xp", 0)
        new_xp = current_xp + xp_earned
        current_level = user.get("level", 1)
        new_level = (new_xp // 100) + 1  # Level up every 100 XP

        # Update streak
        last_activity = user.get("lastActivityDate")
        current_streak = user.get("currentStreak", 0)
        today = datetime.utcnow().date().isoformat()
        
        if last_activity:
            last_date = datetime.fromisoformat(last_activity).date()
            days_diff = (datetime.utcnow().date() - last_date).days
            
            if days_diff == 0:
                # Same day, maintain streak
                new_streak = current_streak
            elif days_diff == 1:
                # Consecutive day, increment streak
                new_streak = current_streak + 1
            else:
                # Streak broken, reset to 1
                new_streak = 1
        else:
            new_streak = 1

        # Update user gamification data
        databases.update_document(
            database_id=database_id,
            collection_id="users",
            document_id=user_id,
            data={
                "xp": new_xp,
                "level": new_level,
                "currentStreak": new_streak,
                "longestStreak": max(user.get("longestStreak", 0), new_streak),
                "lastActivityDate": today,
                "totalChallengesCompleted": user.get("totalChallengesCompleted", 0) + 1
            }
        )

        return context.res.json({
            "success": True,
            "data": {
                "responseId": response_doc["$id"],
                "isCorrect": is_correct,
                "xpEarned": xp_earned,
                "totalXp": new_xp,
                "level": new_level,
                "leveledUp": new_level > current_level,
                "currentStreak": new_streak,
                "feedback": "Correct!" if is_correct else "Keep thinking!"
            }
        })

    except Exception as err:
        context.error(f"Error in submit-challenge-step: {str(err)}")
        return context.res.json({"success": False, "error": str(err)}, 500)
