# Helm HR Ops API Documentation

## Base URL
```
https://gslab.engineer/api
```

## Authentication

All endpoints require JWT authentication via:

**Header:**
```
Authorization: Bearer <jwt_token>
```

**OR Cookie:**
```
Cookie: access_token=<jwt_token>
```

---

## Projects API

### List Projects
```http
GET /api/projects?status=active&owner_id=user_123
```

**Query Parameters:**
- `status` (optional): Filter by status (planning, active, completed, on_hold)
- `owner_id` (optional): Filter by owner

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Website Redesign",
    "client_name": "Acme Corp",
    "status": "active",
    "owner_id": "user_123",
    "team_ids": ["user_123", "user_456"],
    "total_tasks": 15,
    "completed_tasks": 8,
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

### Create Project
```http
POST /api/projects
Content-Type: application/json

{
  "name": "Website Redesign",
  "client_name": "Acme Corp",
  "description": "Complete overhaul",
  "status": "active",
  "owner_id": "user_123",
  "team_ids": ["user_123"],
  "budget_hours": 200
}
```

### Get Project
```http
GET /api/projects/{project_id}
```

### Update Project
```http
PUT /api/projects/{project_id}
Content-Type: application/json

{
  "status": "completed"
}
```

### Delete Project
```http
DELETE /api/projects/{project_id}
```

### Get Project Tasks
```http
GET /api/projects/{project_id}/tasks
```

---

## Tasks API

### List Tasks
```http
GET /api/tasks?project_id=proj_123&status=open&assignee_id=user_456
```

**Query Parameters:**
- `project_id` (optional): Filter by project
- `status` (optional): Filter by status (open, in_progress, blocked, completed)
- `priority` (optional): Filter by priority (low, medium, high)
- `assignee_id` (optional): Filter by assignee

**Response:**
```json
[
  {
    "id": "uuid",
    "project_id": "proj_123",
    "title": "Design homepage",
    "description": "Create mockup",
    "status": "open",
    "priority": "high",
    "assignee_ids": [],
    "skills_required": ["UI Design"],
    "estimated_hours": 8,
    "due_date": "2025-01-15T00:00:00Z",
    "created_by": "user_123",
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

### Create Task
```http
POST /api/tasks
Content-Type: application/json

{
  "project_id": "proj_123",
  "title": "Design homepage",
  "description": "Create high-fidelity mockup",
  "status": "open",
  "priority": "high",
  "skills_required": ["UI Design", "Figma"],
  "estimated_hours": 8,
  "created_by": "user_123"
}
```

### Assign Task
```http
POST /api/tasks/{task_id}/assign
Content-Type: application/json

{
  "assignee_ids": ["user_456", "user_789"]
}
```

### Get User Tasks
```http
GET /api/tasks/user/{user_id}?status=in_progress
```

---

## Schedules API

### List Schedules
```http
GET /api/schedules?assignee_id=user_123&start_date=2025-01-01&end_date=2025-01-31
```

**Query Parameters:**
- `assignee_id` (optional)
- `task_id` (optional)
- `status` (optional): scheduled, in_progress, completed, cancelled
- `start_date` (optional)
- `end_date` (optional)

### Create Schedule
```http
POST /api/schedules
Content-Type: application/json

{
  "task_id": "task_123",
  "assignee_id": "user_456",
  "start_time": "2025-01-15T09:00:00Z",
  "end_time": "2025-01-15T17:00:00Z",
  "title": "Work on homepage design",
  "created_by": "user_123"
}
```

**Response includes conflict detection:**
```json
{
  "id": "uuid",
  "has_conflict": true,
  "conflict_details": "Time overlap with schedule(s): sched_456"
}
```

### Detect Conflicts
```http
GET /api/schedules/conflicts/detect?assignee_id=user_123
```

**Response:**
```json
[
  {
    "schedule_ids": ["sched_123", "sched_456"],
    "assignee_id": "user_123",
    "conflict_type": "time_overlap",
    "description": "Time overlap between Schedule A and Schedule B",
    "severity": "high",
    "resolution_suggestions": [
      "Reschedule one of the tasks",
      "Reassign one task to another team member"
    ]
  }
]
```

---

## Skills API

### Get User Skills
```http
GET /api/skills/user/{user_id}
```

### Add Skill
```http
POST /api/skills/user/{user_id}
Content-Type: application/json

{
  "user_id": "user_123",
  "skill_name": "React",
  "proficiency": "expert",
  "years_experience": 5,
  "certifications": ["React Certified Developer"]
}
```

### Match Skills for Task
```http
GET /api/skills/match/{task_id}
```

**Response:**
```json
[
  {
    "user_id": "user_456",
    "user_name": "John Doe",
    "matched_skills": ["React", "TypeScript"],
    "missing_skills": ["GraphQL"],
    "match_score": 0.85,
    "proficiency_level": "expert",
    "availability": "available"
  }
]
```

---

## Workload API

### Get User Workload
```http
GET /api/workload/user/{user_id}?week_start=2025-01-01
```

**Response:**
```json
{
  "user_id": "user_123",
  "week_start": "2025-01-01",
  "total_hours": 35,
  "utilization_rate": 0.875,
  "tasks_count": 5,
  "projects": [
    {
      "project_id": "proj_123",
      "project_name": "Website Redesign",
      "hours": 20
    }
  ]
}
```

### Get Team Workload
```http
GET /api/workload/team?week_start=2025-01-01
```

### Get Capacity Analysis
```http
GET /api/workload/capacity/analysis?week_start=2025-01-01
```

**Response:**
```json
{
  "week_start": "2025-01-01",
  "total_capacity": 400,
  "total_allocated": 320,
  "team_utilization": 0.8,
  "members": [
    {
      "user_id": "user_123",
      "user_name": "John Doe",
      "total_assigned_hours": 35,
      "available_capacity": 40,
      "utilization_rate": 0.875,
      "status": "busy",
      "current_tasks": 5,
      "upcoming_deadlines": 2
    }
  ],
  "overloaded_members": ["Jane Smith"],
  "available_members": ["Mike Johnson"]
}
```

---

## AI Recommendations API

### Generate Recommendations
```http
POST /api/recommendations/generate?project_id=proj_123&limit=5
```

**Response:**
```json
[
  {
    "id": "uuid",
    "type": "assignment",
    "task_id": "task_123",
    "title": "Assign John Doe to Design homepage",
    "reason": "Skill match: 95% (React, UI Design)",
    "recommended_assignee": "user_456",
    "confidence": 0.92,
    "badge": "Assignment",
    "status": "pending",
    "details": {
      "current_state": {
        "assignee": "Unassigned",
        "workload": "N/A",
        "utilization_rate": 0
      },
      "proposed_state": {
        "assignee": "John Doe",
        "workload": "43 hours",
        "utilization_rate": 85
      },
      "impact": {
        "skill_match": "95%",
        "utilization_change": "+5%",
        "availability_fit": "High",
        "estimated_completion": "2-3 days"
      },
      "reasoning": [
        "Expert proficiency in React and UI Design (5+ years)",
        "Current workload: 35 hours (87% utilization)",
        "Best skill-workload balance in team",
        "Available this week with upcoming capacity"
      ]
    },
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

### List Recommendations
```http
GET /api/recommendations?status=pending&limit=10
```

### Apply Recommendation
```http
POST /api/recommendations/{recommendation_id}/apply
```

**Response:**
```json
{
  "message": "Recommendation applied successfully",
  "task": { /* updated task */ },
  "recommendation_id": "uuid"
}
```

### Dismiss Recommendation
```http
POST /api/recommendations/{recommendation_id}/dismiss
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```

### 404 Not Found
```json
{
  "detail": "Task not found"
}
```

### 400 Bad Request
```json
{
  "detail": "No fields to update"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

---

## Rate Limits

- **AI Recommendations**: 10 requests/minute
- **Other endpoints**: 100 requests/minute

---

## Pagination

For list endpoints, use `limit` parameter:
```http
GET /api/tasks?limit=50
```

Default: 100, Max: 1000

---

## Webhooks (Future)

Planned webhook events:
- `task.created`
- `task.assigned`
- `recommendation.generated`
- `conflict.detected`

---

**API Version**: 1.0.0  
**Last Updated**: {{DATE}}
