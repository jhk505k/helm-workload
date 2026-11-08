from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime, timezone, date
from motor.motor_asyncio import AsyncIOMotorClient

from models import Workload, WorkloadCreate, UserCapacity, TeamCapacityAnalysis
from middleware import get_current_user, CurrentUser
from utils import (
    DatabaseHelper,
    validate_user_exists,
    get_user_by_id,
    get_users_by_ids,
    calculate_utilization_rate,
    get_utilization_status,
    get_week_start,
    calculate_hours_between
)

import os

# Database connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'gslab')]

router = APIRouter(prefix="/api/workload", tags=["Workload"])


async def calculate_user_workload(user_id: str, week_start: date) -> dict:
    """Calculate workload for a user for a specific week"""
    
    week_end = week_start + __import__('datetime').timedelta(days=7)
    
    # Get all tasks assigned to user with due dates in this week
    tasks = await db.tasks.find(
        {
            "assignee_ids": user_id,
            "status": {"$in": ["open", "in_progress", "blocked"]}
        },
        {"_id": 0}
    ).to_list(length=None)
    
    total_hours = 0
    tasks_count = len(tasks)
    project_hours = {}
    
    for task in tasks:
        hours = task.get("estimated_hours", 0) or 0
        total_hours += hours
        
        project_id = task.get("project_id")
        if project_id:
            if project_id not in project_hours:
                project = await db.projects.find_one({"id": project_id}, {"_id": 0})
                project_hours[project_id] = {
                    "project_id": project_id,
                    "project_name": project.get("name", "Unknown") if project else "Unknown",
                    "hours": 0
                }
            project_hours[project_id]["hours"] += hours
    
    utilization_rate = calculate_utilization_rate(total_hours, 40.0)
    
    return {
        "user_id": user_id,
        "week_start": week_start,
        "total_hours": total_hours,
        "utilization_rate": utilization_rate,
        "tasks_count": tasks_count,
        "projects": list(project_hours.values())
    }


@router.get("/user/{user_id}", response_model=Workload)
async def get_user_workload(
    user_id: str,
    week_start: Optional[date] = None,
    current_user: CurrentUser = Depends(get_current_user)
):
    """Get workload for a specific user"""
    
    # Validate user exists
    await validate_user_exists(db, user_id)
    
    if not week_start:
        week_start_dt = get_week_start()
        week_start = week_start_dt.date()
    
    workload = await calculate_user_workload(user_id, week_start)
    
    return workload


@router.get("/team", response_model=List[Workload])
async def get_team_workload(
    week_start: Optional[date] = None,
    current_user: CurrentUser = Depends(get_current_user)
):
    """Get workload for all team members"""
    
    if not week_start:
        week_start_dt = get_week_start()
        week_start = week_start_dt.date()
    
    # Get all users (from GSLAB's users collection)
    users = await db.users.find({}, {"_id": 0, "id": 1}).to_list(length=None)
    
    workloads = []
    for user in users:
        user_id = user.get("id")
        if user_id:
            workload = await calculate_user_workload(user_id, week_start)
            workloads.append(workload)
    
    return workloads


@router.get("/capacity/analysis", response_model=TeamCapacityAnalysis)
async def get_capacity_analysis(
    week_start: Optional[date] = None,
    current_user: CurrentUser = Depends(get_current_user)
):
    """Get comprehensive capacity analysis for the team"""
    
    if not week_start:
        week_start_dt = get_week_start()
        week_start = week_start_dt.date()
    
    # Get all users
    users = await db.users.find({}, {"_id": 0}).to_list(length=None)
    
    members_capacity = []
    total_capacity = 0
    total_allocated = 0
    overloaded = []
    available = []
    
    for user in users:
        user_id = user.get("id")
        if not user_id:
            continue
        
        # Calculate workload
        workload = await calculate_user_workload(user_id, week_start)
        
        # Get upcoming deadlines
        upcoming_tasks = await db.tasks.find(
            {
                "assignee_ids": user_id,
                "status": {"$in": ["open", "in_progress"]},
                "due_date": {"$exists": True}
            },
            {"_id": 0}
        ).to_list(length=None)
        
        upcoming_deadlines = len(upcoming_tasks)
        
        # Calculate capacity
        available_capacity = 40.0  # Standard work week
        total_assigned = workload["total_hours"]
        utilization_rate = workload["utilization_rate"]
        status_str = get_utilization_status(utilization_rate)
        
        user_capacity = UserCapacity(
            user_id=user_id,
            user_name=user.get("name", user.get("email", "Unknown")),
            total_assigned_hours=total_assigned,
            available_capacity=available_capacity,
            utilization_rate=utilization_rate,
            status=status_str,
            current_tasks=workload["tasks_count"],
            upcoming_deadlines=upcoming_deadlines
        )
        
        members_capacity.append(user_capacity)
        total_capacity += available_capacity
        total_allocated += total_assigned
        
        if status_str == "overloaded":
            overloaded.append(user.get("name", user.get("email", "Unknown")))
        elif status_str == "available":
            available.append(user.get("name", user.get("email", "Unknown")))
    
    team_utilization = calculate_utilization_rate(total_allocated, total_capacity) if total_capacity > 0 else 0
    
    return TeamCapacityAnalysis(
        week_start=week_start,
        total_capacity=total_capacity,
        total_allocated=total_allocated,
        team_utilization=team_utilization,
        members=members_capacity,
        overloaded_members=overloaded,
        available_members=available
    )
