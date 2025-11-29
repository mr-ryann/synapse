import os
import json
from datetime import datetime, timezone
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.query import Query
from appwrite.exception import AppwriteException

# Gamification Configuration
XP_PER_QUESTION = 5
XP_COMPLETION_BONUS = 10
XP_TIME_BONUS_THRESHOLD = 120  # seconds - bonus if total thinking time >= this
XP_TIME_BONUS = 5
XP_LENGTH_BONUS_THRESHOLD = 200  # chars per response on average
XP_LENGTH_BONUS = 3
XP_PER_LEVEL = 100


def main(context):
    """
    Submit a complete challenge response.
    
    Document ID format: {userID}_{challengeID}
    This allows us to:
    - Use $id as both unique identifier AND challenge reference
    - Automatically enforce one response per user per challenge
    - Easily check if user completed a challenge by trying to get the document
    
    Expected payload:
    {
        "userId": "user-id",
        "challengeId": "challenge-id",
        "responses": [
            {
                "questionIndex": 0,
                "questionText": "Question 1?",
                "responseText": "My answer to question 1",
                "thinkingTime": 45
            },
            ...
        ],
        "totalThinkingTime": 180
    }
    
    Response document schema:
    {
        "$id": "{userID}_{challengeID}",
        "userID": "user-id",
        "responses": ["response1", "response2", ...],
        "questions": ["question1", "question2", ...],
        "thinkingTimes": [45, 60, ...],
        "totalThinkingTime": 180,
        "totalXpEarned": 25,
        "completedAt": "2025-11-29T12:00:00Z"
    }
    """
    try:
        # Validate environment variables
        required_env = [
            "APPWRITE_FUNCTION_API_ENDPOINT",
            "APPWRITE_FUNCTION_PROJECT_ID",
            "APPWRITE_DATABASE_ID",
            "APPWRITE_DATABASES_API_KEY"
        ]
        missing = [var for var in required_env if not os.environ.get(var)]
        if missing:
            context.error(f"Missing environment variables: {', '.join(missing)}")
            return context.res.json({
                "success": False,
                "error": f"Server configuration error: Missing {', '.join(missing)}"
            }, 500)

        # Initialize Appwrite client
        client = Client()
        client.set_endpoint(os.environ["APPWRITE_FUNCTION_API_ENDPOINT"])
        client.set_project(os.environ["APPWRITE_FUNCTION_PROJECT_ID"])
        client.set_key(os.environ["APPWRITE_DATABASES_API_KEY"])
        
        databases = Databases(client)
        database_id = os.environ["APPWRITE_DATABASE_ID"]

        # Parse request body
        try:
            data = json.loads(context.req.body) if context.req.body else {}
        except json.JSONDecodeError:
            return context.res.json({
                "success": False,
                "error": "Invalid JSON in request body"
            }, 400)

        # Extract and validate fields
        user_id = data.get("userId")
        challenge_id = data.get("challengeId")
        responses = data.get("responses", [])
        total_thinking_time = data.get("totalThinkingTime", 0)

        if not user_id or not challenge_id:
            return context.res.json({
                "success": False,
                "error": "Missing required fields: userId, challengeId"
            }, 400)

        if not responses or len(responses) == 0:
            return context.res.json({
                "success": False,
                "error": "No responses provided"
            }, 400)

        context.log(f"Processing challenge submission - User: {user_id}, Challenge: {challenge_id}, Responses: {len(responses)}")

        # Get challenge to validate
        try:
            challenge = databases.get_document(
                database_id=database_id,
                collection_id="challenges",
                document_id=challenge_id
            )
        except AppwriteException as e:
            context.error(f"Challenge not found: {str(e)}")
            return context.res.json({
                "success": False,
                "error": "Challenge not found"
            }, 404)

        total_questions = len(challenge.get("questions", []))
        
        # Extract arrays from responses
        response_texts = []
        question_texts = []
        thinking_times = []
        
        for resp in responses:
            response_texts.append(resp.get("responseText", ""))
            question_texts.append(resp.get("questionText", ""))
            thinking_times.append(resp.get("thinkingTime", 0))

        # Calculate XP
        base_xp = XP_PER_QUESTION * len(responses)
        context.log(f"Base XP: {base_xp} ({XP_PER_QUESTION} x {len(responses)} questions)")

        # Completion bonus (if all questions answered)
        completion_bonus = 0
        if len(responses) >= total_questions:
            completion_bonus = XP_COMPLETION_BONUS
            context.log(f"Completion bonus: +{completion_bonus} XP")

        # Time bonus (if spent enough time thinking)
        time_bonus = 0
        if total_thinking_time >= XP_TIME_BONUS_THRESHOLD:
            time_bonus = XP_TIME_BONUS
            context.log(f"Time bonus: +{time_bonus} XP (spent {total_thinking_time}s)")

        # Length bonus (if responses are detailed)
        avg_response_length = sum(len(r) for r in response_texts) / len(response_texts) if response_texts else 0
        length_bonus = 0
        if avg_response_length >= XP_LENGTH_BONUS_THRESHOLD:
            length_bonus = XP_LENGTH_BONUS
            context.log(f"Length bonus: +{length_bonus} XP (avg {avg_response_length:.0f} chars)")

        total_xp = base_xp + completion_bonus + time_bonus + length_bonus
        context.log(f"Total XP earned: {total_xp}")

        # Generate deterministic document ID: {userID}_{challengeID}
        # This ensures one response per user per challenge
        doc_id = f"{user_id}_{challenge_id}"
        context.log(f"Document ID: {doc_id}")

        # Check if this response already exists (retry)
        is_retry = False
        try:
            existing_doc = databases.get_document(
                database_id=database_id,
                collection_id="responses",
                document_id=doc_id
            )
            is_retry = True
            context.log(f"Found existing response - this is a retry")
        except AppwriteException as e:
            if "not found" in str(e).lower() or "could not be found" in str(e).lower():
                is_retry = False
                context.log(f"No existing response - first attempt")
            else:
                raise e

        # Prepare response document data (no challengeID - it's in the $id)
        response_data = {
            "userID": user_id,
            "responses": response_texts,
            "questions": question_texts,
            "thinkingTimes": thinking_times,
            "totalThinkingTime": total_thinking_time,
            "totalXpEarned": total_xp,
            "completedAt": datetime.now(timezone.utc).isoformat()
        }

        # Create or update response document
        if is_retry:
            # Update existing (retry)
            response_doc = databases.update_document(
                database_id=database_id,
                collection_id="responses",
                document_id=doc_id,
                data=response_data
            )
            context.log(f"Updated response document: {response_doc['$id']}")
        else:
            # Create new
            response_doc = databases.create_document(
                database_id=database_id,
                collection_id="responses",
                document_id=doc_id,
                data=response_data,
                permissions=[
                    f'read("user:{user_id}")',
                    f'update("user:{user_id}")',
                    f'delete("user:{user_id}")'
                ]
            )
            context.log(f"Created response document: {response_doc['$id']}")

        # Update user stats (only add XP if not a retry, or add difference)
        try:
            user = databases.get_document(
                database_id=database_id,
                collection_id="users",
                document_id=user_id
            )

            current_xp = user.get("xp", 0)
            current_level = user.get("level", 1)
            current_streak = user.get("streak", 0)
            completed_challenges = user.get("completedChallenges", 0)

            if is_retry:
                # On retry, we might want to only add XP difference or skip XP update
                # For now, let's not add XP on retry
                new_xp = current_xp
                new_streak = current_streak
                new_completed = completed_challenges
                context.log("Retry detected - not adding XP")
            else:
                new_xp = current_xp + total_xp
                new_streak = current_streak + 1
                new_completed = completed_challenges + 1

            new_level = (new_xp // XP_PER_LEVEL) + 1
            leveled_up = new_level > current_level

            databases.update_document(
                database_id=database_id,
                collection_id="users",
                document_id=user_id,
                data={
                    "xp": new_xp,
                    "level": new_level,
                    "streak": new_streak,
                    "completedChallenges": new_completed,
                    "lastActiveDate": datetime.now(timezone.utc).isoformat()
                }
            )

            context.log(f"User updated - XP: {new_xp}, Level: {new_level}, Streak: {new_streak}")

        except AppwriteException as e:
            context.error(f"Failed to update user stats: {str(e)}")
            # Don't fail the whole request if user update fails

        return context.res.json({
            "success": True,
            "data": {
                "responseId": response_doc["$id"],
                "isRetry": is_retry,
                "questionsAnswered": len(responses),
                "totalQuestions": total_questions,
                "totalXpEarned": total_xp if not is_retry else 0,
                "xpBreakdown": {
                    "base": base_xp,
                    "completion": completion_bonus,
                    "time": time_bonus,
                    "length": length_bonus
                },
                "level": new_level if 'new_level' in dir() else current_level,
                "leveledUp": leveled_up if 'leveled_up' in dir() else False,
                "streak": new_streak if 'new_streak' in dir() else current_streak,
                "message": "Challenge completed! Great thinking! 🧠✨" if not is_retry else "Challenge responses updated!"
            }
        })

    except AppwriteException as err:
        context.error(f"Appwrite error: {str(err)}")
        return context.res.json({
            "success": False,
            "error": f"Database error: {str(err)}"
        }, 500)
        
    except Exception as err:
        context.error(f"Unexpected error: {str(err)}")
        return context.res.json({
            "success": False,
            "error": f"Server error: {str(err)}"
        }, 500)
