from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.query import Query
from appwrite.exception import AppwriteException
import json
import os
from datetime import datetime, timedelta
from collections import defaultdict

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

        # Calculate basic metrics
        thinking_times = [doc['thinkingTime'] for doc in documents]
        average_thinking_time = sum(thinking_times) / len(thinking_times)
        total_thinking_time = sum(thinking_times)

        # ====== NEW: Calculate Response Trend (Last 30 days) ======
        today = datetime.now()
        response_trend = []
        daily_counts = defaultdict(int)
        
        for doc in documents:
            # Parse date from $createdAt (ISO format)
            date_str = doc['$createdAt'][:10]  # YYYY-MM-DD
            daily_counts[date_str] += 1
        
        # Fill last 30 days (reverse chronological)
        for i in range(29, -1, -1):
            date = (today - timedelta(days=i)).strftime('%Y-%m-%d')
            response_trend.append({
                "date": date,
                "count": daily_counts.get(date, 0)
            })

        # ====== NEW: Calculate Thinking Time by Topic ======
        topic_stats = defaultdict(lambda: {"times": [], "count": 0})
        
        for doc in documents:
            try:
                # Get question to find topic
                question = databases.get_document('synapse', 'questions', doc['questionId'])
                topic = databases.get_document('synapse', 'topics', question['topicId'])
                
                topic_name = topic['name']
                topic_stats[topic_name]["times"].append(doc['thinkingTime'])
                topic_stats[topic_name]["count"] += 1
            except:
                continue  # Skip if question/topic not found
        
        thinking_by_topic = []
        for topic_name, data in topic_stats.items():
            avg_time = sum(data["times"]) / len(data["times"]) if data["times"] else 0
            thinking_by_topic.append({
                "topic": topic_name,
                "avgTime": round(avg_time, 1),
                "count": data["count"]
            })
        
        # Sort by avgTime descending (slowest first)
        thinking_by_topic.sort(key=lambda x: x["avgTime"], reverse=True)

        # ====== NEW: Calculate Topic Progress ======
        topic_progress = []
        try:
            # Get user's selected topics
            user_doc = databases.get_document('synapse', 'users', user_id)
            selected_topics = user_doc.get('selectedTopics', [])
            
            # Get all answered question IDs
            answered_question_ids = set(doc['questionId'] for doc in documents)
            
            for topic_id in selected_topics:
                try:
                    topic = databases.get_document('synapse', 'topics', topic_id)
                    
                    # Count total questions in topic
                    all_questions = databases.list_documents(
                        'synapse',
                        'questions',
                        queries=[Query.equal('topicId', topic_id)]
                    )
                    total_questions = len(all_questions['documents'])
                    
                    # Count answered questions
                    answered_count = sum(1 for q in all_questions['documents'] 
                                       if q['$id'] in answered_question_ids)
                    
                    percentage = (answered_count / total_questions) if total_questions > 0 else 0
                    
                    topic_progress.append({
                        "topic": topic['name'],
                        "answered": answered_count,
                        "total": total_questions,
                        "percentage": round(percentage, 2)
                    })
                except:
                    continue
        except:
            pass  # User doc might not have selectedTopics yet

        # ====== NEW: Calculate Activity Calendar & Streaks (Last 90 days) ======
        activity_map = defaultdict(lambda: {"active": False, "responseCount": 0})
        
        for doc in documents:
            date_str = doc['$createdAt'][:10]
            activity_map[date_str]["active"] = True
            activity_map[date_str]["responseCount"] += 1
        
        # Generate last 90 days
        activity_calendar = []
        for i in range(89, -1, -1):
            date = (today - timedelta(days=i)).strftime('%Y-%m-%d')
            activity_calendar.append({
                "date": date,
                "active": activity_map[date]["active"],
                "responseCount": activity_map[date]["responseCount"]
            })
        
        # Calculate streaks
        sorted_active_dates = sorted([d for d, v in activity_map.items() if v["active"]])
        current_streak = 0
        longest_streak = 0
        temp_streak = 1
        
        today_str = today.strftime('%Y-%m-%d')
        yesterday_str = (today - timedelta(days=1)).strftime('%Y-%m-%d')
        
        # Calculate current streak (counting back from today)
        if today_str in activity_map and activity_map[today_str]["active"]:
            current_streak = 1
            check_date = today - timedelta(days=1)
            while check_date.strftime('%Y-%m-%d') in activity_map:
                if activity_map[check_date.strftime('%Y-%m-%d')]["active"]:
                    current_streak += 1
                    check_date -= timedelta(days=1)
                else:
                    break
        elif yesterday_str in activity_map and activity_map[yesterday_str]["active"]:
            # Streak continues if active yesterday
            current_streak = 1
            check_date = today - timedelta(days=2)
            while check_date.strftime('%Y-%m-%d') in activity_map:
                if activity_map[check_date.strftime('%Y-%m-%d')]["active"]:
                    current_streak += 1
                    check_date -= timedelta(days=1)
                else:
                    break
        
        # Calculate longest streak
        for i in range(1, len(sorted_active_dates)):
            prev_date = datetime.strptime(sorted_active_dates[i-1], '%Y-%m-%d')
            curr_date = datetime.strptime(sorted_active_dates[i], '%Y-%m-%d')
            
            if (curr_date - prev_date).days == 1:
                temp_streak += 1
                longest_streak = max(longest_streak, temp_streak)
            else:
                temp_streak = 1
        
        longest_streak = max(longest_streak, temp_streak, current_streak)
        
        streak_info = {
            "currentStreak": current_streak,
            "longestStreak": longest_streak,
            "totalActiveDays": len(sorted_active_dates)
        }

        # ====== Compile Full Analytics Response ======
        analytics = {
            "totalResponses": total_responses,
            "averageThinkingTime": round(average_thinking_time, 1),
            "totalThinkingTime": total_thinking_time,
            "responseTrend": response_trend,
            "thinkingTimeByTopic": thinking_by_topic,
            "topicProgress": topic_progress,
            "activityCalendar": activity_calendar,
            "streakInfo": streak_info
        }

        context.log(f"Calculated enhanced analytics for user {user_id}: {total_responses} responses")
        return context.res.json({"success": True, "analytics": analytics})

    except AppwriteException as err:
        context.error(f"Appwrite error: {repr(err)}")
        return context.res.json({"success": False, "error": str(err)}, 500)
    except Exception as err:
        context.error(f"Unexpected error: {repr(err)}")
        return context.res.json({"success": False, "error": str(err)}, 500)
