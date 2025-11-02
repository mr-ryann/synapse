import os
import json
import random
from datetime import datetime
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.query import Query
import google.generativeai as genai

# Challenge Generation Configuration
ARCHETYPES = [
    "Ethical Dilemma",
    "Thought Experiment",
    "Paradox",
    "Perspective Shift",
    "Future Scenario",
    "Historical What-If",
    "Personal Reflection",
    "Philosophical Question",
    "Moral Puzzle",
    "Counterfactual Thinking"
]

MUTATORS = [
    "What if the opposite were true?",
    "Consider from a child's perspective",
    "Apply to a different domain",
    "Zoom out 1000 years",
    "Remove all constraints",
    "Add extreme urgency",
    "Make it personal",
    "Challenge the assumption",
    "Flip the stakeholders",
    "Scale it to extremes"
]

MASTER_PROMPT_TEMPLATE = """You are a Socratic thinking coach creating critical thinking challenges for the Synapse app.

Create a thought-provoking challenge with these parameters:
- Topic: {topic}
- SubTopic: {subtopic}
- Archetype: {archetype}
- Mutator: {mutator}
- User Level: {level}

Requirements:
1. Write a provocative question that doesn't have a "correct" answer
2. The question should encourage deep thinking, not quick answers
3. It should be personally relevant and emotionally engaging
4. Length: 2-3 sentences maximum
5. Avoid clichés and generic questions
6. Make it intellectually challenging but accessible
7. The question should spark genuine curiosity and debate

Format your response as JSON:
{{
  "title": "Brief catchy title (4-6 words)",
  "coreProvocation": "The main question or prompt (2-3 sentences)",
  "estimatedTime": 8
}}

Generate the challenge now:"""

def generate_ai_challenge(topic: str, subtopic: str, user_level: int = 1):
    """Generate a new challenge using Gemini AI"""
    try:
        genai.configure(api_key=os.environ["GEMINI_API_KEY"])
        model = genai.GenerativeModel('gemini-pro')
        
        # Select archetype and mutator based on user level
        # Higher levels get more complex archetypes
        archetype = random.choice(ARCHETYPES)
        mutator = random.choice(MUTATORS)
        
        prompt = MASTER_PROMPT_TEMPLATE.format(
            topic=topic,
            subtopic=subtopic,
            archetype=archetype,
            mutator=mutator,
            level=user_level
        )
        
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Try to extract JSON from response
        # Handle cases where AI might wrap JSON in markdown code blocks
        if "```json" in response_text:
            json_start = response_text.find("```json") + 7
            json_end = response_text.find("```", json_start)
            response_text = response_text[json_start:json_end].strip()
        elif "```" in response_text:
            json_start = response_text.find("```") + 3
            json_end = response_text.find("```", json_start)
            response_text = response_text[json_start:json_end].strip()
        
        challenge_data = json.loads(response_text)
        
        # Add metadata
        challenge_data["archetype"] = archetype
        challenge_data["mutator"] = mutator
        
        return challenge_data
    except Exception as e:
        raise Exception(f"AI generation failed: {str(e)}")

def main(context):
    """
    Get Challenge For User - Enhanced Version
    Layer 1: Curated Database (existing challenges)
    Layer 2: AI Generation (NEW - dynamic challenges)
    """
    try:
        # Initialize Appwrite
        client = Client()
        client.set_endpoint(os.environ["APPWRITE_FUNCTION_API_ENDPOINT"])
        client.set_project(os.environ["APPWRITE_FUNCTION_PROJECT_ID"])
        client.set_key(os.environ.get("APPWRITE_DATABASES_API_KEY", context.req.headers.get("x-appwrite-key")))

        databases = Databases(client)
        database_id = os.environ["APPWRITE_DATABASE_ID"]

        # Parse request
        data = json.loads(context.req.body) if context.req.body else {}
        user_id = data.get("userId")
        force_ai_generation = data.get("forceAI", False)

        if not user_id:
            return context.res.json({"success": False, "error": "userId required"}, 400)

        # Get user profile
        user_doc = databases.get_document(
            database_id=database_id,
            collection_id="users",
            document_id=user_id
        )

        selected_topics = user_doc.get("selectedTopics", [])
        if not selected_topics:
            return context.res.json({"success": False, "error": "No topics selected"}, 400)

        user_level = user_doc.get("level", 1)

        # LAYER 1: Try curated database first (unless forced AI)
        if not force_ai_generation:
            try:
                # Get challenge history
                history_response = databases.list_documents(
                    database_id=database_id,
                    collection_id="user_challenge_history",
                    queries=[Query.equal("userId", user_id)]
                )
                seen_challenge_ids = [doc.get("challengeId") for doc in history_response["documents"] if doc.get("challengeId")]

                # Query available challenges from the challenges collection
                challenges_response = databases.list_documents(
                    database_id=database_id,
                    collection_id="challenges",
                    queries=[
                        Query.limit(100)
                    ]
                )

                # Filter challenges by selected topics and exclude seen ones
                available_challenges = [
                    c for c in challenges_response["documents"]
                    if c.get("topicId") in selected_topics and c["$id"] not in seen_challenge_ids
                ]

                # If we have curated challenges, use one
                if available_challenges:
                    challenge = random.choice(available_challenges)
                    
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
                            "source": "curated"
                        }
                    )

                    return context.res.json({
                        "success": True,
                        "data": {
                            "id": challenge["$id"],
                            "title": challenge.get("title", ""),
                            "coreProvocation": challenge.get("coreProvocation", ""),
                            "topic": challenge.get("topicName", ""),
                            "topicId": challenge.get("topicId", ""),
                            "estimatedTime": challenge.get("estimatedTime", 10),
                            "difficulty": challenge.get("difficulty", 1),
                            "source": "curated"
                        }
                    })
            except Exception as e:
                context.log(f"Curated database query failed, falling back to AI: {str(e)}")

        # LAYER 2: Generate AI challenge
        # Select random topic and subtopic
        selected_topic_id = random.choice(selected_topics)
        
        # Get topic details
        topic_doc = databases.get_document(
            database_id=database_id,
            collection_id="topics",
            document_id=selected_topic_id
        )
        topic_name = topic_doc.get("name", "General")
        topic_description = topic_doc.get("description", "")
        
        # Use topic name as subtopic for now (can be enhanced with subcategories)
        subtopic = topic_name
        
        # Generate challenge with AI
        context.log(f"Generating AI challenge for topic: {topic_name}, level: {user_level}")
        ai_challenge = generate_ai_challenge(topic_name, subtopic, user_level)
        
        # Store generated challenge in database
        new_challenge = databases.create_document(
            database_id=database_id,
            collection_id="challenges",
            document_id="unique()",
            data={
                "title": ai_challenge["title"],
                "coreProvocation": ai_challenge["coreProvocation"],
                "topicId": selected_topic_id,
                "topicName": topic_name,
                "difficulty": min(user_level, 3),
                "estimatedTime": ai_challenge.get("estimatedTime", 10),
                "xpReward": 15 + (user_level * 5),  # Scale XP with level
                "source": "ai_generated",
                "archetype": ai_challenge.get("archetype", ""),
                "mutator": ai_challenge.get("mutator", "")
            }
        )
        
        # Record in history
        databases.create_document(
            database_id=database_id,
            collection_id="user_challenge_history",
            document_id="unique()",
            data={
                "userId": user_id,
                "challengeId": new_challenge["$id"],
                "startedAt": datetime.utcnow().isoformat(),
                "status": "in_progress",
                "source": "ai_generated"
            }
        )

        context.log(f"Successfully generated AI challenge: {new_challenge['$id']}")

        return context.res.json({
            "success": True,
            "data": {
                "id": new_challenge["$id"],
                "title": new_challenge["title"],
                "coreProvocation": new_challenge["coreProvocation"],
                "topic": topic_name,
                "topicId": selected_topic_id,
                "estimatedTime": new_challenge["estimatedTime"],
                "difficulty": new_challenge["difficulty"],
                "source": "ai_generated"
            }
        })

    except Exception as err:
        context.error(f"Error in getChallengeForUser: {str(err)}")
        return context.res.json({"success": False, "error": str(err)}, 500)