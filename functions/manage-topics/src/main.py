from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.exception import AppwriteException
from appwrite.id import ID
import json
import os

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
        # Parse request
        data = json.loads(context.req.body)
        action = data.get('action')  # create, update, delete, list
        
        if action == 'create':
            # Create new topic
            name = data.get('name')
            description = data.get('description')
            category = data.get('category', '')
            
            if not name or not description:
                return context.res.json({"success": False, "error": "name and description are required"}, 400)
            
            topic = databases.create_document(
                database_id='synapse',
                collection_id='topics',
                document_id=ID.unique(),
                data={
                    'name': name,
                    'description': description,
                    'category': category
                }
            )
            
            context.log(f"Created topic {topic['$id']}")
            return context.res.json({"success": True, "topic": topic})
        
        elif action == 'update':
            # Update existing topic
            topic_id = data.get('topicId')
            name = data.get('name')
            description = data.get('description')
            category = data.get('category')
            
            if not topic_id:
                return context.res.json({"success": False, "error": "topicId is required"}, 400)
            
            update_data = {}
            if name:
                update_data['name'] = name
            if description:
                update_data['description'] = description
            if category is not None:
                update_data['category'] = category
            
            topic = databases.update_document(
                database_id='synapse',
                collection_id='topics',
                document_id=topic_id,
                data=update_data
            )
            
            context.log(f"Updated topic {topic_id}")
            return context.res.json({"success": True, "topic": topic})
        
        elif action == 'delete':
            # Delete topic
            topic_id = data.get('topicId')
            
            if not topic_id:
                return context.res.json({"success": False, "error": "topicId is required"}, 400)
            
            databases.delete_document(
                database_id='synapse',
                collection_id='topics',
                document_id=topic_id
            )
            
            context.log(f"Deleted topic {topic_id}")
            return context.res.json({"success": True, "message": "Topic deleted"})
        
        elif action == 'list':
            # List all topics
            topics = databases.list_documents('synapse', 'topics')
            return context.res.json({"success": True, "topics": topics['documents']})
        
        else:
            return context.res.json({"success": False, "error": "Invalid action. Use: create, update, delete, list"}, 400)

    except AppwriteException as err:
        context.error(f"Appwrite error: {repr(err)}")
        return context.res.json({"success": False, "error": str(err)}, 500)
    except Exception as err:
        context.error(f"Unexpected error: {repr(err)}")
        return context.res.json({"success": False, "error": str(err)}, 500)
