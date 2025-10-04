# Record Question View Function

This function records when a user views a question to track their challenge history and prevent showing duplicate questions.

## Purpose
- Creates a record in `user_challenge_history` collection
- Prevents users from seeing the same question twice
- Links to response when user submits an answer

## Request Body
```json
{
  "userId": "string",
  "questionId": "string"
}
```

## Response
```json
{
  "success": true,
  "historyId": "string"
}
```

## Usage Flow
1. User requests a new question via `get-question`
2. Frontend displays the question
3. Frontend immediately calls `record-question-view` to log the view
4. User can now get hints or submit a response
5. When response is submitted, `submit-response` links the responseId to this history record

## Permissions
- Each history document is readable/updatable only by the user who viewed it
- Document-level security ensures privacy

## Database Schema
Collection: `user_challenge_history`
- userId: string (required)
- questionId: string (required)
- timestamp: datetime (required)
- responseId: string (optional, linked later)
