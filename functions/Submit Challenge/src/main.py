import os
import json
from datetime import datetime
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.query import Query
from appwrite.exception import AppwriteException

# Gamification Configuration
XP_PER_QUESTION = 5
XP_COMPLETION_BONUS = 10
XP_TIME_BONUS_THRESHOLD = 120
XP_TIME_BONUS = 2
XP_LENGTH_BONUS_THRESHOLD = 200
XP_LENGTH_BONUS = 2
XP_PER_LEVEL = 100

def main(context):
    try:
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

        client = Client()
        client.set_endpoint(os.environ["APPWRITE_FUNCTION_API_ENDPOINT"])
        client.set_project(os.environ["APPWRITE_FUNCTION_PROJECT_ID"])
        client.set_key(os.environ["APPWRITE_DATABASES_API_KEY"])
        
        databases = Databases(client)
        database_id = os.environ["APPWRITE_DATABASE_ID"]

        try:
            data = json.loads(context.req.body) if context.req.body else {}
        except json.JSONDecodeError:
            return context.res.json({
                "success": False,
                "error": "Invalid JSON in request body"
            }, 400)

        user_id = data.get("userId")
        challenge_id = data.get("challengeId")
        question_index = data.get("questionIndex")
        question_text = data.get("questionText")
        response_text = data.get("responseText")
        thinking_time = data.get("thinkingTime", 0)

        if not all([user_id, challenge_id, question_text, response_text]) or question_index is None:
            return context.res.json({
                "success": False,
                "error": "Missing required fields: userId, challengeId, questionIndex, questionText, responseText"
            }, 400)

        context.log(f"Processing question {question_index} - User: {user_id}, Challenge: {challenge_id}")

        challenge = databases.get_document(
            database_id=database_id,
            collection_id="challenges",
            document_id=challenge_id
        )
        
        total_questions = len(challenge.get("questions", []))
        is_last_question = (question_index >= total_questions - 1)

        question_xp = XP_PER_QUESTION
        
        if thinking_time >= XP_TIME_BONUS_THRESHOLD:
            question_xp += XP_TIME_BONUS
            context.log(f"Time bonus: +{XP_TIME_BONUS} XP")
        
        if len(response_text) >= XP_LENGTH_BONUS_THRESHOLD:
            question_xp += XP_LENGTH_BONUS
            context.log(f"Length bonus: +{XP_LENGTH_BONUS} XP")

        context.log(f"XP for this question: {question_xp}")

        # Check if user already answered this question - update instead of create
        existing_response = databases.list_documents(
            database_id=database_id,
            collection_id="responses",
            queries=[
                Query.equal("userID", [user_id]),
                Query.equal("challengeID", [challenge_id]),
                Query.equal("questionIndex", [question_index]),
                Query.limit(1)
            ]
        )

        if existing_response["total"] > 0:
            # Update existing response
            response_doc = databases.update_document(
                database_id=database_id,
                collection_id="responses",
                document_id=existing_response["documents"][0]["$id"],
                data={
                    "questionText": question_text,
                    "responseText": response_text,
                    "thinkingTime": thinking_time,
                    "xpEarned": question_xp,
                    "submittedAt": datetime.utcnow().isoformat()
                }
            )
            context.log(f"Response updated with ID: {response_doc['$id']}")
        else:
            # Create new response
            response_doc = databases.create_document(
                database_id=database_id,
                collection_id="responses",
                document_id="unique()",
                data={
                    "userID": user_id,
                    "challengeID": challenge_id,
                    "questionIndex": question_index,
                    "questionText": question_text,
                    "responseText": response_text,
                    "thinkingTime": thinking_time,
                    "xpEarned": question_xp,
                    "submittedAt": datetime.utcnow().isoformat()
                },
                permissions=[
                    f'read("user:{user_id}")',
                    f'update("user:{user_id}")',
                    f'delete("user:{user_id}")'
                ]
            )
            context.log(f"Response saved with ID: {response_doc['$id']}")

        all_responses = databases.list_documents(
            database_id=database_id,
            collection_id="responses",
            queries=[
                Query.equal("userID", [user_id]),
                Query.equal("challengeID", [challenge_id])
            ]
        )
        
        questions_answered = all_responses["total"]
        total_xp_earned = sum(r.get("xpEarned", 0) for r in all_responses["documents"])
        total_thinking_time = sum(r.get("thinkingTime", 0) for r in all_responses["documents"])

        if is_last_question:
            completion_bonus = XP_COMPLETION_BONUS if questions_answered == total_questions else 0
            total_xp_earned += completion_bonus
            
            context.log(f"Challenge complete! Total XP: {total_xp_earned} (including {completion_bonus} completion bonus)")

            user = databases.get_document(
                database_id=database_id,
                collection_id="users",
                document_id=user_id
            )

            current_xp = user.get("xp", 0)
            new_xp = current_xp + total_xp_earned
            current_level = user.get("level", 1)
            new_level = (new_xp // XP_PER_LEVEL) + 1
            leveled_up = new_level > current_level

            current_streak = user.get("streak", 0)
            new_streak = current_streak + 1

            completed_challenges = user.get("completedChallenges", 0) + 1

            databases.update_document(
                database_id=database_id,
                collection_id="users",
                document_id=user_id,
                data={
                    "xp": new_xp,
                    "level": new_level,
                    "streak": new_streak,
                    "completedChallenges": completed_challenges,
                    "lastActiveDate": datetime.utcnow().isoformat()
                }
            )

            context.log(f"User updated - XP: {new_xp}, Level: {new_level}, Streak: {new_streak}")

            try:
                history_list = databases.list_documents(
                    database_id=database_id,
                    collection_id="user_challenge_history",
                    queries=[
                        Query.equal("userId", [user_id]),
                        Query.equal("challengeId", [challenge_id]),
                        Query.limit(1)
                    ]
                )
                
                if history_list["total"] > 0:
                    history_doc = history_list["documents"][0]
                    databases.update_document(
                        database_id=database_id,
                        collection_id="user_challenge_history",
                        document_id=history_doc["$id"],
                        data={
                            "xpEarned": total_xp_earned,
                            "completionTime": total_thinking_time
                        }
                    )
                else:
                    databases.create_document(
                        database_id=database_id,
                        collection_id="user_challenge_history",
                        document_id="unique()",
                        data={
                            "userId": user_id,
                            "questionId": challenge_id,
                            "challengeId": challenge_id,
                            "challengeType": "text",
                            "timestamp": datetime.utcnow().isoformat(),
                            "xpEarned": total_xp_earned,
                            "completionTime": total_thinking_time
                        },
                        permissions=[
                            f'read("user:{user_id}")',
                            f'update("user:{user_id}")',
                            f'delete("user:{user_id}")'
                        ]
                    )
                    
            except AppwriteException as e:
                context.error(f"Failed to update challenge history: {str(e)}")

            return context.res.json({
                "success": True,
                "data": {
                    "responseId": response_doc["$id"],
                    "questionIndex": question_index,
                    "isLastQuestion": True,
                    "questionsAnswered": questions_answered,
                    "totalQuestions": total_questions,
                    "xpEarnedThisQuestion": question_xp,
                    "totalXpEarned": total_xp_earned,
                    "completionBonus": completion_bonus,
                    "level": new_level,
                    "leveledUp": leveled_up,
                    "streak": new_streak,
                    "message": f"Challenge complete! You earned {total_xp_earned} XP! 🧠✨"
                }
            })
        
        return context.res.json({
            "success": True,
            "data": {
                "responseId": response_doc["$id"],
                "questionIndex": question_index,
                "isLastQuestion": False,
                "questionsAnswered": questions_answered,
                "totalQuestions": total_questions,
                "xpEarnedThisQuestion": question_xp,
                "message": f"Question {question_index + 1} saved! {total_questions - questions_answered} more to go!"
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
