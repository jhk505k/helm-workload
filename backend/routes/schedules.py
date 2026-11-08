from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient

from models import Schedule, ScheduleCreate, ScheduleUpdate, Conflict
from middleware import get_current_user, CurrentUser
from utils import DatabaseHelper, validate_user_exists, check_time_overlap, calculate_hours_between

import os

# Database connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'gslab')]

router = APIRouter(prefix="/api/schedules", tags=["Schedules"])


async def detect_conflicts_for_schedule(schedule: dict) -> tuple[bool, Optional[str]]:
    """
    Detect if a schedule conflicts with existing schedules
    Returns (has_conflict, conflict_details)
    """
    # Find all schedules for the same assignee
    existing_schedules = await db.schedules.find(
        {
            "assignee_id": schedule["assignee_id"],
            "id": {"$ne": schedule.get("id")},  # Exclude current schedule if updating
            "status": {"$in": ["scheduled", "in_progress"]}  # Only check active schedules
        },
        {"_id": 0}
    ).to_list(length=None)
    
    # Deserialize datetime fields
    datetime_fields = ["start_time", "end_time", "created_at", "updated_at"]
    existing_schedules = [DatabaseHelper.deserialize_datetime(s, datetime_fields) for s in existing_schedules]
    
    schedule_start = schedule.get("start_time")
    schedule_end = schedule.get("end_time")
    
    if isinstance(schedule_start, str):
        schedule_start = datetime.fromisoformat(schedule_start)
    if isinstance(schedule_end, str):
        schedule_end = datetime.fromisoformat(schedule_end)
    
    conflicts = []
    for existing in existing_schedules:
        if check_time_overlap(schedule_start, schedule_end, existing["start_time"], existing["end_time"]):
            conflicts.append(existing["id"])
    
    if conflicts:
        return True, f"Time overlap with schedule(s): {', '.join(conflicts)}"
    
    return False, None


@router.get("", response_model=List[Schedule])
async def get_schedules(
    assignee_id: Optional[str] = None,
    task_id: Optional[str] = None,
    status: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user: CurrentUser = Depends(get_current_user)
):
    """Get all schedules with optional filters"""
    query = {}
    
    if assignee_id:
        query["assignee_id"] = assignee_id
    
    if task_id:
        query["task_id"] = task_id
    
    if status:
        query["status"] = status
    
    # Date range filter
    if start_date or end_date:
        query["start_time"] = {}
        if start_date:
            query["start_time"]["$gte"] = start_date.isoformat()
        if end_date:
            query["start_time"]["$lte"] = end_date.isoformat()
    
    schedules = await db.schedules.find(query, {"_id": 0}).to_list(length=None)
    
    # Deserialize datetime fields
    datetime_fields = ["start_time", "end_time", "created_at", "updated_at"]
    schedules = [DatabaseHelper.deserialize_datetime(s, datetime_fields) for s in schedules]
    
    return schedules


@router.post("", response_model=Schedule, status_code=status.HTTP_201_CREATED)
async def create_schedule(
    schedule_data: ScheduleCreate,
    current_user: CurrentUser = Depends(get_current_user)
):
    """Create a new schedule entry"""
    
    # Validate task exists
    await DatabaseHelper.find_one_or_404(
        db.tasks,
        {"id": schedule_data.task_id},
        "Task not found"
    )
    
    # Validate assignee exists
    await validate_user_exists(db, schedule_data.assignee_id)
    
    # Create schedule object
    schedule = Schedule(**schedule_data.model_dump())
    
    # Detect conflicts
    has_conflict, conflict_details = await detect_conflicts_for_schedule(schedule.model_dump())
    schedule.has_conflict = has_conflict
    schedule.conflict_details = conflict_details
    
    # Serialize and insert
    doc = DatabaseHelper.serialize_datetime(schedule.model_dump())
    await db.schedules.insert_one(doc)
    
    return schedule


@router.get("/{schedule_id}", response_model=Schedule)
async def get_schedule(
    schedule_id: str,
    current_user: CurrentUser = Depends(get_current_user)
):
    """Get a specific schedule by ID"""
    
    schedule = await DatabaseHelper.find_one_or_404(
        db.schedules,
        {"id": schedule_id},
        "Schedule not found"
    )
    
    # Deserialize datetime fields
    datetime_fields = ["start_time", "end_time", "created_at", "updated_at"]
    schedule = DatabaseHelper.deserialize_datetime(schedule, datetime_fields)
    
    return schedule


@router.put("/{schedule_id}", response_model=Schedule)
async def update_schedule(
    schedule_id: str,
    schedule_data: ScheduleUpdate,
    current_user: CurrentUser = Depends(get_current_user)
):
    """Update a schedule"""
    
    # Check schedule exists
    existing = await DatabaseHelper.find_one_or_404(
        db.schedules,
        {"id": schedule_id},
        "Schedule not found"
    )
    
    # Prepare update data
    update_data = {k: v for k, v in schedule_data.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")
    
    # Validate task if being changed
    if "task_id" in update_data:
        await DatabaseHelper.find_one_or_404(
            db.tasks,
            {"id": update_data["task_id"]},
            "Task not found"
        )
    
    # Validate assignee if being changed
    if "assignee_id" in update_data:
        await validate_user_exists(db, update_data["assignee_id"])
    
    # Re-check conflicts if time or assignee changed
    if "start_time" in update_data or "end_time" in update_data or "assignee_id" in update_data:
        updated_schedule = {**existing, **update_data, "id": schedule_id}
        has_conflict, conflict_details = await detect_conflicts_for_schedule(updated_schedule)
        update_data["has_conflict"] = has_conflict
        update_data["conflict_details"] = conflict_details
    
    # Add updated timestamp
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    # Serialize datetime fields in update_data
    update_data = DatabaseHelper.serialize_datetime(update_data)
    
    # Update in database
    await db.schedules.update_one(
        {"id": schedule_id},
        {"$set": update_data}
    )
    
    # Fetch updated schedule
    updated_schedule = await db.schedules.find_one({"id": schedule_id}, {"_id": 0})
    
    # Deserialize datetime fields
    datetime_fields = ["start_time", "end_time", "created_at", "updated_at"]
    updated_schedule = DatabaseHelper.deserialize_datetime(updated_schedule, datetime_fields)
    
    return updated_schedule


@router.delete("/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_schedule(
    schedule_id: str,
    current_user: CurrentUser = Depends(get_current_user)
):
    """Delete a schedule"""
    
    # Check schedule exists
    await DatabaseHelper.find_one_or_404(
        db.schedules,
        {"id": schedule_id},
        "Schedule not found"
    )
    
    # Delete schedule
    await db.schedules.delete_one({"id": schedule_id})
    
    return None


@router.get("/conflicts/detect", response_model=List[Conflict])
async def detect_conflicts(
    assignee_id: Optional[str] = None,
    current_user: CurrentUser = Depends(get_current_user)
):
    """Detect all scheduling conflicts"""
    
    query = {"status": {"$in": ["scheduled", "in_progress"]}}
    if assignee_id:
        query["assignee_id"] = assignee_id
    
    schedules = await db.schedules.find(query, {"_id": 0}).to_list(length=None)
    
    # Deserialize datetime fields
    datetime_fields = ["start_time", "end_time", "created_at", "updated_at"]
    schedules = [DatabaseHelper.deserialize_datetime(s, datetime_fields) for s in schedules]
    
    # Group by assignee
    assignee_schedules = {}
    for schedule in schedules:
        assignee = schedule["assignee_id"]
        if assignee not in assignee_schedules:
            assignee_schedules[assignee] = []
        assignee_schedules[assignee].append(schedule)
    
    conflicts = []
    
    # Check for time overlaps within each assignee's schedules
    for assignee, user_schedules in assignee_schedules.items():
        for i, schedule1 in enumerate(user_schedules):
            for schedule2 in user_schedules[i+1:]:
                if check_time_overlap(
                    schedule1["start_time"],
                    schedule1["end_time"],
                    schedule2["start_time"],
                    schedule2["end_time"]
                ):
                    conflicts.append(Conflict(
                        schedule_ids=[schedule1["id"], schedule2["id"]],
                        assignee_id=assignee,
                        conflict_type="time_overlap",
                        description=f"Time overlap between {schedule1.get('title', 'Schedule')} and {schedule2.get('title', 'Schedule')}",
                        severity="high",
                        resolution_suggestions=[
                            f"Reschedule one of the tasks",
                            f"Reassign one task to another team member",
                            f"Reduce duration of one or both tasks"
                        ]
                    ))
    
    return conflicts


@router.post("/conflicts/{schedule_id}/resolve")
async def resolve_conflict(
    schedule_id: str,
    resolution: ScheduleUpdate,
    current_user: CurrentUser = Depends(get_current_user)
):
    """Apply a resolution to a conflicting schedule"""
    return await update_schedule(schedule_id, resolution, current_user)
