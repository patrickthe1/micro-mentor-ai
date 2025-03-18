# Micro-Mentor AI API Documentation

## Overview

The Micro-Mentor AI API provides structured, actionable advice for young professionals facing various challenges. The API uses Google's Gemini 2.0 Flash model to generate high-quality, structured advice with step-by-step guidance.

## Base URL

```
https://micro-mentor-api.example.com
```

For local development:

```
http://localhost:5000
```

## API Version

Current version: 1.0

All API responses include an `apiVersion` field to ensure compatibility as the API evolves.

## Authentication

Currently, the API doesn't require authentication for standard endpoints. However, admin endpoints require an API key.

## Rate Limiting

The API implements rate limiting to prevent abuse:

- 100 requests per 15-minute window per IP address
- Once the limit is reached, requests will be blocked until the window resets
- Rate limit information is provided in the response headers:
  - `RateLimit-Limit`: Maximum requests per window
  - `RateLimit-Remaining`: Remaining requests in the current window
  - `RateLimit-Reset`: Time (in seconds) until the window resets

## Endpoints

### Get Advice

```
POST /api/advice
```

Generate structured advice for a professional challenge.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| challenge | string | Yes | The professional challenge to get advice for |
| category | string | No | Specific category for the advice (see Categories endpoint) |
| version | string | No | Desired API version (defaults to current version) |

#### Response Format

```json
{
  "apiVersion": "1.0",
  "data": {
    "category": "Career Development",
    "insight": "Main insight summary (1-2 sentences).",
    "confidence_score": 0.85,
    "steps": [
      {
        "title": "Step 1 Title",
        "description": "Detailed description of step 1",
        "difficulty": "beginner",
        "time_commitment": "5-10 minutes",
        "resources": [
          {
            "title": "Example Resource",
            "url": "https://example.com/resource"
          }
        ]
      },
      // Additional steps...
    ],
    "overall_takeaway": "A concluding thought of encouragement.",
    "related_topics": ["topic1", "topic2"],
    "generation_timestamp": "2025-03-14T22:15:00Z"
  },
  "meta": {
    "responseTime": "1200ms"
  }
}
```

#### Error Responses

- `400 Bad Request`: Missing or invalid challenge, invalid category
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server-side issue
- `503 Service Unavailable`: AI service temporarily unavailable

### Get Available Categories

```
GET /api/categories
```

Returns a list of available advice categories.

#### Response Format

```json
{
  "apiVersion": "1.0",
  "data": {
    "categories": [
      "Career Development",
      "Skill Improvement",
      "Work-Life Balance",
      "Leadership",
      "Communication",
      "Networking",
      "Project Management",
      "Time Management",
      "Conflict Resolution",
      "Professional Relationships"
    ]
  }
}
```

### Get API Version Information

```
GET /api/version
```

Returns information about the API version and available endpoints.

#### Response Format

```json
{
  "apiVersion": "1.0",
  "name": "Micro-Mentor AI API",
  "description": "AI-powered mentorship advice API",
  "endpoints": [
    { "path": "/api/advice", "method": "POST", "description": "Get structured advice for a challenge" },
    { "path": "/api/categories", "method": "GET", "description": "Get available advice categories" },
    { "path": "/api/version", "method": "GET", "description": "Get API version information" },
    { "path": "/api/admin/cache", "method": "POST", "description": "Admin endpoint to manage response cache" },
    { "path": "/health", "method": "GET", "description": "Health check endpoint" }
  ]
}
```

### API Health Check

```
GET /health
```

Returns the current API health status.

#### Response Format

```json
{
  "apiVersion": "1.0",
  "status": "ok",
  "timestamp": "2025-03-14T22:15:00Z"
}
```

### Cache Management (Admin)

```
POST /api/admin/cache
```

Manages the API response cache. Requires admin API key.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| action | string | Yes | Action to perform on cache (currently supports: "cleanup") |
| apiKey | string | Yes | Admin API key for authentication |

#### Response Format

```json
{
  "apiVersion": "1.0",
  "data": {
    "action": "cleanup",
    "removedEntries": 5,
    "message": "Cache cleanup completed successfully"
  }
}
```

#### Error Responses

- `400 Bad Request`: Invalid action
- `401 Unauthorized`: Invalid API key

## Response Schema

The advice response follows a structured format designed to provide actionable guidance:

- **category**: Classification of the advice (e.g., "Career Development")
- **insight**: Concise summary of the main insight (1-2 sentences)
- **confidence_score**: AI confidence score between 0 and 1
- **steps**: Array of 3-5 sequential, buildable steps with:
  - **title**: Clear step title
  - **description**: Detailed explanation of what to do and why
  - **difficulty**: One of: "beginner", "intermediate", "advanced"
  - **time_commitment**: Estimated time to complete (e.g., "15-20 minutes")
  - **resources** (optional): Helpful resources for this step
  - **potential_challenges** (optional): Common obstacles for this step
  - **success_metrics** (optional): How to measure success for this step
- **overall_takeaway**: Concluding thought or encouragement
- **related_topics** (optional): Keywords for further exploration
- **generation_timestamp**: When the advice was generated

## Error Handling

All error responses follow a consistent format:

```json
{
  "apiVersion": "1.0",
  "error": "Error type or description",
  "message": "Detailed error message"
}
```

## Performance Optimization

The API uses several techniques to optimize performance:

- **Response Caching**: Common queries are cached for 24 hours to reduce response time
- **Response Time Tracking**: Each request includes a `responseTime` field in the metadata
- **Rate Limiting**: Prevents abuse and ensures fair resource allocation
- **Error Retry Logic**: Automatically retries failed requests to the AI service
- **Schema Validation**: Ensures responses match the expected format

## Usage Examples

### Basic Advice Request

```javascript
const response = await fetch('http://localhost:5000/api/advice', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    challenge: 'How can I improve my public speaking skills?'
  }),
});

const data = await response.json();
```

### Categorized Advice Request

```javascript
const response = await fetch('http://localhost:5000/api/advice', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    challenge: 'How can I improve my public speaking skills?',
    category: 'Skill Improvement'
  }),
});

const data = await response.json();
```

### Get Available Categories

```javascript
const response = await fetch('http://localhost:5000/api/categories');
const data = await response.json();
```

## Deployment

The API is designed to be deployed to any Node.js hosting service, such as:

- Render
- Heroku
- AWS Elastic Beanstalk
- Google Cloud Run

For deployment, ensure the following environment variables are set:

- `PORT`: Server port (defaults to 5000)
- `GEMINI_API_KEY`: Google Gemini API key
- `ADMIN_API_KEY`: Admin API key for protected endpoints
- `NODE_ENV`: Environment ("development" or "production") 