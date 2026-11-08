from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient

from models import Recommendation, RecommendationCreate, RecommendationDetails, BeforeAfterState, ImpactMetrics
from middleware import get_current_user, CurrentUser
from utils import DatabaseHelper, get_users_by_ids
from services.ai_recommendations import ai_engine

import os

# Database connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'gslab')]

router = APIRouter(prefix="/api/recommendations", tags=["AI Recommendations"])


@router.post("/generate", response_model=List[Recommendation])
async def generate_recommendations(
    project_id: Optional[str] = None,
    limit: int = Query(default=5, le=10),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Generate AI-powered task assignment recommendations
    
    Analyzes unassigned or newly created tasks and suggests optimal assignments
    based on skills, workload, and availability.
    """
    
    # Get unassigned or recently created tasks
    query = {
        "$or": [
            {"assignee_ids": {"$size": 0}},  # Unassigned
            {"assignee_ids": {"$exists": False}},  # No assignees field
        ],
        "status": {"$in": ["open", "in_progress"]}
    }
    
    if project_id:
        query["project_id"] = project_id
    
    tasks = await db.tasks.find(query, {"_id": 0}).limit(limit).to_list(length=limit)
    
    if not tasks:
        return []
    
    # Deserialize datetime fields
    datetime_fields = ["due_date", "created_at", "updated_at"]
    tasks = [DatabaseHelper.deserialize_datetime(t, datetime_fields) for t in tasks]
    
    # Get all team members
    team_members = await db.users.find({}, {"_id": 0}).to_list(length=None)
    
    if not team_members:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No team members found"
        )
    
    # Get skills for all users
    all_skills = await db.skills.find({}, {"_id": 0}).to_list(length=None)
    user_skills = {}
    for skill in all_skills:
        user_id = skill.get("user_id")
        if user_id not in user_skills:
            user_skills[user_id] = []
        user_skills[user_id].append(skill)
    
    # Get workload for all users
    from utils import get_week_start
    from routes.workload import calculate_user_workload
    
    week_start = get_week_start().date()
    user_workloads = {}
    
    for member in team_members:
        user_id = member.get("id")
        if user_id:
            try:
                workload = await calculate_user_workload(user_id, week_start)
                from utils import get_utilization_status
                workload["status"] = get_utilization_status(workload["utilization_rate"])
                user_workloads[user_id] = workload
            except Exception as e:
                print(f"Error calculating workload for {user_id}: {e}")
                user_workloads[user_id] = {
                    "total_hours": 0,
                    "utilization_rate": 0,
                    "tasks_count": 0,
                    "status": "available"
                }
    
    # Generate AI recommendations
    ai_recommendations = await ai_engine.generate_batch_recommendations(
        tasks, team_members, user_skills, user_workloads
    )
    
    # Convert to Recommendation models and save
    saved_recommendations = []
    
    for ai_rec in ai_recommendations:
        # Build details
        before_state = BeforeAfterState(**ai_rec.get("before_state", {
            "assignee": "Unassigned",
            "time_slot": "Not scheduled",
            "workload": "N/A",
            "utilization_rate": 0
        }))
        
        after_state = BeforeAfterState(**ai_rec.get("after_state", {
            "assignee": ai_rec.get("recommended_assignee_name", "Unknown"),
            "time_slot": "To be scheduled",
            "workload": ai_rec.get("impact_metrics", {}).get("estimated_completion", "Unknown"),
            "utilization_rate": ai_rec.get("impact_metrics", {}).get("utilization_rate", 75)
        }))
        
        impact = ImpactMetrics(**ai_rec.get("impact_metrics", {}))
        
        details = RecommendationDetails(
            current_state=before_state,
            proposed_state=after_state,
            impact=impact,
            reasoning=ai_rec.get("reasoning", []),
            data_sources=["Task requirements", "User skills", "Current workload", "AI analysis"]
        )
        
        # Create recommendation
        rec_data = RecommendationCreate(
            type="assignment",
            task_id=ai_rec.get("task_id"),
            title=f"Assign {ai_rec.get('recommended_assignee_name')} to {ai_rec.get('task_title')}",
            reason=ai_rec.get("reasoning", [])[0] if ai_rec.get("reasoning") else "AI-recommended assignment",
            recommended_assignee=ai_rec.get("recommended_assignee_id"),
            confidence=ai_rec.get("confidence", 0.75),
            badge="Assignment",
            details=details,
            generated_by=current_user.user_id
        )
        
        recommendation = Recommendation(**rec_data.model_dump())
        
        # Save to database
        doc = DatabaseHelper.serialize_datetime(recommendation.model_dump())
        await db.recommendations.insert_one(doc)
        
        saved_recommendations.append(recommendation)
    
    return saved_recommendations


@router.get("", response_model=List[Recommendation])
async def get_recommendations(
    status_filter: Optional[str] = Query(None, alias="status"),
    task_id: Optional[str] = None,
    limit: int = Query(default=10, le=50),
    current_user: CurrentUser = Depends(get_current_user)
):
    """Get all recommendations with optional filters"""
    
    query = {}
    
    if status_filter:
        query["status"] = status_filter
    
    if task_id:
        query["task_id"] = task_id
    
    recommendations = await db.recommendations.find(query, {"_id": 0}).limit(limit).to_list(length=limit)
    
    # Deserialize datetime fields
    datetime_fields = ["created_at", "applied_at"]
    recommendations = [DatabaseHelper.deserialize_datetime(r, datetime_fields) for r in recommendations]
    
    return recommendations


@router.get("/{recommendation_id}", response_model=Recommendation)
async def get_recommendation(
    recommendation_id: str,
    current_user: CurrentUser = Depends(get_current_user)
):
    """Get a specific recommendation"""
    
    rec = await DatabaseHelper.find_one_or_404(
        db.recommendations,
        {"id": recommendation_id},
        "Recommendation not found"
    )
    
    # Deserialize datetime fields
    datetime_fields = ["created_at", "applied_at"]
    rec = DatabaseHelper.deserialize_datetime(rec, datetime_fields)
    
    return rec


@router.post("/{recommendation_id}/apply")
async def apply_recommendation(
    recommendation_id: str,
    current_user: CurrentUser = Depends(get_current_user)
):
    """Apply a recommendation (assign task to recommended user)"""
    
    # Get recommendation
    rec = await DatabaseHelper.find_one_or_404(
        db.recommendations,
        {"id": recommendation_id},
        "Recommendation not found"
    )
    
    if rec.get("status") != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Recommendation is already {rec.get('status')}"
        )
    
    task_id = rec.get("task_id")
    assignee_id = rec.get("recommended_assignee")
    
    if not task_id or not assignee_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Recommendation missing task_id or assignee"
        )
    
    # Update task with assignment
    result = await db.tasks.update_one(
        {"id": task_id},
        {
            "$addToSet": {"assignee_ids": assignee_id},
            "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or assignment failed"
        )
    
    # Mark recommendation as applied
    await db.recommendations.update_one(
        {"id": recommendation_id},
        {
            "$set": {
                "status": "applied",
                "applied_at": datetime.now(timezone.utc).isoformat(),
                "applied_by": current_user.user_id
            }
        }
    )
    
    # Get updated task
    updated_task = await db.tasks.find_one({"id": task_id}, {"_id": 0})
    
    return {
        "message": "Recommendation applied successfully",
        "task": updated_task,
        "recommendation_id": recommendation_id
    }


@router.post("/{recommendation_id}/dismiss")
async def dismiss_recommendation(
    recommendation_id: str,
    current_user: CurrentUser = Depends(get_current_user)
):
    """Dismiss a recommendation"""
    
    # Check recommendation exists
    await DatabaseHelper.find_one_or_404(
        db.recommendations,
        {"id": recommendation_id},
        "Recommendation not found"
    )
    
    # Mark as dismissed
    await db.recommendations.update_one(
        {"id": recommendation_id},
        {"$set": {"status": "dismissed"}}
    )
    
    return {"message": "Recommendation dismissed"}


@router.delete("/{recommendation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_recommendation(
    recommendation_id: str,
    current_user: CurrentUser = Depends(get_current_user)
):
    """Delete a recommendation"""
    
    # Check exists
    await DatabaseHelper.find_one_or_404(
        db.recommendations,
        {"id": recommendation_id},
        "Recommendation not found"
    )
    
    # Delete
    await db.recommendations.delete_one({"id": recommendation_id})
    
    return None
