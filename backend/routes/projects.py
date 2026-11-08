from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timezone

from models import Project, ProjectCreate, ProjectUpdate
from middleware import get_current_user, CurrentUser
from utils import DatabaseHelper, validate_user_exists

import os
from motor.motor_asyncio import AsyncIOMotorClient

# Database connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'gslab')]

router = APIRouter(prefix="/api/projects", tags=["Projects"])


@router.get("", response_model=List[Project])
async def get_projects(
    status: Optional[str] = None,
    owner_id: Optional[str] = None,
    current_user: CurrentUser = Depends(get_current_user)
):
    """Get all projects, optionally filtered by status or owner"""
    query = {}
    
    if status:
        query["status"] = status
    
    if owner_id:
        query["owner_id"] = owner_id
    
    projects = await db.projects.find(query, {"_id": 0}).to_list(length=None)
    
    # Deserialize datetime fields
    datetime_fields = ["start_date", "end_date", "created_at", "updated_at"]
    projects = [DatabaseHelper.deserialize_datetime(p, datetime_fields) for p in projects]
    
    # Calculate task statistics for each project
    for project in projects:
        tasks = await db.tasks.find({"project_id": project["id"]}, {"_id": 0}).to_list(length=None)
        project["total_tasks"] = len(tasks)
        project["completed_tasks"] = len([t for t in tasks if t.get("status") == "completed"])
    
    return projects


@router.post("", response_model=Project, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    current_user: CurrentUser = Depends(get_current_user)
):
    """Create a new project"""
    
    # Validate owner exists
    await validate_user_exists(db, project_data.owner_id)
    
    # Validate team members exist
    for team_id in project_data.team_ids:
        await validate_user_exists(db, team_id)
    
    # Create project object
    project = Project(**project_data.model_dump())
    
    # Serialize and insert
    doc = DatabaseHelper.serialize_datetime(project.model_dump())
    await db.projects.insert_one(doc)
    
    return project


@router.get("/{project_id}", response_model=Project)
async def get_project(
    project_id: str,
    current_user: CurrentUser = Depends(get_current_user)
):
    """Get a specific project by ID"""
    
    project = await DatabaseHelper.find_one_or_404(
        db.projects,
        {"id": project_id},
        "Project not found"
    )
    
    # Deserialize datetime fields
    datetime_fields = ["start_date", "end_date", "created_at", "updated_at"]
    project = DatabaseHelper.deserialize_datetime(project, datetime_fields)
    
    # Calculate task statistics
    tasks = await db.tasks.find({"project_id": project_id}, {"_id": 0}).to_list(length=None)
    project["total_tasks"] = len(tasks)
    project["completed_tasks"] = len([t for t in tasks if t.get("status") == "completed"])
    
    return project


@router.put("/{project_id}", response_model=Project)
async def update_project(
    project_id: str,
    project_data: ProjectUpdate,
    current_user: CurrentUser = Depends(get_current_user)
):
    """Update a project"""
    
    # Check project exists
    existing = await DatabaseHelper.find_one_or_404(
        db.projects,
        {"id": project_id},
        "Project not found"
    )
    
    # Prepare update data (only non-None fields)
    update_data = {k: v for k, v in project_data.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")
    
    # Validate owner if being changed
    if "owner_id" in update_data:
        await validate_user_exists(db, update_data["owner_id"])
    
    # Validate team members if being changed
    if "team_ids" in update_data:
        for team_id in update_data["team_ids"]:
            await validate_user_exists(db, team_id)
    
    # Add updated timestamp
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    # Update in database
    await db.projects.update_one(
        {"id": project_id},
        {"$set": update_data}
    )
    
    # Fetch updated project
    updated_project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    
    # Deserialize datetime fields
    datetime_fields = ["start_date", "end_date", "created_at", "updated_at"]
    updated_project = DatabaseHelper.deserialize_datetime(updated_project, datetime_fields)
    
    # Calculate task statistics
    tasks = await db.tasks.find({"project_id": project_id}, {"_id": 0}).to_list(length=None)
    updated_project["total_tasks"] = len(tasks)
    updated_project["completed_tasks"] = len([t for t in tasks if t.get("status") == "completed"])
    
    return updated_project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: str,
    current_user: CurrentUser = Depends(get_current_user)
):
    """Delete a project"""
    
    # Check project exists
    await DatabaseHelper.find_one_or_404(
        db.projects,
        {"id": project_id},
        "Project not found"
    )
    
    # Delete project
    await db.projects.delete_one({"id": project_id})
    
    # Note: In production, you might want to handle cascading deletes
    # or prevent deletion if project has tasks
    
    return None


@router.get("/{project_id}/tasks")
async def get_project_tasks(
    project_id: str,
    current_user: CurrentUser = Depends(get_current_user)
):
    """Get all tasks for a project"""
    
    # Check project exists
    await DatabaseHelper.find_one_or_404(
        db.projects,
        {"id": project_id},
        "Project not found"
    )
    
    # Get tasks
    tasks = await db.tasks.find({"project_id": project_id}, {"_id": 0}).to_list(length=None)
    
    # Deserialize datetime fields
    datetime_fields = ["due_date", "created_at", "updated_at", "completed_at"]
    tasks = [DatabaseHelper.deserialize_datetime(t, datetime_fields) for t in tasks]
    
    return tasks
