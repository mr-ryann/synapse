# Manage Topics Function

This function provides admin CRUD operations for managing topics in the Synapse database.

## Actions

### Create Topic
```json
{
  "action": "create",
  "name": "Philosophy",
  "description": "Explore philosophical concepts and critical thinking",
  "category": "Humanities"
}
```

### Update Topic
```json
{
  "action": "update",
  "topicId": "topic_id_here",
  "name": "Updated Name",
  "description": "Updated description",
  "category": "Updated Category"
}
```

### Delete Topic
```json
{
  "action": "delete",
  "topicId": "topic_id_here"
}
```

### List Topics
```json
{
  "action": "list"
}
```

## Setup

1. Deploy this function to Appwrite
2. Set appropriate permissions (admin only)
3. Use with admin dashboard or API calls
