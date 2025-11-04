import os
import json
import random
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.query import Query
import google.generativeai as genai

# Configuration
POOL_MINIMUM = 100  # Minimum number of unused challenges to maintain

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

MASTER_CHALLENGE_PROMPT = """You are a Socratic curriculum designer for a critical thinking app.
Your task is to generate one single, thought-provoking challenge.

You must generate the challenge based on these three variables:
1. TOPIC: "{topicName}"
2. ARCHETYPE: "{archetype}"
3. MUTATOR: "{mutator}"

RULES:
- NEVER state the archetype or mutator in your response.
- The challenge must be open-ended with no single right answer.
- The challenge must be concise (under 40 words).
- Do not include any preamble (e.g., "Here is your challenge:").
- Return ONLY the final challenge as a plain string.
"""

def generate_challenge(topic_name, archetype, mutator):
    """
    Generate a challenge using Gemini AI
    """
    try:
        # Configure Gemini
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise Exception("GEMINI_API_KEY not found in environment")
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.5-flash")
        
        # Format prompt
        prompt = MASTER_CHALLENGE_PROMPT.format(
            topicName=topic_name,
            archetype=archetype,
            mutator=mutator
        )
        
        # Call AI
        response = model.generate_content(prompt)
        
        if not response or not response.text:
            raise Exception("AI returned empty response")
        
        challenge_text = response.text.strip()
        
        # Remove any markdown formatting or quotes
        challenge_text = challenge_text.replace("```", "").replace('"', '').strip()
        
        if len(challenge_text) < 10:
            raise Exception(f"AI generated text too short: {len(challenge_text)} chars")
        
        return challenge_text
    except Exception as e:
        raise Exception(f"AI generation failed for {topic_name} ({archetype}/{mutator}): {str(e)}")

def main(context):
    """
    Populate Challenge Pool - Background Worker
    Scheduled Function (Cron Job)
    
    Maintains a pool of at least POOL_MINIMUM unused challenges.
    Runs periodically to ensure the pool is always full.
    """
    # Wrap everything in try-catch to ensure we return proper responses
    try:
        context.log("=" * 50)
        context.log("STARTING: Populate Challenge Pool Function")
        context.log("=" * 50)
        
        # Validate required environment variables
        required_vars = [
            "APPWRITE_FUNCTION_API_ENDPOINT",
            "APPWRITE_DATABASE_ID",
            "GEMINI_API_KEY"
        ]
        
        context.log("Checking environment variables...")
        missing_vars = [var for var in required_vars if not os.environ.get(var)]
        if missing_vars:
            error_msg = f"Missing required environment variables: {', '.join(missing_vars)}"
            context.error(error_msg)
            return context.res.json({
                "success": False,
                "error": error_msg
            }, 400)

        context.log("✅ All environment variables present")
        
        # Initialize Appwrite (APPWRITE_FUNCTION_PROJECT_ID is automatically provided)
        context.log("Initializing Appwrite client...")
        try:
            client = Client()
            endpoint = os.environ.get("APPWRITE_FUNCTION_API_ENDPOINT")
            project_id = os.environ.get("APPWRITE_FUNCTION_PROJECT_ID")
            # Use the automatically provided API key for functions
            api_key = os.environ.get("APPWRITE_FUNCTION_API_KEY", os.environ.get("APPWRITE_API_KEY"))
            
            context.log(f"Endpoint: {endpoint}")
            context.log(f"Project ID: {project_id}")
            context.log(f"API Key present: {bool(api_key)}")
            
            if not api_key:
                raise Exception("No API key found (checked APPWRITE_FUNCTION_API_KEY and APPWRITE_API_KEY)")
            
            client.set_endpoint(endpoint)
            client.set_project(project_id)
            client.set_key(api_key)

            databases = Databases(client)
            database_id = os.environ.get("APPWRITE_DATABASE_ID")
            
            context.log(f"✅ Appwrite client initialized with database: {database_id}")
        except Exception as e:
            error_msg = f"Failed to initialize Appwrite client: {str(e)}"
            context.error(error_msg)
            return context.res.json({"success": False, "error": error_msg}, 500)

        # Step 1: Count unused challenges
        context.log("Step 1: Counting unused challenges...")
        try:
            unused_challenges = databases.list_documents(
                database_id=database_id,
                collection_id="challenges",
                queries=[
                    Query.equal("status", "unused"),
                    Query.limit(1)
                ]
            )
            
            current_count = unused_challenges["total"]
            context.log(f"✅ Current unused challenges: {current_count}/{POOL_MINIMUM}")
        except Exception as e:
            error_msg = f"Failed to count unused challenges: {str(e)}"
            context.error(error_msg)
            return context.res.json({"success": False, "error": error_msg}, 500)

        # Step 2: Check if pool is full
        if current_count >= POOL_MINIMUM:
            context.log("Pool is full. No action needed.")
            return context.res.json({
                "success": True,
                "message": "Pool is full",
                "currentCount": current_count,
                "minimum": POOL_MINIMUM
            })

        # Step 3: Calculate how many to create
        needed = POOL_MINIMUM - current_count
        context.log(f"Need to create {needed} challenges")

        # Step 4: Get all topics
        context.log("Step 4: Fetching topics from database...")
        try:
            topics_response = databases.list_documents(
                database_id=database_id,
                collection_id="topics",
                queries=[Query.limit(100)]
            )
            
            topics = topics_response["documents"]
            if not topics:
                error_msg = "No topics found in database"
                context.error(error_msg)
                return context.res.json({
                    "success": False,
                    "error": error_msg
                }, 400)
            
            context.log(f"✅ Found {len(topics)} topics")
        except Exception as e:
            error_msg = f"Failed to fetch topics: {str(e)}"
            context.error(error_msg)
            return context.res.json({"success": False, "error": error_msg}, 500)

        # Step 5: Generate challenges (limit to 30 per execution to prevent timeout)
        MAX_PER_EXECUTION = 30
        to_create = min(needed, MAX_PER_EXECUTION)
        
        context.log(f"Step 5: Generating challenges...")
        context.log(f"Needed: {needed}, Will create this run: {to_create}")
        
        created_count = 0
        failed_count = 0
        
        for i in range(to_create):
            try:
                # Pick random topic
                topic = random.choice(topics)
                topic_id = topic["$id"]
                topic_name = topic.get("name", "General")
                
                # Pick random archetype and mutator
                archetype = random.choice(ARCHETYPES)
                mutator = random.choice(MUTATORS)
                
                context.log(f"[{i+1}/{to_create}] Generating for topic: {topic_name}")
                context.log(f"[{i+1}/{to_create}] Using archetype: {archetype}, mutator: {mutator}")
                
                # Generate challenge text with AI
                try:
                    prompt_text = generate_challenge(topic_name, archetype, mutator)
                    context.log(f"[{i+1}/{to_create}] ✅ AI generated challenge ({len(prompt_text)} chars)")
                except Exception as ai_error:
                    context.error(f"[{i+1}/{to_create}] ❌ AI generation failed: {str(ai_error)}")
                    failed_count += 1
                    continue
                
                # Create challenge document in database
                try:
                    databases.create_document(
                        database_id=database_id,
                        collection_id="challenges",
                        document_id="unique()",
                        data={
                            "promptText": prompt_text,
                            "topicId": topic_id,
                            "topicName": topic_name,
                            "status": "unused",
                            "difficulty": 1,
                            "xpReward": 10,
                            "archetype": archetype,
                            "mutator": mutator,
                            "estimatedTime": 8
                        }
                    )
                    created_count += 1
                    context.log(f"[{i+1}/{to_create}] ✅ Saved to database")
                except Exception as db_error:
                    context.error(f"[{i+1}/{to_create}] ❌ Database save failed: {str(db_error)}")
                    failed_count += 1
                    continue
                
            except Exception as e:
                failed_count += 1
                context.error(f"[{i+1}/{to_create}] ❌ Unexpected error: {str(e)}")
                continue

        context.log("=" * 50)
        context.log(f"✅ Pool population complete!")
        context.log(f"Created: {created_count}, Failed: {failed_count}")
        context.log(f"New total: {current_count + created_count}/{POOL_MINIMUM}")
        if (current_count + created_count) < POOL_MINIMUM:
            context.log(f"⚠️ Pool still needs {POOL_MINIMUM - (current_count + created_count)} more challenges")
            context.log("Function will run again on next cron schedule")
        context.log("=" * 50)

        return context.res.json({
            "success": True,
            "message": "Pool population complete",
            "created": created_count,
            "failed": failed_count,
            "previousCount": current_count,
            "newTotal": current_count + created_count,
            "targetMinimum": POOL_MINIMUM,
            "stillNeeded": max(0, POOL_MINIMUM - (current_count + created_count))
        })

    except Exception as err:
        context.error(f"Error in populateChallengePool: {str(err)}")
        return context.res.json({
            "success": False,
            "error": str(err)
        }, 500)
