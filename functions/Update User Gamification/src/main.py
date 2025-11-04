import os
import json
from datetime import datetime
from appwrite.client import Client
from appwrite.services.databases import Databases

# Gamification constants
XP_PER_LEVEL = 100
STREAK_BONUS_XP = 5

def main(context):
    """
    Update User Gamification - MVP Version
    Updates XP, levels, and streaks (can be called separately or by submit-challenge-step)
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
        xp_to_add = data.get("xpToAdd", 0)
        force_streak_update = data.get("forceStreakUpdate", False)

        if not user_id:
            return context.res.json({"success": False, "error": "userId required"}, 400)

        # Get current user data
        user = databases.get_document(
            database_id=database_id,
            collection_id="users",
            document_id=user_id
        )

        current_xp = user.get("xp", 0)
        new_xp = current_xp + xp_to_add
        
        # Calculate level
        current_level = user.get("level", 1)
        new_level = (new_xp // XP_PER_LEVEL) + 1
        leveled_up = new_level > current_level

        # Update streak if needed
        last_activity = user.get("lastActivityDate")
        current_streak = user.get("currentStreak", 0)
        today = datetime.utcnow().date().isoformat()
        
        new_streak = current_streak
        if force_streak_update or last_activity != today:
            if last_activity:
                last_date = datetime.fromisoformat(last_activity).date()
                days_diff = (datetime.utcnow().date() - last_date).days
                
                if days_diff == 0:
                    new_streak = current_streak
                elif days_diff == 1:
                    new_streak = current_streak + 1
                    # Bonus XP for maintaining streak
                    new_xp += STREAK_BONUS_XP
                else:
                    new_streak = 1
            else:
                new_streak = 1

        # Update user document
        updated_user = databases.update_document(
            database_id=database_id,
            collection_id="users",
            document_id=user_id,
            data={
                "xp": new_xp,
                "level": new_level,
                "currentStreak": new_streak,
                "longestStreak": max(user.get("longestStreak", 0), new_streak),
                "lastActivityDate": today
            }
        )

        return context.res.json({
            "success": True,
            "data": {
                "xp": new_xp,
                "level": new_level,
                "leveledUp": leveled_up,
                "currentStreak": new_streak,
                "longestStreak": updated_user.get("longestStreak", 0),
                "streakBonusXp": STREAK_BONUS_XP if new_streak > current_streak else 0
            }
        })

    except Exception as err:
        context.error(f"Error in update-user-gamification: {str(err)}")
        return context.res.json({"success": False, "error": str(err)}, 500)
