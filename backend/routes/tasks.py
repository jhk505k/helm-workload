from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timezone

from models import Task, TaskCreate, TaskUpdate, TaskAssign
from middleware import get_current_user, CurrentUser
from utils import DatabaseHelper, validate_user_exists

import os
from motor.motor_asyncio import AsyncIOMotorClient

# Database connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'gslab')]

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


@router.get("", response_model=List[Task])
async def get_tasks(
    project_id: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    assignee_id: Optional[str] = None,
    current_user: CurrentUser = Depends(get_current_user)
):
    """Get all tasks with optional filters"""
    query = {}
    
    if project_id:
        query["project_id"] = project_id
    
    if status:
        query["status"] = status
    
    if priority:
        query["priority"] = priority
    
    if assignee_id:
        query["assignee_ids"] = assignee_id
    
    tasks = await db.tasks.find(query, {"_id": 0}).to_list(length=None)
    
    # Deserialize datetime fields
    datetime_fields = ["due_date", "created_at", "updated_at", "completed_at"]
    tasks = [DatabaseHelper.deserialize_datetime(t, datetime_fields) for t in tasks]
    
    return tasks


@router.post("", response_model=Task, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    current_user: CurrentUser = Depends(get_current_user)
):
    """Create a new task"""
    
    # Validate project exists
    project = await DatabaseHelper.find_one_or_404(
        db.projects,
        {"id": task_data.project_id},
        "Project not found"
    )
    
    # Validate assignees exist
    for assignee_id in task_data.assignee_ids:
        await validate_user_exists(db, assignee_id)
    
    # Create task object
    task = Task(**task_data.model_dump())
    
    # Serialize and insert
    doc = DatabaseHelper.serialize_datetime(task.model_dump())
    await db.tasks.insert_one(doc)
    
    return task


@router.get("/{task_id}", response_model=Task)
async def get_task(
    task_id: str,
    current_user: CurrentUser = Depends(get_current_user)
):
    """Get a specific task by ID"""
    
    task = await DatabaseHelper.find_one_or_404(
        db.tasks,
        {"id": task_id},
        "Task not found"
    )
    
    # Deserialize datetime fields
    datetime_fields = ["due_date", "created_at", "updated_at", "completed_at"]
    task = DatabaseHelper.deserialize_datetime(task, datetime_fields)
    
    return task


@router.put("/{task_id}", response_model=Task)
async def update_task(
    task_id: str,
    task_data: TaskUpdate,
    current_user: CurrentUser = Depends(get_current_user)
):
    """Update a task"""
    
    # Check task exists
    existing = await DatabaseHelper.find_one_or_404(
        db.tasks,
        {"id": task_id},
        "Task not found"
    )
    
    # Prepare update data
    update_data = {k: v for k, v in task_data.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")
    
    # Validate assignees if being changed
    if "assignee_ids" in update_data:
        for assignee_id in update_data["assignee_ids"]:
            await validate_user_exists(db, assignee_id)
    
    # Add completed_at timestamp if status changed to completed
    if update_data.get("status") == "completed" and existing.get("status") != "completed":
        update_data["completed_at"] = datetime.now(timezone.utc).isoformat()
    
    # Add updated timestamp
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    # Update in database
    await db.tasks.update_one(
        {"id": task_id},
        {"$set": update_data}
    )
    
    # Fetch updated task
    updated_task = await db.tasks.find_one({"id": task_id}, {"_id": 0})
    
    # Deserialize datetime fields
    datetime_fields = ["due_date", "created_at", "updated_at", "completed_at"]
    updated_task = DatabaseHelper.deserialize_datetime(updated_task, datetime_fields)
    
    return updated_task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: str,
    current_user: CurrentUser = Depends(get_current_user)
):
    """Delete a task"""
    
    # Check task exists
    await DatabaseHelper.find_one_or_404(
        db.tasks,
        {"id": task_id},
        "Task not found"
    )
    
    # Delete task
    await db.tasks.delete_one({"id": task_id})
    
    # Also delete related schedules
    await db.schedules.delete_many({"task_id": task_id})
    
    return None


@router.post("/{task_id}/assign", response_model=Task)
async def assign_task(
    task_id: str,
    assignment: TaskAssign,
    current_user: CurrentUser = Depends(get_current_user)
):
    """Assign task to users (replaces existing assignees)"""
    
    # Check task exists
    await DatabaseHelper.find_one_or_404(
        db.tasks,
        {"id": task_id},
        "Task not found"
    )
    
    # Validate assignees exist
    for assignee_id in assignment.assignee_ids:
        await validate_user_exists(db, assignee_id)
    
    # Update assignees
    await db.tasks.update_one(
        {"id": task_id},
        {
            "$set": {
                "assignee_ids": assignment.assignee_ids,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    # Fetch updated task
    updated_task = await db.tasks.find_one({"id": task_id}, {"_id": 0})
    
    # Deserialize datetime fields
    datetime_fields = ["due_date", "created_at", "updated_at", "completed_at"]
    updated_task = DatabaseHelper.deserialize_datetime(updated_task, datetime_fields)
    
    return updated_task


@router.post("/{task_id}/reassign", response_model=Task)
async def reassign_task(
    task_id: str,
    assignment: TaskAssign,
    current_user: CurrentUser = Depends(get_current_user)
):
    """Reassign task to different users"""
    return await assign_task(task_id, assignment, current_user)


@router.get("/user/{user_id}")
async def get_user_tasks(
    user_id: str,
    status: Optional[str] = None,
    current_user: CurrentUser = Depends(get_current_user)
):
    """Get all tasks assigned to a specific user"""
    
    # Validate user exists
    await validate_user_exists(db, user_id)
    
    query = {"assignee_ids": user_id}
    
    if status:
        query["status"] = status
    
    tasks = await db.tasks.find(query, {"_id": 0}).to_list(length=None)
    
    # Deserialize datetime fields
    datetime_fields = ["due_date", "created_at", "updated_at", "completed_at"]
    tasks = [DatabaseHelper.deserialize_datetime(t, datetime_fields) for t in tasks]
    
    return tasks
